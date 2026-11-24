import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { brl } from '../data/cardapio'
import { CLUBE, REGRAS } from '../data/clube'
import { TEMA } from '../data/tema'
import * as P from '../lib/painel'
import { alertaAtivo, ativarAlerta, relogio, tocar } from '../lib/alerta'
import type { Estab } from '../lib/dono'

const ROT: Record<string, string> = Object.fromEntries(REGRAS.map(r => [r.action, r.rotulo]))
const LIMITES: [string, string][] = [['once', 'Uma vez'], ['per_day', 'Por dia'], ['per_week', 'Por semana'], ['per_month', 'Por mês'], ['unlimited', 'Sem limite']]
const dh = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/** Carrega dados e dá um jeito simples de recarregar; erro vira mensagem, nunca tela vazia sem explicação. */
function useCarga<T>(f: () => Promise<T>, deps: unknown[]): [T | null, string, () => void] {
  const [d, setD] = useState<T | null>(null); const [e, setE] = useState(''); const [n, setN] = useState(0)
  useEffect(() => { let vivo = true; setE(''); f().then(v => vivo && setD(v)).catch(() => vivo && setE('Não foi possível carregar. Verifique a internet e tente de novo.')); return () => { vivo = false } }, [...deps, n]) // eslint-disable-line react-hooks/exhaustive-deps
  return [d, e, () => setN(x => x + 1)]
}
const Aviso = ({ e }: { e: string }) => e ? <p className="alerta" role="alert">{e}</p> : null
const Carregando = () => <p className="nota">Carregando…</p>
function Abas({ abas, valor, set }: { abas: [string, string][]; valor: string; set: (v: string) => void }) {
  return <div className="abas-p" role="tablist">{abas.map(([k, t]) => <button key={k} role="tab" aria-selected={valor === k} className={valor === k ? 'on' : ''} onClick={() => set(k)}>{t}</button>)}</div>
}
const Linha = ({ t, children }: { t: string; children: ReactNode }) => <label className="linha-f"><span>{t}</span>{children}</label>
const Sw = ({ on, set, t }: { on: boolean; set: (v: boolean) => void; t: string }) => <label className="sw"><input type="checkbox" role="switch" checked={on} onChange={e => set(e.target.checked)} /><span>{t}</span></label>

/** 1. Resumo: só o que o sistema mede. Percentuais e medianas com amostra mínima. */
export function ResumoSec({ est }: { est: Estab }) {
  const [per, setPer] = useState('0'); const dias = Number(per)
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - dias)
  const [r, e] = useCarga(() => P.resumo(est.tenant_id, d.toISOString(), d.toISOString().slice(0, 10)), [est.tenant_id, per])
  const Card = ({ t, v, n }: { t: string; v: string | number; n?: string }) => <div className="card-p"><small>{t}</small><b className={typeof v === 'string' ? 'txt' : ''}>{v}</b>{n && <em>{n}</em>}</div>
  return (
    <section>
      <Abas abas={[['0', 'Hoje'], ['7', '7 dias'], ['30', '30 dias']]} valor={per} set={setPer} />
      <Aviso e={e} />{!r && !e && <Carregando />}
      {r && <>
        <div className="grade-p">
          <Card t="Visitas com check-in" v={r.visitas} /><Card t="Novos cadastros" v={r.cadastros} /><Card t="Pedidos enviados ao garçom" v={r.pedidos} />
          <Card t="Trocas de prêmios" v={r.trocas} /><Card t="Pontos dados" v={r.pontosDados} /><Card t="Pontos usados" v={r.pontosUsados} />
          <Card t="Prêmios da Roleta e aniversário" v={r.extrasEmitidos} n={`${r.extrasUsados} usados`} />
          <Card t="Nota média da visita" v={r.opiniaoN >= 5 ? (r.opiniaoMediana ?? 0).toFixed(1) : 'dados insuficientes'} n={`${r.opiniaoN} opiniões (mediana, mínimo 5)`} />
          <Card t="Valor típico do pedido" v={r.pedidosN >= 5 && r.subtotalMediana != null ? brl(r.subtotalMediana) : 'dados insuficientes'} n={`${r.pedidosN} pedidos (mediana, mínimo 5)`} />
        </div>
        <p className="nota">Estes números medem o que o app registra: visitas, pedidos enviados ao garçom, pontos e trocas. Não medem faturamento, seguidores ganhos nem avaliações publicadas. O valor do pedido é o calculado pelos preços do cardápio, não o valor pago.</p>
      </>}
    </section>)
}

/** 2. Atendimento: fila agora, com os itens do pedido. */
export function FilaSec({ est }: { est: Estab }) {
  const [f, e, recarregar] = useCarga(() => P.filaAgora(est.tenant_id), [est.tenant_id])
  useEffect(() => { const i = setInterval(recarregar, 5000); return () => clearInterval(i) }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const ROTK: Record<string, string> = { waiter: 'Chamar garçom', bill: 'Pedir a conta', order: 'Pedido', question: 'Dúvida', other: 'Outro', kitchen_item: 'Item da cozinha' }
  return (
    <section><h2 className="sub">Chamados agora</h2><Aviso e={e} />{!f && !e && <Carregando />}
      {f && !f.length && <p className="vazio">Nenhum chamado em aberto. Tudo em dia.</p>}
      {f?.map(x => <div key={x.id} className="cartao-p"><div className="lin"><b>Mesa {x.table_label} · {ROTK[x.kind] ?? x.kind}</b><span>{dh(x.created_at)} · {x.status === 'PENDING' ? 'aguardando' : `com ${x.handled_by_label ?? 'a equipe'}`}</span></div>
        {x.itens && <ul className="itens-p">{x.itens.map((i, k) => <li key={k}>{i.qty} × {i.name}{i.obs ? ` (${i.obs})` : ''}</li>)}<li><b>Subtotal: {brl(x.subtotal ?? 0)}</b></li></ul>}</div>)}
      <p className="nota">Quem atende usa o painel da equipe (link em Configurações). Esta lista atualiza sozinha a cada 5 segundos.</p>
    </section>)
}

/** 3. Clube: regras de pontos, prêmios e trocas. */
export function ClubeSec({ est }: { est: Estab }) {
  const [aba, setAba] = useState('regras')
  return <section><Abas abas={[['regras', 'Regras de pontos'], ['premios', 'Prêmios'], ['trocas', 'Trocas']]} valor={aba} set={setAba} />
    {aba === 'regras' && <Regras t={est.tenant_id} />}{aba === 'premios' && <Premios t={est.tenant_id} />}{aba === 'trocas' && <Trocas t={est.tenant_id} />}</section>
}
function Regras({ t }: { t: string }) {
  const [rs, e, rec] = useCarga(() => P.regras(t), [t]); const [msg, setMsg] = useState('')
  const salvar = async (r: P.RegraDono) => { try { setMsg(await P.salvarRegra(t, r) ? 'Salvo.' : 'Você não tem permissão para isso.'); rec() } catch { setMsg('Não foi possível salvar. Tente de novo.') } }
  return <div><p>Escolha quanto vale cada ação e os limites. As mudanças valem dali em diante e não alteram pontos já ganhos.</p><Aviso e={e} />{!rs && !e && <Carregando />}{msg && <p role="status" className="nota">{msg}</p>}
    {rs && <table className="tabela"><thead><tr><th>Ação</th><th>Pontos</th><th>Limite</th><th>Ligada</th></tr></thead><tbody>{rs.map(r => <RegraLinha key={r.action} r={r} salvar={salvar} />)}</tbody></table>}
    <p className="nota">Só ligue ações que o app já cumpre. As desligadas por padrão ainda não foram construídas.</p></div>
}
function RegraLinha({ r, salvar }: { r: P.RegraDono; salvar: (r: P.RegraDono) => void }) {
  const [v, setV] = useState(r)
  const mudou = JSON.stringify(v) !== JSON.stringify(r)
  return <tr><td>{ROT[r.action] ?? r.action}</td>
    <td><input className="campo-p num" type="number" min={0} max={1000} value={v.points} onChange={e => setV({ ...v, points: Math.max(0, Math.min(1000, Number(e.target.value) || 0)) })} aria-label={`Pontos de ${ROT[r.action] ?? r.action}`} /></td>
    <td><select className="campo-p" value={v.limit_kind} onChange={e => setV({ ...v, limit_kind: e.target.value })} aria-label="Limite">{LIMITES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
      {['per_day', 'per_week', 'per_month'].includes(v.limit_kind) && <input className="campo-p num" type="number" min={1} max={100} value={v.limit_n} onChange={e => setV({ ...v, limit_n: Math.max(1, Math.min(100, Number(e.target.value) || 1)) })} aria-label="Quantas vezes" />}</td>
    <td><input type="checkbox" role="switch" checked={v.enabled} onChange={e => setV({ ...v, enabled: e.target.checked })} aria-label="Ligada" />{mudou && <button className="primario peq-p" onClick={() => salvar(v)}>Salvar</button>}</td></tr>
}
function Premios({ t }: { t: string }) {
  const [ps, e, rec] = useCarga(() => P.premios(t), [t]); const [msg, setMsg] = useState(''); const [novo, setNovo] = useState({ name: '', cost_points: 200 })
  const salvar = async (p: Partial<P.PremioDono> & { name: string; cost_points: number }) => { try { setMsg(await P.salvarPremio(t, p) ? 'Salvo.' : 'Você não tem permissão ou os dados são inválidos.'); rec() } catch { setMsg('Não foi possível salvar. Tente de novo.') } }
  return <div><p>Prêmios que o cliente troca por pontos. Mudar o preço vale para as próximas trocas.</p><Aviso e={e} />{!ps && !e && <Carregando />}{msg && <p role="status" className="nota">{msg}</p>}
    {ps && <table className="tabela"><thead><tr><th>Prêmio</th><th>Pontos</th><th>Visitas mínimas</th><th>Por pessoa/mês</th><th>Ativo</th></tr></thead><tbody>{ps.map(p => <PremioLinha key={p.id} p={p} salvar={salvar} />)}</tbody></table>}
    <h2 className="sub">Novo prêmio</h2><div className="form-p"><input className="campo-p" placeholder="Nome do prêmio" value={novo.name} onChange={e => setNovo({ ...novo, name: e.target.value })} /><input className="campo-p num" type="number" min={1} value={novo.cost_points} onChange={e => setNovo({ ...novo, cost_points: Number(e.target.value) || 1 })} aria-label="Pontos" />
      <button className="primario" disabled={novo.name.trim().length < 2} onClick={async () => { await salvar({ ...novo, name: novo.name.trim() }); setNovo({ name: '', cost_points: 200 }) }}>Adicionar</button></div></div>
}
function PremioLinha({ p, salvar }: { p: P.PremioDono; salvar: (p: P.PremioDono) => void }) {
  const [v, setV] = useState(p); const mudou = JSON.stringify(v) !== JSON.stringify(p); const n = (x: string) => x === '' ? null : Math.max(1, Number(x) || 1)
  return <tr><td><input className="campo-p" value={v.name} onChange={e => setV({ ...v, name: e.target.value })} aria-label="Nome" /></td><td><input className="campo-p num" type="number" min={1} value={v.cost_points} onChange={e => setV({ ...v, cost_points: Number(e.target.value) || 1 })} aria-label="Pontos" /></td>
    <td><input className="campo-p num" type="number" min={0} value={v.min_visits} onChange={e => setV({ ...v, min_visits: Math.max(0, Number(e.target.value) || 0) })} aria-label="Visitas mínimas" /></td>
    <td><input className="campo-p num" type="number" min={1} placeholder="sem limite" value={v.per_person_month ?? ''} onChange={e => setV({ ...v, per_person_month: n(e.target.value) })} aria-label="Por pessoa por mês" /></td>
    <td><input type="checkbox" role="switch" checked={v.active} onChange={e => setV({ ...v, active: e.target.checked })} aria-label="Ativo" />{mudou && <button className="primario peq-p" onClick={() => salvar(v)}>Salvar</button>}</td></tr>
}
function Trocas({ t }: { t: string }) {
  const [tr, e, rec] = useCarga(() => P.trocasRecentes(t), [t]); const [msg, setMsg] = useState('')
  useEffect(() => { const i = setInterval(rec, 8000); return () => clearInterval(i) }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const estornar = async (x: P.TrocaDono) => {
    const m = window.prompt(`Estornar a troca "${x.reward_name}" (código ${x.code})? Os pontos voltam para o cliente. Escreva o motivo (mínimo 5 letras):`); if (!m || m.trim().length < 5) return
    try { setMsg(await P.estornar(t, x.id, m.trim()) ? 'Troca estornada e pontos devolvidos.' : 'Não foi possível estornar (já encerrada ou sem permissão).'); rec() } catch { setMsg('Sem conexão. Tente de novo.') }
  }
  return <div><p>As trocas aparecem aqui na hora. O garçom confere o código no comprovante do cliente.</p><Aviso e={e} />{msg && <p role="status" className="nota">{msg}</p>}{!tr && !e && <Carregando />}
    {tr && !tr.length && <p className="vazio">Nenhuma troca ainda.</p>}
    {tr && tr.length > 0 && <table className="tabela"><thead><tr><th>Quando</th><th>Mesa</th><th>Prêmio</th><th>Pontos</th><th>Código</th><th>Situação</th><th /></tr></thead><tbody>{tr.map(x => <tr key={x.id}><td>{dh(x.created_at)}</td><td>{x.table_label ?? '–'}</td><td>{x.reward_name}</td><td>{x.cost_points}</td><td><code>{x.code}</code></td>
      <td>{x.status === 'active' ? 'Realizada' : x.status === 'cancelled' ? 'Cancelada pelo cliente' : 'Estornada'}</td><td>{x.status === 'active' && <button className="sec peq-p" onClick={() => estornar(x)}>Estornar</button>}</td></tr>)}</tbody></table>}</div>
}

/** 4. Cardápio: preços e disponibilidade (o preço do pedido é calculado a partir daqui). */
export function PrecosSec({ est }: { est: Estab }) {
  const t = est.tenant_id; const [is, e, rec] = useCarga(() => P.itensMenu(t), [t]); const [msg, setMsg] = useState('')
  const salvar = async (i: P.ItemMenu) => { try { setMsg(await P.salvarItem(t, i) ? 'Salvo.' : 'Você não tem permissão ou os dados são inválidos.'); rec() } catch { setMsg('Não foi possível salvar. Tente de novo.') } }
  return <div><p>Preço e disponibilidade de cada item. O valor do pedido e a liberação da Roleta usam estes preços.</p><Aviso e={e} />{!is && !e && <Carregando />}{msg && <p role="status" className="nota">{msg}</p>}
    {is && <table className="tabela"><thead><tr><th>Item</th><th>Preço (R$)</th><th>No cardápio</th></tr></thead><tbody>{is.map(i => <ItemLinha key={i.item_id} i={i} salvar={salvar} />)}</tbody></table>}</div>
}
function ItemLinha({ i, salvar }: { i: P.ItemMenu; salvar: (i: P.ItemMenu) => void }) {
  const [v, setV] = useState(i); const mudou = JSON.stringify(v) !== JSON.stringify(i)
  return <tr><td>{i.name}</td><td><input className="campo-p num" type="number" min={0} step="0.01" value={(v.price_cents / 100).toFixed(2)} onChange={e => setV({ ...v, price_cents: Math.max(0, Math.round((Number(e.target.value) || 0) * 100)) })} aria-label={`Preço de ${i.name}`} /></td>
    <td><input type="checkbox" role="switch" checked={v.active} onChange={e => setV({ ...v, active: e.target.checked })} aria-label="No cardápio" />{mudou && <button className="primario peq-p" onClick={() => salvar(v)}>Salvar</button>}</td></tr>
}

/** 5. Aparência: o tema é dado no código; aqui se vê como o app aparece para o cliente. */
export function AparenciaSec() {
  return <section><p>Esta é a aparência do aplicativo do cliente. Cores, logo e textos são dados do restaurante.</p>
    <div className="cartao-p"><div className="amostras">{Object.entries(TEMA.cores).filter(([k]) => ['--bg', '--bg2', '--bg3', '--laranja', '--txt'].includes(k)).map(([k, v]) => <span key={k} className="amostra"><i style={{ background: v }} />{v}</span>)}</div>
      <img src={import.meta.env.BASE_URL + TEMA.logo} alt={TEMA.nome} className="logo-p" /><p><b>{TEMA.nome}</b></p><p>{TEMA.slogan}</p><p><b>{CLUBE.nome}</b></p></div>
    <p className="nota">A troca de cores, logo e textos pelo painel é a próxima versão. Hoje a alteração é feita pelo SemReservas.</p></section>
}

/** 6. Roleta do Chef e aniversário. */
export function ExtrasSec({ est }: { est: Estab }) {
  const t = est.tenant_id
  return <section><RoletaForm t={t} /><AnivForm t={t} /><ExtrasLista t={t} /></section>
}
function RoletaForm({ t }: { t: string }) {
  const [c, e] = useCarga(() => P.roletaCfg(t), [t]); const [v, setV] = useState<P.Roleta | null>(null); const [msg, setMsg] = useState('')
  useEffect(() => { if (c) setV(c) }, [c])
  if (e) return <Aviso e={e} />; if (!v) return <Carregando />
  return <div className="cartao-p"><h2>Roleta do Chef</h2><Sw on={v.enabled} set={x => setV({ ...v, enabled: x })} t="Ligada" />
    <Linha t="Pedido mínimo para ganhar 1 giro (R$)"><input className="campo-p num" type="number" min={0} value={v.min_subtotal_cents / 100} onChange={e => setV({ ...v, min_subtotal_cents: Math.max(0, Math.round((Number(e.target.value) || 0) * 100)) })} /></Linha>
    <Linha t="Prazo para completar as 5 etapas (dias)"><input className="campo-p num" type="number" min={7} max={365} value={v.window_days} onChange={e => setV({ ...v, window_days: Number(e.target.value) || 7 })} /></Linha>
    <Linha t="Prêmio"><input className="campo-p" value={v.prize_name} onChange={e => setV({ ...v, prize_name: e.target.value })} /></Linha>
    <Linha t="Validade do prêmio (dias)"><input className="campo-p num" type="number" min={1} max={365} value={v.prize_valid_days} onChange={e => setV({ ...v, prize_valid_days: Number(e.target.value) || 1 })} /></Linha>
    <Sw on={v.demo} set={x => setV({ ...v, demo: x })} t='Modo demonstração ("sem prêmio real")' />
    <p className="nota">Cada giro entrega uma etapa nova e o 5º giro ganha o prêmio. O valor do pedido vem dos preços do cardápio. Para prêmio real, consulte as regras de promoção comercial antes de desligar a demonstração.</p>
    <button className="primario" onClick={async () => { try { setMsg(await P.salvarRoleta(t, v) ? 'Salvo.' : 'Você não tem permissão ou os dados são inválidos.') } catch { setMsg('Não foi possível salvar.') } }}>Salvar</button>{msg && <p role="status" className="nota">{msg}</p>}</div>
}
function AnivForm({ t }: { t: string }) {
  const [c, e] = useCarga(() => P.anivCfg(t), [t]); const [v, setV] = useState<P.Aniv | null>(null); const [msg, setMsg] = useState('')
  useEffect(() => { if (c) setV(c) }, [c])
  if (e) return <Aviso e={e} />; if (!v) return <Carregando />
  return <div className="cartao-p"><h2>Meu aniversário</h2><Sw on={v.enabled} set={x => setV({ ...v, enabled: x })} t="Ligado" />
    <Linha t="Presente do aniversariante"><input className="campo-p" value={v.benefit} onChange={e => setV({ ...v, benefit: e.target.value })} /></Linha>
    <Linha t="Desconto para convidados na comida (%)"><input className="campo-p num" type="number" min={0} max={100} value={v.guests_pct} onChange={e => setV({ ...v, guests_pct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></Linha>
    <Linha t="Mínimo de acompanhantes"><input className="campo-p num" type="number" min={0} max={50} value={v.min_guests} onChange={e => setV({ ...v, min_guests: Math.max(0, Number(e.target.value) || 0) })} /></Linha>
    <Linha t="Validade do presente (dias após o aniversário)"><input className="campo-p num" type="number" min={1} max={30} value={v.valid_days} onChange={e => setV({ ...v, valid_days: Math.max(1, Number(e.target.value) || 1) })} /></Linha>
    <Sw on={v.demo} set={x => setV({ ...v, demo: x })} t='Modo demonstração ("sem prêmio real")' />
    <button className="primario" onClick={async () => { try { setMsg(await P.salvarAniv(t, v) ? 'Salvo.' : 'Você não tem permissão ou os dados são inválidos.') } catch { setMsg('Não foi possível salvar.') } }}>Salvar</button>{msg && <p role="status" className="nota">{msg}</p>}</div>
}
function ExtrasLista({ t }: { t: string }) {
  const [x, e] = useCarga(() => P.extrasRecentes(t), [t])
  return <div className="cartao-p"><h2>Prêmios emitidos recentemente</h2><Aviso e={e} />{!x && !e && <Carregando />}{x && !x.length && <p className="vazio">Nenhum prêmio emitido ainda.</p>}
    {x && x.length > 0 && <table className="tabela"><thead><tr><th>Quando</th><th>Origem</th><th>Prêmio</th><th>Código</th><th>Situação</th></tr></thead><tbody>{x.map((p, i) => <tr key={i}><td>{dh(p.created_at)}</td><td>{p.source === 'roulette' ? 'Roleta' : 'Aniversário'}</td><td>{p.name}</td><td><code>{p.code}</code></td><td>{p.status === 'used' ? 'Usado' : new Date(p.valid_until) < new Date() ? 'Vencido' : `Válido até ${dh(p.valid_until).slice(0, 5)}`}</td></tr>)}</tbody></table>}</div>
}

/** 7. Configurações: placas, horário e presença (o link da equipe vem do painel já existente). */
export function ConfigSec({ est, equipe }: { est: Estab; equipe: ReactNode }) {
  const t = est.tenant_id
  return <section>{equipe}<AlertasSec t={t} /><GarconsSec t={t} /><PlacasSec t={t} /><HorarioSec t={t} /><PresencaSec t={t} /></section>
}
function PlacasSec({ t }: { t: string }) {
  const [p, e] = useCarga(() => P.placas(t), [t]); const [msg, setMsg] = useState('')
  const copiar = async (u?: string) => { if (!u) return; try { await navigator.clipboard.writeText(u); setMsg('Link copiado.') } catch { setMsg('Copie manualmente: ' + u) } }
  return <div className="cartao-p"><h2>Placas das mesas</h2><p>Cada placa tem um link próprio (NFC e QR). Quem tem o link age como se estivesse naquela mesa: trate como uma senha.</p><Aviso e={e} />{!p && !e && <Carregando />}{msg && <p role="status" className="nota">{msg}</p>}
    {p && !p.length && <p className="vazio">Nenhuma placa cadastrada.</p>}{p && p.length > 0 && <table className="tabela"><thead><tr><th>Placa</th><th>Situação</th><th>Links</th></tr></thead><tbody>{p.map(x => <tr key={x.numero}><td>{x.numero}</td><td>{x.estado}</td><td><button className="sec peq-p" onClick={() => copiar(x.nfc)}>Copiar link NFC</button> <button className="sec peq-p" onClick={() => copiar(x.qr)}>Copiar link QR</button></td></tr>)}</tbody></table>}</div>
}
const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
function HorarioSec({ t }: { t: string }) {
  const [c, e] = useCarga(() => P.clubeCfg(t), [t]); const [v, setV] = useState<P.Cfg | null>(null); const [msg, setMsg] = useState('')
  useEffect(() => { if (c) setV({ ...c, open_from: c.open_from.slice(0, 5), open_to: c.open_to.slice(0, 5) }) }, [c])
  if (e) return <Aviso e={e} />; if (!v) return <Carregando />
  return <div className="cartao-p"><h2>Horário de funcionamento e Clube</h2>
    <Sw on={v.hours_enforced} set={x => setV({ ...v, hours_enforced: x })} t="Pontos de visita só no horário de funcionamento" />
    <div className="dias">{DIAS.map((d, i) => <label key={d} className="chip-d"><input type="checkbox" checked={v.open_days.includes(i + 1)} onChange={e => setV({ ...v, open_days: e.target.checked ? [...v.open_days, i + 1].sort() : v.open_days.filter(x => x !== i + 1) })} />{d}</label>)}</div>
    <Linha t="Abre às"><input className="campo-p" type="time" value={v.open_from} onChange={e => setV({ ...v, open_from: e.target.value })} /></Linha>
    <Linha t="Fecha às"><input className="campo-p" type="time" value={v.open_to} onChange={e => setV({ ...v, open_to: e.target.value })} /></Linha>
    <Linha t="Tolerância depois de fechar (minutos)"><input className="campo-p num" type="number" min={0} max={180} value={v.grace_min} onChange={e => setV({ ...v, grace_min: Math.max(0, Number(e.target.value) || 0) })} /></Linha>
    <Linha t="Teto mensal de pontos por interações"><input className="campo-p num" type="number" min={0} value={v.monthly_cap} onChange={e => setV({ ...v, monthly_cap: Math.max(0, Number(e.target.value) || 0) })} /></Linha>
    <Linha t="Prazo para cancelar uma troca (segundos)"><input className="campo-p num" type="number" min={0} max={600} value={v.cancel_window_seconds} onChange={e => setV({ ...v, cancel_window_seconds: Math.max(0, Math.min(600, Number(e.target.value) || 0)) })} /></Linha>
    <button className="primario" disabled={!v.open_days.length} onClick={async () => { try { setMsg(await P.salvarCfg(t, v) ? 'Salvo.' : 'Você não tem permissão ou os dados são inválidos.') } catch { setMsg('Não foi possível salvar.') } }}>Salvar</button>{msg && <p role="status" className="nota">{msg}</p>}</div>
}
function PresencaSec({ t }: { t: string }) {
  const [c, e] = useCarga(() => P.presencaCfg(t), [t]); const [v, setV] = useState<P.Presenca | null>(null); const [msg, setMsg] = useState('')
  useEffect(() => { if (c) setV(c) }, [c])
  const aqui = () => navigator.geolocation?.getCurrentPosition(p => setV(x => x && { ...x, lat: +p.coords.latitude.toFixed(6), lon: +p.coords.longitude.toFixed(6) }), () => setMsg('Não foi possível obter a localização deste aparelho.'), { enableHighAccuracy: true, timeout: 10000 })
  if (e) return <Aviso e={e} />; if (!v) return <Carregando />
  return <div className="cartao-p"><h2>Presença no restaurante</h2><p>Confere se o cliente está no local ao chamar o garçom e ao registrar a visita. A posição do cliente nunca é guardada, só o resultado (perto, longe ou não verificado).</p>
    <Linha t="Regra"><select className="campo-p" value={v.presence_policy} onChange={e => setV({ ...v, presence_policy: e.target.value })}>
      <option value="off">Desligada</option><option value="flag">Só avisar a equipe</option><option value="block_far">Recusar quem está longe</option><option value="require">Exigir localização</option></select></Linha>
    <Linha t="Latitude"><input className="campo-p" inputMode="decimal" value={v.lat ?? ''} onChange={e => setV({ ...v, lat: e.target.value === '' ? null : Number(e.target.value) })} /></Linha>
    <Linha t="Longitude"><input className="campo-p" inputMode="decimal" value={v.lon ?? ''} onChange={e => setV({ ...v, lon: e.target.value === '' ? null : Number(e.target.value) })} /></Linha>
    <Linha t="Raio (metros)"><input className="campo-p num" type="number" min={30} max={2000} value={v.radius_m} onChange={e => setV({ ...v, radius_m: Math.max(30, Math.min(2000, Number(e.target.value) || 150)) })} /></Linha>
    <button className="sec" onClick={aqui}>Usar a localização deste aparelho</button> <button className="primario" onClick={async () => { try { setMsg(await P.salvarPresenca(t, v) ? 'Salvo.' : 'Dados inválidos (latitude e longitude juntas; raio de 30 a 2000 m).') } catch { setMsg('Não foi possível salvar.') } }}>Salvar</button>{msg && <p role="status" className="nota">{msg}</p>}</div>
}
export { useCallback }

const ROTK2: Record<string, string> = { waiter: 'Chamar garçom', bill: 'Pedir a conta', order: 'Pedido', question: 'Dúvida', other: 'Outro', kitchen_item: 'Item da cozinha' }
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Aviso de chamados em QUALQUER seção do painel: som e visual, ativo até alguém assumir. Se ninguém assume, o dono direciona ou assume. */
export function AlertaChamados({ est }: { est: Estab }) {
  const t = est.tenant_id; const [cfg, setCfg] = useState<P.Alertas>({ owner_sound: true, staff_sound: true, volume: 10, interval_s: 4, escalate_s: 60 }); const cfgRef = useRef(cfg).current
  const [fila, setFila] = useState<P.Fila[]>([]); const [ok, setOk] = useState(alertaAtivo()); const [agora, setAgora] = useState(Date.now()); const [offline, setOffline] = useState(false)
  const [equipe, setEquipe] = useState<P.Garcom[]>([]); const [busy, setBusy] = useState<string | null>(null); const [msg, setMsg] = useState('')
  const vistos = useRef(new Set<string>()).current; const titulo = useRef(document.title).current
  useEffect(() => { P.garcons(t).then(l => setEquipe(l.filter(g => g.active))).catch(() => undefined); P.alertaCfg(t).then(c => { if (c) { setCfg(c); Object.assign(cfgRef, c) } }).catch(() => undefined) }, [t])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let n = 0; let vivo = true; let ultimoOk = Date.now()
    const ler = () => P.filaAgora(t).then(l => { if (!vivo) return; ultimoOk = Date.now(); setOffline(false); setFila(l)
      for (const x of l) if (x.status === 'PENDING' && !vistos.has(x.id)) { vistos.add(x.id); if (typeof Notification !== 'undefined' && Notification.permission === 'granted') { try { new Notification(`Mesa ${x.table_label} · ${ROTK2[x.kind] ?? x.kind}`, { tag: x.id, requireInteraction: true, body: 'Chamado aguardando atendimento' }) } catch { /* ignora */ } } }
    }).catch(() => { if (vivo && Date.now() - ultimoOk > 9000) setOffline(true) })
    void ler()
    const parar = relogio(() => { n++; setAgora(Date.now()); if (n % 3 === 0) void ler() })
    return () => { vivo = false; parar(); document.title = titulo }
  }, [t])   // eslint-disable-line react-hooks/exhaustive-deps
  const pend = fila.filter(x => x.status === 'PENDING'); const urgentes = pend.filter(x => (agora - Date.parse(x.created_at)) / 1000 > cfg.escalate_s)
  const ref = useRef({ pend: 0, urg: 0, n: 0 }).current
  ref.pend = pend.length; ref.urg = urgentes.length
  useEffect(() => {   // som a cada 3 s enquanto houver chamado sem atendimento; título pisca
    const parar = relogio(() => { ref.n++
      if (ref.pend > 0) {
        document.title = ref.n % 2 ? `🔴 ${ref.pend} CHAMADO${ref.pend > 1 ? 'S' : ''}!` : '⚠️ ATENDER · SemReservas'
        const periodo = ref.urg > 0 ? Math.max(2, Math.round(cfgRef.interval_s / 2)) : cfgRef.interval_s    // urgente soa com o dobro da frequência
        if (cfgRef.owner_sound && ref.n % periodo === 0) tocar(ref.urg > 0, cfgRef.volume)
      }
      else document.title = titulo })
    return () => parar()
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const assumir = async (x: P.Fila, quem: string | null) => {
    setBusy(x.id); setMsg('')
    try { setMsg(await P.assumirChamado(t, x.id, quem) ? '' : 'Não foi possível assumir (outra pessoa já assumiu ou sem permissão).'); setFila(await P.filaAgora(t)) } catch { setMsg('Sem conexão. Tente de novo.') }
    setBusy(null)
  }
  const concluir = async (x: P.Fila) => { setBusy(x.id); try { await P.concluirChamado(t, x.id); setFila(await P.filaAgora(t)) } catch { setMsg('Sem conexão. Tente de novo.') } setBusy(null) }
  const ativar = async () => { setOk(await ativarAlerta(cfg.volume)); if (typeof Notification !== 'undefined' && Notification.permission === 'default') { try { await Notification.requestPermission() } catch { /* ignora */ } } }
  const andamento = fila.filter(x => x.status === 'ACKNOWLEDGED')
  return (
    <div className="alerta-ch" aria-live="assertive">
      {!ok && cfg.owner_sound && <div className="ativar-som"><span>Ative o alerta sonoro para ser avisado dos chamados, mesmo em outra aba.</span><button className="primario" onClick={ativar}>Ativar alerta sonoro</button></div>}
      {offline && <div className="ch-offline" role="alert">SEM CONEXÃO. Chamados podem não aparecer. Verifique a internet.</div>}
      {msg && <p className="alerta" role="alert">{msg}</p>}
      {pend.map(x => { const seg = Math.max(0, Math.floor((agora - Date.parse(x.created_at)) / 1000)); const urg = seg > cfg.escalate_s; return (
        <div key={x.id} className={'ch-novo' + (urg ? ' urg' : '')} role="alert">
          <div className="ch-topo"><b>Mesa {x.table_label} · {ROTK2[x.kind] ?? x.kind}</b><span>aguardando há {mmss(seg)}</span></div>
          {urg && <p className="ch-urg">Ninguém assumiu há mais de {cfg.escalate_s} segundos. Direcione a um garçom ou assuma você.</p>}
          {x.itens && <ul className="itens-p">{x.itens.map((i, k) => <li key={k}>{i.qty} × {i.name}{i.obs ? ` (${i.obs})` : ''}</li>)}</ul>}
          <div className="ch-acoes">
            <button className="primario" disabled={busy === x.id} onClick={() => assumir(x, null)}>Eu assumo</button>
            {equipe.length > 0 && <select className="campo-p" aria-label="Direcionar para um garçom" disabled={busy === x.id} value="" onChange={e => { if (e.target.value) void assumir(x, e.target.value) }}><option value="">Direcionar para…</option>{equipe.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select>}
          </div></div>) })}
      {andamento.map(x => <div key={x.id} className="ch-and"><span><b>Mesa {x.table_label} · {ROTK2[x.kind] ?? x.kind}</b> · com <b>{x.handled_by_label ?? 'a equipe'}</b>{x.handled_at ? ` desde ${new Date(x.handled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
        <button className="sec peq-p" disabled={busy === x.id} onClick={() => concluir(x)}>Concluir</button></div>)}
    </div>
  )
}

/** Lista de garçons para direcionar (nomes, não contas de acesso). */
export function GarconsSec({ t }: { t: string }) {
  const [g, e, rec] = useCarga(() => P.garcons(t), [t]); const [nome, setNome] = useState(''); const [msg, setMsg] = useState('')
  const salvar = async (n: string, a: boolean) => { try { setMsg(await P.salvarGarcom(t, n, a) ? '' : 'Não foi possível salvar.'); rec() } catch { setMsg('Sem conexão. Tente de novo.') } }
  return <div className="cartao-p"><h2>Garçons</h2><p>Nomes para direcionar chamados quando ninguém assumir. Aparecem na lista "Direcionar para…".</p><Aviso e={e} />{msg && <p role="status" className="nota">{msg}</p>}
    {g && g.map(x => <label key={x.id} className="sw"><input type="checkbox" role="switch" checked={x.active} onChange={ev => salvar(x.name, ev.target.checked)} /><span>{x.name}{x.active ? '' : ' (inativo)'}</span></label>)}
    <div className="form-p"><input className="campo-p" placeholder="Nome do garçom" maxLength={40} value={nome} onChange={e => setNome(e.target.value)} /><button className="primario" disabled={!nome.trim()} onClick={async () => { await salvar(nome.trim(), true); setNome('') }}>Adicionar</button></div></div>
}

/** Alertas de chamado: som alto e intermitente; se os garçons não têm equipamento, o som toca só neste painel. */
export function AlertasSec({ t }: { t: string }) {
  const [c, e] = useCarga(() => P.alertaCfg(t), [t]); const [v, setV] = useState<P.Alertas | null>(null); const [msg, setMsg] = useState('')
  useEffect(() => { if (c) setV(c) }, [c])
  if (e) return <Aviso e={e} />; if (!v) return <Carregando />
  const testar = async () => { await ativarAlerta(v.volume); tocar(false, v.volume); setTimeout(() => tocar(true, v.volume), 1700) }
  return <div className="cartao-p"><h2>Alertas de chamado</h2>
    <p>O chamado fica em alerta, com som e visual, até alguém assumir. Se ninguém assumir, o alerta fica urgente e o proprietário direciona a um garçom ou assume.</p>
    <Sw on={v.owner_sound} set={x => setV({ ...v, owner_sound: x })} t="Tocar som neste painel (proprietário)" />
    <Sw on={v.staff_sound} set={x => setV({ ...v, staff_sound: x })} t="Os garçons têm equipamento: tocar som também no painel da equipe" />
    {!v.staff_sound && <p className="nota">Sem equipamento para os garçons, o chamado soa só neste painel. Mantenha-o aberto e com o som ativado.</p>}
    <Linha t={`Volume (${v.volume} de 10)`}><input type="range" min={1} max={10} value={v.volume} onChange={e => setV({ ...v, volume: Number(e.target.value) })} aria-label="Volume" /></Linha>
    <Linha t="Intermitência: repetir o som a cada (segundos)"><input className="campo-p num" type="number" min={2} max={30} value={v.interval_s} onChange={e => setV({ ...v, interval_s: Math.max(2, Math.min(30, Number(e.target.value) || 4)) })} /></Linha>
    <Linha t="Alerta urgente se ninguém assumir em (segundos)"><input className="campo-p num" type="number" min={15} max={600} value={v.escalate_s} onChange={e => setV({ ...v, escalate_s: Math.max(15, Math.min(600, Number(e.target.value) || 60)) })} /></Linha>
    <div className="form-p"><button className="sec" onClick={testar}>Testar o som</button><button className="primario" onClick={async () => { try { setMsg(await P.salvarAlertas(t, v) ? 'Salvo. Vale na próxima atualização dos painéis.' : 'Você não tem permissão ou os dados são inválidos.') } catch { setMsg('Não foi possível salvar.') } }}>Salvar</button></div>{msg && <p role="status" className="nota">{msg}</p>}</div>
}

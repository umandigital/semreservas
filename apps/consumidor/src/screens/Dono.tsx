import { useCallback, useEffect, useState } from 'react'
import { CATEGORIAS, ITENS } from '../data/cardapio'
import { ROTULO, type Kind } from '../lib/api'
import { calcularMetricas, fmtDuracao, type Metricas } from '../lib/metricas'
import { chamadosDesde, entrar, esgotadosDoEstab, linkDaEquipe, marcarEsgotado, meusEstabelecimentos, sair, trocarLinkDaEquipe, urlDoPainel, useSessao, type Estab } from '../lib/dono'

type Aba = 'geral' | 'esgotado' | 'equipe'
const PERIODOS = [{ k: 'hoje', t: 'Hoje', dias: 0 }, { k: '7', t: '7 dias', dias: 7 }, { k: '30', t: '30 dias', dias: 30 }] as const

export default function Dono() {
  const { sessao, carregando } = useSessao()
  if (carregando) return <main className="centro"><p>Carregando…</p></main>
  return sessao ? <Painel email={sessao.user.email ?? ''} /> : <Login />
}

function Login() {
  const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [ver, setVer] = useState(false); const [erro, setErro] = useState(''); const [busy, setBusy] = useState(false)
  return (
    <main className="dono-login">
      <h1>Área do dono</h1><p className="nota">SemReservas · acesso com e-mail e senha</p>
      <form onSubmit={async e => { e.preventDefault(); setBusy(true); setErro(''); const r = await entrar(email, senha); if (r) setErro(r); setBusy(false) }}>
        <label className="rot">E-mail<input className="campo" type="email" name="username" autoComplete="username" inputMode="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="rot">Senha<span className="senha"><input className="campo" type={ver ? 'text' : 'password'} name="password" autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} /><button type="button" className="sec" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? 'Ocultar' : 'Mostrar'}</button></span></label>
        {erro && <p className="alerta" role="alert">{erro}</p>}
        <button className="primario grande" disabled={busy || !email || !senha}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="nota">Esqueceu a senha? Fale com o SemReservas.</p>
    </main>
  )
}

function Painel({ email }: { email: string }) {
  const [ests, setEsts] = useState<Estab[] | null>(null); const [erro, setErro] = useState(false); const [aba, setAba] = useState<Aba>('geral')
  useEffect(() => { meusEstabelecimentos().then(setEsts).catch(() => setErro(true)) }, [])
  const est = ests?.[0]
  return (
    <main className="dono">
      <header><div><b>{est?.name ?? 'Dashboard'}</b><small>{email}</small></div><button className="sec" onClick={() => sair()}>Sair</button></header>
      {erro && <p className="alerta" role="alert">Não foi possível carregar. Verifique a internet e recarregue.</p>}
      {ests && !est && <div className="aviso">Sua conta ainda não está ligada a nenhum estabelecimento. Fale com o SemReservas.</div>}
      {est && (
        <>
          <div className="abas" role="tablist">
            {([['geral', 'Atendimento'], ['esgotado', 'Acabou hoje'], ['equipe', 'Painel da equipe']] as const).map(([k, t]) => <button key={k} role="tab" aria-selected={aba === k} className={aba === k ? 'on' : ''} onClick={() => setAba(k)}>{t}</button>)}
          </div>
          {aba === 'geral' && <Geral est={est} />}
          {aba === 'esgotado' && <Esgotado est={est} />}
          {aba === 'equipe' && <Equipe est={est} />}
        </>
      )}
    </main>
  )
}

function Geral({ est }: { est: Estab }) {
  const [per, setPer] = useState<(typeof PERIODOS)[number]['k']>('hoje'); const [m, setM] = useState<Metricas | null>(null); const [erro, setErro] = useState(false)
  useEffect(() => {
    const dias = PERIODOS.find(p => p.k === per)!.dias; const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - dias)
    setM(null); setErro(false)
    chamadosDesde(est.tenant_id, d.toISOString()).then(l => setM(calcularMetricas(l))).catch(() => setErro(true))
  }, [est.tenant_id, per])
  return (
    <section>
      <div className="chips" role="tablist" aria-label="Período">{PERIODOS.map(p => <button key={p.k} role="tab" aria-selected={per === p.k} className={'chip' + (per === p.k ? ' on' : '')} onClick={() => setPer(p.k)}>{p.t}</button>)}</div>
      {erro && <p className="alerta" role="alert">Não foi possível carregar os números.</p>}
      {!m && !erro && <p className="nota">Carregando…</p>}
      {m && (m.total === 0 ? <p className="vazio">Nenhum chamado neste período.</p> : (
        <>
          <div className="cards">
            <Card t="Chamados" v={String(m.total)} /><Card t="Atendidos" v={String(m.atendidos)} /><Card t="Cancelados" v={String(m.cancelados)} /><Card t="Em aberto agora" v={String(m.abertos)} />
            <Card t="Tempo típico até a equipe ver" v={fmtDuracao(m.medianaVistoS)} /><Card t="Tempo típico até concluir" v={fmtDuracao(m.medianaConclusaoS)} />
          </div>
          <h2 className="sub">Por motivo</h2>
          <ul className="barras">{m.porMotivo.map(x => <li key={x.kind}><span>{ROTULO[x.kind as Kind] ?? x.kind}</span><i style={{ width: `${(x.total / m.total) * 100}%` }} /><b>{x.total}</b></li>)}</ul>
          <h2 className="sub">Mesas que mais chamaram</h2>
          <ul className="barras">{m.porMesa.map(x => <li key={x.mesa}><span>Mesa {x.mesa}</span><i style={{ width: `${(x.total / m.porMesa[0].total) * 100}%` }} /><b>{x.total}</b></li>)}</ul>
        </>
      ))}
      <p className="nota">Estes números medem o atendimento (chamados e tempos de resposta). Não medem vendas nem faturamento. O tempo típico é a mediana: um chamado esquecido não distorce o resultado.</p>
    </section>
  )
}
const Card = ({ t, v }: { t: string; v: string }) => <div className="card-n"><small>{t}</small><b>{v}</b></div>

function Esgotado({ est }: { est: Estab }) {
  const [ids, setIds] = useState<string[] | null>(null); const [erro, setErro] = useState(''); const [busy, setBusy] = useState<string | null>(null)
  const carregar = useCallback(() => esgotadosDoEstab(est.tenant_id).then(setIds).catch(() => setErro('Não foi possível carregar.')), [est.tenant_id])
  useEffect(() => { carregar() }, [carregar])
  const alternar = async (item: string, acabou: boolean) => {
    const antes = ids ?? []
    setIds(acabou ? [...antes.filter(x => x !== item), item] : antes.filter(x => x !== item))   // aparece na hora
    setBusy(item); setErro('')
    try { if (!(await marcarEsgotado(est.tenant_id, item, acabou))) { setIds(antes); setErro('Você não tem permissão para isso.') } }
    catch { setIds(antes); setErro('Sem conexão. A alteração não foi salva. Tente de novo.') }   // desfaz: nunca mostra algo que não foi salvo
    setBusy(null)
  }
  return (
    <section>
      <p className="nota">Marque o que acabou. Some na hora para os clientes: o prato fica cinza, com "Acabou hoje".</p>
      {erro && <p className="alerta" role="alert">{erro}</p>}
      {ids === null ? <p className="nota">Carregando…</p> : CATEGORIAS.map(cat => (
        <div key={cat}><h2 className="sub">{cat}</h2>
          {ITENS.filter(i => i.cat === cat).map(i => { const acabou = ids.includes(i.id); return (
            <label key={i.id} className="toggle"><span>{i.nome}</span><input type="checkbox" role="switch" checked={acabou} disabled={busy === i.id} onChange={e => alternar(i.id, e.target.checked)} /><i>{acabou ? 'Acabou' : 'Tem'}</i></label>) })}
        </div>))}
    </section>
  )
}

function Equipe({ est }: { est: Estab }) {
  const [link, setLink] = useState<string | null | undefined>(undefined); const [msg, setMsg] = useState(''); const [erro, setErro] = useState('')
  useEffect(() => { linkDaEquipe(est.tenant_id).then(setLink).catch(() => setErro('Não foi possível carregar o link.')) }, [est.tenant_id])
  const url = link ? urlDoPainel(link) : ''
  const copiar = async () => { try { await navigator.clipboard.writeText(url); setMsg('Link copiado.') } catch { setMsg('Selecione o link e copie manualmente.') } }
  const trocar = async () => {
    if (!confirm('Trocar o link? O link atual para de funcionar NA HORA e o tablet do restaurante precisará abrir o novo.')) return
    try { const n = await trocarLinkDaEquipe(est.tenant_id); if (n) { setLink(n); setMsg('Link novo gerado. O antigo não funciona mais.') } else setErro('Você não tem permissão para isso.') } catch { setErro('Sem conexão. Tente de novo.') }
  }
  return (
    <section>
      <p>Este é o link do painel de atendimento. A equipe abre no tablet, toca em "Toque para iniciar" e deixa a tela aberta.</p>
      {erro && <p className="alerta" role="alert">{erro}</p>}
      {link === undefined && !erro && <p className="nota">Carregando…</p>}
      {link === null && <div className="aviso">Este estabelecimento ainda não tem link de painel. Use "Gerar link".</div>}
      {link && <div className="cartao-i"><code className="link-painel" data-testid="link-painel">{url}</code><button className="primario" onClick={copiar}>Copiar link</button></div>}
      {msg && <p className="nota" role="status">{msg}</p>}
      <button className="sec grande" onClick={trocar}>{link ? 'Trocar por um link novo' : 'Gerar link'}</button>
      <p className="nota">Trate o link como uma senha: quem o tem opera a fila de atendimento. Se vazar ou o tablet for perdido, troque-o aqui.</p>
    </section>
  )
}

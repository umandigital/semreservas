import { useEffect, useState } from 'react'
import { avisar } from '../lib/mockStore'
import { useClube, type ExtraV } from '../lib/clube'
import { brl } from '../data/cardapio'
import { IconCheck } from '../ui/Icons'

type Ir = { ir: (r: string) => void }
const dia = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const Demo = ({ on }: { on: boolean }) => on ? <small className="selo-demo">Demonstração: sem prêmio real</small> : null

/** Lista de prêmios dos extras com a validade sempre à vista. */
function ListaExtras({ extras, ir }: { extras: ExtraV[]; ir: (r: string) => void }) {
  if (!extras.length) return null
  return <div className="bloco-c"><h2>Meus prêmios</h2><ul className="premios">{extras.map(x => (
    <li key={x.id}><span><b>{x.name}</b><small>{x.status === 'available' ? `Troque até ${dia(x.validade)}` : x.status === 'used' ? 'Já usado' : 'Vencido'}</small></span>
      {x.status === 'available' ? <button className="primario" onClick={() => ir('/extra/' + x.id)}>Trocar</button> : <span className="falta">{x.status === 'used' ? 'usado' : 'vencido'}</span>}</li>))}</ul></div>
}

const ROT = 360 / 5
/** Roleta do Chef: 5 etapas; cada giro dá uma etapa nova; o 5º giro ganha. */
export function Roleta({ ir }: Ir) {
  const c = useClube(); const v = c.v; const r = v?.roleta
  const [giro, setGiro] = useState(0); const [rodando, setRodando] = useState(false); const [res, setRes] = useState<{ step: string; count: number; won: boolean; prizeId?: string } | null>(null); const [info, setInfo] = useState(false)
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!v.membro) return <section className="tela-int"><h1>Roleta do Chef</h1><p>Entre no Clube para participar.</p><button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>
  if (!r?.enabled) return <section className="tela-int"><h1>Roleta do Chef</h1><p>A Roleta do Chef não está disponível agora. Volte na próxima visita.</p><button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  if (!r.adulto) return <section className="tela-int"><h1>Roleta do Chef</h1><p>A Roleta é só para maiores de 18 anos.</p><button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  const total = r.steps.length; const faltam = total - r.got.length
  const girar = async () => {
    if (rodando) return; setRes(null)
    try {
      const x = await c.girar(); const idx = r.steps.indexOf(x.step); setRodando(true)
      setGiro(g => g + 360 * 4 + (360 - (idx * ROT + ROT / 2)) - (g % 360))
      setTimeout(() => { setRodando(false); setRes(x); if (navigator.vibrate) navigator.vibrate(x.won ? [80, 60, 80] : 60) }, 3200)
    } catch (e) { c.avisarErro(e) }
  }
  return (
    <section className="tela-int roleta">
      <h1>Roleta do Chef</h1>
      <div className="bloco-c"><div className="etapas">{r.steps.map(p => <span key={p} className={'etapa' + (r.got.includes(p) ? ' tem' : '')}><i><IconCheck /></i>{p}</span>)}</div>
        <p><b>Você tem {r.got.length} de {total}</b>{r.expira ? ` · faltam ${Math.max(0, Math.ceil((r.expira - Date.now()) / 86400000))} dias` : ''}</p></div>
      <div className="roda-wrap" aria-hidden="true"><div className="ponteiro" /><svg className="roda" viewBox="-100 -100 200 200" style={{ transform: `rotate(${giro}deg)`, transition: rodando ? 'transform 3.1s cubic-bezier(.12,.7,.1,1)' : 'none' }}>
        {r.steps.map((p, i) => { const a0 = (i * ROT - 90) * Math.PI / 180, a1 = ((i + 1) * ROT - 90) * Math.PI / 180, am = (a0 + a1) / 2
          return <g key={p}><path d={`M0 0 L${95 * Math.cos(a0)} ${95 * Math.sin(a0)} A95 95 0 0 1 ${95 * Math.cos(a1)} ${95 * Math.sin(a1)}Z`} fill={i % 2 ? '#e09060' : '#5e1b34'} stroke="#f8e8c8" strokeWidth="2" />
            <text x={62 * Math.cos(am)} y={62 * Math.sin(am)} textAnchor="middle" dominantBaseline="middle" fill={i % 2 ? '#380818' : '#f8e8c8'} fontSize="13" fontWeight="800">{p}</text></g> })}
        <circle r="16" fill="#380818" stroke="#f8e8c8" strokeWidth="3" /></svg></div>
      {res && !rodando && (res.won
        ? <div className="papel"><h2>Prato completo!</h2><p>Você completou as {total} etapas e ganhou:</p><b className="premio-g">{r.premio}</b><Demo on={r.demo} />
            <button className="primario grande" onClick={() => ir('/extra/' + (res.prizeId ?? v.extras[0]?.id))}>Trocar agora</button></div>
        : <div className="papel"><h2>Você ganhou: {res.step}!</h2><p>Você tem {res.count} de {total}. Faltam {total - res.count} {total - res.count === 1 ? 'giro' : 'giros'}.</p>{total - res.count === 1 && <p><b>Falta só 1!</b> Seu próximo giro garante {r.premio}.</p>}</div>)}
      {r.grants > 0
        ? <button className="primario grande" disabled={rodando} onClick={girar}>{rodando ? 'Girando…' : 'Girar'}</button>
        : <p className="aviso">Para ganhar um giro: peça pelo app, chegue a {brl(r.minCents)} e toque em <b>Chamar garçom</b>. Um giro por visita.</p>}
      {faltam === 1 && !res && r.got.length > 0 && <p className="aviso"><b>Falta só 1!</b> Seu próximo giro garante {r.premio}.</p>}
      <ListaExtras extras={v.extras.filter(x => x.source === 'roulette')} ir={ir} />
      <button className="link" onClick={() => setInfo(!info)}>Como funciona</button>
      {info && <div className="bloco-c"><p><b>1.</b> Peça pelo app e chame o garçom com um pedido de {brl(r.minCents)} ou mais.</p><p><b>2.</b> Gire a roleta, uma vez por visita.</p><p><b>3.</b> Cada giro dá uma etapa nova. Complete as {total} etapas em {r.janelaDias} dias e ganhe {r.premio}.</p><p className="nota">Só para maiores de 18 anos. O valor do pedido é o estimado pelo app.</p><Demo on={r.demo} /></div>}
    </section>
  )
}

/** Meu aniversário: presente no dia (ou no dia seguinte), uma vez por ano. */
export function Aniversario({ ir }: Ir) {
  const c = useClube(); const v = c.v; const a = v?.aniv
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!v.membro || !a) return <section className="tela-int"><h1>Meu aniversário</h1><p>Entre no Clube e informe seu aniversário para ganhar um presente.</p><button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>
  if (!a.enabled) return <section className="tela-int"><h1>Meu aniversário</h1><p>Este benefício não está disponível agora.</p></section>
  const quando = a.diasAte === 0 ? 'Hoje é o seu dia!' : a.diasAte === -1 ? 'Seu aniversário foi ontem. Ainda dá tempo!' : a.diasAte === 1 ? 'Seu aniversário é amanhã.' : `Faltam ${a.diasAte} dias para o seu aniversário.`
  return (
    <section className="tela-int">
      <h1>Meu aniversário</h1>
      <div className="bloco-c pontos"><small>{String(a.dia).padStart(2, '0')}/{String(a.mes).padStart(2, '0')}</small><b className="peq-b">{quando}</b></div>
      <div className="bloco-c"><h2>Quem faz aniversário ganha: {a.beneficio}</h2>
        <p>Os convidados ganham <b>{a.pct}% de desconto</b> na comida do pedido do aniversariante, a partir de {a.minConv} acompanhantes.</p>
        <p className="nota">Vale para comida, não para bebida. Mostre um documento ao garçom. Vale no dia do aniversário e no dia seguinte. Não soma com troca de pontos.</p><Demo on={a.demo} /></div>
      {a.canClaim && <button className="primario grande" onClick={async () => { try { await c.pegarPresente(); avisar('Presente guardado em "Meus prêmios". Feliz aniversário!') } catch (e) { c.avisarErro(e) } }}>Pegar meu presente</button>}
      {a.claimed && !a.canClaim && <p className="aviso">Você já pegou o presente deste ano.</p>}
      <ListaExtras extras={v.extras.filter(x => x.source === 'birthday')} ir={ir} />
    </section>
  )
}

/** Comprovante de um prêmio dos extras: usa uma vez e mostra o código ao garçom por 30 minutos. */
export function ExtraComprovante({ id, ir }: { id: string } & Ir) {
  const c = useClube(); const x = c.v?.extras.find(e => e.id === id); const [agora, setAgora] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(i) }, [])
  if (!c.v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!x) return <section className="tela-int"><h1>Prêmio não encontrado</h1><button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  const volta = x.source === 'roulette' ? '/roleta' : '/aniversario'
  const mostrando = x.status === 'used' && x.usadoEm && agora < x.usadoEm + 30 * 60000
  const resta = x.usadoEm ? Math.max(0, Math.floor((x.usadoEm + 30 * 60000 - agora) / 1000)) : 0
  if (x.status === 'available') return (
    <section className="tela-int"><h1>{x.name}</h1><div className="papel"><p>Troque até <b>{dia(x.validade)}</b>.</p><p className="nota-p">Toque em "Trocar agora" quando o garçom estiver com você. O prêmio só pode ser usado uma vez.</p></div>
      <button className="primario grande" onClick={async () => { try { await c.usarExtra(x.id) } catch (e) { c.avisarErro(e) } }}>Trocar agora</button>
      <button className="link" onClick={() => ir(volta)}>Depois</button></section>)
  if (x.status === 'expired') return <section className="tela-int"><h1>Este prêmio venceu</h1><button className="primario grande" onClick={() => ir(volta)}>Voltar</button></section>
  return (
    <section className="tela-int">
      <div className="papel"><p className="selo-t ok"><IconCheck /> Troca realizada</p><h1>{x.name}</h1><p>Código do comprovante</p><b className="cod-g">{x.code}</b>
        {mostrando ? <p className="valido">Mostre em até <b>{String(Math.floor(resta / 60)).padStart(2, '0')}:{String(resta % 60).padStart(2, '0')}</b></p> : <p className="valido">Comprovante vencido. A troca continua registrada.</p>}<Demo on={x.demo} /><p className="nota-p">Mostre esta tela ao garçom.</p></div>
      <button className="primario grande" onClick={() => ir(volta)}>Voltar</button>
    </section>)
}

/** Aviso ao entrar: se há prêmio dos extras para trocar, mostra uma vez por sessão com a validade. */
export function AvisoPremio({ ir }: Ir) {
  const v = useClube().v; const [fechado, setFechado] = useState(() => { try { return sessionStorage.getItem('sr-aviso-premio') === '1' } catch { return false } })
  const x = v?.extras.filter(e => e.status === 'available').sort((a, b) => a.validade - b.validade)[0]
  if (!x || fechado) return null
  const dias = Math.ceil((x.validade - Date.now()) / 86400000)
  const fechar = () => { try { sessionStorage.setItem('sr-aviso-premio', '1') } catch { /* ignora */ } setFechado(true) }
  return (
    <div className="aviso-premio" role="dialog" aria-modal="true" aria-label="Prêmio para trocar"><div className="papel">
      <h2>Você tem um prêmio para trocar</h2><b className="premio-g">{x.name}</b>
      <p className={dias <= 1 ? 'urgente' : ''}>{dias <= 1 ? 'Vence amanhã!' : `Vence em ${dias} dias`} · troque até {dia(x.validade)}</p>
      <button className="primario grande" onClick={() => { fechar(); ir('/extra/' + x.id) }}>Trocar agora</button>
      <button className="link" onClick={fechar}>Depois</button></div></div>
  )
}

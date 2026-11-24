import { useEffect, useState } from 'react'
import { avisar } from '../lib/mockStore'
import { useClube, type ExtraV } from '../lib/clube'
import { brl } from '../data/cardapio'
import { IconCheck } from '../ui/Icons'

type Ir = { ir: (r: string) => void }
const dia = (t: number) => new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
export const Demo = ({ on }: { on: boolean }) => on ? <small className="selo-demo">Demonstração: sem prêmio real</small> : null

/** Lista de prêmios dos extras com a validade sempre à vista. */
export function ListaExtras({ extras, ir }: { extras: ExtraV[]; ir: (r: string) => void }) {
  if (!extras.length) return null
  return <div className="bloco-c"><h2>Meus prêmios</h2><ul className="premios">{extras.map(x => (
    <li key={x.id}><span><b>{x.name}</b><small>{x.status === 'available' ? `Troque até ${dia(x.validade)}` : x.status === 'used' ? 'Já usado' : 'Vencido'}</small></span>
      {x.status === 'available' ? <button className="primario" onClick={() => ir('/extra/' + x.id)}>Trocar</button> : <span className="falta">{x.status === 'used' ? 'usado' : 'vencido'}</span>}</li>))}</ul></div>
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

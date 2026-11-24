import { useState } from 'react'
import { brl } from '../data/cardapio'
import { useClube } from '../lib/clube'
import { somEtapa, somGirar, somVitoria } from '../lib/somRoleta'
import { IconChef, IconeEtapa, IconeEtapaSvg } from '../ui/IconsChef'
import { Demo, ListaExtras } from './Extras'

const dia = 86400000
type Res = { step: string; count: number; won: boolean; prizeId?: string }

/** Anel com as etapas: as conquistadas em cor, a que falta pontilhada. O centro mostra o que o restaurante quiser (a pizza ou a contagem). */
function Anel({ passos, got, centro }: { passos: string[]; got: string[]; centro: React.ReactNode }) {
  const n = passos.length; const R = 104
  return (
    <div className="anel" role="img" aria-label={`${got.length} de ${n} etapas conquistadas`}>
      <div className="anel-centro">{centro}</div>
      {passos.map((p, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; const tem = got.includes(p)
        return <div key={p} className={'anel-no' + (tem ? ' tem' : '')} style={{ left: `calc(50% + ${R * Math.cos(a)}px)`, top: `calc(50% + ${R * Math.sin(a)}px)` }}><span className="anel-ic"><IconeEtapa nome={p} tam={26} /></span><small>{p}</small>{tem && <i className="anel-ok" aria-hidden="true">✓</i>}</div> })}
    </div>)
}

/** Roleta do Chef: cada giro entrega uma etapa nova; no 5º giro o prêmio. Visual do layout: roda com ícones, giro, resultado, reta final e prêmio. */
export function Roleta({ ir }: { ir: (r: string) => void }) {
  const c = useClube(); const v = c.v; const r = v?.roleta
  const [giro, setGiro] = useState(0); const [rodando, setRodando] = useState(false); const [res, setRes] = useState<Res | null>(null); const [info, setInfo] = useState(false)
  const [som, setSom] = useState(() => { try { return localStorage.getItem('sr-som-roleta') !== '0' } catch { return true } })
  const Topo = () => <div className="roleta-topo"><span className="chef-ic"><IconChef tam={30} /></span><h1>Roleta do Chef</h1><button className="som-b" aria-pressed={som} onClick={() => { const n = !som; setSom(n); try { localStorage.setItem('sr-som-roleta', n ? '1' : '0') } catch { /* ignora */ } }}>{som ? '🔊' : '🔇'} Som</button></div>
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!v.membro) return <section className="tela-int"><Topo /><p>Entre no Clube para participar.</p><button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>
  if (!r?.enabled) return <section className="tela-int"><Topo /><p>A Roleta do Chef não está disponível agora.</p><p>Volte na próxima visita.</p><button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  if (!r.adulto) return <section className="tela-int"><Topo /><p>A Roleta é só para maiores de 18 anos.</p><button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  const n = r.steps.length; const ROT = 360 / n; const dias = r.expira ? Math.max(0, Math.ceil((r.expira - Date.now()) / dia)) : r.janelaDias
  const girar = async () => {
    if (rodando) return; setRes(null)
    try {
      const x = await c.girar(); const idx = r.steps.indexOf(x.step); setRodando(true); if (som) somGirar()
      setGiro(g => g + 360 * 4 + (360 - (idx * ROT + ROT / 2)) - (g % 360))
      setTimeout(() => { setRodando(false); setRes(x); if (som) (x.won ? somVitoria : somEtapa)(); if (navigator.vibrate) navigator.vibrate(x.won ? [80, 60, 80] : 60) }, 3300)
    } catch (e) { c.avisarErro(e) }
  }
  const roda = (grande: boolean) => (
    <div className={'roda-wrap' + (grande ? ' grande' : '')} aria-hidden="true"><div className="ponteiro" />
      <svg className="roda" viewBox="-100 -100 200 200" style={{ transform: `rotate(${giro}deg)`, transition: rodando ? 'transform 3.2s cubic-bezier(.12,.7,.1,1)' : 'none' }}>
        {r.steps.map((p, i) => { const a0 = (i * ROT - 90) * Math.PI / 180, a1 = ((i + 1) * ROT - 90) * Math.PI / 180, am = (a0 + a1) / 2; const x = 60 * Math.cos(am), y = 60 * Math.sin(am); const claro = i % 2 === 1
          const contra = { transform: `rotate(${-giro}deg)`, transition: rodando ? 'transform 3.2s cubic-bezier(.12,.7,.1,1)' : 'none' } as React.CSSProperties
          return <g key={p}><path d={`M0 0 L${95 * Math.cos(a0)} ${95 * Math.sin(a0)} A95 95 0 0 1 ${95 * Math.cos(a1)} ${95 * Math.sin(a1)}Z`} fill={claro ? '#e09060' : '#5e1b34'} stroke="#f8e8c8" strokeWidth="2" />
            <g transform={`translate(${x} ${y})`}><g style={{ ...contra, color: claro ? '#380818' : '#f8e8c8' }}><g transform="translate(0 -7)"><IconeEtapaSvg nome={p} tam={24} /></g><text y="16" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="800">{p}</text></g></g></g> })}
        <circle r="17" fill="#380818" stroke="#f8e8c8" strokeWidth="3" /><g style={{ color: '#f8e8c8' }}><IconeEtapaSvg nome="chef" tam={20} /></g></svg>
    </div>)

  if (rodando) return <section className="tela-int roleta girando"><Topo />{roda(true)}<p className="girando-t">Girando…</p></section>

  if (res?.won) return (
    <section className="tela-int roleta"><Topo />
      <h2 className="tit-r">Prato completo!</h2><p className="ctr">Você conquistou as {n} etapas.</p>
      <Anel passos={r.steps} got={r.steps} centro={<img className="prato-img" src={import.meta.env.BASE_URL + 'media/pizza.webp'} alt="" onError={e => { e.currentTarget.style.display = 'none' }} />} />
      <div className="papel premio"><b className="premio-g">{r.premio}</b><Demo on={r.demo} /></div>
      <div className="barra-seg" aria-hidden="true">{r.steps.map(p => <i key={p} className="on" />)}</div><p className="ctr"><b>{n} de {n} etapas</b></p>
      <button className="primario grande" onClick={() => ir('/extra/' + (res.prizeId ?? v.extras[0]?.id))}>Trocar agora</button>
    </section>)

  if (res) {
    const got = r.got.length ? r.got : r.steps.slice(0, res.count); const falta = n - res.count
    return (
      <section className="tela-int roleta"><Topo />
        <div className="res-ic"><IconeEtapa nome={res.step} tam={64} /></div>
        <h2 className="tit-r">Você ganhou: {res.step}!</h2><p className="ctr"><b>Você tem {res.count} de {n} etapas</b></p>
        <div className="etapas">{r.steps.map(p => <span key={p} className={'etapa' + (got.includes(p) || p === res.step ? ' tem' : '')}><i><IconeEtapa nome={p} tam={22} /></i>{p}</span>)}</div>
        <p className="ctr">{falta === 1 ? <><b>Falta só 1 etapa!</b> Seu próximo giro garante {r.premio}.</> : `Faltam ${falta} giros.`}</p>
        <button className="primario grande" onClick={() => setRes(null)}>Continuar</button><Demo on={r.demo} />
      </section>)
  }

  const reta = r.got.length === n - 1 && r.got.length > 0
  return (
    <section className="tela-int roleta"><Topo />
      <div className="chips-r"><span>{r.got.length} de {n} etapas · {r.expira ? `faltam ${dias} dias` : `${dias} dias para completar`}</span></div>
      {reta ? <><h2 className="tit-r">Falta só 1 etapa!</h2><Anel passos={r.steps} got={r.got} centro={<b className="ctr-n">{r.got.length}/{n}</b>} /><p className="ctr">Seu próximo giro garante {r.premio}.</p></>
        : <>{roda(false)}<div className="etapas">{r.steps.map(p => <span key={p} className={'etapa' + (r.got.includes(p) ? ' tem' : '')}><i><IconeEtapa nome={p} tam={22} /></i>{p}</span>)}</div></>}
      {r.grants > 0
        ? <><button className="primario grande" onClick={girar}>Girar</button><p className="ctr nota">Gire a roda com o botão</p></>
        : <div className="aviso">Para ganhar um giro: peça pelo app, chegue a {brl(r.minCents)} e toque em <b>Chamar garçom</b>. Um giro por visita.</div>}
      <Demo on={r.demo} />
      <ListaExtras extras={v.extras.filter(x => x.source === 'roulette')} ir={ir} />
      <button className="link" onClick={() => setInfo(!info)}>Como funciona</button>
      {info && <div className="bloco-c">
        <p className="passo"><b>1</b> Peça pelo app e chame o garçom com um pedido de {brl(r.minCents)} ou mais.</p>
        <p className="passo"><b>2</b> Gire a roda, uma vez por visita. Cada giro dá uma etapa nova.</p>
        <p className="passo"><b>3</b> Complete as {n} etapas em {r.janelaDias} dias e ganhe {r.premio}.</p>
        <p className="nota">Só para maiores de 18 anos. O valor do pedido é calculado pelos preços do cardápio.</p></div>}
    </section>)
}

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { TEMA } from '../data/tema'
import { useClube } from '../lib/clube'
import { getMesa } from '../lib/router'
import { IcCarteira, IcDir, IcBolo, IcCloche, IcClube, IcFoto, IcG, IcEstrela, IcInsta, IcRoleta, IcSeta, IcBaixo } from '../ui/IconsV2'

const reduz = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }

/** Carrossel da mídia do ambiente: arrasta com o dedo (rolagem com encaixe), avança sozinho, pausa ao tocar e tem pontos clicáveis. Slide com link vira promoção. */
function Carrossel() {
  const fotos = TEMA.ambiente; const n = fotos.length; const ref = useRef<HTMLDivElement>(null); const [i, setI] = useState(0); const pausa = useRef(0)
  const vai = (k: number) => { const el = ref.current; if (el) el.scrollTo({ left: ((k % n) + n) % n * el.clientWidth, behavior: reduz() ? 'auto' : 'smooth' }) }
  useEffect(() => {
    if (n < 2 || reduz()) return
    const t = setInterval(() => { if (document.hidden || Date.now() < pausa.current) return; const el = ref.current; if (el) vai(Math.round(el.scrollLeft / el.clientWidth) + 1) }, 5000)
    return () => clearInterval(t)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps
  const segurar = () => { pausa.current = Date.now() + 9000 }
  return <div className="n2-car">
    <div className="n2-slides" ref={ref} onScroll={e => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)) }} onPointerDown={segurar} onMouseEnter={segurar} onTouchStart={segurar} role="group" aria-roledescription="carrossel" aria-label="Fotos do restaurante">
      {fotos.map((f, k) => { const im = <img src={import.meta.env.BASE_URL + f.img} alt={f.alt ?? ''} draggable={false} loading={k === 0 ? 'eager' : 'lazy'} />; return <div key={f.img} className="n2-slide" role="group" aria-label={`${k + 1} de ${n}`}>{f.link ? <a href={f.link} target="_blank" rel="noopener">{im}</a> : im}</div> })}
    </div>
    {n > 1 && <div className="n2-pontos" role="tablist" aria-label="Escolher foto">{fotos.map((f, k) => <button key={f.img} role="tab" aria-selected={k === i} aria-label={`Foto ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => { segurar(); vai(k) }} />)}</div>}
  </div>
}

const Atalho = ({ icone, t, onClick, ponto, i }: { icone: ReactNode; t: string; onClick: () => void; ponto?: boolean; i: number }) =>
  <button className="n2-atalho n2-in" style={{ '--i': i } as CSSProperties} onClick={onClick}><span className="n2-ic">{icone}</span><span className="n2-rot">{t}</span>{ponto && <i className="n2-ponto" aria-label="Novidade" />}</button>

/** Início: mídia do ambiente (carrossel) com a marca e a mesa, "Explorar cardápio", dois botões grandes e seis atalhos. */
export function Home({ nome, ir }: { nome: string; ir: (r: string) => void }) {
  const mesa = getMesa(); const clube = useClube(); const cv = clube.v; const m = cv?.membro
  const mesaTxt = useMemo(() => mesa ? (/^\d+$/.test(mesa) ? mesa.padStart(2, '0') : mesa) : null, [mesa])
  const entrarOu = (rota: string) => () => ir(m ? rota : '/clube')   // roleta e aniversário são do Clube: quem ainda não entrou vê o convite
  return (
    <section className="home n2-home">
      <div className="n2-hero n2-in" style={{ '--i': 0 } as CSSProperties}>
        <Carrossel />
        <div className="n2-hero-topo">
          <img className="n2-logo" src={import.meta.env.BASE_URL + TEMA.logoTransp} alt={nome} />
          {mesaTxt && <button className="n2-mesa" onClick={() => ir('/chamar')} aria-label={`Mesa ${mesaTxt}. Trocar de mesa`}><IconMesa /> Mesa {mesaTxt} <IcBaixo /></button>}
        </div>
        <div className="n2-hero-nome" aria-hidden="true"><b>{TEMA.heroTitulo}</b><span>{TEMA.heroSub}</span></div>
      </div>
      <div className="n2-corpo">
        <button className="n2-explorar n2-in" style={{ '--i': 1 } as CSSProperties} onClick={() => ir('/cardapio')}>Explorar cardápio <IcSeta /></button>
        <div className="n2-duo">
          <button className="n2-grande n2-in" style={{ '--i': 2 } as CSSProperties} onClick={() => ir('/chamar')}><IcCloche /><b>Chamar o garçom</b></button>
          <button className="n2-grande n2-in" style={{ '--i': 3 } as CSSProperties} onClick={() => ir('/clube')}><IcClube /><b>Meu Clube</b></button>
        </div>
        <div className="n2-grade">
          <Atalho i={4} icone={<IcFoto />} t="Fotos com moldura" onClick={() => ir('/fotos')} />
          <Atalho i={5} icone={<IcInsta />} t="Siga-nos no Instagram" onClick={() => ir('/instagram')} />
          <Atalho i={6} icone={<IcG />} t="Avalie-nos no Google" onClick={() => ir('/google')} />
          <Atalho i={7} icone={<IcEstrela />} t="Pesquisa de satisfação" onClick={() => ir('/visita')} />
          <Atalho i={8} icone={<IcRoleta />} t="Roleta do Chef" onClick={entrarOu('/roleta')} ponto={!!cv?.roleta && cv.roleta.grants > 0} />
          <Atalho i={9} icone={<IcBolo />} t="Meu aniversário" onClick={entrarOu('/aniversario')} ponto={!!cv?.aniv?.canClaim} />
        </div>
        <FaixaClube ir={ir} i={10} />
      </div>
    </section>
  )
}
/** Faixa do Clube: sócio vê saldo e quanto falta para o próximo prêmio; quem ainda não entrou vê a barra zerada e o convite. */
function FaixaClube({ ir, i }: { ir: (r: string) => void; i: number }) {
  const v = useClube().v; const m = v?.membro; const proximo = v?.premios.find(p => !m || p.custo > m.saldo)
  const frac = m && proximo ? Math.min(100, Math.round((m.saldo / Math.max(1, proximo.custo)) * 100)) : m ? 100 : 0
  return <button className="n2-faixa n2-in" style={{ '--i': i } as CSSProperties} onClick={() => ir('/clube')}>
    <span className="n2-faixa-t"><IcCarteira /><b>{m ? m.saldo : 0}</b><span>pontos</span></span>
    <span className="n2-barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={frac} aria-label="Progresso para o próximo prêmio"><i style={{ width: frac + '%' }} /></span>
    <span className="n2-faixa-c">{m ? (proximo ? `Faltam ${Math.max(0, proximo.custo - m.saldo)} pontos para ${proximo.nome.split(' (')[0]}` : 'Você já pode trocar qualquer prêmio') : 'Entre no Clube e ganhe seus primeiros pontos'}<IcDir /></span>
  </button>
}
const IconMesa = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 9h14M7 9v10M17 9v10M3 9l1.5-4h15L21 9" /></svg>

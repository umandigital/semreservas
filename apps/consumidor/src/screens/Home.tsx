import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { TEMA, type Slide } from '../data/tema'
import { brl, ITENS } from '../data/cardapio'
import { fotoDoPremio } from '../data/clube'
import { statusChamado, type Status } from '../lib/api'
import { chamadoAtual, limparChamadoAtual } from '../lib/atendimento'
import { useSelecao } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { getMesa } from '../lib/router'
import { IcCarteira, IcDir, IcPedido, IcBolo, IcCloche, IcClube, IcFoto, IcG, IcEstrela, IcInsta, IcRoleta, IcSeta, IcBaixo } from '../ui/IconsV2'

const reduz = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }

/** Carrossel da mídia do ambiente: arrasta com o dedo (rolagem com encaixe), avança sozinho, pausa ao tocar e tem pontos clicáveis. Slide com link vira promoção. */
function Carrossel({ fotos, ir, aoMudar }: { fotos: Slide[]; ir: (r: string) => void; aoMudar: (s: Slide) => void }) {
  const n = fotos.length; const ref = useRef<HTMLDivElement>(null); const [i, setI] = useState(0); const pausa = useRef(0)
  const vai = (k: number) => { const el = ref.current; if (el) el.scrollTo({ left: ((k % n) + n) % n * el.clientWidth, behavior: reduz() ? 'auto' : 'smooth' }) }
  useEffect(() => {
    if (n < 2 || reduz()) return
    const t = setInterval(() => { if (document.hidden || Date.now() < pausa.current) return; const el = ref.current; if (el) vai(Math.round(el.scrollLeft / el.clientWidth) + 1) }, 5000)
    return () => clearInterval(t)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fotos[Math.min(i, n - 1)]) aoMudar(fotos[Math.min(i, n - 1)]) }, [i, n]) // eslint-disable-line react-hooks/exhaustive-deps
  const segurar = () => { pausa.current = Date.now() + 9000 }
  return <div className="n2-car">
    <div className="n2-slides" ref={ref} onScroll={e => { const el = e.currentTarget; setI(Math.round(el.scrollLeft / el.clientWidth)) }} onPointerDown={segurar} onMouseEnter={segurar} onTouchStart={segurar} role="group" aria-roledescription="carrossel" aria-label="Destaques do restaurante">
      {fotos.map((f, k) => {
        const im = <img src={import.meta.env.BASE_URL + f.img} alt={f.alt ?? ''} draggable={false} loading={k === 0 ? 'eager' : 'lazy'} />
        const vai_ = () => { if (f.prato) { try { sessionStorage.setItem('sr-ir-prato', f.prato) } catch { /* ignora */ } ir('/cardapio') } else if (f.rota) ir(f.rota) }
        const corpo = f.rota || f.prato ? <button className="n2-slide-b" onClick={vai_}>{im}</button> : f.link ? <a href={f.link} target="_blank" rel="noopener">{im}</a> : im
        return <div key={f.img} className={'n2-slide' + (f.tipo === 'banner' ? ' banner' : f.tipo === 'cheio' ? ' cheio' : '')} role="group" aria-label={`${k + 1} de ${n}`}>{corpo}</div>
      })}
    </div>
    {n > 1 && <div className="n2-pontos" role="tablist" aria-label="Escolher destaque">{fotos.map((f, k) => <button key={f.img} role="tab" aria-selected={k === i} aria-label={`Destaque ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => { segurar(); vai(k) }} />)}</div>}
  </div>
}

const Atalho = ({ icone, t, onClick, ponto, i }: { icone: ReactNode; t: string; onClick: () => void; ponto?: boolean; i: number }) =>
  <button className="n2-atalho n2-in" style={{ '--i': i } as CSSProperties} onClick={onClick}><span className="n2-ic">{icone}</span><span className="n2-rot">{t}</span>{ponto && <i className="n2-ponto" aria-label="Novidade" />}</button>

/** Início: mídia do ambiente (carrossel) com a marca e a mesa, "Explorar cardápio", dois botões grandes e seis atalhos. */
export function Home({ nome, ir }: { nome: string; ir: (r: string) => void }) {
  const mesa = getMesa(); const clube = useClube(); const cv = clube.v; const m = cv?.membro
  const mesaTxt = useMemo(() => mesa ? (/^\d+$/.test(mesa) ? mesa.padStart(2, '0') : mesa) : null, [mesa])
  const slides = useMemo(() => { const hoje = new Date(); const hojeTxt = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`; return TEMA.ambiente.filter(x => (!x.ate || hojeTxt <= x.ate) && (!x.quem || x.quem === 'todos' || (x.quem === 'clube' ? !!m : !m))) }, [m])
  const [ativo, setAtivo] = useState<Slide | null>(null)
  const temBannerClube = slides.some(x => x.rota === '/clube')   // com o banner do Clube no carrossel, o espaço de baixo não repete o convite
  const entrarOu = (rota: string) => () => ir(m ? rota : '/clube')   // roleta e aniversário são do Clube: quem ainda não entrou vê o convite
  return (
    <section className="home n2-home">
      <div className={'n2-hero n2-in' + (ativo?.tipo === 'banner' || ativo?.tipo === 'cheio' ? ' so-banner' : '')} style={{ '--i': 0 } as CSSProperties}>
        <Carrossel fotos={slides} ir={ir} aoMudar={setAtivo} />
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
        <SlotHome ir={ir} i={10} semConvite={temBannerClube} />
      </div>
    </section>
  )
}
const Slot = ({ i, onClick, icone, titulo, sub, cls = '', barra }: { i: number; onClick: () => void; icone: ReactNode; titulo: ReactNode; sub: ReactNode; cls?: string; barra?: number }) =>
  <button className={'n2-faixa n2-slot n2-in ' + cls} style={{ '--i': i } as CSSProperties} onClick={onClick}>
    <span className="n2-faixa-t">{icone}{titulo}</span>
    {barra != null && <span className="n2-barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={barra} aria-label="Progresso para o próximo prêmio"><i style={{ width: barra + '%' }} /></span>}
    <span className="n2-faixa-c">{sub}<IcDir /></span>
  </button>

/** Andamento do último chamado deste aparelho enquanto estiver aberto (consulta a cada 8 s). */
function useChamadoAberto() {
  const [c, setC] = useState<{ id: string; status: Status; mesa: string } | null>(null)
  useEffect(() => {
    const id = chamadoAtual(); if (!id) return; let vivo = true
    const ler = () => { statusChamado(id).then(r => { if (!vivo) return; if (!r || r.status === 'RESOLVED' || r.status === 'CANCELLED') { limparChamadoAtual(); setC(null) } else setC({ id, status: r.status, mesa: r.table_label }) }).catch(() => { /* mantém o último estado */ }) }
    ler(); const t = setInterval(ler, 8000); return () => { vivo = false; clearInterval(t) }
  }, [])
  return c
}

/** O espaço de baixo da Início mostra UMA coisa, a mais útil agora: chamado aberto, prêmio ou giro esperando, seleção do pedido, pontos, ou o convite ao Clube. Altura fixa: a tela não rola. */
function SlotHome({ ir, i, semConvite }: { ir: (r: string) => void; i: number; semConvite: boolean }) {
  const v = useClube().v; const m = v?.membro; const chamado = useChamadoAberto(); const sel = useSelecao()
  const linhas = ITENS.filter(x => sel.qtd[x.id]); const n = linhas.reduce((a, x) => a + sel.qtd[x.id], 0); const total = linhas.reduce((a, x) => a + x.preco * sel.qtd[x.id], 0)
  const proximo = v?.premios.find(p => !m || p.custo > m.saldo); const extra = v?.extras.filter(e => e.status === 'available').sort((a, b) => a.validade - b.validade)[0]
  if (chamado) return <Slot i={i} cls="n2-urgente" onClick={() => ir('/chamado/' + chamado.id)} icone={<IcCloche />} titulo={<b className="n2-t">{chamado.status === 'ACKNOWLEDGED' ? 'Garçom a caminho' : 'Chamado enviado'}</b>} sub={chamado.status === 'ACKNOWLEDGED' ? `Mesa ${chamado.mesa} · toque para acompanhar` : `Mesa ${chamado.mesa} · aguardando o garçom`} />
  if (m && extra) { const d = Math.ceil((extra.validade - Date.now()) / 86400000); return <Slot i={i} cls="n2-destaque" onClick={() => ir('/extra/' + extra.id)} icone={<IcEstrela f />} titulo={<b className="n2-t">Você tem um prêmio para trocar</b>} sub={`${extra.name} · ${d <= 1 ? 'vence amanhã' : `vence em ${d} dias`}`} /> }
  if (m && v?.roleta && v.roleta.grants > 0) return <Slot i={i} cls="n2-destaque" onClick={() => ir('/roleta')} icone={<IcRoleta />} titulo={<b className="n2-t">Você tem um giro na Roleta!</b>} sub="Toque para girar e ganhar um prêmio" />
  if (m && v?.aniv?.canClaim) return <Slot i={i} cls="n2-destaque" onClick={() => ir('/aniversario')} icone={<IcBolo />} titulo={<b className="n2-t">Seu presente de aniversário chegou</b>} sub="Toque para pegar o seu presente" />
  if (n) return <Slot i={i} cls="n2-pedido" onClick={() => ir('/pedido')} icone={<IcPedido />} titulo={<><b>{n}</b><span>{n === 1 ? 'item escolhido' : 'itens escolhidos'}</span></>} sub={<>Total: {brl(total)} <span className="n2-ver">· Ver pedido</span></>} />
  if (m) { const frac = proximo ? Math.min(100, Math.round((m.saldo / Math.max(1, proximo.custo)) * 100)) : 100
    return <Slot i={i} onClick={() => ir('/clube')} icone={<IcCarteira />} titulo={<><b>{m.saldo}</b><span>pontos</span></>} barra={frac} sub={proximo ? `Faltam ${Math.max(0, proximo.custo - m.saldo)} pontos para ${proximo.nome.split(' (')[0]}` : 'Você já pode trocar qualquer prêmio'} /> }
  if (semConvite) return <Slot i={i} onClick={() => ir('/clube')} icone={<IcCarteira />} titulo={<><b>0</b><span>pontos</span></>} barra={0} sub="Ganhe seus primeiros pontos ao entrar no Clube" />
  return <Convite ir={ir} i={i} />
}

/** Convite ao Clube (quem ainda não entrou). Usa o banner do restaurante se houver; sem ele, desenha com os prêmios e os pontos reais. */
function Convite({ ir, i }: { ir: (r: string) => void; i: number }) {
  const v = useClube().v; const premios = (v?.premios ?? []).slice(0, 3)
  const pts = (v?.regras ?? []).filter(r => r.action === 'signup' || r.action === 'profile_complete').reduce((a, r) => a + r.points, 0)
  const banner = TEMA.bannerClube
  const estilo = { '--i': i, ...(banner ? { backgroundImage: `url(${import.meta.env.BASE_URL + banner})`, '--cor-t': TEMA.bannerClubeTexto } : {}) } as CSSProperties
  return <div className={'n2-convite n2-in' + (banner ? ' com-arte' : '')} style={estilo}>
    <div className="n2-conv-t"><b>{TEMA.conviteTitulo}</b>{!banner && pts > 0 && <small>Ganhe {pts} pontos ao entrar</small>}
      <span className="n2-conv-b"><button className="n2-conv-ir" onClick={() => ir('/clube')}>Quero entrar</button><button className="n2-conv-como" onClick={() => { try { sessionStorage.setItem('sr-abrir-intro', '1') } catch { /* ignora */ } ir('/clube') }}>Saiba mais</button></span></div>
    {!banner && <div className="n2-conv-p" aria-label="Prêmios do Clube">{premios.map(p => { const f = fotoDoPremio(p.nome); return <span key={p.id} className="n2-conv-pr"><span>{f ? <img src={import.meta.env.BASE_URL + f} alt="" /> : <IcEstrela />}</span><em>{p.custo} pts</em></span> })}</div>}
  </div>
}
const IconMesa = () => <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 9h14M7 9v10M17 9v10M3 9l1.5-4h15L21 9" /></svg>

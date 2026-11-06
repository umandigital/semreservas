import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { brl, CATEGORIAS, CONFIG, ITENS, type Item } from '../data/cardapio'
import { useEsgotados } from '../lib/hooks'
import { avisar, curtir, salvar, setQtd, useMembro, useSelecao, useSocial } from '../lib/mockStore'
import { abrirRa, baseCurtidas, media } from '../lib/util'
import type { ModeloEl } from '../ui/model-viewer'
import { IconBalao, IconBusca, IconCardapio, IconCoracao, IconCubo, IconEnviar, IconEstrela, IconLista, IconMais } from '../ui/Icons'

// O 3D (e a biblioteca dele) só baixa quando um prato em 3D chega perto da tela.
const Modelo3D = lazy(() => import('./Modelo3D'))
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function Cardapio({ ir }: { ir: (r: string) => void }) {
  const soldOut = useEsgotados(); const sel = useSelecao()
  const [cat, setCat] = useState<string>('Todos'); const [q, setQ] = useState(''); const [buscando, setBuscando] = useState(false); const [lista, setLista] = useState(false)
  const [dica, setDica] = useState(() => { try { return !localStorage.getItem('sr-dica') } catch { return true } })
  const [h, setH] = useState<number | null>(null); const wrap = useRef<HTMLDivElement>(null); const rolo = useRef<HTMLDivElement>(null)
  const base = import.meta.env.BASE_URL
  const itens = useMemo(() => ITENS.filter(i => (cat === 'Todos' || i.cat === cat) && (!q || norm(i.nome + ' ' + i.desc + ' ' + i.ingredientes.join(' ')).includes(norm(q)))), [cat, q])

  // a área do feed ocupa a tela toda entre o cabeçalho e a barra de baixo, seja qual for o aparelho
  useLayoutEffect(() => {
    const medir = () => { const t = wrap.current?.getBoundingClientRect().top ?? 0; const nav = document.querySelector('.rodape')?.getBoundingClientRect().height ?? 64; setH(Math.max(320, Math.round(innerHeight - t - nav))) }
    medir(); addEventListener('resize', medir); return () => removeEventListener('resize', medir)
  }, [])
  useEffect(() => { rolo.current?.scrollTo({ top: 0 }) }, [cat, q, lista])

  // vídeo toca só quando o prato está na tela
  useEffect(() => {
    const vs = rolo.current?.querySelectorAll('video'); if (!vs?.length || lista) return
    const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target as HTMLVideoElement; if (e.isIntersecting && e.intersectionRatio > 0.6) v.play().catch(() => { /* sem permissão */ }); else v.pause() }), { root: rolo.current, threshold: [0, 0.6, 1] })
    vs.forEach(v => io.observe(v)); return () => io.disconnect()
  }, [itens, lista])
  const rolou = () => { if (dica) { setDica(false); try { localStorage.setItem('sr-dica', '1') } catch { /* ignora */ } } }

  return (
    <div className="reels-wrap" ref={wrap} style={{ ...(h ? { height: h } : { minHeight: '70dvh' }), '--fundo-3d': CONFIG.fundo3d } as unknown as CSSProperties}>
      <div className="reels-topo">
        {buscando ? (
          <>
            <label className="busca"><IconBusca /><input autoFocus placeholder="Buscar no cardápio" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar no cardápio" /></label>
            <button className="icone" onClick={() => { setBuscando(false); setQ('') }} aria-label="Fechar busca">✕</button>
          </>
        ) : (
          <>
            <button className="icone" onClick={() => setBuscando(true)} aria-label="Buscar no cardápio"><IconBusca /></button>
            <div className="chips" role="tablist" aria-label="Categorias">
              {['Todos', ...CATEGORIAS].map(c => <button key={c} role="tab" aria-selected={cat === c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
            </div>
            <button className="icone" onClick={() => setLista(!lista)} aria-label={lista ? 'Ver em tela cheia' : 'Ver em lista'}>{lista ? <IconCardapio /> : <IconLista />}</button>
          </>
        )}
      </div>
      {itens.length === 0 ? <p className="vazio-reel">Nada encontrado. Tente outra palavra.</p> : lista ? (
        <div className="lista lista-wrap" ref={rolo} style={{ position: 'absolute', inset: 0, paddingTop: 72, paddingBottom: 16, background: 'var(--bg)' }}>
          {itens.map(i => <LinhaItem key={i.id} i={i} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />)}
        </div>
      ) : (
        <div className="reels" ref={rolo} onScroll={rolou} tabIndex={0} aria-label="Pratos do cardápio. Deslize para ver o próximo">
          {itens.map((i, n) => <Reel key={i.id} ir={ir} i={i} n={n + 1} de={itens.length} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />)}
        </div>
      )}
      {dica && !lista && itens.length > 1 && <div className="dica-deslize" aria-hidden="true">↑ Deslize para o próximo</div>}
    </div>
  )
}

function Acao({ i, esgotado, qtd, curto = false }: { i: Item; esgotado: boolean; qtd: number; curto?: boolean }) {
  if (esgotado) return <span className="esgotado">Acabou hoje</span>
  if (qtd === 0) return <button className="primario cheio" onClick={() => { setQtd(i.id, 1); avisar('Incluído na sua seleção.') }}><IconMais /> {curto ? 'Adicionar' : 'Adicionar ao pedido'}</button>
  return <span className="qtd"><button onClick={() => setQtd(i.id, qtd - 1)} aria-label={`Menos ${i.nome}`}>−</button><b>{qtd}</b><button onClick={() => setQtd(i.id, qtd + 1)} aria-label={`Mais ${i.nome}`}>+</button></span>
}

/** Observa se o prato está perto (para montar o 3D) e se está ativo (para girar), dentro do feed. */
function useVisibilidade(ref: React.RefObject<HTMLElement | null>, ligado: boolean) {
  const [perto, setPerto] = useState(false); const [ativo, setAtivo] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!ligado || !el) return
    const root = el.closest('.reels'); const o: IntersectionObserverInit[] = [{ root, rootMargin: '60% 0px', threshold: 0 }, { root, threshold: 0.6 }]
    const a = new IntersectionObserver(es => es.forEach(e => setPerto(e.isIntersecting)), o[0]); const b = new IntersectionObserver(es => es.forEach(e => setAtivo(e.intersectionRatio >= 0.6)), o[1])
    a.observe(el); b.observe(el); return () => { a.disconnect(); b.disconnect() }
  }, [ref, ligado])
  return { perto, ativo }
}

function Reel({ i, n, de, base, esgotado, qtd, ir }: { i: Item; n: number; de: number; base: string; esgotado: boolean; qtd: number; ir: (r: string) => void }) {
  const [aberto, setAberto] = useState(false)
  const soc = useSocial(); const membro = useMembro()
  const curtido = soc.likes.includes(i.id), salvo = soc.saved.includes(i.id)
  const reduzir = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const ref = useRef<HTMLElement>(null); const mv = useRef<ModeloEl | null>(null)
  const { perto, ativo } = useVisibilidade(ref, !!i.modelo)
  const [carregado, setCarregado] = useState(false); const [ra, setRa] = useState(false)
  const aoCarregar = useCallback((podeRa: boolean) => { setCarregado(true); setRa(podeRa) }, [])
  useEffect(() => { if (!perto) { setCarregado(false); setRa(false) } }, [perto])   // longe da tela: libera o 3D (memória e bateria)
  const enviar = async () => {
    const url = location.href.split('#')[0]
    try { if (navigator.share) { await navigator.share({ title: i.nome, text: `${i.nome} · ${brl(i.preco)}`, url }); return } } catch { return }
    try { await navigator.clipboard.writeText(url); avisar('Link copiado. Compartilhar não comprova que alguém publicou.') } catch { avisar('Copie o endereço da barra do navegador.') }
  }
  const [msgRa, setMsgRa] = useState('')
  const projetar = async () => { if (!mv.current) return; const r = await abrirRa(mv.current, setMsgRa); if (r !== 'aberto') setTimeout(() => setMsgRa(''), 9000) }
  const m = i.modelo
  return (
    <article ref={ref} className={'reel' + (esgotado ? ' off' : '') + (m ? ' com-3d' : '')} aria-label={`${i.nome}, prato ${n} de ${de}`}>
      {m ? (
        <div className="palco">
          <img className={'poster3d' + (carregado ? ' some' : '')} src={media(m.poster)} alt={i.nome} />
          {perto && <Suspense fallback={null}><Modelo3D item={i} ativo={ativo && !esgotado} mvRef={mv} aoCarregar={aoCarregar} /></Suspense>}
          <span className="nota3d">{m.nota.split('.')[0]} · {m.medidas}</span>
        </div>
      ) : i.video && !reduzir
        ? <video src={base + i.video} poster={base + i.img} muted loop playsInline preload="metadata" aria-label={`Vídeo de ${i.nome}`} />
        : <img src={base + i.img} alt={i.nome} loading={n > 2 ? 'lazy' : 'eager'} />}
      <span className="selo">{m ? '◆ 3D · gire com o dedo' : i.video ? '▶ Vídeo' : '● Foto'}</span>
      <span className="contador" aria-hidden="true">{n}/{de}</span>
      <div className="lateral">
        <button onClick={() => curtir(i.id)} aria-pressed={curtido} aria-label={`Curtir ${i.nome}`}><IconCoracao cheio={curtido} /><small>{baseCurtidas(i.id) + (curtido ? 1 : 0)}</small></button>
        <button onClick={() => ir('/comentarios/' + i.id)} aria-label={`Comentar ${i.nome}`}><IconBalao /></button>
        <button onClick={() => { salvar(i.id); avisar(salvo ? 'Removido dos salvos.' : membro ? 'Salvo na sua conta e disponível em outros aparelhos.' : 'Salvo só neste aparelho. Entre para guardar em qualquer lugar.') }} aria-pressed={salvo} aria-label={`Salvar ${i.nome}`}><IconEstrela cheio={salvo} /></button>
        <button onClick={enviar} aria-label={`Enviar ${i.nome}`}><IconEnviar /></button>
      </div>
      <div className="base">
        <div className="sombra">
          <div className="linha-nome"><h2>{i.nome}</h2><span className="preco">{brl(i.preco)}</span></div>
          <p className={aberto ? '' : 'desc1'}>{i.desc}</p>
          {aberto && <ul className="ingr">{i.ingredientes.map(x => <li key={x}>{x}</li>)}{i.tags?.map(t => <li key={t} className="tag">{t}</li>)}</ul>}
          <button className="link" style={{ textAlign: 'left', padding: 0 }} onClick={() => setAberto(!aberto)} aria-expanded={aberto}>{aberto ? 'Recolher ↓' : 'Ver ingredientes ↑'}</button>
        </div>
        {msgRa && <p className="status-ra" role="status">{msgRa}</p>}
        <div className="acao-reel">
          {m && <button className="sec cta-ar" disabled={!ra || esgotado} onClick={projetar} title={carregado && !ra ? 'Disponível no celular' : undefined}><IconCubo /> Projete na mesa</button>}
          <Acao i={i} esgotado={esgotado} qtd={qtd} curto={!!m} />
        </div>
      </div>
    </article>
  )
}

function LinhaItem({ i, base, esgotado, qtd }: { i: Item; base: string; esgotado: boolean; qtd: number }) {
  return (
    <article className={'linha-item' + (esgotado ? ' off' : '')}>
      <img src={i.modelo ? media(i.modelo.poster) : base + i.img} alt="" loading="lazy" />
      <div className="meio"><h2>{i.nome}{i.modelo && <span className="tag3d">3D</span>}</h2><p>{i.desc}</p><span className="preco">{brl(i.preco)}</span></div>
      <Acao i={i} esgotado={esgotado} qtd={qtd} />
    </article>
  )
}

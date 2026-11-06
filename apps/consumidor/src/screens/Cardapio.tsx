import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { brl, CATEGORIAS, ITENS, type Item } from '../data/cardapio'
import { useEsgotados } from '../lib/hooks'
import { avisar, curtir, salvar, setQtd, useMembro, useSelecao, useSocial } from '../lib/mockStore'
import { baseCurtidas } from '../lib/util'
import { IconBalao, IconBusca, IconCubo, IconCardapio, IconCoracao, IconEnviar, IconEstrela, IconLista, IconMais } from '../ui/Icons'

const VisorAR = lazy(() => import('./VisorAR'))   // 3D/RA só baixa quando alguém toca em "Veja em 3D"
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function Cardapio({ ir }: { ir: (r: string) => void }) {
  const soldOut = useEsgotados(); const sel = useSelecao()
  const [cat, setCat] = useState<string>('Todos'); const [q, setQ] = useState(''); const [lista, setLista] = useState(false)
  const [ar, setAr] = useState<Item | null>(null)
  const [dica, setDica] = useState(() => { try { return !localStorage.getItem('sr-dica') } catch { return true } })
  const [h, setH] = useState<number | null>(null); const wrap = useRef<HTMLDivElement>(null); const rolo = useRef<HTMLDivElement>(null)
  const base = import.meta.env.BASE_URL
  const itens = useMemo(() => ITENS.filter(i => (cat === 'Todos' || i.cat === cat) && (!q || norm(i.nome + ' ' + i.desc + ' ' + i.ingredientes.join(' ')).includes(norm(q)))), [cat, q])
  const total = Object.values(sel.qtd).reduce((a, b) => a + b, 0)

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
    <div className="reels-wrap" ref={wrap} style={h ? { height: h } : { minHeight: '70dvh' }}>
      <div className="reels-topo">
        <div className="barra">
          <label className="busca"><IconBusca /><input placeholder="Buscar no cardápio" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar no cardápio" /></label>
          <button className="icone" onClick={() => setLista(!lista)} aria-label={lista ? 'Ver em tela cheia' : 'Ver em lista'}>{lista ? <IconCardapio /> : <IconLista />}</button>
          {total > 0 && <button className="pilula-sel" onClick={() => ir('/pedido')}>Seleção ({total})</button>}
        </div>
        <div className="chips" role="tablist" aria-label="Categorias">
          {['Todos', ...CATEGORIAS].map(c => <button key={c} role="tab" aria-selected={cat === c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      {itens.length === 0 ? <p className="vazio-reel">Nada encontrado. Tente outra palavra.</p> : lista ? (
        <div className={'lista lista-wrap'} ref={rolo} style={{ position: 'absolute', inset: 0, paddingTop: 128, paddingBottom: 16, background: 'var(--bg)' }}>
          {itens.map(i => <LinhaItem key={i.id} abrirAr={setAr} i={i} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />)}
        </div>
      ) : (
        <div className="reels" ref={rolo} onScroll={rolou} tabIndex={0} aria-label="Pratos do cardápio. Deslize para ver o próximo">
          {itens.map((i, n) => <Reel key={i.id} ir={ir} abrirAr={setAr} i={i} n={n + 1} de={itens.length} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />)}
        </div>
      )}
      {ar && <Suspense fallback={<div className="visor-ar"><p className="nota carregando-ar">Carregando…</p></div>}><VisorAR item={ar} fechar={() => setAr(null)} /></Suspense>}
      {dica && !lista && itens.length > 1 && <div className="dica-deslize" aria-hidden="true">↑ Deslize para o próximo</div>}
    </div>
  )
}

function Acao({ i, esgotado, qtd }: { i: Item; esgotado: boolean; qtd: number }) {
  if (esgotado) return <span className="esgotado">Acabou hoje</span>
  if (qtd === 0) return <button className="primario cheio" onClick={() => { setQtd(i.id, 1); avisar('Incluído na sua seleção.') }}><IconMais /> Adicionar ao pedido</button>
  return <span className="qtd"><button onClick={() => setQtd(i.id, qtd - 1)} aria-label={`Menos ${i.nome}`}>−</button><b>{qtd}</b><button onClick={() => setQtd(i.id, qtd + 1)} aria-label={`Mais ${i.nome}`}>+</button></span>
}

function Reel({ i, n, de, base, esgotado, qtd, ir, abrirAr }: { i: Item; n: number; de: number; base: string; esgotado: boolean; qtd: number; ir: (r: string) => void; abrirAr: (i: Item) => void }) {
  const [aberto, setAberto] = useState(false)
  const soc = useSocial(); const membro = useMembro()
  const curtido = soc.likes.includes(i.id), salvo = soc.saved.includes(i.id)
  const reduzir = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const enviar = async () => {
    const url = location.href.split('#')[0]
    try { if (navigator.share) { await navigator.share({ title: i.nome, text: `${i.nome} · ${brl(i.preco)}`, url }); return } } catch { return }
    try { await navigator.clipboard.writeText(url); avisar('Link copiado. Compartilhar não comprova que alguém publicou.') } catch { avisar('Copie o endereço da barra do navegador.') }
  }
  return (
    <article className={'reel' + (esgotado ? ' off' : '') + (i.modelo ? ' com-3d' : '')} aria-label={`${i.nome}, prato ${n} de ${de}`}>
      {i.video && !reduzir
        ? <video src={base + i.video} poster={base + i.img} muted loop playsInline preload="metadata" aria-label={`Vídeo de ${i.nome}`} />
        : <img src={base + i.img} alt={i.nome} loading={n > 2 ? 'lazy' : 'eager'} />}
      <span className="selo">{i.video ? '▶ Vídeo' : i.modelo?.capaRender ? '◆ Imagem 3D' : '● Foto'}{i.modelo && !i.modelo.capaRender ? ' · 3D' : ''}</span>
      <div className="lateral">
        <button onClick={() => curtir(i.id)} aria-pressed={curtido} aria-label={`Curtir ${i.nome}`}><IconCoracao cheio={curtido} /><small>{baseCurtidas(i.id) + (curtido ? 1 : 0)}</small></button>
        <button onClick={() => ir('/comentarios/' + i.id)} aria-label={`Comentar ${i.nome}`}><IconBalao /><small>Comentar</small></button>
        <button onClick={() => { salvar(i.id); avisar(salvo ? 'Removido dos salvos.' : membro ? 'Salvo na sua conta e disponível em outros aparelhos.' : 'Salvo só neste aparelho. Entre para guardar em qualquer lugar.') }} aria-pressed={salvo} aria-label={`Salvar ${i.nome}`}><IconEstrela cheio={salvo} /><small>Salvar</small></button>
        <button onClick={enviar} aria-label={`Enviar ${i.nome}`}><IconEnviar /><small>Enviar</small></button>
      </div>
      <span className="contador" aria-hidden="true">{n}/{de}</span>
      <div className="sombra">
        <span className="catag">{i.cat}</span>
        <h2>{i.nome}</h2>
        <span className="preco">{brl(i.preco)}</span>
        <p>{aberto ? i.desc : i.desc.length > 55 ? i.desc.slice(0, 55) + '…' : i.desc}</p>
        {aberto && <ul className="ingr">{i.ingredientes.map(x => <li key={x}>{x}</li>)}{i.tags?.map(t => <li key={t} className="tag">{t}</li>)}</ul>}
        <button className="link" style={{ textAlign: 'left', padding: 0 }} onClick={() => setAberto(!aberto)} aria-expanded={aberto}>{aberto ? 'Recolher descrição ↓' : 'Ver ingredientes e detalhes ↑'}</button>
      </div>
      <div className="acao-reel">
        {i.modelo && <button className="sec cta-ar" onClick={() => abrirAr(i)}><IconCubo /> Veja em 3D</button>}
        <Acao i={i} esgotado={esgotado} qtd={qtd} />
      </div>
    </article>
  )
}

function LinhaItem({ i, base, esgotado, qtd, abrirAr }: { i: Item; base: string; esgotado: boolean; qtd: number; abrirAr: (i: Item) => void }) {
  return (
    <article className={'linha-item' + (esgotado ? ' off' : '')}>
      <img src={base + i.img} alt="" loading="lazy" />
      <div className="meio"><h2>{i.nome}</h2><p>{i.desc}</p><span className="preco">{brl(i.preco)}</span>{i.modelo && <button className="link" style={{ padding: 0, textAlign: 'left' }} onClick={() => abrirAr(i)}>Veja em 3D</button>}</div>
      <Acao i={i} esgotado={esgotado} qtd={qtd} />
    </article>
  )
}

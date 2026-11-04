import { useMemo, useRef, useState } from 'react'
import { brl, CATEGORIAS, ITENS, type Item } from '../data/cardapio'
import { avisar, curtir, salvar, setQtd, useMembro, useSelecao, useShared, useSocial } from '../lib/mockStore'
import { baseCurtidas } from '../lib/util'
import { IconBalao, IconBusca, IconCardapio, IconCoracao, IconEnviar, IconEstrela, IconLista, IconMais } from '../ui/Icons'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function Cardapio({ ir }: { ir: (r: string) => void }) {
  const { soldOut } = useShared(); const sel = useSelecao()
  const [cat, setCat] = useState<string>('Todos'); const [q, setQ] = useState(''); const [lista, setLista] = useState(false)
  const base = import.meta.env.BASE_URL
  const itens = useMemo(() => ITENS.filter(i => (cat === 'Todos' || i.cat === cat) && (!q || norm(i.nome + ' ' + i.desc + ' ' + i.ingredientes.join(' ')).includes(norm(q)))), [cat, q])
  const total = Object.values(sel.qtd).reduce((a, b) => a + b, 0)
  return (
    <section className="cardapio">
      <div className="barra">
        <label className="busca"><IconBusca /><input placeholder="Buscar no cardápio" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar no cardápio" /></label>
        <button className="icone" onClick={() => setLista(!lista)} aria-label={lista ? 'Ver em feed' : 'Ver em lista'}>{lista ? <IconCardapio /> : <IconLista />}</button>
      </div>
      <div className="chips" role="tablist" aria-label="Categorias">
        {['Todos', ...CATEGORIAS].map(c => <button key={c} role="tab" aria-selected={cat === c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      {itens.length === 0 && <p className="vazio">Nada encontrado. Tente outra palavra.</p>}
      <div className={lista ? 'lista' : 'feed'}>
        {itens.map(i => lista
          ? <LinhaItem key={i.id} i={i} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />
          : <CartaoFeed key={i.id} ir={ir} i={i} base={base} esgotado={soldOut.includes(i.id)} qtd={sel.qtd[i.id] ?? 0} />)}
      </div>
      {total > 0 && <button className="flutuante" onClick={() => ir('/pedido')}>Ver minha seleção ({total})</button>}
    </section>
  )
}

function Acao({ i, esgotado, qtd }: { i: Item; esgotado: boolean; qtd: number }) {
  if (esgotado) return <span className="esgotado">Acabou hoje</span>
  if (qtd === 0) return <button className="primario cheio" onClick={() => { setQtd(i.id, 1); avisar('Incluído na sua seleção.') }}><IconMais /> Adicionar ao pedido</button>
  return <span className="qtd"><button onClick={() => setQtd(i.id, qtd - 1)} aria-label={`Menos ${i.nome}`}>−</button><b>{qtd}</b><button onClick={() => setQtd(i.id, qtd + 1)} aria-label={`Mais ${i.nome}`}>+</button></span>
}

function CartaoFeed({ i, base, esgotado, qtd, ir }: { i: Item; base: string; esgotado: boolean; qtd: number; ir: (r: string) => void }) {
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
    <article className={'cartao' + (esgotado ? ' off' : '')}>
      <div className="quadro">
        {i.video && !reduzir
          ? <video src={base + i.video} poster={base + i.img} muted loop playsInline autoPlay preload="none" aria-label={`Vídeo de ${i.nome}`} />
          : <img src={base + i.img} alt={i.nome} loading="lazy" />}
        <span className="selo">{i.video ? '▶ Vídeo' : '● Foto'}</span>
        <div className="lateral">
          <button onClick={() => curtir(i.id)} aria-pressed={curtido} aria-label={`Curtir ${i.nome}`}><IconCoracao cheio={curtido} /><small>{baseCurtidas(i.id) + (curtido ? 1 : 0)}</small></button>
          <button onClick={() => ir('/comentarios/' + i.id)} aria-label={`Comentar ${i.nome}`}><IconBalao /><small>Comentar</small></button>
          <button onClick={() => { salvar(i.id); avisar(salvo ? 'Removido dos salvos.' : membro ? 'Salvo na sua conta e disponível em outros aparelhos.' : 'Salvo só neste aparelho. Entre para guardar em qualquer lugar.') }} aria-pressed={salvo} aria-label={`Salvar ${i.nome}`}><IconEstrela cheio={salvo} /><small>Salvar</small></button>
          <button onClick={enviar} aria-label={`Enviar ${i.nome}`}><IconEnviar /><small>Enviar</small></button>
        </div>
        <div className="sombra">
          <span className="catag">{i.cat}</span>
          <h2>{i.nome}</h2>
          <span className="preco">{brl(i.preco)}</span>
          <p>{aberto ? i.desc : i.desc.length > 55 ? i.desc.slice(0, 55) + '…' : i.desc}</p>
          {aberto && <ul className="ingr">{i.ingredientes.map(x => <li key={x}>{x}</li>)}{i.tags?.map(t => <li key={t} className="tag">{t}</li>)}</ul>}
          <button className="link" onClick={() => setAberto(!aberto)} aria-expanded={aberto}>{aberto ? 'Recolher descrição ↓' : 'Ver ingredientes e detalhes ↑'}</button>
        </div>
      </div>
      <div className="rodacartao"><Acao i={i} esgotado={esgotado} qtd={qtd} /></div>
    </article>
  )
}

function LinhaItem({ i, base, esgotado, qtd }: { i: Item; base: string; esgotado: boolean; qtd: number }) {
  return (
    <article className={'linha-item' + (esgotado ? ' off' : '')}>
      <img src={base + i.img} alt="" loading="lazy" />
      <div className="meio"><h2>{i.nome}</h2><p>{i.desc}</p><span className="preco">{brl(i.preco)}</span></div>
      <Acao i={i} esgotado={esgotado} qtd={qtd} />
    </article>
  )
}

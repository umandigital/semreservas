import { useState } from 'react'
import { ITENS } from '../data/cardapio'
import { avisar, comentar, curtir, useMembro, useSocial } from '../lib/mockStore'
import { comentariosDe } from '../data/exemplos'
import { baseCurtidas } from '../lib/util'
import { IcCoracao } from '../ui/IconsV2'

export function Comentarios({ id, ir }: { id: string; ir: (r: string) => void }) {
  const item = ITENS.find(i => i.id === id); const m = useMembro(); const soc = useSocial(); const [txt, setTxt] = useState('')
  if (!item) return <section className="tela-int"><h1>Item não encontrado</h1><button className="primario grande" onClick={() => ir('/cardapio')}>Voltar ao cardápio</button></section>
  const meus = soc.comments.filter(c => c.produto === id)
  return (
    <section className="tela-int">
      <h1>Comentários</h1><p className="mesa-g">{item.nome}</p>
      <div className="cartao-i"><button className={'n2-curtir' + (soc.likes.includes(id) ? ' on' : '')} aria-pressed={soc.likes.includes(id)} onClick={() => curtir(id)}><IcCoracao f={soc.likes.includes(id)} /><b>{baseCurtidas(id) + (soc.likes.includes(id) ? 1 : 0)}</b> curtidas</button>
        <h2>Publicados</h2><ul className="coment">{comentariosDe(id, item.cat).map(c => <li key={c.autor + c.texto}><b>{c.autor}</b> <small className="quando">{c.quando}</small><p>{c.texto}</p><small>comentário de exemplo</small></li>)}</ul></div>
      {meus.length > 0 && <div className="cartao-i"><h2>Seus, aguardando moderação</h2><ul className="coment">{meus.map(c => <li key={c.id}>{c.texto}<small>só você vê até a equipe aprovar</small></li>)}</ul></div>}
      {!m ? (
        <div className="cartao-i"><p>Qualquer pessoa pode ler. Para comentar, é preciso estar identificado, para o estabelecimento moderar e evitar abuso.</p>
          <button className="primario grande" onClick={() => ir('/entrar?de=/comentarios/' + id)}>Entrar para comentar</button></div>
      ) : (
        <div className="cartao-i"><label className="rot">Sua opinião<textarea className="campo" rows={3} maxLength={600} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Conte como foi" /></label>
          <button className="primario grande" disabled={!txt.trim()} onClick={() => { if (comentar(id, txt)) { setTxt(''); avisar('Enviado para moderação. Nada é publicado automaticamente.') } }}>Enviar para moderação</button></div>
      )}
      <button className="link" onClick={() => ir('/cardapio')}>Voltar ao cardápio</button>
    </section>
  )
}

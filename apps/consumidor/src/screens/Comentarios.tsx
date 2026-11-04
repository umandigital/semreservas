import { useState } from 'react'
import { ITENS } from '../data/cardapio'
import { avisar, comentar, useMembro, useSocial } from '../lib/mockStore'

const EXEMPLOS = ['Pão macio e carne no ponto.', 'Bom para dividir.', 'Chegou rápido e quente.']

export function Comentarios({ id, ir }: { id: string; ir: (r: string) => void }) {
  const item = ITENS.find(i => i.id === id); const m = useMembro(); const soc = useSocial(); const [txt, setTxt] = useState('')
  if (!item) return <section className="tela-int"><h1>Item não encontrado</h1><button className="primario grande" onClick={() => ir('/cardapio')}>Voltar ao cardápio</button></section>
  const meus = soc.comments.filter(c => c.produto === id)
  return (
    <section className="tela-int">
      <h1>Comentários</h1><p className="mesa-g">{item.nome}</p>
      <div className="cartao-i"><h2>Publicados</h2><ul className="coment">{EXEMPLOS.map(e => <li key={e}>{e}<small>comentário de exemplo (teste)</small></li>)}</ul></div>
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

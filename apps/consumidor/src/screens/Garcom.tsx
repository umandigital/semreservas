import { ITENS } from '../data/cardapio'
import { useSelecao } from '../lib/mockStore'
import { getMesa } from '../lib/router'

// Modo garçom: contraste alto, letras grandes e NENHUM valor em tela.
export function Garcom({ ir }: { ir: (r: string) => void }) {
  const sel = useSelecao(); const mesa = getMesa()
  const linhas = ITENS.filter(i => sel.qtd[i.id])
  return (
    <section className="garcom">
      <header><span>{mesa ? `Mesa ${mesa}` : 'Mesa não informada'}</span><span className="codigo">Código {sel.code}</span></header>
      {linhas.length === 0 ? <p>Nenhum item.</p> : (
        <ul>{linhas.map(i => <li key={i.id}><b>{sel.qtd[i.id]}×</b> {i.nome}{sel.obs[i.id] && <small>{sel.obs[i.id]}</small>}</li>)}</ul>
      )}
      <p className="nota-g">Seleção do cliente. O garçom confirma e lança o pedido.</p>
      <button className="primario grande" onClick={() => ir('/chamar')}>Chamar garçom</button>
      <button className="link claro" onClick={() => ir('/pedido')}>Voltar</button>
    </section>
  )
}

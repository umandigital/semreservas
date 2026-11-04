import { brl, ITENS } from '../data/cardapio'
import { limparSelecao, setObs, setQtd, useSelecao, useShared } from '../lib/mockStore'

export function Pedido({ ir }: { ir: (r: string) => void }) {
  const sel = useSelecao(); const { soldOut } = useShared()
  const linhas = ITENS.filter(i => sel.qtd[i.id])
  const subtotal = linhas.reduce((s, i) => s + i.preco * sel.qtd[i.id], 0)
  if (!linhas.length) return <section className="tela-int"><h1>Minha seleção</h1><p className="vazio">Você ainda não escolheu nada.</p><button className="primario grande" onClick={() => ir('/cardapio')}>Ver cardápio</button></section>
  return (
    <section className="tela-int">
      <h1>Minha seleção</h1>
      <p className="aviso">Isto ainda <b>não foi enviado à cozinha</b>. Mostre ao garçom para fazer o pedido.</p>
      <ul className="itens">
        {linhas.map(i => (
          <li key={i.id}>
            <div className="linha"><b>{i.nome}</b><span>{brl(i.preco * sel.qtd[i.id])}</span></div>
            {soldOut.includes(i.id) && <p className="alerta">Este item acabou. Remova ou fale com o garçom.</p>}
            <div className="linha">
              <span className="qtd"><button onClick={() => setQtd(i.id, sel.qtd[i.id] - 1)} aria-label={`Menos ${i.nome}`}>−</button><b>{sel.qtd[i.id]}</b><button onClick={() => setQtd(i.id, sel.qtd[i.id] + 1)} aria-label={`Mais ${i.nome}`}>+</button></span>
              <input className="obs" placeholder="Observação (ex.: sem cebola)" value={sel.obs[i.id] ?? ''} maxLength={120} onChange={e => setObs(i.id, e.target.value)} aria-label={`Observação de ${i.nome}`} />
            </div>
          </li>
        ))}
      </ul>
      <div className="linha total"><span>Subtotal estimado</span><b>{brl(subtotal)}</b></div>
      <button className="primario grande" onClick={() => ir('/garcom')}>Mostrar ao garçom</button>
      <button className="sec grande" onClick={() => ir('/chamar')}>Chamar garçom</button>
      <button className="link" onClick={limparSelecao}>Limpar seleção</button>
    </section>
  )
}

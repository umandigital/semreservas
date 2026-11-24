import { useState } from 'react'
import { useEsgotados } from '../lib/hooks'
import { ApiError, MENSAGEM_ERRO } from '../lib/api'
import { pedirAtendimento, pedirComItens } from '../lib/atendimento'
import { CLUBE_REAL } from '../lib/clube'
import { getMesa, getToken } from '../lib/router'
import { useClube } from '../lib/clube'
import { brl, ITENS } from '../data/cardapio'
import { avisar, limparSelecao, setObs, setQtd, useSelecao } from '../lib/mockStore'

export function Pedido({ ir }: { ir: (r: string) => void }) {
  const sel = useSelecao(); const soldOut = useEsgotados(); const [abertas, setAbertas] = useState<string[]>([]); const [busy, setBusy] = useState(false); const clube = useClube()
  const linhas = ITENS.filter(i => sel.qtd[i.id])
  const subtotal = linhas.reduce((s, i) => s + i.preco * sel.qtd[i.id], 0)
  const chamar = async () => {
    if (!getMesa() || !getToken()) return ir('/chamar')
    setBusy(true)
    try {
      // Um toque só: chama o garçom com os itens. No modo real o servidor calcula o valor e libera o giro da Roleta.
      if (CLUBE_REAL) { const r = await pedirComItens(linhas.map(i => ({ id: i.id, qty: sel.qtd[i.id], obs: sel.obs[i.id] }))); ir('/chamado/' + r.id) }
      else { const id = await pedirAtendimento('order'); if (clube.v?.membro && clube.v.roleta?.enabled) { try { await clube.liberarGiro(id, subtotal) } catch { /* sem giro */ } } ir('/chamado/' + id) }
    } catch (e) { avisar(MENSAGEM_ERRO[e instanceof ApiError ? e.code : 'rede']) } finally { setBusy(false) }
  }
  if (!linhas.length) return <section className="tela-int"><h1>Meu pedido</h1><p className="vazio">Você ainda não escolheu nada.</p><button className="primario grande" onClick={() => ir('/cardapio')}>Ver cardápio</button></section>
  return (
    <section className="tela-int">
      <h1>Meu pedido</h1>
      <p className="aviso">Toque em <b>Chamar garçom</b>. Ele confere os itens com você e lança o pedido.</p>
      <ul className="itens">
        {linhas.map(i => (
          <li key={i.id}>
            <div className="linha"><b>{i.nome}</b><span>{brl(i.preco * sel.qtd[i.id])}</span></div>
            {soldOut.includes(i.id) && <p className="alerta">Este item acabou. Remova ou fale com o garçom.</p>}
            <div className="linha">
              <span className="qtd"><button onClick={() => setQtd(i.id, sel.qtd[i.id] - 1)} aria-label={`Menos ${i.nome}`}>−</button><b>{sel.qtd[i.id]}</b><button onClick={() => setQtd(i.id, sel.qtd[i.id] + 1)} aria-label={`Mais ${i.nome}`}>+</button></span>
              {abertas.includes(i.id) || sel.obs[i.id] ? <input className="obs" placeholder="Ex.: sem cebola" value={sel.obs[i.id] ?? ''} maxLength={120} onChange={e => setObs(i.id, e.target.value)} aria-label={`Observação de ${i.nome}`} /> : <button className="obs-link" onClick={() => setAbertas([...abertas, i.id])}>Observação</button>}
            </div>
          </li>
        ))}
      </ul>
      <div className="linha total"><span>Subtotal estimado</span><b>{brl(subtotal)}</b></div>
      <button className="primario grande" disabled={busy} onClick={chamar}>Chamar garçom</button>
      <button className="link" onClick={limparSelecao}>Limpar seleção</button>
    </section>
  )
}

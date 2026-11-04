import { useState } from 'react'
import { useMembro } from '../lib/mockStore'

export function Pesquisa({ ir }: { ir: (r: string) => void }) {
  const m = useMembro(); const [nota, setNota] = useState(0); const [txt, setTxt] = useState(''); const [ok, setOk] = useState(false)
  if (ok) return <section className="tela-int"><h1>Obrigado!</h1><p>Sua resposta foi registrada (teste) e ajuda a melhorar o atendimento.</p>
    <p className="nota">{m ? 'Pontos só entram se o regulamento do clube previr e a equipe validar.' : 'Resposta anônima não gera pontos.'}</p>
    <button className="primario grande" onClick={() => ir('/')}>Voltar ao início</button></section>
  return (
    <section className="tela-int">
      <h1>Pesquisa rápida</h1>
      <p>Como está sendo sua visita?</p>
      <div className="notas" role="radiogroup" aria-label="Nota de 1 a 5">{[1, 2, 3, 4, 5].map(n => <button key={n} role="radio" aria-checked={nota === n} className={'chip grande-chip' + (nota === n ? ' on' : '')} onClick={() => setNota(n)}>{n}</button>)}</div>
      <small className="nota">1 = precisa melhorar · 5 = excelente</small>
      <label className="rot">Comentário ou sugestão (opcional)<textarea className="campo" rows={4} maxLength={500} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Conte o que podemos melhorar" /></label>
      <button className="primario grande" disabled={!nota} onClick={() => setOk(true)}>Enviar</button>
      <p className="nota">Esta pesquisa é interna do GastroPub. Não é uma avaliação pública no Google.</p>
    </section>
  )
}

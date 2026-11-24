import { useState } from 'react'
import { ITENS } from '../data/cardapio'
import { avisar, lerSelecao } from '../lib/mockStore'
import { useClube } from '../lib/clube'
import { IconEstrela } from '../ui/Icons'

/** "Como foi a visita?": um fluxo só. 1) estrelas, 2) o que gostou e comentário (opcional), 3) enviar. */
export function Visita({ ir }: { ir: (r: string) => void }) {
  const c = useClube(); const v = c.v; const [nota, setNota] = useState(0); const [txt, setTxt] = useState(''); const [gostei, setGostei] = useState<string[]>([]); const [busy, setBusy] = useState(false)
  const pratos = ITENS.filter(i => lerSelecao().qtd[i.id]).map(i => i.nome)
  if (!v) return <section className="tela-int"><p>Carregando…</p></section>
  if (!v.membro) return (
    <section className="tela-int"><h1>Como foi a visita?</h1><p>Entre no Clube para contar como foi e ganhar pontos.</p>
      <button className="primario grande" onClick={() => ir('/entrar')}>Entrar ou cadastrar</button></section>)
  if (v.hoje.opinou) return (
    <section className="tela-int"><h1>Obrigado!</h1><p>Você já contou como foi a sua visita de hoje.</p><button className="primario grande" onClick={() => ir('/clube')}>Ver meus pontos</button></section>)
  const pts = (a: string) => v.regras.find(r => r.action === a)?.points ?? 0
  const enviar = async () => {
    setBusy(true)
    try { const g = await c.opinar(nota, txt, gostei); avisar(g ? `Obrigado! Você ganhou +${g} pontos.` : 'Obrigado por contar como foi!'); ir('/clube') }
    catch (e) { c.avisarErro(e) } finally { setBusy(false) }
  }
  return (
    <section className="tela-int">
      <h1>Como foi a visita?</h1>
      {!v.hoje.visitou && <p className="aviso">Para contar como foi, encoste o celular na placa da mesa e registre sua visita.</p>}
      <div className="bloco-c"><h2>Sua nota</h2>
        <div className="estrelas" role="radiogroup" aria-label="Nota de 1 a 5">{[1, 2, 3, 4, 5].map(n => <button key={n} role="radio" aria-checked={nota === n} aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`} onClick={() => setNota(n)}><IconEstrela cheio={n <= nota} /></button>)}</div>
        <p className="nota">Ganhe +{pts('survey')} pontos só pela nota.</p></div>
      {nota > 0 && <>
        {pratos.length > 0 && <div className="bloco-c"><h2>O que você gostou?</h2>
          <div className="chips-g">{pratos.map(p => <button key={p} className={'chip' + (gostei.includes(p) ? ' on' : '')} aria-pressed={gostei.includes(p)} onClick={() => setGostei(gostei.includes(p) ? gostei.filter(x => x !== p) : [...gostei, p])}>{p}</button>)}</div>
          <p className="nota">+{pts('like_dish')} pontos por prato, até 3.</p></div>}
        <div className="bloco-c"><h2>Quer contar mais?</h2>
          <textarea className="campo" rows={3} maxLength={600} value={txt} onChange={e => setTxt(e.target.value)} placeholder="O que funcionou bem? O que podemos melhorar?" />
          <p className="nota">Opcional. Com 20 letras ou mais: +{pts('comment_dish')} pontos. O restaurante lê antes de publicar.</p></div>
      </>}
      <button className="primario grande" disabled={nota === 0 || busy || !v.hoje.visitou} onClick={enviar}>Enviar</button>
    </section>
  )
}

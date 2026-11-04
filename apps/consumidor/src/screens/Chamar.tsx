import { useState } from 'react'
import { CONFIG } from '../data/cardapio'
import { aberto, criarChamado, type Motivo, useShared } from '../lib/mockStore'
import { getMesa, setMesa } from '../lib/router'

const MOTIVOS: Motivo[] = ['Conta', 'Dúvida', 'Fazer pedido', 'Outro']

export function Chamar({ ir }: { ir: (r: string) => void }) {
  const [mesa, setM] = useState<string | null>(getMesa()); const [trocando, setTrocando] = useState(false)
  const { calls } = useShared()
  const abertos = mesa ? calls.filter(c => c.mesa === mesa && aberto(c)) : []
  const escolher = (m: string) => { setMesa(m); setM(m); setTrocando(false) }
  if (!mesa || trocando) return (
    <section className="tela-int">
      <h1>Em qual mesa você está?</h1>
      <p>O número está na placa da mesa.</p>
      <div className="grade">{CONFIG.mesas.map(m => <button key={m} className="chip grande-chip" onClick={() => escolher(m)}>{m}</button>)}</div>
    </section>
  )
  return (
    <section className="tela-int">
      <h1>Chamar garçom</h1>
      <p className="mesa-g">Mesa {mesa} <button className="link" onClick={() => setTrocando(true)}>Não é esta mesa?</button></p>
      <p>Como podemos ajudar?</p>
      <div className="motivos">
        {MOTIVOS.map(m => {
          const ja = abertos.find(c => c.motivo === m)
          return <button key={m} className="primario grande" onClick={() => { const c = criarChamado(mesa, m); ir('/chamado/' + c.id) }}>{ja ? `${m} (já chamado)` : m}</button>
        })}
      </div>
    </section>
  )
}

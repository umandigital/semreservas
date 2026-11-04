import { useState } from 'react'
import { ehAparelhoDeToque, ehIphone, entrarTelaCheia } from '../lib/telacheia'

export function BoasVindas({ nome, mesa, entrar }: { nome: string; mesa: string | null; entrar: () => void }) {
  const [busy, setBusy] = useState(false)
  const iphone = ehIphone() && ehAparelhoDeToque()
  return (
    <main className="boas-vindas">
      <img className="logo-sr" src={import.meta.env.BASE_URL + 'media/logo-oficial-horizontal.png'} alt="SemReservas" />
      <h1>{nome}</h1>
      {mesa && <p className="mesa-g">Mesa {mesa}</p>}
      <p className="nota">Cardápio, atendimento e novidades, sem baixar nada.</p>
      <button className="primario grande" disabled={busy} onClick={async () => { setBusy(true); await entrarTelaCheia(); entrar() }}>Toque para começar</button>
      {iphone && <p className="nota">Dica: no iPhone, toque em Compartilhar e em "Adicionar à Tela de Início" para abrir sempre em tela cheia.</p>}
    </main>
  )
}

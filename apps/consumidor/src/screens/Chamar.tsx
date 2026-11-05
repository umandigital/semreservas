import { useEffect, useState } from 'react'
import { ApiError, MENSAGEM_ERRO, mesasDaPlaca, type Kind } from '../lib/api'
import { corrigirMesa, pedirAtendimento } from '../lib/atendimento'
import { getMesa, getToken } from '../lib/router'

const MOTIVOS: { rotulo: string; kind: Kind }[] = [
  { rotulo: 'Conta', kind: 'bill' }, { rotulo: 'Dúvida', kind: 'question' },
  { rotulo: 'Fazer pedido', kind: 'order' }, { rotulo: 'Outro', kind: 'other' },
]

export function Chamar({ ir }: { ir: (r: string) => void }) {
  const token = getToken()
  const [mesa, setM] = useState<string | null>(getMesa()); const [trocando, setTrocando] = useState(false)
  const [mesas, setMesas] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [erro, setErro] = useState('')
  useEffect(() => { if (token) mesasDaPlaca(token).then(setMesas).catch(() => setMesas([])) }, [token])

  if (!token) return (
    <section className="tela-int"><h1>Chamar garçom</h1>
      <div className="aviso">Para chamar o garçom, <b>aproxime o celular da placa da sua mesa</b> (ou leia o QR). Assim a equipe sabe exatamente onde você está.</div>
      <p className="nota">Se a placa não funcionar, chame alguém do salão.</p></section>
  )
  const enviar = async (kind: Kind) => {
    setBusy(true); setErro('')
    try { ir('/chamado/' + await pedirAtendimento(kind)) }
    catch (e) { setErro(MENSAGEM_ERRO[e instanceof ApiError ? e.code : 'rede']) }
    finally { setBusy(false) }
  }
  if (trocando || !mesa) return (
    <section className="tela-int">
      <h1>Em qual mesa você está?</h1><p>O número está na placa da mesa.</p>
      <div className="grade">{mesas.map(m => <button key={m} className="chip grande-chip" onClick={() => { corrigirMesa(m); setM(m); setTrocando(false) }}>{m}</button>)}</div>
      {mesas.length === 0 && <p className="nota">Carregando as mesas…</p>}
    </section>
  )
  return (
    <section className="tela-int">
      <h1>Chamar garçom</h1>
      <p className="mesa-g">Mesa {mesa} <button className="link" onClick={() => setTrocando(true)}>Não é esta mesa?</button></p>
      <p>Como podemos ajudar?</p>
      <p className="nota">Para confirmar que você está no restaurante, o navegador pode pedir a localização do aparelho. Usamos só nesse momento e <b>não guardamos</b> a sua posição.</p>
      <div className="motivos">{MOTIVOS.map(m => <button key={m.kind} className="primario grande" disabled={busy} onClick={() => enviar(m.kind)}>{m.rotulo}</button>)}</div>
      {erro && <p className="alerta" role="alert">{erro}</p>}
    </section>
  )
}

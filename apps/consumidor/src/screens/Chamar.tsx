import { useEffect, useState, type ReactNode } from 'react'
import { ApiError, MENSAGEM_ERRO, mesasDaPlaca, type Kind } from '../lib/api'
import { corrigirMesa, pedirAtendimento } from '../lib/atendimento'
import { getMesa, getToken } from '../lib/router'
import { SessaoVencida } from '../ui/SessaoVencida'
import { IconConta, IconSino, IconBalao } from '../ui/Icons'

const MOTIVOS: { rotulo: string; sub: string; kind: Kind; icone: ReactNode }[] = [
  { rotulo: 'Chamar garçom', sub: 'Preciso de atendimento na mesa', kind: 'waiter', icone: <IconSino /> },
  { rotulo: 'Pedir a conta', sub: 'Quero fechar meu consumo', kind: 'bill', icone: <IconConta /> },
  { rotulo: 'Tirar uma dúvida', sub: 'Quero falar com alguém da equipe', kind: 'question', icone: <IconBalao /> },
]

export function Chamar({ ir }: { ir: (r: string) => void }) {
  const token = getToken()
  const [mesa, setM] = useState<string | null>(getMesa()); const [trocando, setTrocando] = useState(false)
  const [mesas, setMesas] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [erro, setErro] = useState('')
  useEffect(() => { if (token) mesasDaPlaca(token).then(setMesas).catch(() => setMesas([])) }, [token])

  if (!token) return (
    <><SessaoVencida titulo="Chamar garçom" /><p className="nota" style={{ textAlign: 'center' }}>Se a placa não funcionar, chame alguém do salão.</p></>
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
      <h1>Atendimento · Mesa {mesa}</h1>
      <p className="mesa-g"><button className="link" onClick={() => setTrocando(true)}>Não é esta mesa?</button></p>
      <p>Como podemos ajudar?</p>
      <p className="nota">Para confirmar que você está no restaurante, o navegador pode pedir a localização do aparelho. Usamos só nesse momento e <b>não guardamos</b> a sua posição.</p>
      <div className="motivos-l">{MOTIVOS.map(m => <button key={m.kind} className="linha-motivo" disabled={busy} onClick={() => enviar(m.kind)}><span className="ic">{m.icone}</span><span><b>{m.rotulo}</b><small>{m.sub}</small></span><span aria-hidden="true">›</span></button>)}</div>
      <p className="nota">O chamado será enviado para a equipe desta unidade.</p>
      {erro && <p className="alerta" role="alert">{erro}</p>}
    </section>
  )
}

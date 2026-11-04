import { cancelar, type Status as S, useShared } from '../lib/mockStore'

const TXT: Record<S, [string, string]> = {
  PENDING: ['Chamado enviado', 'Aguardando um atendente ver. Se não vierem em alguns minutos, fale com alguém do salão.'],
  ACKNOWLEDGED: ['O garçom viu e está a caminho', 'Fique na mesa. Ele já sabe onde você está.'],
  RESOLVED: ['Atendido', 'Obrigado!'],
  CANCELLED: ['Chamado cancelado', ''],
}
export function Status({ id, ir }: { id: string; ir: (r: string) => void }) {
  const c = useShared().calls.find(x => x.id === id)
  if (!c) return <section className="tela-int"><h1>Chamado não encontrado</h1><button className="primario grande" onClick={() => ir('/')}>Início</button></section>
  const [t, d] = TXT[c.status]
  return (
    <section className="tela-int status" aria-live="polite">
      <p className="mesa-g">Mesa {c.mesa} · {c.motivo}</p>
      <h1>{t}</h1><p>{d}</p>
      <p className="codigo">Código {c.code}</p>
      <ol className="passos"><li className="ok">Enviado</li><li className={c.status !== 'PENDING' && c.status !== 'CANCELLED' ? 'ok' : ''}>Visto</li><li className={c.status === 'RESOLVED' ? 'ok' : ''}>Atendido</li></ol>
      {(c.status === 'PENDING' || c.status === 'ACKNOWLEDGED') && <button className="sec grande" onClick={() => cancelar(c.id)}>Cancelar chamado</button>}
      <button className="link" onClick={() => ir('/')}>Voltar ao início</button>
    </section>
  )
}

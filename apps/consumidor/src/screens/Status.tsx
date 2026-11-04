import { useEffect, useState } from 'react'
import { cancelarChamado, ROTULO, statusChamado, type Status as S, type StatusChamado } from '../lib/api'
import { tokenDeCancelamento } from '../lib/atendimento'
import { avisar } from '../lib/mockStore'

const TXT: Record<S, [string, string]> = {
  PENDING: ['Chamado enviado', 'Aguardando a equipe ver. Se demorar, fale com alguém do salão.'],
  ACKNOWLEDGED: ['A equipe viu e está a caminho', 'Fique na mesa. Eles já sabem onde você está.'],
  RESOLVED: ['Atendido', 'Obrigado!'],
  CANCELLED: ['Chamado cancelado', ''],
}
export function Status({ id, ir }: { id: string; ir: (r: string) => void }) {
  const [c, setC] = useState<StatusChamado | null | undefined>(undefined); const [semRede, setSemRede] = useState(false)
  useEffect(() => {
    let vivo = true
    const ler = () => statusChamado(id).then(v => { if (vivo) { setC(v); setSemRede(false) } }).catch(() => vivo && setSemRede(true))
    ler(); const t = setInterval(ler, 3000); const vis = () => { if (!document.hidden) ler() }
    document.addEventListener('visibilitychange', vis)
    return () => { vivo = false; clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [id])
  const tk = tokenDeCancelamento(id)
  if (c === undefined) return <section className="tela-int"><p>{semRede ? 'Sem conexão. Tentando de novo…' : 'Carregando…'}</p></section>
  if (c === null) return <section className="tela-int"><h1>Chamado não encontrado</h1><button className="primario grande" onClick={() => ir('/')}>Início</button></section>
  const [t, d] = TXT[c.status]; const aberto = c.status === 'PENDING' || c.status === 'ACKNOWLEDGED'
  return (
    <section className="tela-int status" aria-live="polite">
      <p className="mesa-g">Mesa {c.table_label} · {ROTULO[c.kind]}{c.detail ? ` · ${c.detail}` : ''}</p>
      <h1>{t}</h1><p>{d}</p>
      <p className="codigo">Código {c.public_code}</p>
      {semRede && <p className="alerta" role="alert">Sem conexão agora. Este status pode estar desatualizado.</p>}
      <ol className="passos"><li className="ok">Enviado</li><li className={c.status === 'ACKNOWLEDGED' || c.status === 'RESOLVED' ? 'ok' : ''}>Visto</li><li className={c.status === 'RESOLVED' ? 'ok' : ''}>Atendido</li></ol>
      {aberto && tk && <button className="sec grande" onClick={async () => { try { await cancelarChamado(id, tk) ? avisar('Chamado cancelado.') : avisar('Não foi possível cancelar.') } catch { avisar('Sem conexão. Tente de novo.') } }}>Cancelar chamado</button>}
      <button className="link" onClick={() => ir('/')}>Voltar ao início</button>
    </section>
  )
}

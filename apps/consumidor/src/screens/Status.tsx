import { useEffect, useState } from 'react'
import { cancelarChamado, ROTULO, statusChamado, type StatusChamado } from '../lib/api'
import { tokenDeCancelamento } from '../lib/atendimento'
import { avisar, useSelecao } from '../lib/mockStore'
import { ITENS, brl } from '../data/cardapio'
import { TEMA } from '../data/tema'
import { useClube } from '../lib/clube'
import { IconSino } from '../ui/Icons'

/** "Garçom a caminho": o cliente mostra esta tela ao garçom. Faixa de estado, mesa e código, pedido em papel creme, editar e cancelar. */
export function Status({ id, ir }: { id: string; ir: (r: string) => void }) {
  const [c, setC] = useState<StatusChamado | null | undefined>(undefined); const [semRede, setSemRede] = useState(false)
  useEffect(() => {
    let vivo = true
    const ler = () => statusChamado(id).then(v => { if (vivo) { setC(v); setSemRede(false) } }).catch(() => vivo && setSemRede(true))
    ler(); const t = setInterval(ler, 3000); const vis = () => { if (!document.hidden) ler() }
    document.addEventListener('visibilitychange', vis)
    return () => { vivo = false; clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [id])
  const clube = useClube(); const giro = (clube.v?.roleta?.grants ?? 0) > 0
  const sel = useSelecao(); const linhas = ITENS.filter(i => sel.qtd[i.id])
  const tk = tokenDeCancelamento(id)
  if (c === undefined) return <section className="tela-int"><p>{semRede ? 'Sem conexão. Tentando de novo…' : 'Carregando…'}</p></section>
  if (c === null) return <section className="tela-int"><h1>Chamado não encontrado</h1><button className="primario grande" onClick={() => ir('/')}>Início</button></section>
  const aberto = c.status === 'PENDING' || c.status === 'ACKNOWLEDGED'
  const faixa = c.status === 'ACKNOWLEDGED' ? ['ok', 'Garçom a caminho'] : c.status === 'PENDING' ? ['espera', 'Chamando o garçom'] : c.status === 'RESOLVED' ? ['ok', 'Atendido'] : ['off', 'Chamado cancelado']
  const pedido = c.kind === 'order' && aberto && linhas.length > 0
  return (
    <section className="tela-int status" aria-live="polite">
      <img className="logo-c" src={import.meta.env.BASE_URL + TEMA.logo} alt={TEMA.nome} />
      <div className={'faixa-st ' + faixa[0]}><IconSino /><b>{faixa[1]}</b></div>
      {c.kind === 'order' && giro && <div className="faixa-giro"><b>Seu pedido chegou a {brl(clube.v!.roleta!.minCents)}!</b><span>Você ganhou 1 giro da Roleta do Chef.</span><button className="primario grande" onClick={() => ir('/roleta')}>Girar agora</button></div>}
      <div className="chips-st"><span className="mesa-chip">Mesa {c.table_label}</span><span className="cod-chip">{c.public_code}</span></div>
      {aberto && <h1 className="mostre">{pedido ? <>Mostre esta tela<br />ao garçom</> : c.status === 'PENDING' ? <>Aguarde,<br />já vamos até você</> : <>Fique na mesa,<br />ele já sabe onde você está</>}</h1>}
      {!aberto && <h1 className="mostre">{c.status === 'RESOLVED' ? 'Obrigado!' : 'Chamado cancelado'}</h1>}
      <p className="nota-st">{ROTULO[c.kind]}{c.detail ? ` · ${c.detail}` : ''}</p>
      {pedido && <div className="papel pedido-p"><h2>Seu pedido</h2><ul>{linhas.map(i => <li key={i.id}>{sel.qtd[i.id]} × {i.nome}{sel.obs[i.id] && <small>{sel.obs[i.id]}</small>}</li>)}</ul></div>}
      {pedido && <p className="nota-st"><i>O garçom confirma os itens antes de registrar.</i></p>}
      {semRede && <p className="alerta" role="alert">Sem conexão agora. Este estado pode estar desatualizado.</p>}
      <ol className="passos"><li className="ok">Enviado</li><li className={c.status === 'ACKNOWLEDGED' || c.status === 'RESOLVED' ? 'ok' : ''}>Visto</li><li className={c.status === 'RESOLVED' ? 'ok' : ''}>Atendido</li></ol>
      {pedido && <button className="primario grande" onClick={() => ir('/pedido')}>Editar pedido</button>}
      {aberto && tk && <button className="link" onClick={async () => { try { await cancelarChamado(id, tk) ? avisar('Chamado cancelado.') : avisar('Não foi possível cancelar.') } catch { avisar('Sem conexão. Tente de novo.') } }}>Cancelar chamado</button>}
      {aberto && <p className="nota-st">O chamado foi enviado para a equipe desta unidade.</p>}
      <button className="link" onClick={() => ir('/')}>Voltar ao início</button>
    </section>
  )
}

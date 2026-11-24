import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CLUBE, type Grupo } from '../data/clube'
import { TEMA } from '../data/tema'
import { useClube } from '../lib/clube'
import { IconCamera, IconCartao, IconCheck, IconConta, IconCubo, IconEstrela, IconInsta, IconPrancheta, IconSino, IconUsuario, IconWifi } from '../ui/Icons'

/** O "S" da marca como guia: traço que se desenha e ondas de aproximação (o "toque"). */
const S = ({ grande }: { grande?: boolean }) => (
  <svg className={'s-guia' + (grande ? ' grande' : '')} viewBox="0 0 100 100" aria-hidden="true">
    <path className="s-traco" d="M62 24c-6-8-30-8-30 6 0 16 36 8 36 28 0 16-28 18-38 6" />
    <path className="onda o1" d="M68 12a22 22 0 0120 20" /><path className="onda o2" d="M68 2a32 32 0 0130 30" />
  </svg>)

type Item = { icone: ReactNode; rotulo: string; pts?: number }
type Cap = { id: string; titulo: string; texto: string; resumo: string; itens?: Item[]; exemplo?: boolean; abertura?: boolean; tipo?: 'lista' | 'duvidas' | 'fecho' }
const ICONE: Record<string, ReactNode> = { signup: <IconUsuario />, profile_complete: <IconCheck />, install_app: <IconPrancheta />, enable_notifications: <IconSino />, checkin: <IconCartao />, return_7d: <IconCheck />, visits_3_month: <IconCheck />, streak_4w: <IconEstrela cheio />, full_table: <IconUsuario />,
  order_via_app: <IconPrancheta />, ar_used: <IconCubo />, like_dish: <IconEstrela />, rate_dish: <IconEstrela cheio />, comment_dish: <IconConta />, survey: <IconEstrela cheio />, suggestion: <IconConta />, photo_frame: <IconCamera />, share_photo: <IconCamera />, share_app: <IconWifi />, instagram_follow: <IconInsta />, google_open: <IconEstrela />, referral: <IconUsuario /> }
const TEXTO: Record<Grupo, [string, string, string]> = {
  cadastro: ['Seu cadastro rende pontos', 'Ao se cadastrar e completar o seu perfil você ganha pontos. Instalar o app e ativar os avisos também. Cada um vale uma vez.', 'Cadastro e perfil dão pontos.'],
  visita: ['Ganhe pontos por visita', 'Abra o app na mesa do restaurante. Cada visita dá pontos, uma vez por dia.', 'Cada visita dá pontos.'],
  voltar: ['Volte e ganhe mais', 'Voltar em até 7 dias, 3 visitas no mês, 4 semanas seguidas e mesa cheia com amigos do Clube dão pontos extras.', 'Voltar rende mais.'],
  app: ['Use o app na mesa', 'Fazer o pedido pelo app e ver o prato em realidade aumentada também dão pontos.', 'Usar o app dá pontos.'],
  opiniao: ['Depois da conta', 'Conte como foi a visita: dê uma nota, diga o que gostou e comente. Cada um tem um limite por visita.', 'Sua opinião dá pontos.'],
  divulgar: ['Fotos e divulgação', 'Baixe a sua foto com moldura, compartilhe, siga o restaurante no Instagram e abra a página do Google: ganha pontos ao tocar. O que escrever lá é decisão sua.', 'Divulgar dá pontos.'],
  indicar: ['Indique um amigo', 'Quando seu amigo se cadastrar e fizer a primeira visita, você ganha pontos.', 'O amigo vem, você ganha.'],
}
export const INTRO_KEY = 'sr-intro-clube'

export function IntroClube({ fechar, ir }: { fechar: () => void; ir: (r: string) => void }) {
  const v = useClube().v; const [i, setI] = useState(0); const [lista, setLista] = useState(false); const [aberta, setAberta] = useState<number | null>(null)
  const caps = useMemo<Cap[]>(() => {
    const regras = (v?.regras ?? []).filter(r => r.points > 0); const out: Cap[] = []
    out.push({ id: 'abertura', titulo: `Bem-vindo ao ${CLUBE.nome}`, texto: 'Vamos ver, em poucos minutos, como ganhar pontos e trocar por prêmios.', resumo: '', abertura: true })
    out.push({ id: 'oque', titulo: 'O que é o Clube', texto: 'No Clube você ganha pontos e troca por prêmios do restaurante.', resumo: 'Pontos viram prêmios.', itens: [{ icone: <IconCartao />, rotulo: 'Seus pontos' }, { icone: <IconCheck />, rotulo: 'Prêmios' }] })
    ;(['cadastro', 'visita', 'voltar', 'app', 'opiniao', 'divulgar', 'indicar'] as Grupo[]).forEach(g => {
      const rs = regras.filter(r => r.grupo === g); if (!rs.length) return
      out.push({ id: g, titulo: TEXTO[g][0], texto: TEXTO[g][1], resumo: TEXTO[g][2], exemplo: true, itens: rs.slice(0, 4).map(r => ({ icone: ICONE[r.action] ?? <IconCheck />, rotulo: r.rotulo, pts: r.points })) })
    })
    out.push({ id: 'limites', titulo: 'Os limites', texto: `Para ser justo com todos, algumas ações têm limite por visita, por mês ou valem uma vez. As interações do app somam no máximo ${CLUBE.tetoMensal} pontos por mês.`, resumo: 'Cada ação tem seu limite.', itens: [{ icone: <IconCheck />, rotulo: 'Uma vez' }, { icone: <IconCheck />, rotulo: 'Por dia' }, { icone: <IconCheck />, rotulo: 'Por mês' }] })
    out.push({ id: 'numeros', titulo: 'Seus dois números', texto: '"Seus pontos" é o que você pode gastar. "Total ganho" só aumenta: é a sua história no Clube.', resumo: 'Trocar gasta seus pontos, não o total.', itens: [{ icone: <IconCartao />, rotulo: 'Seus pontos' }, { icone: <IconEstrela cheio />, rotulo: 'Total ganho' }] })
    out.push({ id: 'premios', titulo: 'Os prêmios', texto: 'Cada prêmio tem um preço em pontos. Troque agora ou continue juntando para um prêmio maior.', resumo: 'Você escolhe quando trocar.', exemplo: true, itens: (v?.premios ?? []).slice(0, 4).map(p => ({ icone: <IconCheck />, rotulo: p.nome.split(' (')[0], pts: p.custo })) })
    out.push({ id: 'trocar', titulo: 'Como trocar', texto: `1. Toque em Trocar. 2. Confirme. 3. Mostre o comprovante ao garçom. A troca é na mesa, uma por visita, e o comprovante vale ${CLUBE.comprovanteMin} minutos.`, resumo: 'Trocou, mostrou, recebeu.', itens: [{ icone: <IconCartao />, rotulo: 'Trocar' }, { icone: <IconCheck />, rotulo: 'Confirmar' }, { icone: <IconSino />, rotulo: 'Mostrar' }] })
    out.push({ id: 'seguranca', titulo: 'Seus pontos são seus', texto: 'Os pontos ficam na sua conta e só valem para quem está no restaurante. Se o restaurante definir validade, avisamos 30 dias antes.', resumo: 'Seus pontos são seus.', itens: [{ icone: <IconUsuario />, rotulo: 'Na sua conta' }, { icone: <IconSino />, rotulo: 'Aviso antes de vencer' }] })
    out.push({ id: 'lista', titulo: 'Todas as formas de ganhar', texto: 'Veja a lista completa quando quiser, também dentro do Clube.', resumo: '', tipo: 'lista' })
    out.push({ id: 'duvidas', titulo: 'Dúvidas comuns', texto: '', resumo: '', tipo: 'duvidas' })
    out.push({ id: 'fecho', titulo: 'Pronto!', texto: 'Os valores desta animação são exemplos. Os do restaurante estão na tela do Clube.', resumo: '', abertura: true, tipo: 'fecho' })
    return out
  }, [v?.regras, v?.premios])
  const cap = caps[Math.min(i, caps.length - 1)]; const ultimo = i >= caps.length - 1
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }; addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [fechar])
  const DUVIDAS: [string, string][] = [['E se eu não estiver no restaurante?', 'Você vê seus pontos, mas ganha e troca só na mesa. Cadastro, Instagram e indicação podem ser feitos de qualquer lugar.'], ['E se eu esquecer de abrir o app na mesa?', 'Não há pontos retroativos. Abra o app na próxima visita.'], ['Posso trocar em outro dia?', 'Sim, com o seu prêmio liberado, na mesa, uma troca por visita.'], ['Perco o total se eu trocar?', 'Não. O total ganho nunca diminui.'], ['Preciso mostrar algo ao garçom?', 'Só o comprovante da troca. Para ganhar pontos, não.']]
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="Como o Clube funciona">
      <div className="intro-topo">
        <button className="intro-x" onClick={fechar} aria-label="Fechar">✕</button>
        <div className="pontinhos" aria-hidden="true">{caps.map((c, k) => <i key={c.id} className={k === i ? 'on' : k < i ? 'ok' : ''} />)}</div>
        <button className="link" onClick={() => setLista(!lista)}>Capítulos</button>
      </div>
      {lista ? <ul className="intro-lista">{caps.map((c, k) => <li key={c.id}><button onClick={() => { setI(k); setLista(false) }}>{k + 1}. {c.titulo}</button></li>)}</ul> : (
        <div className="intro-corpo" key={cap.id}>
          <div className={'palco-i' + (cap.abertura ? ' abre' : '')}>
            {cap.abertura ? <S grande /> : <><S /><div className="itens-i">{cap.itens?.map((it, k) => <div key={k} className="item-i" style={{ animationDelay: `${0.25 + k * 0.35}s` }}><span className="ic">{it.icone}</span><b>{it.rotulo}</b>{it.pts != null && <em>+{it.pts}</em>}</div>)}</div></>}
          </div>
          <h2>{cap.titulo}</h2>
          {cap.tipo === 'duvidas' ? <ul className="duvidas">{DUVIDAS.map(([p, r], k) => <li key={k}><button aria-expanded={aberta === k} onClick={() => setAberta(aberta === k ? null : k)}>{p}</button>{aberta === k && <p>{r}</p>}</li>)}</ul> : <p className="intro-txt">{cap.texto}</p>}
          {cap.tipo === 'lista' && <button className="sec grande" onClick={() => { fechar(); ir('/clube/ganhar') }}>Ver a lista completa</button>}
          {cap.resumo && <p className="resumo">Em uma frase: <b>{cap.resumo}</b></p>}
          {cap.exemplo && <small className="exemplo">Exemplo</small>}
        </div>)}
      <div className="intro-pe">
        <button className="sec" disabled={i === 0} onClick={() => setI(i - 1)}>Voltar</button>
        {ultimo ? <button className="primario" onClick={fechar}>Entendi</button> : <button className="primario" onClick={() => { setI(i + 1); setLista(false) }}>Próximo</button>}
      </div>
      <p className="marca-i">{TEMA.nome}</p>
    </div>
  )
}

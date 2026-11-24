import { lazy, Suspense, useEffect, useState } from 'react'
import { useRota, setMesa, setToken, setSlug, getMesa } from './lib/router'
import { parseRoute } from './lib/route'
import { carregarTenant, resolverPlaca } from './lib/supabase'
import { avisar, useMembro, useSelecao, useToast } from './lib/mockStore'
import { Home } from './screens/Home'
import { Cardapio } from './screens/Cardapio'
import { Pedido } from './screens/Pedido'
import { Chamar } from './screens/Chamar'
import { Status } from './screens/Status'
import { Equipe } from './screens/Equipe'
import { Cadastro, Entrar } from './screens/Entrar'
import { Clube, ClubeGanhar, Extrato, Indicar, Troca } from './screens/Clube'
import { Visita } from './screens/Visita'
import { Comentarios } from './screens/Comentarios'
import { Fotos } from './screens/Fotos'
import { Sobre } from './screens/Sobre'
import { BoasVindas } from './screens/BoasVindas'
import { TEMA, aplicarTema } from './data/tema'
import { guardarIndicacao, useClube } from './lib/clube'
import { IconGarfoFaca, IconCartao, IconHome, IconInfo, IconPrancheta, IconSino } from './ui/Icons'

const Dono = lazy(() => import('./screens/Dono'))   // código do dashboard só baixa quem abre #/dono
type Boot = { fase: 'carregando' } | { fase: 'ok'; nome: string } | { fase: 'placa-invalida' } | { fase: 'erro'; msg: string }
const NOME_PADRAO = 'SemReservas GastroPub'

export function App() {
  const [hash, ir] = useRota(); const [entrou, setEntrou] = useState(() => { try { return sessionStorage.getItem('sr-entrou') === '1' } catch { return false } }); const [rota, query = ''] = hash.split('?'); const membro = useMembro(); const [boot, setBoot] = useState<Boot>({ fase: 'carregando' }); const sel = useSelecao()
  const equipe = rota === '/equipe' || rota.startsWith('/equipe/')

  useEffect(() => { aplicarTema(); guardarIndicacao() }, [])
  const clube = useClube()
  // Voltou do login (Google ou código): quem ainda não completou o cadastro vai direto para "Falta só um passo"
  useEffect(() => {
    const v = clube.v; if (!v?.logado) return
    try { if (localStorage.getItem('sr-entrando')) { localStorage.removeItem('sr-entrando'); ir(v.membro ? '/' : '/cadastro') } } catch { /* ignora */ }
  }, [clube.v?.logado, clube.v?.membro])
  // Visita do dia: ao abrir o app na mesa, quem é do Clube ganha o check-in sem fazer nada (1 por dia)
  useEffect(() => {
    const v = clube.v; if (!v?.membro || v.hoje.visitou || !getMesa()) return
    clube.checkin().then(r => { if (r.credited) avisar(`Visita registrada! +${r.credited} pontos.`) }).catch(() => { /* fora do horário ou longe: sem aviso */ })
  }, [clube.v?.membro?.nome, clube.v?.hoje.visitou])
  useEffect(() => {
    const r = parseRoute(location.pathname, import.meta.env.BASE_URL)
    ;(async () => {
      try {
        if (r.kind === 'placa') {
          const p = await resolverPlaca(r.token)
          if (!p) return setBoot({ fase: 'placa-invalida' })
          setMesa(p.table_label); setToken(r.token); setSlug(p.tenant_slug); history.replaceState(null, '', import.meta.env.BASE_URL + '#/')
          return setBoot({ fase: 'ok', nome: p.tenant_name })
        }
        const t = await carregarTenant((import.meta.env.VITE_DEFAULT_TENANT as string) || 'gastropub')
        setBoot({ fase: 'ok', nome: t?.name ?? NOME_PADRAO })
      } catch { setBoot({ fase: 'ok', nome: NOME_PADRAO }) } // protótipo funciona mesmo sem o banco
    })()
  }, [])

  if (equipe) return <Equipe tokenUrl={rota.slice(8) || undefined} />
  if (rota === '/dono') return <Suspense fallback={<main className="centro"><p>Carregando…</p></main>}><Dono /></Suspense>
  if (boot.fase === 'carregando') return <main className="centro"><p>Carregando…</p></main>
  if (boot.fase === 'placa-invalida') return <main className="centro"><h1>Placa indisponível</h1><p>Esta placa foi desativada. Chame um atendente.</p></main>
  if (!entrou) return <BoasVindas nome={boot.fase === 'ok' ? boot.nome : NOME_PADRAO} mesa={getMesa()} entrar={() => { try { sessionStorage.setItem('sr-entrou', '1') } catch { /* ignora */ } setEntrou(true) }} />
  const total = Object.values(sel.qtd).reduce((a, b) => a + b, 0)
  const nome = boot.fase === 'ok' ? boot.nome : NOME_PADRAO
  const tela = (() => {
    if (rota === '/cardapio') return <Cardapio ir={ir} />
    if (rota === '/entrar') return <Entrar ir={ir} volta={new URLSearchParams(query).get('de') || '/'} />
    if (rota === '/clube') return <Clube ir={ir} />
    if (rota === '/clube/ganhar') return <ClubeGanhar ir={ir} />
    if (rota === '/clube/extrato') return <Extrato ir={ir} />
    if (rota.startsWith('/troca/')) return <Troca id={rota.slice(7)} ir={ir} />
    if (rota === '/cadastro') return <Cadastro ir={ir} />
    if (rota.startsWith('/comentarios/')) return <Comentarios id={rota.slice(13)} ir={ir} />
    if (rota === '/fotos') return <Fotos />
    if (rota === '/visita' || rota === '/pesquisa') return <Visita ir={ir} />
    if (rota === '/clube/indicar') return <Indicar ir={ir} />
    if (rota === '/sobre' || rota === '/servicos' || rota === '/contato') return <Sobre />
    if (rota === '/pedido') return <Pedido ir={ir} />
    if (rota === '/chamar') return <Chamar ir={ir} />
    if (rota.startsWith('/chamado/')) return <Status id={rota.slice(9)} ir={ir} />
    return <Home nome={nome} ir={ir} />
  })()
  return (
    <Casca>
      <header className="topo">
        <img className="topo-logo" src={import.meta.env.BASE_URL + TEMA.logo} alt={nome} />
        {getMesa() && <span className="mesa-chip">Mesa {getMesa()}</span>}
        <button className="chamar" onClick={() => ir('/chamar')}><IconSino /><span>Chamar garçom</span></button>
      </header>
      <main className={rota === '/cardapio' ? 'cheio' : ''}>{tela}</main>
      <Toast />
      <nav className="rodape" aria-label="Principal">
        <Aba on={rota === '/'} onClick={() => ir('/')} icone={<IconHome />} t="Início" />
        <Aba on={rota === '/cardapio' || rota.startsWith('/comentarios/')} onClick={() => ir('/cardapio')} icone={<IconGarfoFaca />} t="Cardápio" />
        <Aba on={rota === '/pedido'} onClick={() => ir('/pedido')} icone={<IconPrancheta />} t="Pedido" n={total} />
        <Aba on={rota === '/clube' || rota.startsWith('/clube/') || rota === '/entrar' || rota === '/cadastro' || rota.startsWith('/troca/')} onClick={() => ir('/clube')} icone={<IconCartao />} t="Clube" />
        <Aba on={['/sobre', '/servicos', '/contato'].includes(rota)} onClick={() => ir('/sobre')} icone={<IconInfo />} t="Sobre" />
      </nav>
    </Casca>
  )
}
const Toast = () => { const m = useToast(); return m ? <div className="toast" role="status">{m}</div> : null }
const Casca = ({ children }: { children: React.ReactNode }) => <div className="casca">{import.meta.env.VITE_MODO_TESTE === '1' && <div className="proto">Versão de testes</div>}{children}</div>
const Aba = ({ on, onClick, icone, t, n }: { on: boolean; onClick: () => void; icone: React.ReactNode; t: string; n?: number }) =>
  <button className={'aba' + (on ? ' on' : '')} onClick={onClick} aria-current={on ? 'page' : undefined}>{icone}<span>{t}</span>{!!n && <i className="badge">{n}</i>}</button>

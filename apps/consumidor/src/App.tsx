import { useEffect, useState } from 'react'
import { useRota, setMesa } from './lib/router'
import { parseRoute } from './lib/route'
import { carregarTenant, resolverPlaca } from './lib/supabase'
import { useSelecao } from './lib/mockStore'
import { Home } from './screens/Home'
import { Cardapio } from './screens/Cardapio'
import { Pedido } from './screens/Pedido'
import { Garcom } from './screens/Garcom'
import { Chamar } from './screens/Chamar'
import { Status } from './screens/Status'
import { Equipe } from './screens/Equipe'
import { IconCardapio, IconHome, IconPrancheta, IconSino } from './ui/Icons'

type Boot = { fase: 'carregando' } | { fase: 'ok'; nome: string } | { fase: 'placa-invalida' } | { fase: 'erro'; msg: string }
const NOME_PADRAO = 'SemReservas GastroPub'

export function App() {
  const [rota, ir] = useRota(); const [boot, setBoot] = useState<Boot>({ fase: 'carregando' }); const sel = useSelecao()
  const equipe = rota.startsWith('/equipe')

  useEffect(() => {
    const r = parseRoute(location.pathname, import.meta.env.BASE_URL)
    ;(async () => {
      try {
        if (r.kind === 'placa') {
          const p = await resolverPlaca(r.token)
          if (!p) return setBoot({ fase: 'placa-invalida' })
          setMesa(p.table_label); history.replaceState(null, '', import.meta.env.BASE_URL + '#/')
          return setBoot({ fase: 'ok', nome: p.tenant_name })
        }
        const t = await carregarTenant((import.meta.env.VITE_DEFAULT_TENANT as string) || 'gastropub')
        setBoot({ fase: 'ok', nome: t?.name ?? NOME_PADRAO })
      } catch { setBoot({ fase: 'ok', nome: NOME_PADRAO }) } // protótipo funciona mesmo sem o banco
    })()
  }, [])

  if (equipe) return <Casca><Equipe /></Casca>
  if (boot.fase === 'carregando') return <main className="centro"><p>Carregando…</p></main>
  if (boot.fase === 'placa-invalida') return <main className="centro"><h1>Placa indisponível</h1><p>Esta placa foi desativada. Chame um atendente.</p></main>
  const total = Object.values(sel.qtd).reduce((a, b) => a + b, 0)
  const nome = boot.fase === 'ok' ? boot.nome : NOME_PADRAO
  const tela = (() => {
    if (rota === '/cardapio') return <Cardapio ir={ir} />
    if (rota === '/pedido') return <Pedido ir={ir} />
    if (rota === '/garcom') return <Garcom ir={ir} />
    if (rota === '/chamar') return <Chamar ir={ir} />
    if (rota.startsWith('/chamado/')) return <Status id={rota.slice(9)} ir={ir} />
    return <Home nome={nome} ir={ir} />
  })()
  return (
    <Casca>
      <header className="topo"><b>{nome}</b></header>
      <main>{tela}</main>
      <nav className="rodape" aria-label="Principal">
        <Aba on={rota === '/'} onClick={() => ir('/')} icone={<IconHome />} t="Início" />
        <Aba on={rota === '/cardapio'} onClick={() => ir('/cardapio')} icone={<IconCardapio />} t="Cardápio" />
        <Aba on={rota === '/pedido' || rota === '/garcom'} onClick={() => ir('/pedido')} icone={<IconPrancheta />} t="Seleção" n={total} />
        <Aba on={rota === '/chamar' || rota.startsWith('/chamado/')} onClick={() => ir('/chamar')} icone={<IconSino />} t="Garçom" />
      </nav>
    </Casca>
  )
}
const Casca = ({ children }: { children: React.ReactNode }) => <div className="casca"><div className="proto">Protótipo · dados de teste</div>{children}</div>
const Aba = ({ on, onClick, icone, t, n }: { on: boolean; onClick: () => void; icone: React.ReactNode; t: string; n?: number }) =>
  <button className={'aba' + (on ? ' on' : '')} onClick={onClick} aria-current={on ? 'page' : undefined}>{icone}<span>{t}</span>{!!n && <i className="badge">{n}</i>}</button>

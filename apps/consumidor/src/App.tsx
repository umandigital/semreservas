import { useEffect, useState } from 'react'
import { useRota, setMesa, setToken, setSlug, getMesa } from './lib/router'
import { parseRoute } from './lib/route'
import { carregarTenant, resolverPlaca } from './lib/supabase'
import { useMembro, useSelecao, useToast } from './lib/mockStore'
import { Home } from './screens/Home'
import { Cardapio } from './screens/Cardapio'
import { Pedido } from './screens/Pedido'
import { Garcom } from './screens/Garcom'
import { Chamar } from './screens/Chamar'
import { Status } from './screens/Status'
import { Equipe } from './screens/Equipe'
import { Entrar } from './screens/Entrar'
import { Clube } from './screens/Clube'
import { Comentarios } from './screens/Comentarios'
import { Fotos } from './screens/Fotos'
import { Pesquisa } from './screens/Pesquisa'
import { Servicos } from './screens/Servicos'
import { Contato } from './screens/Contato'
import { BoasVindas } from './screens/BoasVindas'
import { IconCardapio, IconHome, IconPrancheta, IconPresente, IconSino, IconUsuario, IconWifi } from './ui/Icons'

type Boot = { fase: 'carregando' } | { fase: 'ok'; nome: string } | { fase: 'placa-invalida' } | { fase: 'erro'; msg: string }
const NOME_PADRAO = 'SemReservas GastroPub'

export function App() {
  const [hash, ir] = useRota(); const [entrou, setEntrou] = useState(() => { try { return sessionStorage.getItem('sr-entrou') === '1' } catch { return false } }); const [rota, query = ''] = hash.split('?'); const membro = useMembro(); const [boot, setBoot] = useState<Boot>({ fase: 'carregando' }); const sel = useSelecao()
  const equipe = rota === '/equipe' || rota.startsWith('/equipe/')

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
  if (boot.fase === 'carregando') return <main className="centro"><p>Carregando…</p></main>
  if (boot.fase === 'placa-invalida') return <main className="centro"><h1>Placa indisponível</h1><p>Esta placa foi desativada. Chame um atendente.</p></main>
  if (!entrou) return <BoasVindas nome={boot.fase === 'ok' ? boot.nome : NOME_PADRAO} mesa={getMesa()} entrar={() => { try { sessionStorage.setItem('sr-entrou', '1') } catch { /* ignora */ } setEntrou(true) }} />
  const total = Object.values(sel.qtd).reduce((a, b) => a + b, 0)
  const nome = boot.fase === 'ok' ? boot.nome : NOME_PADRAO
  const tela = (() => {
    if (rota === '/cardapio') return <Cardapio ir={ir} />
    if (rota === '/entrar') return <Entrar ir={ir} volta={new URLSearchParams(query).get('de') || '/'} />
    if (rota === '/clube') return <Clube ir={ir} />
    if (rota.startsWith('/comentarios/')) return <Comentarios id={rota.slice(13)} ir={ir} />
    if (rota === '/fotos') return <Fotos />
    if (rota === '/pesquisa') return <Pesquisa ir={ir} />
    if (rota === '/servicos') return <Servicos ir={ir} />
    if (rota === '/contato') return <Contato />
    if (rota === '/pedido') return <Pedido ir={ir} />
    if (rota === '/garcom') return <Garcom ir={ir} />
    if (rota === '/chamar') return <Chamar ir={ir} />
    if (rota.startsWith('/chamado/')) return <Status id={rota.slice(9)} ir={ir} />
    return <Home nome={nome} ir={ir} />
  })()
  return (
    <Casca>
      <header className="topo">
        <b>{nome}</b>
        <span className="topo-acoes">
          <button className={'ident-chip' + (membro ? ' on' : '')} onClick={() => ir(membro ? '/clube' : '/entrar?de=' + rota)} aria-label={membro ? 'Minha conta' : 'Entrar'}><IconUsuario /><span>{membro ? 'Identificado' : 'Entrar'}</span></button>
          <button className="icone" onClick={() => ir('/chamar')} aria-label="Chamar garçom"><IconSino /></button>
        </span>
      </header>
      <main className={rota === '/cardapio' ? 'cheio' : ''}>{tela}</main>
      <Toast />
      <nav className="rodape" aria-label="Principal">
        <Aba on={rota === '/'} onClick={() => ir('/')} icone={<IconHome />} t="Início" />
        <Aba on={rota === '/cardapio' || rota.startsWith('/comentarios/')} onClick={() => ir('/cardapio')} icone={<IconCardapio />} t="Cardápio" />
        <Aba on={rota === '/pedido' || rota === '/garcom'} onClick={() => ir('/pedido')} icone={<IconPrancheta />} t="Pedido" n={total} />
        <Aba on={rota === '/clube' || rota === '/entrar'} onClick={() => ir('/clube')} icone={<IconPresente />} t="Clube" />
        <Aba on={['/servicos', '/fotos', '/pesquisa', '/contato', '/chamar'].includes(rota) || rota.startsWith('/chamado/')} onClick={() => ir('/servicos')} icone={<IconWifi />} t="Serviços" />
      </nav>
    </Casca>
  )
}
const Toast = () => { const m = useToast(); return m ? <div className="toast" role="status">{m}</div> : null }
const Casca = ({ children }: { children: React.ReactNode }) => <div className="casca"><div className="proto">Protótipo · dados de teste</div>{children}</div>
const Aba = ({ on, onClick, icone, t, n }: { on: boolean; onClick: () => void; icone: React.ReactNode; t: string; n?: number }) =>
  <button className={'aba' + (on ? ' on' : '')} onClick={onClick} aria-current={on ? 'page' : undefined}>{icone}<span>{t}</span>{!!n && <i className="badge">{n}</i>}</button>

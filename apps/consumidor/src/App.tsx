import { useEffect, useState } from 'react'
import { parseRoute } from './lib/route'
import { carregarTenant, resolverPlaca } from './lib/supabase'

type Estado =
  | { fase: 'carregando' }
  | { fase: 'ok'; nome: string; mesa: string | null }
  | { fase: 'placa-invalida' }
  | { fase: 'erro'; msg: string }

export function App() {
  const [estado, setEstado] = useState<Estado>({ fase: 'carregando' })

  useEffect(() => {
    const rota = parseRoute(location.pathname, import.meta.env.BASE_URL)
    ;(async () => {
      try {
        if (rota.kind === 'placa') {
          const p = await resolverPlaca(rota.token)
          setEstado(p ? { fase: 'ok', nome: p.tenant_name, mesa: p.table_label } : { fase: 'placa-invalida' })
        } else {
          const slug = (import.meta.env.VITE_DEFAULT_TENANT as string) || 'gastropub'
          const t = await carregarTenant(slug)
          setEstado(t ? { fase: 'ok', nome: t.name, mesa: null } : { fase: 'erro', msg: 'Estabelecimento não encontrado.' })
        }
      } catch (e) {
        setEstado({ fase: 'erro', msg: e instanceof Error && e.message === 'sem-config'
          ? 'Configuração do banco ausente neste ambiente.' : 'Não foi possível carregar. Tente novamente.' })
      }
    })()
  }, [])

  return (
    <main className="tela">
      {estado.fase === 'carregando' && <p>Carregando…</p>}
      {estado.fase === 'ok' && (
        <>
          <h1>{estado.nome}</h1>
          {estado.mesa && <p className="mesa">Mesa {estado.mesa}</p>}
          <p className="nota">Fundação conectada ao banco. O cardápio chega no próximo marco.</p>
        </>
      )}
      {estado.fase === 'placa-invalida' && (
        <>
          <h1>Placa indisponível</h1>
          <p>Esta placa foi desativada. Chame um atendente.</p>
        </>
      )}
      {estado.fase === 'erro' && <p role="alert">{estado.msg}</p>}
    </main>
  )
}

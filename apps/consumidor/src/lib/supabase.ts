import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Só a chave pública. Segurança vem das regras do banco (RLS), não do segredo desta chave.
export const supabase = url && key ? createClient(url, key) : null

export type Placa = { tenant_slug: string; tenant_name: string; table_label: string | null; origin: string }
export type Tenant = { slug: string; name: string; establishment_type: string }

export async function resolverPlaca(token: string): Promise<Placa | null> {
  if (!supabase) throw new Error('sem-config')
  const { data, error } = await supabase.rpc('resolve_access_token', { p_token: token })
  if (error) throw error
  return (data as Placa[])[0] ?? null
}

export async function carregarTenant(slug: string): Promise<Tenant | null> {
  if (!supabase) throw new Error('sem-config')
  const { data, error } = await supabase.rpc('public_tenant', { p_slug: slug })
  if (error) throw error
  return (data as Tenant[])[0] ?? null
}

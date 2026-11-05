import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Linha } from './metricas'

export type Estab = { tenant_id: string; slug: string; name: string; role: string }

/** Sessão do dono (login e senha). Persiste no aparelho e renova sozinha. */
export function useSessao(): { sessao: Session | null; carregando: boolean } {
  const [sessao, setSessao] = useState<Session | null>(null); const [carregando, setCarregando] = useState(true)
  useEffect(() => {
    if (!supabase) { setCarregando(false); return }
    supabase.auth.getSession().then(({ data }) => { setSessao(data.session); setCarregando(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return { sessao, carregando }
}

export async function entrar(email: string, senha: string): Promise<string | null> {
  if (!supabase) return 'Este ambiente não está conectado ao banco.'
  try {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (!error) return null
    if (/invalid login credentials/i.test(error.message)) return 'E-mail ou senha incorretos.'
    if (/rate limit|too many/i.test(error.message)) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
    return 'Não foi possível entrar. Tente de novo.'
  } catch { return 'Sem conexão. Tente de novo.' }
}
export const sair = () => supabase?.auth.signOut()

const db = () => { if (!supabase) throw new Error('sem-config'); return supabase }
export async function meusEstabelecimentos(): Promise<Estab[]> {
  const { data, error } = await db().rpc('my_tenants'); if (error) throw error; return (data ?? []) as Estab[]
}
export async function chamadosDesde(tenantId: string, desdeIso: string): Promise<Linha[]> {
  const { data, error } = await db().from('service_requests').select('id,table_label,kind,status,created_at,acknowledged_at,resolved_at')
    .eq('tenant_id', tenantId).gte('created_at', desdeIso).order('created_at', { ascending: false }).limit(5000)
  if (error) throw error; return (data ?? []) as Linha[]
}
export async function esgotadosDoEstab(tenantId: string): Promise<string[]> {
  const { data, error } = await db().from('sold_out_items').select('item_id').eq('tenant_id', tenantId); if (error) throw error
  return (data ?? []).map((r: { item_id: string }) => r.item_id)
}
export async function marcarEsgotado(tenantId: string, item: string, sold: boolean): Promise<boolean> {
  const { data, error } = await db().rpc('owner_set_sold_out', { p_tenant: tenantId, p_item: item, p_sold: sold }); if (error) throw error; return data === true
}
export async function linkDaEquipe(tenantId: string): Promise<string | null> {
  const { data, error } = await db().rpc('owner_staff_link', { p_tenant: tenantId }); if (error) throw error; return (data as string | null) ?? null
}
export async function trocarLinkDaEquipe(tenantId: string): Promise<string | null> {
  const { data, error } = await db().rpc('owner_rotate_staff_link', { p_tenant: tenantId }); if (error) throw error; return (data as string | null) ?? null
}
export const urlDoPainel = (token: string) => `${location.origin}${import.meta.env.BASE_URL}#/equipe/${token}`

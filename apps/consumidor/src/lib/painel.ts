// Dados do painel do proprietário (computador). Leitura pelas políticas do banco (dono/gerente do PRÓPRIO restaurante) e escrita só por funções
// que conferem o papel no servidor. O restaurante vem do login, nunca de um campo digitado.
import { supabase } from './supabase'

const db = () => { if (!supabase) throw new Error('sem-config'); return supabase }
const ler = <T,>(r: { data: unknown; error: unknown }): T => { if (r.error) throw r.error; return (r.data ?? []) as T }
const contar = async (tabela: string, t: string, col: string, desde: string, extra?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  let q = db().from(tabela).select('*', { count: 'exact', head: true }).eq('tenant_id', t).gte(col, desde); if (extra) q = extra(q)
  const { count, error } = await q; if (error) throw error; return count ?? 0
}
const mediana = (v: number[]) => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }

export type Resumo = { visitas: number; cadastros: number; pedidos: number; trocas: number; pontosDados: number; pontosUsados: number; extrasEmitidos: number; extrasUsados: number; opiniaoN: number; opiniaoMediana: number | null; subtotalMediana: number | null; pedidosN: number }
/** Só o que o sistema mede (visitas, cadastros, pedidos enviados ao garçom, pontos e trocas). Nada de faturamento. */
export async function resumo(t: string, desdeIso: string, desdeDia: string): Promise<Resumo> {
  const [visitas, cadastros, pedidos, trocas, extrasEmitidos, extrasUsados, led, fb, snaps] = await Promise.all([
    contar('club_visits', t, 'day', desdeDia), contar('club_members', t, 'joined_at', desdeIso), contar('service_requests', t, 'created_at', desdeIso, q => q.eq('kind', 'order').neq('status', 'CANCELLED')),
    contar('redemptions', t, 'created_at', desdeIso, q => q.eq('status', 'active')), contar('extra_prizes', t, 'created_at', desdeIso), contar('extra_prizes', t, 'used_at', desdeIso),
    db().from('points_ledger').select('delta,kind').eq('tenant_id', t).gte('created_at', desdeIso).limit(10000),
    db().from('club_feedback').select('rating').eq('tenant_id', t).gte('day', desdeDia).limit(5000),
    db().from('order_snapshots').select('subtotal_cents').eq('tenant_id', t).gte('created_at', desdeIso).limit(5000),
  ])
  const l = ler<{ delta: number; kind: string }[]>(led); const f = ler<{ rating: number }[]>(fb); const s = ler<{ subtotal_cents: number }[]>(snaps)
  return { visitas, cadastros, pedidos, trocas, extrasEmitidos, extrasUsados,
    pontosDados: l.filter(x => x.delta > 0 && (x.kind === 'earn' || x.kind === 'adjust')).reduce((a, x) => a + x.delta, 0), pontosUsados: -l.filter(x => x.kind === 'redeem').reduce((a, x) => a + x.delta, 0),
    opiniaoN: f.length, opiniaoMediana: mediana(f.map(x => x.rating)), pedidosN: s.length, subtotalMediana: mediana(s.map(x => x.subtotal_cents)) }
}

export type Fila = { id: string; table_label: string; kind: string; status: string; created_at: string; handled_by_label?: string | null; handled_at?: string | null; itens?: { name: string; qty: number; obs: string | null }[]; subtotal?: number }
export async function filaAgora(t: string): Promise<Fila[]> {
  const f = ler<Fila[]>(await db().from('service_requests').select('id,table_label,kind,status,created_at,handled_by_label,handled_at').eq('tenant_id', t).in('status', ['PENDING', 'ACKNOWLEDGED']).order('created_at'))
  if (!f.length) return []
  const o = ler<{ request_id: string; items: { name: string; qty: number; obs: string | null }[]; subtotal_cents: number }[]>(await db().from('order_snapshots').select('request_id,items,subtotal_cents').in('request_id', f.map(x => x.id)))
  return f.map(x => { const s = o.find(y => y.request_id === x.id); return s ? { ...x, itens: s.items, subtotal: s.subtotal_cents } : x })
}

export const assumirChamado = async (t: string, id: string, quem: string | null) => ler<boolean>(await db().rpc('owner_request_take', { p_tenant: t, p_id: id, p_label: quem }))
export const concluirChamado = async (t: string, id: string) => ler<boolean>(await db().rpc('owner_request_resolve', { p_tenant: t, p_id: id }))
export type Garcom = { id: string; name: string; active: boolean }
export const garcons = async (t: string) => ler<Garcom[]>(await db().from('staff_roster').select('id,name,active').eq('tenant_id', t).order('name'))
export const salvarGarcom = async (t: string, name: string, active: boolean) => ler<boolean>(await db().rpc('owner_roster_set', { p_tenant: t, p_name: name, p_active: active }))

export type RegraDono = { action: string; points: number; enabled: boolean; limit_kind: string; limit_n: number }
export const regras = async (t: string) => ler<RegraDono[]>(await db().from('club_action_rules').select('action,points,enabled,limit_kind,limit_n').eq('tenant_id', t).order('points', { ascending: false }))
export const salvarRegra = async (t: string, r: RegraDono) => ler<boolean>(await db().rpc('owner_club_rule_set', { p_tenant: t, p_action: r.action, p_points: r.points, p_enabled: r.enabled, p_limit_kind: r.limit_kind, p_limit_n: r.limit_n }))
export type PremioDono = { id: string; name: string; cost_points: number; min_visits: number; per_person_month: number | null; stock_month: number | null; active: boolean }
export const premios = async (t: string) => ler<PremioDono[]>(await db().from('club_rewards').select('id,name,cost_points,min_visits,per_person_month,stock_month,active').eq('tenant_id', t).order('cost_points'))
export const salvarPremio = async (t: string, p: Partial<PremioDono> & { name: string; cost_points: number }) => ler<string | null>(await db().rpc('owner_club_reward_set', { p_tenant: t, p_id: p.id ?? null, p_name: p.name, p_cost: p.cost_points, p_min_visits: p.min_visits ?? 0, p_per_person: p.per_person_month ?? null, p_stock: p.stock_month ?? null, p_active: p.active ?? true }))
export type TrocaDono = { id: string; reward_name: string; cost_points: number; code: string; table_label: string | null; created_at: string; status: string }
export const trocasRecentes = async (t: string) => ler<TrocaDono[]>(await db().from('redemptions').select('id,reward_name,cost_points,code,table_label,created_at,status').eq('tenant_id', t).order('created_at', { ascending: false }).limit(100))
export const estornar = async (t: string, id: string, motivo: string) => ler<boolean>(await db().rpc('owner_club_reverse_redemption', { p_tenant: t, p_id: id, p_reason: motivo }))

export type ItemMenu = { item_id: string; name: string; price_cents: number; active: boolean }
export const itensMenu = async (t: string) => ler<ItemMenu[]>(await db().from('menu_items').select('item_id,name,price_cents,active').eq('tenant_id', t).order('name'))
export const salvarItem = async (t: string, i: ItemMenu) => ler<boolean>(await db().rpc('owner_menu_set', { p_tenant: t, p_item: i.item_id, p_name: i.name, p_price_cents: i.price_cents, p_active: i.active }))

export type Roleta = { enabled: boolean; min_subtotal_cents: number; window_days: number; prize_name: string; prize_valid_days: number; demo: boolean }
export type Aniv = { enabled: boolean; benefit: string; guests_pct: number; min_guests: number; valid_days: number; demo: boolean }
export const roletaCfg = async (t: string) => ler<Roleta[]>(await db().from('roulette_settings').select('enabled,min_subtotal_cents,window_days,prize_name,prize_valid_days,demo').eq('tenant_id', t))[0]
export const salvarRoleta = async (t: string, r: Roleta) => ler<boolean>(await db().rpc('owner_roulette_set', { p_tenant: t, p_enabled: r.enabled, p_min_cents: r.min_subtotal_cents, p_window_days: r.window_days, p_prize: r.prize_name, p_prize_days: r.prize_valid_days, p_demo: r.demo }))
export const anivCfg = async (t: string) => ler<Aniv[]>(await db().from('birthday_settings').select('enabled,benefit,guests_pct,min_guests,valid_days,demo').eq('tenant_id', t))[0]
export const salvarAniv = async (t: string, a: Aniv) => ler<boolean>(await db().rpc('owner_birthday_set', { p_tenant: t, p_enabled: a.enabled, p_benefit: a.benefit, p_pct: a.guests_pct, p_min_guests: a.min_guests, p_valid_days: a.valid_days, p_demo: a.demo }))
export type ExtraDono = { source: string; name: string; code: string; created_at: string; valid_until: string; status: string }
export const extrasRecentes = async (t: string) => ler<ExtraDono[]>(await db().from('extra_prizes').select('source,name,code,created_at,valid_until,status').eq('tenant_id', t).order('created_at', { ascending: false }).limit(30))

export type Cfg = { hours_enforced: boolean; open_days: number[]; open_from: string; open_to: string; grace_min: number; monthly_cap: number; cancel_window_seconds: number }
export const clubeCfg = async (t: string) => ler<Cfg[]>(await db().from('club_settings').select('hours_enforced,open_days,open_from,open_to,grace_min,monthly_cap,cancel_window_seconds').eq('tenant_id', t))[0]
export const salvarCfg = async (t: string, c: Cfg) => ler<boolean>(await db().rpc('owner_club_settings_set', { p_tenant: t, p_hours_enforced: c.hours_enforced, p_open_days: c.open_days, p_open_from: c.open_from, p_open_to: c.open_to, p_grace_min: c.grace_min, p_monthly_cap: c.monthly_cap, p_cancel_seconds: c.cancel_window_seconds }))
export type Presenca = { lat: number | null; lon: number | null; radius_m: number; presence_policy: string }
export const presencaCfg = async (t: string) => ler<Presenca[]>(await db().from('tenants').select('lat,lon,radius_m,presence_policy').eq('id', t))[0]
export const salvarPresenca = async (t: string, p: Presenca) => ler<boolean>(await db().rpc('owner_presence_set', { p_tenant: t, p_lat: p.lat, p_lon: p.lon, p_radius: p.radius_m, p_policy: p.presence_policy }))
export type Alertas = { owner_sound: boolean; staff_sound: boolean; volume: number; interval_s: number; escalate_s: number }
export const alertaCfg = async (t: string) => ler<Alertas[]>(await db().from('alert_settings').select('owner_sound,staff_sound,volume,interval_s,escalate_s').eq('tenant_id', t))[0]
export const salvarAlertas = async (t: string, a: Alertas) => ler<boolean>(await db().rpc('owner_alert_set', { p_tenant: t, p_owner_sound: a.owner_sound, p_staff_sound: a.staff_sound, p_volume: a.volume, p_interval_s: a.interval_s, p_escalate_s: a.escalate_s }))
export type Placa = { numero: string; estado: string; nfc?: string; qr?: string }
export async function placas(t: string): Promise<Placa[]> {
  const [ap, tk] = await Promise.all([db().from('access_points').select('id,number,state').eq('tenant_id', t).neq('state', 'revoked').order('number'), db().from('access_point_tokens').select('token,origin,access_point_id,revoked_at').eq('tenant_id', t).is('revoked_at', null)])
  const a = ler<{ id: string; number: string; state: string }[]>(ap); const k = ler<{ token: string; origin: string; access_point_id: string }[]>(tk)
  const url = (tok?: string) => tok ? `${location.origin}${import.meta.env.BASE_URL}r/${tok}` : undefined
  return a.map(x => ({ numero: x.number, estado: x.state, nfc: url(k.find(y => y.access_point_id === x.id && y.origin === 'nfc')?.token), qr: url(k.find(y => y.access_point_id === x.id && y.origin === 'qr')?.token) }))
}

export type Comentario = { user_id: string; day: string; first_name: string; rating: number; comment: string | null; liked: string[]; status: 'pending' | 'published' | 'rejected'; created_at: string }
export const comentarios = async (t: string, status: string | null) => ler<Comentario[]>(await db().rpc('owner_club_feedback_list', { p_tenant: t, p_status: status, p_limit: 100 }))
export const moderar = async (t: string, c: Comentario, status: 'published' | 'rejected') => ler<boolean>(await db().rpc('owner_club_feedback_moderate', { p_tenant: t, p_user: c.user_id, p_day: c.day, p_status: status }))
export type Cliente = { user_id: string; first_name: string; joined_at: string; visits: number; last_visit: string | null; points: number; status: string }
export const clientes = async (t: string) => ler<Cliente[]>(await db().rpc('owner_club_members_list', { p_tenant: t, p_limit: 200 }))
export const ajustarPontos = async (t: string, u: string, delta: number, motivo: string) => ler<boolean>(await db().rpc('owner_club_adjust', { p_tenant: t, p_user: u, p_delta: delta, p_reason: motivo }))
export { mediana }

export const novoItem = async (t: string, nome: string, precoCents: number, cat: string, desc: string) => ler<string | null>(await db().rpc('owner_menu_add', { p_tenant: t, p_name: nome, p_price_cents: precoCents, p_category: cat, p_description: desc || null }))
export type MolduraDono = { frame_id: string; enabled: boolean; title: string[]; footer: string }
export const molduras = async (t: string) => ler<MolduraDono[]>(await db().rpc('owner_frames_list', { p_tenant: t }))
export const salvarMoldura = async (t: string, m: MolduraDono) => ler<boolean>(await db().rpc('owner_frame_set', { p_tenant: t, p_frame: m.frame_id, p_enabled: m.enabled, p_title: m.title, p_footer: m.footer }))

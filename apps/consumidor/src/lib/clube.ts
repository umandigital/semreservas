// Camada de dados do Clube. UMA interface, duas implementações:
//  - real (VITE_CLUBE_REAL=1 e Supabase configurado): funções do banco (migração 0005); o restaurante vem da placa (token), nunca do navegador;
//  - simulação no aparelho (padrão, sem banco): mesmas regras, em lib/clubeDemo.ts.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { getToken } from './router'
import { avisar, entrar as entrarLegado, sair as sairLegado } from './mockStore'
import { ANIV, REGRAS, PREMIOS, ROLETA, type Regra } from '../data/clube'
import * as D from './clubeDemo'

export const guardarIndicacao = () => { try { const r = new URLSearchParams(location.search).get('ref'); if (r && /^[A-Z0-9]{4,8}$/i.test(r)) localStorage.setItem('sr-ref', r.toUpperCase()) } catch { /* ignora */ } }
export const lerIndicacao = (): string | null => { try { return localStorage.getItem('sr-ref') } catch { return null } }
export const CLUBE_REAL = !!supabase && import.meta.env.VITE_CLUBE_REAL === '1'
export type Membro = { nome: string; saldo: number; total: number; ref: string; visitas: number }
export type Extrato = { em: number; delta: number; kind: string; action: string }
export type TrocaV = { id: string; nome: string; code: string; em: number; expira: number; status: string; custo?: number }
export type Hoje = { visitou: boolean; opinou: boolean }
export type RoletaV = { enabled: boolean; steps: string[]; got: string[]; expira: number | null; grants: number; minCents: number; premio: string; validadeDias: number; janelaDias: number; demo: boolean; adulto: boolean }
export type AnivV = { enabled: boolean; beneficio: string; pct: number; minConv: number; validadeDias: number; demo: boolean; dia: number; mes: number; diasAte: number; canClaim: boolean; claimed: boolean }
export type ExtraV = { id: string; source: string; name: string; code: string; demo: boolean; em: number; validade: number; status: 'available' | 'used' | 'expired'; usadoEm?: number }
export type Visao = { logado: boolean; email: string; membro: Membro | null; extrato: Extrato[]; trocas: TrocaV[]; regras: Regra[]; premios: typeof PREMIOS; hoje: Hoje; roleta: RoletaV | null; aniv: AnivV | null; extras: ExtraV[] }
const SEM_HOJE: Hoje = { visitou: false, opinou: false }
const KEY = 'sr-clube-v1', AUTH = 'sr-clube-auth'

// ── armazenamento da simulação ──
const subs = new Set<() => void>(); const emit = () => subs.forEach(f => f())
const lerD = (): D.Estado => { try { const r = localStorage.getItem(KEY); return r ? D.migrar(JSON.parse(r) as Partial<D.Estado>) : D.vazio() } catch { return D.vazio() } }
const gravarD = (e: D.Estado) => { try { localStorage.setItem(KEY, JSON.stringify(e)) } catch { /* ignora */ } emit() }
const lerEmail = () => { try { return localStorage.getItem(AUTH) ?? '' } catch { return '' } }

const demoVisao = (): Visao => {
  const e = lerD(); const email = lerEmail()
  return { logado: !!email, email, membro: e.membro ? { nome: e.membro.nome, saldo: D.saldo(e), total: D.total(e), ref: e.membro.ref, visitas: D.visitas(e) } : null,
    extrato: [...e.ledger].reverse().map(l => ({ em: l.em, delta: l.delta, kind: l.kind, action: l.action })),
    trocas: [...e.trocas].reverse().map(t => ({ id: t.id, nome: t.nome, code: t.code, em: t.em, expira: t.expira, status: t.status, custo: t.custo })), regras: REGRAS, premios: PREMIOS,
    hoje: { visitou: D.visitouHoje(e), opinou: D.opinouHoje(e) },
    roleta: e.membro ? { enabled: true, steps: ROLETA.passos, got: e.roleta.expira && Date.now() > e.roleta.expira ? [] : e.roleta.got, expira: e.roleta.expira || null, grants: e.roleta.grants.length, minCents: ROLETA.minCents, premio: ROLETA.premio, validadeDias: ROLETA.validadeDias, janelaDias: ROLETA.janelaDias, demo: ROLETA.demo, adulto: new Date(e.membro.nasc) <= new Date(new Date().setFullYear(new Date().getFullYear() - 18)) } : null,
    aniv: ((): AnivV | null => { const a = D.aniversario(e); return a ? { enabled: true, beneficio: ANIV.beneficio, pct: ANIV.pctConvidados, minConv: ANIV.minConvidados, validadeDias: ANIV.validadeDias, demo: ANIV.demo, dia: a.dia, mes: a.mes, diasAte: a.dias, canClaim: a.canClaim, claimed: a.claimed } : null })(),
    extras: [...e.extras].reverse().map(x => ({ id: x.id, source: x.source, name: x.name, code: x.code, demo: true, em: x.em, validade: x.validade, status: x.status === 'available' && Date.now() > x.validade ? 'expired' as const : x.status, usadoEm: x.usadoEm })) }
}
const realVisao = async (): Promise<Visao> => {
  const tok = getToken(); const { data: s } = await supabase!.auth.getSession(); const email = s.session?.user.email ?? ''
  if (!email || !tok) return { logado: !!email, email, membro: null, extrato: [], trocas: [], regras: REGRAS, premios: PREMIOS, hoje: SEM_HOJE, roleta: null, aniv: null, extras: [] }
  const { data: me } = await supabase!.rpc('club_me', { p_token: tok })
  const m = me as { member?: boolean; name?: string; balance?: number; lifetime?: number; referral_code?: string } | null
  if (!m?.member) return { logado: true, email, membro: null, extrato: [], trocas: [], regras: REGRAS, premios: PREMIOS, hoje: SEM_HOJE, roleta: null, aniv: null, extras: [] }
  const [{ data: ex }, { data: tr }, { data: cat }, { data: hj }, { data: rl }, { data: an }, { data: xs }] = await Promise.all([supabase!.rpc('club_my_ledger', { p_token: tok, p_limit: 100 }), supabase!.rpc('club_my_redemptions', { p_token: tok }), supabase!.rpc('club_catalog', { p_token: tok }), supabase!.rpc('club_today', { p_token: tok }), supabase!.rpc('roulette_state', { p_token: tok }), supabase!.rpc('club_birthday_state', { p_token: tok }), supabase!.rpc('club_extras', { p_token: tok })])
  const R = rl as { enabled?: boolean; steps?: string[]; got?: string[]; expires_at?: string | null; grants?: number; min_subtotal_cents?: number; prize_name?: string; prize_valid_days?: number; window_days?: number; demo?: boolean; adult?: boolean } | null
  const A = an as { enabled?: boolean; benefit?: string; guests_pct?: number; min_guests?: number; valid_days?: number; demo?: boolean; day?: number; month?: number; days_until?: number; can_claim?: boolean; claimed?: boolean } | null
  const h = hj as { visited?: boolean; feedback?: boolean; visits?: number } | null
  return { logado: true, email, membro: { nome: m.name ?? '', saldo: m.balance ?? 0, total: m.lifetime ?? 0, ref: m.referral_code ?? '', visitas: h?.visits ?? 0 },
    extrato: ((ex ?? []) as { created_at: string; delta: number; kind: string; action: string }[]).map(l => ({ em: Date.parse(l.created_at), delta: l.delta, kind: l.kind, action: l.action })),
    trocas: ((tr ?? []) as { id: string; reward_name: string; code: string; created_at: string; expires_at: string; status: string }[]).map(t => ({ id: t.id, nome: t.reward_name, code: t.code, em: Date.parse(t.created_at), expira: Date.parse(t.expires_at), status: t.status })),
    regras: REGRAS, premios: ((cat ?? []) as { id: string; name: string; cost_points: number; min_visits: number }[]).map(c => ({ id: c.id, nome: c.name, custo: c.cost_points, minVisitas: c.min_visits, porPessoaMes: null })),
    hoje: { visitou: !!h?.visited, opinou: !!h?.feedback },
    roleta: R ? { enabled: !!R.enabled, steps: R.steps ?? ROLETA.passos, got: R.got ?? [], expira: R.expires_at ? Date.parse(R.expires_at) : null, grants: R.grants ?? 0, minCents: R.min_subtotal_cents ?? ROLETA.minCents, premio: R.prize_name ?? ROLETA.premio, validadeDias: R.prize_valid_days ?? ROLETA.validadeDias, janelaDias: R.window_days ?? ROLETA.janelaDias, demo: R.demo ?? true, adulto: !!R.adult } : null,
    aniv: A && A.day ? { enabled: !!A.enabled, beneficio: A.benefit ?? ANIV.beneficio, pct: A.guests_pct ?? 50, minConv: A.min_guests ?? 5, validadeDias: A.valid_days ?? 2, demo: A.demo ?? true, dia: A.day, mes: A.month ?? 1, diasAte: A.days_until ?? 999, canClaim: !!A.can_claim, claimed: !!A.claimed } : null,
    extras: ((xs ?? []) as { id: string; source: string; name: string; code: string; demo: boolean; created_at: string; valid_until: string; status: 'available' | 'used' | 'expired'; used_at: string | null }[]).map(x => ({ id: x.id, source: x.source, name: x.name, code: x.code, demo: x.demo, em: Date.parse(x.created_at), validade: Date.parse(x.valid_until), status: x.status, usadoEm: x.used_at ? Date.parse(x.used_at) : undefined })) }
}

/** Mensagens simples para os códigos do banco/motor. */
export const MSG: Record<string, string> = { no_grant: 'Você não tem giro agora. Faça um pedido e chame o garçom.', adults_only: 'A Roleta é só para maiores de 18 anos.', disabled: 'Isto não está disponível agora.', invalid_request: 'Chame o garçom pelo pedido para liberar o giro.', already_claimed: 'Você já pegou o presente deste ano.', not_birthday: 'O presente vale no dia do seu aniversário.', expired: 'Este prêmio venceu.', closed: 'O restaurante está fechado agora.', too_far: 'Parece que você não está no restaurante.', location_required: 'Precisamos da sua localização para confirmar a visita.', no_visit: 'Faça a visita primeiro: encoste na placa da mesa.', already_sent: 'Você já contou como foi hoje. Obrigado!', invalid_rating: 'Escolha de 1 a 5 estrelas.', invalid_birth: 'Confira a data de nascimento.', insufficient_points: 'Você ainda não tem pontos para este prêmio.', min_visits: 'Este prêmio precisa de mais visitas.',
  one_per_day: 'Só uma troca por dia. Volte na próxima visita.', person_limit: 'Você já trocou este prêmio o máximo do mês.', sold_out: 'Este prêmio esgotou neste mês.', not_member: 'Entre no Clube primeiro.',
  cancel_window_over: 'O prazo de cancelar (2 minutos) acabou.', not_active: 'Esta troca já foi encerrada.', invalid_token: 'Encoste o celular na placa da sua mesa.', reward_unavailable: 'Este prêmio não está disponível.' }
const erro = (e: unknown) => { const m = e instanceof Error ? e.message : String(e); return Object.keys(MSG).find(k => m.includes(k)) ?? 'rede' }
export const textoErro = (e: unknown) => MSG[erro(e)] ?? 'Sem conexão agora. Tente de novo.'

export function useClube() {
  const [v, setV] = useState<Visao | null>(CLUBE_REAL ? null : demoVisao())
  const recarregar = useCallback(async () => { setV(CLUBE_REAL ? await realVisao().catch(() => demoVisao()) : demoVisao()) }, [])
  useEffect(() => { void recarregar(); const f = () => { void recarregar() }; subs.add(f); return () => { subs.delete(f) } }, [recarregar])
  useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f) } }, () => 0)
  const acao = async <T,>(f: () => Promise<T> | T): Promise<T> => { const r = await f(); await recarregar(); return r }
  return {
    v,
    // login: em produção, Supabase Auth (código por e-mail ou Google); na simulação, qualquer código de 6 dígitos
    enviarCodigo: async (email: string) => { if (CLUBE_REAL) { const { error } = await supabase!.auth.signInWithOtp({ email }); if (error) throw error } },
    confirmarCodigo: (email: string, cod: string) => acao(async () => {
      if (CLUBE_REAL) { const { error } = await supabase!.auth.verifyOtp({ email, token: cod, type: 'email' }); if (error) throw error } else { localStorage.setItem(AUTH, email) } entrarLegado(email) }),
    entrarGoogle: async () => { if (CLUBE_REAL) { await supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + import.meta.env.BASE_URL } }) } else { localStorage.setItem(AUTH, 'ana.souza@gmail.com'); entrarLegado('ana.souza@gmail.com'); emit() } },
    sair: () => acao(async () => { if (CLUBE_REAL) await supabase!.auth.signOut(); else localStorage.removeItem(AUTH); sairLegado() }),
    cadastrar: (nome: string, nasc: string, publicidade: boolean) => acao(async () => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_join', { p_token: getToken(), p_name: nome, p_birth: nasc, p_regulation: 'v1', p_publicity: publicidade, p_ref: lerIndicacao() }); if (error) throw error }
      else gravarD(D.cadastrar(lerD(), nome, nasc)) }),
    ganhar: (action: string) => acao(async () => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_earn', { p_token: getToken(), p_action: action }); if (error) throw error; return (data as { credited: number }).credited }
      const [e, g] = D.ganhar(lerD(), action); gravarD(e); return g }),
    trocar: (id: string) => acao(async () => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_redeem', { p_token: getToken(), p_reward: id }); if (error) throw error; return (data as { id: string }).id }
      const [e, t] = D.trocar(lerD(), id); gravarD(e); return t.id }),
    cancelar: (id: string) => acao(async () => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_cancel_redemption', { p_token: getToken(), p_id: id }); if (error) throw error } else gravarD(D.cancelar(lerD(), id)) }),
    checkin: () => acao(async (): Promise<{ credited: number; already: boolean; bonuses: string[] }> => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_checkin', { p_token: getToken(), p_lat: null, p_lon: null }); if (error) throw error; return data as { credited: number; already: boolean; bonuses: string[] } }
      const [e, r] = D.checkin(lerD()); gravarD(e); return r }),
    opinar: (nota: number, comentario: string, gostei: string[]) => acao(async (): Promise<number> => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_feedback', { p_token: getToken(), p_rating: nota, p_comment: comentario || null, p_liked: gostei }); if (error) throw error; return (data as { credited: number }).credited }
      const [e, g] = D.opinar(lerD(), nota, comentario, gostei); gravarD(e); return g }),
    liberarGiro: (requestId: string, subtotalCents: number) => acao(async (): Promise<boolean> => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('roulette_grant', { p_token: getToken(), p_request: requestId, p_subtotal_cents: subtotalCents }); if (error) throw error; return !!(data as { granted: boolean }).granted }
      const [e, ok] = D.liberarGiro(lerD(), subtotalCents); gravarD(e); return ok }),
    girar: () => acao(async (): Promise<{ step: string; count: number; won: boolean; prizeId?: string }> => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('roulette_spin', { p_token: getToken() }); if (error) throw error; const d = data as { step: string; count: number; won: boolean; prize_id?: string }; return { step: d.step, count: d.count, won: d.won, prizeId: d.prize_id } }
      const [e, r] = D.girar(lerD()); gravarD(e); return r }),
    pegarPresente: () => acao(async (): Promise<void> => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_birthday_claim', { p_token: getToken() }); if (error) throw error } else gravarD(D.pegarPresente(lerD())[0]) }),
    usarExtra: (id: string) => acao(async (): Promise<void> => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_extra_use', { p_token: getToken(), p_id: id }); if (error) throw error } else gravarD(D.usarExtra(lerD(), id)[0]) }),
    avisarErro: (e: unknown) => avisar(textoErro(e)),
  }
}

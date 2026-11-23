// Camada de dados do Clube. UMA interface, duas implementações:
//  - real (VITE_CLUBE_REAL=1 e Supabase configurado): funções do banco (migração 0005); o restaurante vem da placa (token), nunca do navegador;
//  - simulação no aparelho (padrão, sem banco): mesmas regras, em lib/clubeDemo.ts.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { supabase } from './supabase'
import { getToken } from './router'
import { avisar, entrar as entrarLegado, sair as sairLegado } from './mockStore'
import { REGRAS, PREMIOS, type Regra } from '../data/clube'
import * as D from './clubeDemo'

export const CLUBE_REAL = !!supabase && import.meta.env.VITE_CLUBE_REAL === '1'
export type Membro = { nome: string; saldo: number; total: number; ref: string; visitas: number }
export type Extrato = { em: number; delta: number; kind: string; action: string }
export type TrocaV = { id: string; nome: string; code: string; em: number; expira: number; status: string; custo?: number }
export type Visao = { logado: boolean; email: string; membro: Membro | null; extrato: Extrato[]; trocas: TrocaV[]; regras: Regra[]; premios: typeof PREMIOS }
const KEY = 'sr-clube-v1', AUTH = 'sr-clube-auth'

// ── armazenamento da simulação ──
const subs = new Set<() => void>(); const emit = () => subs.forEach(f => f())
const lerD = (): D.Estado => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) as D.Estado : D.vazio() } catch { return D.vazio() } }
const gravarD = (e: D.Estado) => { try { localStorage.setItem(KEY, JSON.stringify(e)) } catch { /* ignora */ } emit() }
const lerEmail = () => { try { return localStorage.getItem(AUTH) ?? '' } catch { return '' } }

const demoVisao = (): Visao => {
  const e = lerD(); const email = lerEmail()
  return { logado: !!email, email, membro: e.membro ? { nome: e.membro.nome, saldo: D.saldo(e), total: D.total(e), ref: e.membro.ref, visitas: D.visitas(e) } : null,
    extrato: [...e.ledger].reverse().map(l => ({ em: l.em, delta: l.delta, kind: l.kind, action: l.action })),
    trocas: [...e.trocas].reverse().map(t => ({ id: t.id, nome: t.nome, code: t.code, em: t.em, expira: t.expira, status: t.status, custo: t.custo })), regras: REGRAS, premios: PREMIOS }
}
const realVisao = async (): Promise<Visao> => {
  const tok = getToken(); const { data: s } = await supabase!.auth.getSession(); const email = s.session?.user.email ?? ''
  if (!email || !tok) return { logado: !!email, email, membro: null, extrato: [], trocas: [], regras: REGRAS, premios: PREMIOS }
  const { data: me } = await supabase!.rpc('club_me', { p_token: tok })
  const m = me as { member?: boolean; name?: string; balance?: number; lifetime?: number; referral_code?: string } | null
  if (!m?.member) return { logado: true, email, membro: null, extrato: [], trocas: [], regras: REGRAS, premios: PREMIOS }
  const [{ data: ex }, { data: tr }, { data: cat }] = await Promise.all([supabase!.rpc('club_my_ledger', { p_token: tok, p_limit: 100 }), supabase!.rpc('club_my_redemptions', { p_token: tok }), supabase!.rpc('club_catalog', { p_token: tok })])
  return { logado: true, email, membro: { nome: m.name ?? '', saldo: m.balance ?? 0, total: m.lifetime ?? 0, ref: m.referral_code ?? '', visitas: 0 },
    extrato: ((ex ?? []) as { created_at: string; delta: number; kind: string; action: string }[]).map(l => ({ em: Date.parse(l.created_at), delta: l.delta, kind: l.kind, action: l.action })),
    trocas: ((tr ?? []) as { id: string; reward_name: string; code: string; created_at: string; expires_at: string; status: string }[]).map(t => ({ id: t.id, nome: t.reward_name, code: t.code, em: Date.parse(t.created_at), expira: Date.parse(t.expires_at), status: t.status })),
    regras: REGRAS, premios: ((cat ?? []) as { id: string; name: string; cost_points: number; min_visits: number }[]).map(c => ({ id: c.id, nome: c.name, custo: c.cost_points, minVisitas: c.min_visits, porPessoaMes: null })) }
}

/** Mensagens simples para os códigos do banco/motor. */
export const MSG: Record<string, string> = { invalid_birth: 'Confira a data de nascimento.', insufficient_points: 'Você ainda não tem pontos para este prêmio.', min_visits: 'Este prêmio precisa de mais visitas.',
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
    entrarGoogle: async () => { if (CLUBE_REAL) { await supabase!.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } }) } else { localStorage.setItem(AUTH, 'ana.souza@gmail.com'); entrarLegado('ana.souza@gmail.com'); emit() } },
    sair: () => acao(async () => { if (CLUBE_REAL) await supabase!.auth.signOut(); else localStorage.removeItem(AUTH); sairLegado() }),
    cadastrar: (nome: string, nasc: string, publicidade: boolean) => acao(async () => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_join', { p_token: getToken(), p_name: nome, p_birth: nasc, p_regulation: 'v1', p_publicity: publicidade }); if (error) throw error }
      else gravarD(D.cadastrar(lerD(), nome, nasc)) }),
    ganhar: (action: string) => acao(async () => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_earn', { p_token: getToken(), p_action: action }); if (error) throw error; return (data as { credited: number }).credited }
      const [e, g] = D.ganhar(lerD(), action); gravarD(e); return g }),
    trocar: (id: string) => acao(async () => {
      if (CLUBE_REAL) { const { data, error } = await supabase!.rpc('club_redeem', { p_token: getToken(), p_reward: id }); if (error) throw error; return (data as { id: string }).id }
      const [e, t] = D.trocar(lerD(), id); gravarD(e); return t.id }),
    cancelar: (id: string) => acao(async () => {
      if (CLUBE_REAL) { const { error } = await supabase!.rpc('club_cancel_redemption', { p_token: getToken(), p_id: id }); if (error) throw error } else gravarD(D.cancelar(lerD(), id)) }),
    avisarErro: (e: unknown) => avisar(textoErro(e)),
  }
}

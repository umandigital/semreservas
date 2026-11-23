// Motor do Clube SEM banco (simulação no aparelho). Espelha as regras da migração 0005: extrato só cresce, idempotente,
// limites por período, teto mensal, troca com débito, 1 troca por dia, cancelamento em 2 minutos.
import { CLUBE, PREMIOS, REGRAS, type Limite } from '../data/clube'

export type Linha = { id: number; em: number; delta: number; kind: 'earn' | 'redeem' | 'reversal' | 'adjust'; action: string; key: string }
export type Troca = { id: string; premioId: string; nome: string; custo: number; code: string; em: number; expira: number; status: 'active' | 'cancelled' }
export type Estado = { membro: null | { nome: string; nasc: string; termo: string; ref: string }; ledger: Linha[]; trocas: Troca[] }
export const vazio = (): Estado => ({ membro: null, ledger: [], trocas: [] })

const inicio = (k: Limite, agora: number) => {
  const d = new Date(agora)
  if (k === 'per_day') return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (k === 'per_week') { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime() }
  if (k === 'per_month') return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
  return -Infinity
}
export const saldo = (e: Estado) => e.ledger.reduce((s, l) => s + l.delta, 0)
export const total = (e: Estado) => e.ledger.filter(l => l.delta > 0 && (l.kind === 'earn' || l.kind === 'adjust')).reduce((s, l) => s + l.delta, 0)
export const visitas = (e: Estado) => e.ledger.filter(l => l.kind === 'earn' && l.action === 'checkin').length
const codigo = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')

/** Credita (se a regra permitir). Devolve o estado novo e os pontos creditados. */
export function creditar(e: Estado, action: string, key: string, agora = Date.now()): [Estado, number] {
  const r = REGRAS.find(x => x.action === action); if (!r || e.ledger.some(l => l.key === key)) return [e, 0]
  if (r.limit !== 'unlimited') {
    const usado = e.ledger.filter(l => l.kind === 'earn' && l.action === action && l.em >= inicio(r.limit, agora)).length
    if (usado >= r.n) return [e, 0]
  }
  if (r.capped) {
    const mes = e.ledger.filter(l => l.kind === 'earn' && l.em >= inicio('per_month', agora) && REGRAS.find(x => x.action === l.action)?.capped).reduce((s, l) => s + l.delta, 0)
    if (mes + r.points > CLUBE.tetoMensal) return [e, 0]
  }
  const linha: Linha = { id: e.ledger.length + 1, em: agora, delta: r.points, kind: 'earn', action, key }
  return [{ ...e, ledger: [...e.ledger, linha] }, r.points]
}
export function cadastrar(e: Estado, nome: string, nasc: string, agora = Date.now()): Estado {
  if (e.membro) return e
  const lim = new Date(agora); lim.setFullYear(lim.getFullYear() - 13)
  if (!nome.trim() || nome.trim().length < 2 || !nasc || new Date(nasc) > lim || new Date(nasc) < new Date('1900-01-01')) throw new Error('invalid_birth')
  let n: Estado = { ...e, membro: { nome: nome.trim(), nasc, termo: CLUBE.termo, ref: codigo() } }
  n = creditar(n, 'signup', 'signup', agora)[0]; n = creditar(n, 'profile_complete', 'profile', agora)[0]
  return n
}
export function ganhar(e: Estado, action: string, agora = Date.now()): [Estado, number] {
  const r = REGRAS.find(x => x.action === action)
  if (!e.membro) throw new Error('not_member')
  if (!r?.claimable) throw new Error('action_not_claimable')
  const usado = e.ledger.filter(l => l.kind === 'earn' && l.action === action).length
  return creditar(e, action, `earn:${action}:${usado}:${r.limit === 'once' ? 'x' : inicio(r.limit, agora)}`, agora)
}
export function trocar(e: Estado, premioId: string, agora = Date.now()): [Estado, Troca] {
  const p = PREMIOS.find(x => x.id === premioId)
  if (!e.membro) throw new Error('not_member'); if (!p) throw new Error('reward_unavailable')
  if (saldo(e) < p.custo) throw new Error('insufficient_points')
  if (visitas(e) < p.minVisitas) throw new Error('min_visits')
  if (e.trocas.some(t => t.status === 'active' && t.em >= inicio('per_day', agora))) throw new Error('one_per_day')
  if (p.porPessoaMes != null && e.trocas.filter(t => t.status === 'active' && t.premioId === p.id && t.em >= inicio('per_month', agora)).length >= p.porPessoaMes) throw new Error('person_limit')
  const t: Troca = { id: 'tr' + (e.trocas.length + 1), premioId: p.id, nome: p.nome, custo: p.custo, code: codigo(), em: agora, expira: agora + CLUBE.comprovanteMin * 60000, status: 'active' }
  const linha: Linha = { id: e.ledger.length + 1, em: agora, delta: -p.custo, kind: 'redeem', action: 'redeem', key: 'redeem:' + t.id }
  return [{ ...e, trocas: [...e.trocas, t], ledger: [...e.ledger, linha] }, t]
}
export function cancelar(e: Estado, id: string, agora = Date.now()): Estado {
  const t = e.trocas.find(x => x.id === id); if (!t) throw new Error('not_found'); if (t.status !== 'active') throw new Error('not_active')
  if (agora > t.em + CLUBE.cancelarSeg * 1000) throw new Error('cancel_window_over')
  const linha: Linha = { id: e.ledger.length + 1, em: agora, delta: t.custo, kind: 'reversal', action: 'redeem_cancel', key: 'reversal:' + t.id }
  return { ...e, trocas: e.trocas.map(x => x.id === id ? { ...x, status: 'cancelled' as const } : x), ledger: [...e.ledger, linha] }
}

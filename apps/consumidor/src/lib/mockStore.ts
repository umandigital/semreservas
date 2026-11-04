// Loja de protótipo: guarda no navegador e sincroniza entre abas do MESMO navegador.
// Não é o backend. A fila real (Supabase, entre aparelhos) vem no marco 1.5.
import { useSyncExternalStore } from 'react'

export type Status = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED'
export type Motivo = 'Conta' | 'Dúvida' | 'Fazer pedido' | 'Outro'
export type Call = { id: string; mesa: string; motivo: Motivo; code: string; status: Status; createdAt: number; ackAt?: number; resolvedAt?: number }
type Shared = { soldOut: string[]; calls: Call[] }
export type Selecao = { qtd: Record<string, number>; obs: Record<string, string>; code: string }

const KEY = 'sr-proto-v1', SELKEY = 'sr-sel-v1', CH = 'sr-proto'
const vazio: Shared = { soldOut: [], calls: [] }
const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CH) : null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())
bc && (bc.onmessage = emit)
if (typeof window !== 'undefined') window.addEventListener('storage', emit)

const ler = <T,>(k: string, v: T): T => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : v } catch { return v } }
let cacheRaw: string | null = null, cacheVal: Shared = vazio
export function getShared(): Shared {
  let raw: string | null = null
  try { raw = localStorage.getItem(KEY) } catch { /* sem armazenamento */ }
  if (raw !== cacheRaw) { cacheRaw = raw; cacheVal = raw ? JSON.parse(raw) as Shared : vazio }
  return cacheVal
}
function gravar(s: Shared) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignora */ } bc?.postMessage(1); emit() }
const sub = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }
export const useShared = () => useSyncExternalStore(sub, getShared)

const novoId = () => Math.random().toString(36).slice(2, 10)
export const codigoCurto = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('')
export const aberto = (c: Call) => c.status === 'PENDING' || c.status === 'ACKNOWLEDGED'

/** 1 chamado aberto por mesa+motivo: repetir devolve o que já existe (anti-spam). */
export function criarChamado(mesa: string, motivo: Motivo): Call {
  const s = getShared()
  const ja = s.calls.find(c => c.mesa === mesa && c.motivo === motivo && aberto(c))
  if (ja) return ja
  const c: Call = { id: novoId(), mesa, motivo, code: codigoCurto(), status: 'PENDING', createdAt: Date.now() }
  gravar({ ...s, calls: [...s.calls, c] })
  return c
}
function mudar(id: string, de: Status[], para: Status, extra: Partial<Call> = {}): boolean {
  const s = getShared(); const c = s.calls.find(x => x.id === id)
  if (!c || !de.includes(c.status)) return false   // transição condicional: ninguém assume duas vezes
  gravar({ ...s, calls: s.calls.map(x => x.id === id ? { ...x, status: para, ...extra } : x) })
  return true
}
export const assumir = (id: string) => mudar(id, ['PENDING'], 'ACKNOWLEDGED', { ackAt: Date.now() })
export const concluir = (id: string) => mudar(id, ['ACKNOWLEDGED'], 'RESOLVED', { resolvedAt: Date.now() })
export const cancelar = (id: string) => mudar(id, ['PENDING', 'ACKNOWLEDGED'], 'CANCELLED', { resolvedAt: Date.now() })
export function marcarEsgotado(itemId: string, esgotado: boolean) {
  const s = getShared(); const set = new Set(s.soldOut)
  esgotado ? set.add(itemId) : set.delete(itemId)
  gravar({ ...s, soldOut: [...set] })
}
export const reiniciarDemo = () => gravar(vazio)

// ── seleção do cliente (só neste aparelho) ──
let selRaw: string | null = null, selVal: Selecao = { qtd: {}, obs: {}, code: codigoCurto() }
function getSel(): Selecao {
  let raw: string | null = null
  try { raw = localStorage.getItem(SELKEY) } catch { /* ignora */ }
  if (raw !== selRaw) { selRaw = raw; selVal = ler<Selecao>(SELKEY, selVal) }
  return selVal
}
function gravarSel(s: Selecao) { try { localStorage.setItem(SELKEY, JSON.stringify(s)) } catch { /* ignora */ } emit() }
export const useSelecao = () => useSyncExternalStore(sub, getSel)
export function setQtd(id: string, q: number) {
  const s = getSel(); const qtd = { ...s.qtd }
  q <= 0 ? delete qtd[id] : (qtd[id] = Math.min(q, 20))
  gravarSel({ ...s, qtd })
}
export const setObs = (id: string, t: string) => { const s = getSel(); gravarSel({ ...s, obs: { ...s.obs, [id]: t.slice(0, 120) } }) }
export const limparSelecao = () => gravarSel({ qtd: {}, obs: {}, code: codigoCurto() })

export const lerSelecao = () => getSel()

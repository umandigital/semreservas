import { ApiError, criarChamado, type Kind } from './api'
import { getMesaFix, getToken, setMesa, setMesaFix } from './router'
import { aparelhoId, posicaoAtual } from './presenca'
import { supabase } from './supabase'

/** Último chamado desta sessão (a Início mostra o andamento enquanto estiver aberto). */
export const chamadoAtual = (): string | null => { try { return sessionStorage.getItem('sr-chamado') } catch { return null } }
export const limparChamadoAtual = () => { try { sessionStorage.removeItem('sr-chamado') } catch { /* ignora */ } }
const guardarChamado = (id: string) => { try { sessionStorage.setItem('sr-chamado', id) } catch { /* ignora */ } }

/** Abre um chamado para a mesa da placa (ou a corrigida pelo cliente). Devolve o id do chamado. */
export async function pedirAtendimento(kind: Kind, detalhe?: string): Promise<string> {
  const token = getToken()
  if (!token) throw new ApiError('invalid_token')
  const local = await posicaoAtual()   // só para confirmar presença; não é guardada
  const c = await criarChamado(token, kind, getMesaFix() ?? undefined, detalhe, aparelhoId(), local)
  setMesa(c.table_label); guardarChamado(c.id)
  if (c.cancel_token) { try { sessionStorage.setItem('sr-cancel-' + c.id, c.cancel_token) } catch { /* ignora */ } }
  return c.id
}
export type PedidoEnviado = { id: string; granted: boolean; subtotalCents: number }
/** Um toque: chama o garçom COM os itens. O servidor calcula o subtotal pelos preços do restaurante e, se for do Clube, libera o giro. */
export async function pedirComItens(itens: { id: string; qty: number; obs?: string }[]): Promise<PedidoEnviado> {
  const token = getToken()
  if (!token) throw new ApiError('invalid_token')
  if (!supabase) throw new ApiError('sem-config')
  const local = await posicaoAtual()
  const { data, error } = await supabase.rpc('order_call', { p_token: token, p_items: itens.map(i => ({ id: i.id, qty: i.qty, obs: i.obs ?? null })), p_table_label: getMesaFix() ?? null, p_device: aparelhoId(), p_lat: local?.lat ?? null, p_lon: local?.lon ?? null })
  if (error) throw new ApiError(/too_far/.test(error.message) ? 'too_far' : /location_required/.test(error.message) ? 'location_required' : /rate_limited/.test(error.message) ? 'rate_limited' : /device_blocked/.test(error.message) ? 'device_blocked' : /invalid_token/.test(error.message) ? 'invalid_token' : 'rede')
  const c = data as { id: string; table_label: string; cancel_token: string | null; subtotal_cents: number; granted: boolean }
  setMesa(c.table_label); guardarChamado(c.id)
  if (c.cancel_token) { try { sessionStorage.setItem('sr-cancel-' + c.id, c.cancel_token) } catch { /* ignora */ } }
  return { id: c.id, granted: !!c.granted, subtotalCents: c.subtotal_cents }
}
export const corrigirMesa = (m: string) => { setMesa(m); setMesaFix(m) }
export const tokenDeCancelamento = (id: string) => { try { return sessionStorage.getItem('sr-cancel-' + id) } catch { return null } }

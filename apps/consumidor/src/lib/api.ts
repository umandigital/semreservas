// Chamadas ao banco (Supabase) por funções. O navegador nunca informa tenant_id:
// o servidor deduz o estabelecimento do token da placa (cliente) ou do link do painel (equipe).
import { supabase } from './supabase'

export type Kind = 'waiter' | 'bill' | 'question' | 'order' | 'other' | 'kitchen_item'
export type Status = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED'
export type ApiCode = 'sem-config' | 'rede' | 'invalid_token' | 'invalid_kind' | 'invalid_table' | 'module_disabled' | 'rate_limited'
export class ApiError extends Error { constructor(public code: ApiCode) { super(code) } }

const CONHECIDOS: ApiCode[] = ['invalid_token', 'invalid_kind', 'invalid_table', 'module_disabled', 'rate_limited']
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T[]> {
  if (!supabase) throw new ApiError('sem-config')
  let res
  try { res = await supabase.rpc(fn, args) } catch { throw new ApiError('rede') }
  if (res.error) throw new ApiError(CONHECIDOS.find(c => (res.error!.message || '').includes(c)) ?? 'rede')
  // funções que devolvem tabela vêm como lista; as que devolvem um valor (boolean) vêm como valor puro
  return (Array.isArray(res.data) ? res.data : res.data == null ? [] : [res.data]) as T[]
}

export type Chamado = { id: string; status: Status; public_code: string; table_label: string; cancel_token: string | null; already_open: boolean }
export const criarChamado = async (token: string, kind: Kind, mesa?: string, detalhe?: string) =>
  (await rpc<Chamado>('create_service_request', { p_token: token, p_kind: kind, p_table_label: mesa ?? null, p_detail: detalhe ?? null }))[0]

export type StatusChamado = { status: Status; table_label: string; kind: Kind; detail: string | null; public_code: string; acknowledged_at: string | null; resolved_at: string | null }
export const statusChamado = async (id: string) => (await rpc<StatusChamado>('public_request_status', { p_id: id }))[0] ?? null
export const cancelarChamado = async (id: string, cancelToken: string) =>
  ((await rpc<boolean>('cancel_service_request', { p_id: id, p_cancel_token: cancelToken }))[0] as unknown) === true
export const mesasDaPlaca = async (token: string) => (await rpc<{ label: string }>('public_tables', { p_token: token })).map(r => r.label)
export const esgotadosPublicos = async (slug: string) => (await rpc<{ item_id: string }>('public_sold_out', { p_slug: slug })).map(r => r.item_id)

// ── painel da equipe (link secreto, sem login) ──
export type Pedido = { id: string; table_label: string; kind: Kind; detail: string | null; status: Status; public_code: string; created_at: string; acknowledged_at: string | null; server_now: string }
export const painelInfo = async (token: string) => (await rpc<{ tenant_name: string; tenant_slug: string }>('panel_info', { p_token: token }))[0]
export const painelFila = (token: string) => rpc<Pedido>('panel_requests', { p_token: token })
export const painelMudar = async (token: string, id: string, para: 'ACKNOWLEDGED' | 'RESOLVED') =>
  ((await rpc<boolean>('panel_change_request', { p_token: token, p_id: id, p_to: para }))[0] as unknown) === true

export const ROTULO: Record<Kind, string> = { waiter: 'Chamar garçom', bill: 'Conta', question: 'Dúvida', order: 'Fazer pedido', other: 'Outro', kitchen_item: 'Pedido à cozinha' }
export const MENSAGEM_ERRO: Record<ApiCode, string> = {
  'sem-config': 'Este ambiente não está conectado ao banco.',
  rede: 'Sem conexão no momento. Tente de novo. Se continuar, chame alguém do salão.',
  invalid_token: 'Esta placa não está ativa. Chame alguém do salão.',
  invalid_kind: 'Pedido inválido.',
  invalid_table: 'Mesa não encontrada. Escolha a mesa de novo.',
  module_disabled: 'O chamado digital está desligado neste estabelecimento. Chame alguém do salão.',
  rate_limited: 'Muitos chamados agora. Aguarde um instante e tente de novo.',
}

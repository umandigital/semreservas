import { ApiError, criarChamado, type Kind } from './api'
import { getMesaFix, getToken, setMesa, setMesaFix } from './router'
import { aparelhoId, posicaoAtual } from './presenca'

/** Abre um chamado para a mesa da placa (ou a corrigida pelo cliente). Devolve o id do chamado. */
export async function pedirAtendimento(kind: Kind, detalhe?: string): Promise<string> {
  const token = getToken()
  if (!token) throw new ApiError('invalid_token')
  const local = await posicaoAtual()   // só para confirmar presença; não é guardada
  const c = await criarChamado(token, kind, getMesaFix() ?? undefined, detalhe, aparelhoId(), local)
  setMesa(c.table_label)
  if (c.cancel_token) { try { sessionStorage.setItem('sr-cancel-' + c.id, c.cancel_token) } catch { /* ignora */ } }
  return c.id
}
export const corrigirMesa = (m: string) => { setMesa(m); setMesaFix(m) }
export const tokenDeCancelamento = (id: string) => { try { return sessionStorage.getItem('sr-cancel-' + id) } catch { return null } }

import { beforeEach, describe, expect, it } from 'vitest'
// jsdom não está instalado: simula o mínimo do navegador
const mem = new Map<string, string>()
;(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
;(globalThis as any).window = { addEventListener() {} }
const S = await import('./mockStore')

beforeEach(() => { mem.clear(); S.reiniciarDemo() })
describe('fila de chamados', () => {
  it('nasce PENDING e repetir na mesma mesa/motivo não duplica', () => {
    const a = S.criarChamado('2', 'Conta'); const b = S.criarChamado('2', 'Conta')
    expect(a.status).toBe('PENDING'); expect(b.id).toBe(a.id)
    expect(S.getShared().calls).toHaveLength(1)
  })
  it('motivo diferente ou outra mesa gera outro chamado', () => {
    S.criarChamado('2', 'Conta'); S.criarChamado('2', 'Dúvida'); S.criarChamado('3', 'Conta')
    expect(S.getShared().calls).toHaveLength(3)
  })
  it('só assume quem estava PENDING; só conclui quem estava assumido', () => {
    const c = S.criarChamado('1', 'Outro')
    expect(S.concluir(c.id)).toBe(false)
    expect(S.assumir(c.id)).toBe(true)
    expect(S.assumir(c.id)).toBe(false)   // segundo funcionário não assume de novo
    expect(S.concluir(c.id)).toBe(true)
    expect(S.cancelar(c.id)).toBe(false)  // já resolvido
  })
  it('depois de resolvido, a mesa pode chamar de novo', () => {
    const c = S.criarChamado('1', 'Conta'); S.assumir(c.id); S.concluir(c.id)
    expect(S.criarChamado('1', 'Conta').id).not.toBe(c.id)
  })
})
describe('esgotado e seleção', () => {
  it('liga e desliga esgotado', () => {
    S.marcarEsgotado('h1', true); expect(S.getShared().soldOut).toEqual(['h1'])
    S.marcarEsgotado('h1', false); expect(S.getShared().soldOut).toEqual([])
  })
  it('quantidade limita a 20 e zero remove', () => {
    S.setQtd('h1', 99); expect(S.lerSelecao().qtd.h1).toBe(20)
    S.setQtd('h1', 0); expect(S.lerSelecao().qtd.h1).toBeUndefined()
  })
})

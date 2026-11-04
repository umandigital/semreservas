import { beforeEach, describe, expect, it } from 'vitest'
// jsdom não está instalado: simula o mínimo do navegador
const mem = new Map<string, string>()
;(globalThis as any).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) }
;(globalThis as any).window = { addEventListener() {} }
const S = await import('./mockStore')

beforeEach(() => { mem.clear(); S.zerarTudoDeTeste() })
describe('seleção', () => {
  it('quantidade limita a 20 e zero remove', () => {
    S.setQtd('h1', 99); expect(S.lerSelecao().qtd.h1).toBe(20)
    S.setQtd('h1', 0); expect(S.lerSelecao().qtd.h1).toBeUndefined()
  })
})
describe('identificação opcional, clube e comentários', () => {
  it('sem entrar não há membro nem comentário', () => {
    expect(S.lerMembro()).toBeNull()
    expect(S.comentar('h1', 'oi')).toBe(false)
  })
  it('entrar dá saldo demonstrativo; sair limpa', () => {
    S.entrar(' a@b.co '); expect(S.lerMembro()?.pontos).toBe(S.PONTOS_INICIAIS); expect(S.lerMembro()?.email).toBe('a@b.co')
    S.sair(); expect(S.lerMembro()).toBeNull()
  })
  it('resgate debita, gera código e nunca deixa saldo negativo', () => {
    S.entrar('a@b.co')
    expect(S.resgatar('Sobremesa', 800)).toBeNull()            // 520 < 800
    const c = S.resgatar('Drink especial', 500); expect(c).toHaveLength(4)
    expect(S.lerMembro()?.pontos).toBe(20)
    expect(S.resgatar('Drink especial', 500)).toBeNull()       // saldo insuficiente
    expect(S.lerMembro()?.pontos).toBe(20)
  })
  it('comentário de membro vai para moderação; vazio é recusado', () => {
    S.entrar('a@b.co'); expect(S.comentar('h1', '   ')).toBe(false)
    expect(S.comentar('h1', 'ótimo')).toBe(true); expect(S.lerSocial().comments[0].status).toBe('EM_MODERACAO')
  })
  it('curtir e salvar alternam', () => {
    S.curtir('h1'); expect(S.lerSocial().likes).toEqual(['h1']); S.curtir('h1'); expect(S.lerSocial().likes).toEqual([])
    S.salvar('p1'); expect(S.lerSocial().saved).toEqual(['p1'])
  })
})

import { describe, expect, it } from 'vitest'
import { lerRota } from './router'

describe('lerRota', () => {
  it('hash vazio é o início', () => { expect(lerRota('')).toBe('/'); expect(lerRota('#')).toBe('/') })
  it('lê telas do app', () => { expect(lerRota('#/cardapio')).toBe('/cardapio'); expect(lerRota('#/equipe/abc')).toBe('/equipe/abc'); expect(lerRota('#/entrar?de=/clube')).toBe('/entrar?de=/clube') })
  it('IGNORA o sinal da RA e qualquer hash que não seja tela: mantém a tela anterior', () => {
    expect(lerRota('#model-viewer-no-ar-fallback', '/cardapio')).toBe('/cardapio')
    expect(lerRota('#qualquer-coisa', '/pedido')).toBe('/pedido')
  })
})

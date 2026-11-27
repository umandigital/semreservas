import { describe, expect, it } from 'vitest'
import { ITENS } from './cardapio'
import { comentariosDe } from './exemplos'

describe('comentários de exemplo', () => {
  it('todo prato tem 3 ou 4 comentários, sempre os mesmos para o mesmo prato', () => {
    for (const i of ITENS) { const a = comentariosDe(i.id, i.cat); expect(a.length).toBeGreaterThanOrEqual(3); expect(a.length).toBeLessThanOrEqual(4); expect(a).toEqual(comentariosDe(i.id, i.cat)); for (const c of a) { expect(c.autor.length).toBeGreaterThan(1); expect(c.texto.length).toBeGreaterThan(8) } }
  })
})

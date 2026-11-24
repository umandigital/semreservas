import { describe, expect, it } from 'vitest'
import { aplicarMenu, ITENS, ITENS_FEED } from './cardapio'

describe('cardápio vindo do servidor', () => {
  it('troca preço, esconde item desligado e mostra item novo; sem linha do servidor, fica como está', () => {
    const a = ITENS[0], b = ITENS[1], total = ITENS.length
    aplicarMenu([
      { item_id: a.id, name: 'Nome novo', price_cents: 1234, active: true, category: null, description: null },
      { item_id: b.id, name: b.nome, price_cents: b.preco, active: false, category: null, description: null },
      { item_id: 'n-1', name: 'Suco', price_cents: 900, active: true, category: 'Bebidas', description: 'Integral' },
      { item_id: 'n-2', name: 'Sem categoria válida', price_cents: 900, active: true, category: 'Inventada', description: null },
    ])
    expect(ITENS.find(i => i.id === a.id)).toMatchObject({ nome: 'Nome novo', preco: 1234 })
    expect(ITENS.some(i => i.id === b.id)).toBe(false)
    expect(ITENS.find(i => i.id === 'n-1')).toMatchObject({ cat: 'Bebidas', preco: 900 })
    expect(ITENS.some(i => i.id === 'n-2')).toBe(false)
    expect(ITENS_FEED.length).toBe(ITENS.length)
    aplicarMenu([])   // volta ao embutido
    expect(ITENS.length).toBe(total)
    expect(ITENS.find(i => i.id === a.id)?.preco).toBe(a.preco)
  })
})

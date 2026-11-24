import { describe, expect, it } from 'vitest'
import { CENAS, DUVIDAS, duracaoTotal } from './introClube'

describe('roteiro do vídeo do Clube', () => {
  it('cada cena animada tem título (menos a abertura), legenda e duração; ids únicos', () => {
    expect(new Set(CENAS.map(c => c.id)).size).toBe(CENAS.length)
    for (const c of CENAS.filter(x => x.seg > 0)) { expect(c.legenda.length).toBeGreaterThan(20); if (c.id !== 'abre') expect(c.titulo.length).toBeGreaterThan(3) }
  })
  it('dura entre 1 e 2 minutos (as cenas interativas não contam)', () => { expect(duracaoTotal()).toBeGreaterThanOrEqual(60); expect(duracaoTotal()).toBeLessThanOrEqual(120) })
  it('os cinco passos vêm em ordem 1 a 5', () => { expect(CENAS.filter(c => c.passo).map(c => c.passo)).toEqual([1, 2, 3, 4, 5]) })
  it('é genérico: nenhum texto cita restaurante, prato ou valor em reais específico', () => {
    const t = JSON.stringify([CENAS, DUVIDAS]).toLowerCase()
    for (const proibido of ['gastropub', 'semreservas', 'r$', 'pizza', 'hambúrguer']) expect(t).not.toContain(proibido)
  })
})

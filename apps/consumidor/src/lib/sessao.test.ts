import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SESSAO_MS, getMesa, getToken, setMesa, setToken } from './router'

// armazenamento mínimo em memória (o ambiente de teste é Node)
const mem = new Map<string, string>()
const fake = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { mem.set(k, v) }, removeItem: (k: string) => { mem.delete(k) } }
describe('sessão da mesa (90 minutos)', () => {
  beforeEach(() => { mem.clear(); vi.stubGlobal('localStorage', fake); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-21T20:00:00Z')) })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })
  it('guarda a mesa e a placa e lembra em outra aba', () => { setToken('dev-gastropub-p1-qr-000000'); setMesa('1'); expect(getToken()).toBe('dev-gastropub-p1-qr-000000'); expect(getMesa()).toBe('1') })
  it('vale por 90 minutos e depois pede a placa de novo', () => {
    setToken('t'.repeat(24)); vi.advanceTimersByTime(SESSAO_MS - 1000); expect(getToken()).toBe('t'.repeat(24))
    vi.advanceTimersByTime(2000); expect(getToken()).toBeNull()
  })
  it('encostar de novo na placa renova o prazo', () => {
    setToken('a'.repeat(24)); vi.advanceTimersByTime(SESSAO_MS - 1000); setToken('a'.repeat(24)); vi.advanceTimersByTime(SESSAO_MS - 1000)
    expect(getToken()).toBe('a'.repeat(24))
  })
  it('limpar a mesa funciona', () => { setMesa('2'); setMesa(null); expect(getMesa()).toBeNull() })
})

import { describe, expect, it } from 'vitest'
import { calcularMetricas, fmtDuracao, mediana, type Linha } from './metricas'

const t0 = Date.parse('2026-11-05T20:00:00Z'); const iso = (s: number) => new Date(t0 + s * 1000).toISOString()
const L = (id: string, mesa: string, kind: string, status: string, ack?: number, res?: number): Linha =>
  ({ id, table_label: mesa, kind, status, created_at: iso(0), acknowledged_at: ack === undefined ? null : iso(ack), resolved_at: res === undefined ? null : iso(res) })

describe('metricas de atendimento', () => {
  it('sem dados: zeros e "sem dados", nunca inventa número', () => {
    const m = calcularMetricas([]); expect(m.total).toBe(0); expect(m.medianaVistoS).toBeNull(); expect(m.medianaConclusaoS).toBeNull(); expect(m.maiorEsperaS).toBeNull()
    expect(fmtDuracao(null)).toBe('sem dados')
  })
  it('conta por estado e calcula tempos', () => {
    const m = calcularMetricas([L('1', '2', 'bill', 'RESOLVED', 30, 120), L('2', '2', 'bill', 'RESOLVED', 60, 300), L('3', '1', 'other', 'CANCELLED'), L('4', '3', 'question', 'PENDING'), L('5', '3', 'question', 'ACKNOWLEDGED', 90)])
    expect(m).toMatchObject({ total: 5, atendidos: 2, cancelados: 1, abertos: 2 })
    expect(m.medianaVistoS).toBe(60); expect(m.maiorEsperaS).toBe(90); expect(m.medianaConclusaoS).toBe(210)
    expect(m.porMotivo[0]).toEqual({ kind: 'bill', total: 2 })
  })
  it('mediana resiste a um chamado esquecido por horas', () => {
    expect(mediana([20, 25, 30, 40, 36000])).toBe(30)   // a média seria ~7200 s
    expect(mediana([10, 20])).toBe(15)
  })
  it('mesas que mais chamam, no máximo 5', () => {
    const l = ['1', '1', '1', '2', '2', '3', '4', '5', '6'].map((m, i) => L(String(i), m, 'other', 'RESOLVED', 5, 9))
    const m = calcularMetricas(l); expect(m.porMesa).toHaveLength(5); expect(m.porMesa[0]).toEqual({ mesa: '1', total: 3 })
  })
  it('formata duração', () => { expect(fmtDuracao(45)).toBe('45 s'); expect(fmtDuracao(125)).toBe('2 min 5 s'); expect(fmtDuracao(600)).toBe('10 min'); expect(fmtDuracao(3900)).toBe('1 h 5 min') })
})

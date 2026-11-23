import { describe, expect, it } from 'vitest'
import { cadastrar, cancelar, creditar, ganhar, saldo, total, trocar, vazio, visitas } from './clubeDemo'
const T0 = new Date('2026-11-23T20:00:00').getTime()
const membro = () => cadastrar(vazio(), 'Ana', '1990-05-05', T0)
describe('Clube (motor sem banco)', () => {
  it('cadastro dá 50 pontos uma vez e rejeita menor de 13', () => {
    const e = membro(); expect(saldo(e)).toBe(50); expect(cadastrar(e, 'Ana', '1990-05-05', T0)).toBe(e)
    expect(() => cadastrar(vazio(), 'Bia', '2020-01-01', T0)).toThrow('invalid_birth')
  })
  it('ações de intenção respeitam o limite; ações do servidor não são pedidas pelo app', () => {
    let e = membro(); let g: number
    ;[e, g] = ganhar(e, 'instagram_follow', T0); expect(g).toBe(20)
    ;[e, g] = ganhar(e, 'instagram_follow', T0); expect(g).toBe(0)
    for (let i = 0; i < 3; i++) [e] = ganhar(e, 'ar_used', T0); [e, g] = ganhar(e, 'ar_used', T0); expect(g).toBe(0)
    expect(saldo(e)).toBe(50 + 20 + 15)
    expect(() => ganhar(e, 'checkin', T0)).toThrow('action_not_claimable')
    expect(() => ganhar(vazio(), 'instagram_follow', T0)).toThrow('not_member')
  })
  it('limite por dia volta no dia seguinte e o teto mensal para as interações', () => {
    let e = membro(); let g = 0
    ;[e] = ganhar(e, 'photo_frame', T0); [e, g] = ganhar(e, 'photo_frame', T0 + 3600000); expect(g).toBe(0)
    ;[e, g] = ganhar(e, 'photo_frame', T0 + 86400000); expect(g).toBe(15)
    let x = membro()
    for (let d = 0; d < 12; d++) { [x] = creditar(x, 'comment_dish', 'c' + d, T0 + d * 1000) }  // 20 cada, teto 200
    expect(total(x) - 50).toBeLessThanOrEqual(200)
  })
  it('troca: debita, 1 por dia, cancela em 2 minutos, não cancela depois', () => {
    let e = membro(); e = { ...e, ledger: [...e.ledger, { id: 99, em: T0, delta: 400, kind: 'adjust', action: 'manual', key: 'k' }] }
    expect(() => trocar(e, 'pizza', T0)).toThrow('insufficient_points')
    const [e2, t] = trocar(e, 'sorvete', T0); expect(saldo(e2)).toBe(250); expect(t.code).toHaveLength(6)
    expect(() => trocar(e2, 'sorvete', T0)).toThrow('one_per_day')
    const e3 = cancelar(e2, t.id, T0 + 60000); expect(saldo(e3)).toBe(450)
    expect(() => cancelar(e3, t.id, T0 + 61000)).toThrow('not_active')
    expect(() => cancelar(e2, t.id, T0 + 121000)).toThrow('cancel_window_over')
  })
  it('prêmio grande exige visitas e o extrato nunca perde linhas', () => {
    let e = membro(); e = { ...e, ledger: [...e.ledger, { id: 98, em: T0, delta: 2000, kind: 'adjust', action: 'manual', key: 'k2' }] }
    expect(() => trocar(e, 'pizza', T0)).toThrow('min_visits')
    expect(visitas(e)).toBe(0)
    const antes = e.ledger.length; const [e2] = trocar(e, 'refri', T0); expect(e2.ledger.length).toBe(antes + 1)
  })
})

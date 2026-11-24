import { describe, expect, it } from 'vitest'
import { aniversario, cadastrar, cancelar, checkin, creditar, ganhar, girar, liberarGiro, opinar, pegarPresente, saldo, total, trocar, usarExtra, vazio, visitas } from './clubeDemo'
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
  it('check-in dá 30 por dia, bônus de voltar em 7 dias e opinião exige a visita', () => {
    let e = membro(); expect(() => opinar(e, 5, '', [], T0)).toThrow('no_visit')
    let r; [e, r] = checkin(e, T0); expect(r.credited).toBe(30); expect(r.bonuses).toEqual(['checkin'])
    ;[e, r] = checkin(e, T0 + 3600000); expect(r.already).toBe(true)
    ;[e, r] = checkin(e, T0 + 3 * 86400000); expect(r.credited).toBe(50); expect(r.bonuses).toContain('return_7d')
    const [e2, g] = opinar(e, 5, 'Hambúrguer muito saboroso, volto com certeza!', ['a', 'b', 'c', 'd'], T0 + 3 * 86400000); expect(g).toBe(10 + 15 + 20)
    expect(() => opinar(e2, 4, '', [], T0 + 3 * 86400000)).toThrow('already_sent')
    expect(opinar(e, 5, 'veja www.spam.com e compre agora mesmo', [], T0 + 3 * 86400000)[1]).toBe(10)
  })
  it('roleta: 1 giro por dia com pedido de R$ 80, etapas nunca repetem e o 5º giro ganha', () => {
    let e = membro(); expect(() => liberarGiro(e, 9000, T0)).toThrow('no_visit'); [e] = checkin(e, T0)
    let ok: boolean; [e, ok] = liberarGiro(e, 5000, T0); expect(ok).toBe(false)
    ;[e, ok] = liberarGiro(e, 9000, T0); expect(ok).toBe(true); [e, ok] = liberarGiro(e, 9000, T0); expect(ok).toBe(false)
    e = { ...e, roleta: { ...e.roleta, grants: ['a', 'b', 'c', 'd', 'e'] } }
    const vistos: string[] = []; let r
    for (let i = 1; i <= 5; i++) { [e, r] = girar(e, T0, () => 0); expect(vistos).not.toContain(r.step); vistos.push(r.step); expect(r.count).toBe(i % 5 || 5); expect(r.won).toBe(i === 5) }
    expect(e.extras).toHaveLength(1); expect(e.extras[0].name).toBe('Pizza à escolha')
    expect(() => girar(e, T0)).toThrow('no_grant')
    const [e2, x] = usarExtra(e, e.extras[0].id, T0 + 1000); expect(x.status).toBe('used'); expect(() => usarExtra(e2, x.id, T0 + 2000)).toThrow('not_active')
    expect(() => usarExtra(e, e.extras[0].id, T0 + 40 * 86400000)).toThrow('expired')
    expect(() => liberarGiro(cadastrar(vazio(), 'Bia', '2012-01-01', T0), 9000, T0)).toThrow('adults_only')
  })
  it('aniversário: só no dia ou no seguinte, uma vez por ano', () => {
    const e = cadastrar(vazio(), 'Ana', '1990-11-23', T0)
    expect(aniversario(e, T0)?.canClaim).toBe(true)
    const [e2, ex] = pegarPresente(e, T0); expect(ex.source).toBe('birthday'); expect(() => pegarPresente(e2, T0)).toThrow('already_claimed')
    expect(aniversario(e, T0 + 86400000)?.canClaim).toBe(true); expect(aniversario(e, T0 + 2 * 86400000)?.canClaim).toBe(false)
    expect(() => pegarPresente(e, T0 + 5 * 86400000)).toThrow('not_birthday')
  })
})

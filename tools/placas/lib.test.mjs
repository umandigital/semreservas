import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gerarCsv, gerarSql, montarPlacas, novoToken, parseMesas, urlDe } from './lib.mjs'

test('intervalo e lista', () => {
  assert.deepEqual(parseMesas('1..3'), ['1', '2', '3'])
  assert.deepEqual(parseMesas('Balcão, Varanda 1'), ['Balcão', 'Varanda 1'])
})
test('rejeita repetidos, vazios e intervalos absurdos', () => {
  assert.throws(() => parseMesas('1,1'))
  assert.throws(() => parseMesas('  '))
  assert.throws(() => parseMesas('5..2'))
  assert.throws(() => parseMesas('1..9999'))
})
test('tokens longos, únicos e sem caracteres estranhos', () => {
  const ts = montarPlacas(parseMesas('1..200')).flatMap(p => [p.nfc, p.qr])
  assert.equal(new Set(ts).size, 400)
  assert.ok(ts.every(t => /^[A-Za-z0-9_-]{32}$/.test(t)))
})
test('sql escapa aspas e usa o slug', () => {
  const sql = gerarSql("x'y", [{ numero: "O'Brien", nfc: 'a'.repeat(32), qr: 'b'.repeat(32) }])
  assert.match(sql, /slug = 'x''y'/)
  assert.match(sql, /'O''Brien'/)
})
test('csv e url sem barra dupla', () => {
  const p = [{ numero: '1', nfc: novoToken(), qr: novoToken() }]
  assert.equal(urlDe('https://a.b/c/', 'T'), 'https://a.b/c/r/T')
  assert.match(gerarCsv('https://a.b/c', p), /^numero,url_nfc,url_qr\n1,https:\/\/a\.b\/c\/r\//)
})

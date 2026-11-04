import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const roda = conteudo => {
  const d = mkdtempSync(join(tmpdir(), 'pk-')); writeFileSync(join(d, 'a.js'), conteudo)
  return spawnSync('node', [new URL('./verificar-pacote.mjs', import.meta.url).pathname, d]).status
}
const jwt = role => 'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from(JSON.stringify({ role })).toString('base64url') + '.assinaturaassinatura'
test('texto de aviso da biblioteca passa', () => assert.equal(roda('console.warn("do not use service_role or sb_secret_ in browser")'), 0))
test('chave anon (publishable) passa', () => assert.equal(roda('k="sb_publishable_6Dluh769f1NXhm8Ns0t4Qw_AGawQkUA";j="' + jwt('anon') + '"'), 0))
test('sb_secret_ de verdade falha', () => assert.equal(roda('k="sb_secret_abcdefghijklmnopqrstuvwxyz123456"'), 1))
test('JWT service_role falha', () => assert.equal(roda('j="' + jwt('service_role') + '"'), 1))

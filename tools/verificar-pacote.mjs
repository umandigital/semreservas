#!/usr/bin/env node
// Falha se o pacote publicado contiver uma chave SECRETA do Supabase de verdade.
// (A biblioteca supabase-js cita "service_role" e "sb_secret_" em mensagens de aviso;
//  por isso procuramos a chave em si, não a palavra.)
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const raiz = process.argv[2]
const achados = []
const varrer = dir => {
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome)
    if (statSync(p).isDirectory()) { varrer(p); continue }
    if (!/\.(js|mjs|html|css|json|map|txt)$/.test(nome)) continue
    const t = readFileSync(p, 'utf8')
    if (/sb_secret_[A-Za-z0-9_-]{20,}/.test(t)) achados.push(`${p}: chave sb_secret_`)
    for (const m of t.matchAll(/eyJ[A-Za-z0-9_-]{10,}\.([A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}/g)) {
      try { if (JSON.parse(Buffer.from(m[1], 'base64url').toString()).role === 'service_role') achados.push(`${p}: JWT service_role`) } catch { /* não é JWT */ }
    }
  }
}
varrer(raiz)
if (achados.length) { console.error('CHAVE SECRETA NO PACOTE:\n' + achados.join('\n')); process.exit(1) }
console.log('ok: nenhuma chave secreta no pacote')

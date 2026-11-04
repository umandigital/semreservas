#!/usr/bin/env node
// Gera placas em lote (ADR-0004): SQL, CSV para o app de gravação NFC e folha de QR para imprimir.
//   node tools/placas/gerar.mjs --slug gastropub --mesas 1..3 --base https://umandigital.com.br/semreservas --out ./saida-placas
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import QRCode from 'qrcode'
import { gerarCsv, gerarSql, montarPlacas, parseMesas, urlDe } from './lib.mjs'

const arg = n => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : undefined }
const slug = arg('slug'), mesas = arg('mesas'), base = arg('base'), out = arg('out') || './saida-placas'
if (!slug || !mesas || !base) {
  console.error('uso: gerar.mjs --slug gastropub --mesas "1..30" (ou "Balcão,Varanda 1") --base https://dominio/caminho [--out pasta]')
  process.exit(1)
}
const placas = montarPlacas(parseMesas(mesas))
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'placas.sql'), gerarSql(slug, placas))
writeFileSync(join(out, 'placas.csv'), gerarCsv(base, placas))

const cartoes = await Promise.all(placas.map(async p => {
  const svg = await QRCode.toString(urlDe(base, p.qr), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
  return `<section><div class="n">${p.numero}</div>${svg}<div class="l">Aproxime o celular ou leia o QR</div></section>`
}))
writeFileSync(join(out, 'placas-qr.html'), `<!doctype html><meta charset="utf-8"><title>Placas ${slug}</title>
<style>body{font-family:system-ui;margin:0}main{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm;padding:8mm}
section{border:1px dashed #999;padding:6mm;text-align:center;break-inside:avoid}.n{font-size:56pt;font-weight:800}
svg{width:48mm;height:48mm}.l{font-size:10pt;margin-top:3mm}@media print{@page{margin:0}}</style><main>${cartoes.join('')}</main>`)
writeFileSync(join(out, 'conferencia.csv'), 'numero,gravada,testada,travada\n' + placas.map(p => `${p.numero},,,`).join('\n') + '\n')
console.log(`${placas.length} placas em ${out}/ (placas.sql, placas.csv, placas-qr.html, conferencia.csv)`)

import { randomBytes } from 'node:crypto'

/** "1..30" → ['1',...,'30'];  "Balcão,Varanda 1" → lista. Rótulos únicos, até 30 caracteres. */
export function parseMesas(entrada) {
  const s = String(entrada).trim()
  const r = /^(\d+)\.\.(\d+)$/.exec(s)
  let lista
  if (r) {
    const a = +r[1], b = +r[2]
    if (b < a || b - a > 499) throw new Error('intervalo inválido (máximo 500 mesas)')
    lista = Array.from({ length: b - a + 1 }, (_, i) => String(a + i))
  } else {
    lista = s.split(',').map(x => x.trim()).filter(Boolean)
  }
  if (!lista.length) throw new Error('nenhuma mesa informada')
  if (lista.some(x => x.length > 30)) throw new Error('rótulo com mais de 30 caracteres')
  if (new Set(lista.map(x => x.toLowerCase())).size !== lista.length) throw new Error('rótulos repetidos')
  return lista
}

/** Token opaco de 32 caracteres (24 bytes aleatórios). Nunca sequencial. */
export const novoToken = () => randomBytes(24).toString('base64url')

export const aspas = v => `'${String(v).replaceAll("'", "''")}'`

export function montarPlacas(rotulos) {
  return rotulos.map(numero => ({ numero, nfc: novoToken(), qr: novoToken() }))
}

export function gerarSql(slug, placas) {
  const t = `(select id from tenants where slug = ${aspas(slug)})`
  const out = ['-- Gerado por tools/placas. Contém tokens: NÃO versionar. Rodar uma vez no SQL Editor.', 'begin;']
  for (const p of placas) {
    const ap = `(select id from access_points where tenant_id = ${t} and number = ${aspas(p.numero)})`
    out.push(
      `insert into venue_tables (tenant_id, label) values (${t}, ${aspas(p.numero)}) on conflict (tenant_id, label) do nothing;`,
      `insert into access_points (tenant_id, number) values (${t}, ${aspas(p.numero)});`,
      `insert into access_point_tokens (token, tenant_id, access_point_id, origin) values (${aspas(p.nfc)}, ${t}, ${ap}, 'nfc'), (${aspas(p.qr)}, ${t}, ${ap}, 'qr');`,
      `insert into access_point_assignments (tenant_id, access_point_id, table_id) values (${t}, ${ap}, (select id from venue_tables where tenant_id = ${t} and label = ${aspas(p.numero)}));`,
    )
  }
  out.push('commit;')
  return out.join('\n') + '\n'
}

export const urlDe = (base, token) => `${base.replace(/\/+$/, '')}/r/${token}`

export function gerarCsv(base, placas) {
  return ['numero,url_nfc,url_qr', ...placas.map(p => `${p.numero},${urlDe(base, p.nfc)},${urlDe(base, p.qr)}`)].join('\n') + '\n'
}

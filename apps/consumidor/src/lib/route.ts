export type Route =
  | { kind: 'placa'; token: string }   // /r/{token}: veio de uma placa NFC/QR
  | { kind: 'inicio' }

/** Lê a rota ignorando o caminho base ('/semreservas/' ou '/'). */
export function parseRoute(pathname: string, base: string): Route {
  const b = base.endsWith('/') ? base : base + '/'
  const rel = pathname.startsWith(b) ? pathname.slice(b.length) : pathname.replace(/^\//, '')
  const m = /^r\/([A-Za-z0-9_-]{22,})\/?$/.exec(rel)
  return m ? { kind: 'placa', token: m[1] } : { kind: 'inicio' }
}

import { describe, expect, it } from 'vitest'
import { parseRoute } from './route'

const T = 'dev-gastropub-p2-nfc-000000'
describe('parseRoute', () => {
  it('lê o token com caminho base de teste', () => {
    expect(parseRoute(`/semreservas/r/${T}`, '/semreservas/')).toEqual({ kind: 'placa', token: T })
  })
  it('lê o token na raiz (domínio definitivo)', () => {
    expect(parseRoute(`/r/${T}/`, '/')).toEqual({ kind: 'placa', token: T })
  })
  it('rejeita token curto ou com caracteres estranhos', () => {
    expect(parseRoute('/semreservas/r/abc', '/semreservas/')).toEqual({ kind: 'inicio' })
    expect(parseRoute(`/semreservas/r/${T}<script>`, '/semreservas/')).toEqual({ kind: 'inicio' })
  })
  it('qualquer outro caminho vira início', () => {
    expect(parseRoute('/semreservas/', '/semreservas/')).toEqual({ kind: 'inicio' })
  })
})

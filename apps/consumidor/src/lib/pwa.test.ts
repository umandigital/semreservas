import { describe, expect, it } from 'vitest'
import { manifestoDoPainel } from './pwa'

describe('manifesto do painel instalado', () => {
  const m = manifestoDoPainel('t'.repeat(48), '/semreservas/', 'https://umandigital.com.br')
  it('abre direto no painel com o link da equipe', () => expect(m.start_url).toBe('https://umandigital.com.br/semreservas/#/equipe/' + 't'.repeat(48)))
  it('start_url dentro do escopo (exigência para instalar)', () => { expect(m.start_url.startsWith(m.scope)).toBe(true); expect(m.scope).toBe('https://umandigital.com.br/semreservas/') })
  it('standalone, com ícones 192 e 512 e um maskable', () => {
    expect(m.display).toBe('standalone'); const t = m.icons.map(i => i.sizes + i.purpose)
    expect(t).toContain('192x192any'); expect(t).toContain('512x512any'); expect(t).toContain('512x512maskable')
  })
  it('funciona no domínio definitivo (base /)', () => { const d = manifestoDoPainel('x'.repeat(40), '/', 'https://semreservas.com.br'); expect(d.start_url).toBe('https://semreservas.com.br/#/equipe/' + 'x'.repeat(40)); expect(d.icons[0].src).toBe('https://semreservas.com.br/icons/icon-192.png') })
})

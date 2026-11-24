import { describe, expect, it } from 'vitest'
import { manifestoDoDono, manifestoDoPainel } from './pwa'

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

describe('manifesto do painel do dono instalado', () => {
  const m = manifestoDoDono('/', 'https://semreservas.com.br')
  it('abre direto em #/dono, dentro do escopo, e sem segredo no endereço', () => { expect(m.start_url).toBe('https://semreservas.com.br/#/dono'); expect(m.start_url.startsWith(m.scope)).toBe(true) })
  it('é outro aplicativo (id próprio) e não mistura com o painel da equipe', () => { expect(m.id).toBe('https://semreservas.com.br/#/dono'); expect(m.id).not.toBe(manifestoDoPainel('t'.repeat(40), '/', 'https://semreservas.com.br').id); expect(m.name).toContain('dono') })
  it('standalone com ícones', () => { expect(m.display).toBe('standalone'); expect(m.icons.length).toBe(3) })
})

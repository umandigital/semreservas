// Painel da equipe instalável (PWA). O manifesto é montado na hora com o link da equipe,
// para o ícone instalado abrir direto neste painel, sem ninguém digitar nada.
type EventoInstalar = Event & { prompt: () => Promise<void> }
let guardado: EventoInstalar | null = null
const ouvintes = new Set<(v: boolean) => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); guardado = e as EventoInstalar; ouvintes.forEach(f => f(true)) })
  window.addEventListener('appinstalled', () => { guardado = null; ouvintes.forEach(f => f(false)) })
}
export const instalavel = (cb: (v: boolean) => void) => { ouvintes.add(cb); cb(!!guardado); return () => { ouvintes.delete(cb) } }
export const instalar = async () => { if (guardado) { await guardado.prompt(); guardado = null; ouvintes.forEach(f => f(false)) } }
export const jaInstalado = () => matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
export const ehIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function manifestoDoPainel(token: string, base: string, origem: string) {
  const abs = (p: string) => origem + base + p
  return {
    name: 'SemReservas · Painel da equipe', short_name: 'Painel', description: 'Chamados das mesas em tempo real',
    start_url: abs('#/equipe/' + token), scope: abs(''), id: abs('#/equipe'), display: 'standalone', orientation: 'any',
    background_color: '#2a1148', theme_color: '#2a1148',
    icons: [
      { src: abs('icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: abs('icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: abs('icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
/** Painel do proprietário instalável: o ícone instalado abre direto em #/dono (o login continua sendo pedido). */
export function manifestoDoDono(base: string, origem: string) {
  const abs = (p: string) => origem + base + p
  return { ...manifestoDoPainel('x', base, origem), name: 'SemReservas · Painel do dono', short_name: 'Meu painel', description: 'Resumo, atendimento, Clube e cardápio do restaurante', start_url: abs('#/dono'), id: abs('#/dono') }
}
export const registrarPwa = (token: string) => registrar(manifestoDoPainel(token, import.meta.env.BASE_URL, location.origin))
export const registrarPwaDono = () => registrar(manifestoDoDono(import.meta.env.BASE_URL, location.origin))
async function registrar(manifesto: unknown) {
  const base = import.meta.env.BASE_URL
  const url = URL.createObjectURL(new Blob([JSON.stringify(manifesto)], { type: 'application/manifest+json' }))
  let l = document.querySelector<HTMLLinkElement>('link[rel=manifest]'); if (!l) { l = document.createElement('link'); l.rel = 'manifest'; document.head.appendChild(l) }
  l.href = url
  if ('serviceWorker' in navigator) { try { await navigator.serviceWorker.register(base + 'sw.js', { scope: base }) } catch { /* sem suporte: o painel funciona no navegador do mesmo jeito */ } }
}

// Tela cheia: os navegadores só a liberam depois de um toque do usuário, por isso existe a tela de boas-vindas.
type ElFS = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type DocFS = Document & { webkitFullscreenElement?: Element | null }

/** Só faz sentido no celular/tablet (toque). No computador a tela cheia atrapalha. */
export const ehAparelhoDeToque = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
export const emTelaCheia = () => !!(document.fullscreenElement || (document as DocFS).webkitFullscreenElement)
/** iPhone não tem API de tela cheia para páginas (iPad e Android têm). */
export const ehIphone = () => /iPhone|iPod/.test(navigator.userAgent)

/** Chame DENTRO do tratador de toque. Devolve true se entrou em tela cheia. */
export async function entrarTelaCheia(): Promise<boolean> {
  if (!ehAparelhoDeToque() || emTelaCheia()) return emTelaCheia()
  const el = document.documentElement as ElFS
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' })
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen()
    else return false
    try { await (screen.orientation as unknown as { lock?: (o: string) => Promise<void> }).lock?.('portrait') } catch { /* nem todo navegador permite */ }
    return emTelaCheia()
  } catch { return false }
}

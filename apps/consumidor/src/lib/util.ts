/** Curtidas de demonstração: base estável por item + a do próprio aparelho. Não representa pessoas únicas. */
export const baseCurtidas = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return 40 + (h % 120) }
export const media = (f: string) => import.meta.env.BASE_URL + f

type ElRa = EventTarget & { arModes: string; canActivateAR: boolean; activateAR(): Promise<void>; updateComplete: Promise<boolean> }
const dorme = (ms: number) => new Promise(r => setTimeout(r, ms))
/** Espera o componente avisar que a RA começou ('session-started') ou falhou, até `ms`. */
function esperaRa(el: ElRa, ms: number): Promise<boolean> {
  return new Promise(res => {
    const f = (e: Event) => { const s = (e as CustomEvent).detail?.status; if (s === 'session-started' || s === 'object-placed') fim(true); else if (s === 'failed') fim(false) }
    const fim = (v: boolean) => { clearTimeout(t); el.removeEventListener('ar-status', f); res(v) }
    const t = setTimeout(() => fim(false), ms); el.addEventListener('ar-status', f)
  })
}

/** Abre a realidade aumentada sem nunca deixar o toque "morto".
 *  1) tenta o modo preferido (no Android, o Scene Viewer do Google: projeta na superfície apontada, em tamanho real);
 *  2) se em ~2 s a página continua aqui (o app do Google não abriu), tenta sozinho o modo do navegador (WebXR),
 *     ainda dentro da janela do toque, e CONFIRMA que a sessão começou; 3) se nada servir, explica o que fazer. */
export async function abrirRa(el: ElRa, aviso: (m: string) => void, espera = 1800): Promise<'aberto' | 'reserva' | 'falhou'> {
  let saiu = false; const sai = () => { saiu = true }
  document.addEventListener('visibilitychange', sai); addEventListener('pagehide', sai); addEventListener('blur', sai)
  const limpa = () => { document.removeEventListener('visibilitychange', sai); removeEventListener('pagehide', sai); removeEventListener('blur', sai) }
  try {
    aviso('Abrindo a realidade aumentada…')
    try { await el.activateAR() } catch { /* tenta a reserva abaixo */ }
    await dorme(espera); limpa()
    if (saiu || document.visibilityState === 'hidden') { aviso(''); return 'aberto' }
    const modos = el.arModes.split(/\s+/).filter(m => m !== 'scene-viewer')
    if (modos.length) {
      el.arModes = modos.join(' '); try { await el.updateComplete } catch { /* ignora */ }
      await dorme(700)                                   // o componente reavalia os modos de forma assíncrona
      if (el.canActivateAR) {
        const comecou = esperaRa(el, 2500)
        try { await el.activateAR() } catch { /* o resultado vem do evento */ }
        if (await comecou) { aviso('Aponte a câmera para a mesa e mova o celular devagar. Quando a superfície aparecer, toque para colocar o prato.'); return 'reserva' }
      }
    }
    aviso('Não consegui abrir a câmera de realidade aumentada neste aparelho. Use o Chrome (Android) ou o Safari (iPhone), com o app do Google atualizado.')
    return 'falhou'
  } finally { limpa() }
}

/** O navegador faz RA pelo WebXR? (checagem leve: não carrega a biblioteca 3D) */
export async function webxrArDisponivel(): Promise<boolean> {
  try { const x = (navigator as unknown as { xr?: { isSessionSupported(m: string): Promise<boolean> } }).xr; return !!x && await x.isSessionSupported('immersive-ar') } catch { return false }
}

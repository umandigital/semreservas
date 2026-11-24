// Sinal sonoro dos painéis (dono e equipe): ALTO e INTERMITENTE. O navegador só libera som depois de um toque do usuário (botão "Ativar alerta").
export type PadraoAlerta = { volume: number; interval_s: number; escalate_s: number }
export const PADRAO: PadraoAlerta = { volume: 10, interval_s: 4, escalate_s: 60 }
let ctx: AudioContext | null = null
export const alertaAtivo = () => !!ctx && ctx.state === 'running'
export const contexto = () => ctx
let viva = false
export async function ativarAlerta(volume = 10): Promise<boolean> {
  try {
    ctx = ctx ?? new AudioContext(); await ctx.resume()
    if (!viva) {   // som contínuo quase inaudível: ajuda o navegador a não adormecer a aba quando a janela está minimizada ou coberta
      const o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0.0001; o.frequency.value = 40; o.connect(g); g.connect(ctx.destination); o.start(); viva = true
    }
    tocar(false, volume); return ctx.state === 'running'
  } catch { return false }
}
/** Relógio em Web Worker: não sofre a pausa que os navegadores aplicam a abas em segundo plano (minimizadas ou cobertas). */
export function relogio(cb: () => void): () => void {
  try {
    const w = new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(1),1000)'], { type: 'text/javascript' })))
    w.onmessage = cb; return () => w.terminate()
  } catch { const t = setInterval(cb, 1000); return () => clearInterval(t) }
}
/** Chamado novo: três toques agudos seguidos. Sem atendimento (urgente): sirene grave e mais longa. Volume de 1 a 10. */
export function tocar(urgente: boolean, volume = 10) {
  const c = ctx; if (!c || c.state !== 'running') return
  const v = Math.max(1, Math.min(10, volume)); const ganho = 0.12 + 0.88 * (v / 10)
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 6; comp.connect(c.destination)
  const t0 = c.currentTime
  const notas: [number, number][] = urgente ? [[880, 0], [660, 0.24], [880, 0.48], [660, 0.72], [880, 0.96], [660, 1.2]] : [[1319, 0], [988, 0.17], [1319, 0.34], [988, 0.51], [1319, 0.68], [988, 0.85]]
  const dur = urgente ? 0.22 : 0.15
  for (const [f, dt] of notas) {
    const o = c.createOscillator(), g = c.createGain(); o.type = urgente ? 'sawtooth' : 'square'; o.frequency.value = f
    g.gain.setValueAtTime(ganho, t0 + dt); g.gain.exponentialRampToValueAtTime(0.001, t0 + dt + dur)
    o.connect(g); g.connect(comp); o.start(t0 + dt); o.stop(t0 + dt + dur + 0.01)
  }
  navigator.vibrate?.(urgente ? [400, 150, 400, 150, 400] : [200, 100, 200])
}
export const bip = tocar

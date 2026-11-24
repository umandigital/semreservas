// Sons curtos da Roleta (só depois de um toque do usuário: o toque em "Girar" libera o som). Respeitam o botão "Som".
let ctx: AudioContext | null = null
const c = () => { try { ctx = ctx ?? new AudioContext(); if (ctx.state === 'suspended') void ctx.resume(); return ctx } catch { return null } }
function nota(f: number, t: number, dur: number, tipo: OscillatorType = 'triangle', ganho = 0.25) {
  const a = c(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = tipo; o.frequency.value = f
  g.gain.setValueAtTime(ganho, a.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + dur); o.connect(g); g.connect(a.destination); o.start(a.currentTime + t); o.stop(a.currentTime + t + dur + 0.02)
}
/** Cliques que desaceleram, como a roda parando (no máximo 3 por segundo no fim: nada de piscar ou som frenético). */
export const somGirar = () => { let t = 0; for (let i = 0; i < 22; i++) { nota(520 + (i % 2) * 90, t, 0.05, 'square', 0.12); t += 0.06 + i * 0.012 } }
export const somEtapa = () => { nota(784, 0, 0.14); nota(1047, 0.14, 0.3) }
export const somVitoria = () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.16, 0.28, 'triangle', 0.3)) }

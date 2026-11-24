// Sinal sonoro do painel do proprietário. O navegador só libera som depois de um toque do usuário: por isso o botão "Ativar alerta".
let ctx: AudioContext | null = null
export const alertaAtivo = () => !!ctx && ctx.state === 'running'
export async function ativarAlerta(): Promise<boolean> {
  try { ctx = ctx ?? new AudioContext(); await ctx.resume(); bip(false); return ctx.state === 'running' } catch { return false }
}
/** Dois tons agudos para chamado novo; tons graves e mais longos para chamado sem atendimento (urgente). */
export function bip(urgente: boolean) {
  const c = ctx; if (!c || c.state !== 'running') return
  const t0 = c.currentTime; const notas = urgente ? [523, 392, 523, 392] : [988, 1319]
  notas.forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; o.type = urgente ? 'sawtooth' : 'square'
    g.gain.setValueAtTime(urgente ? 0.5 : 0.4, t0 + i * 0.22); g.gain.exponentialRampToValueAtTime(0.001, t0 + i * 0.22 + 0.2)
    o.connect(g); g.connect(c.destination); o.start(t0 + i * 0.22); o.stop(t0 + i * 0.22 + 0.21)
  })
  navigator.vibrate?.([200, 100, 200])
}

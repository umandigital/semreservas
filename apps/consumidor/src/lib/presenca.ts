import type { Local } from './api'

/** Identificador aleatório deste aparelho (não identifica a pessoa). Serve para limitar abuso e bloquear trote. */
export function aparelhoId(): string {
  try { let d = localStorage.getItem('sr-aparelho'); if (!d || d.length < 8) { d = crypto.randomUUID(); localStorage.setItem('sr-aparelho', d) } return d } catch { return crypto.randomUUID() }
}

export type Estado = 'concedida' | 'negada' | 'pergunta' | 'indisponivel'
export async function estadoLocalizacao(): Promise<Estado> {
  if (!('geolocation' in navigator)) return 'indisponivel'
  try { const r = await navigator.permissions?.query({ name: 'geolocation' as PermissionName }); return r ? (r.state === 'granted' ? 'concedida' : r.state === 'denied' ? 'negada' : 'pergunta') : 'pergunta' } catch { return 'pergunta' }
}

/** Posição do aparelho NESTE momento (só para o servidor confirmar que está no restaurante; nada é guardado). */
export function posicaoAtual(): Promise<Local | null> {
  return new Promise(res => {
    if (!('geolocation' in navigator)) return res(null)
    navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lon: p.coords.longitude }), () => res(null), { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 })
  })
}

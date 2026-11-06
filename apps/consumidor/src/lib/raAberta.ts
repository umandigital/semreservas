// Enquanto a RA própria está aberta, o 3D do feed (outro contexto WebGL) é desmontado: sem isso o aparelho renderiza duas cenas 3D e trava.
import { useSyncExternalStore } from 'react'
let aberta = false
const ouvintes = new Set<() => void>()
export const definirRaAberta = (v: boolean) => { if (aberta === v) return; aberta = v; ouvintes.forEach(f => f()) }
export const useRaAberta = () => useSyncExternalStore(f => { ouvintes.add(f); return () => { ouvintes.delete(f) } }, () => aberta, () => false)

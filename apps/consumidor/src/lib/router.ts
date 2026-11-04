import { useEffect, useState } from 'react'
// Rotas por # (#/cardapio): funcionam em hospedagem comum sem regras de servidor.
// O /r/{token} da placa é resolvido uma vez e vira #/ com a mesa guardada na sessão.
const atual = () => (location.hash.replace(/^#/, '') || '/')
export function useRota(): [string, (r: string) => void] {
  const [r, setR] = useState(atual)
  useEffect(() => { const f = () => setR(atual()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return [r, (n: string) => { location.hash = n }]
}
const MESA = 'sr-mesa'
export const getMesa = (): string | null => { try { return sessionStorage.getItem(MESA) } catch { return null } }
export const setMesa = (m: string | null) => { try { m ? sessionStorage.setItem(MESA, m) : sessionStorage.removeItem(MESA) } catch { /* ignora */ } }

const TOKEN = 'sr-placa', FIX = 'sr-mesa-fix', SLUG = 'sr-slug'
const ss = (k: string) => { try { return sessionStorage.getItem(k) } catch { return null } }
const sset = (k: string, v: string | null) => { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k) } catch { /* ignora */ } }
export const getToken = () => ss(TOKEN)
export const setToken = (t: string | null) => sset(TOKEN, t)
export const getMesaFix = () => ss(FIX)
export const setMesaFix = (m: string | null) => sset(FIX, m)
export const getSlug = () => ss(SLUG) || (import.meta.env.VITE_DEFAULT_TENANT as string) || 'gastropub'
export const setSlug = (s: string) => sset(SLUG, s)

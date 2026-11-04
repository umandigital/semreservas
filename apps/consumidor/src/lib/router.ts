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

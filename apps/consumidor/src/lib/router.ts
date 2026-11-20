import { useEffect, useState } from 'react'
// Rotas por # (#/cardapio): funcionam em hospedagem comum sem regras de servidor.
// O /r/{token} da placa é resolvido uma vez e vira #/ com a mesa guardada na sessão.
/** Lê a tela a partir do hash. Hash que NÃO começa com "/" não é tela do app (ex.: o #model-viewer-no-ar-fallback que o componente
 *  de RA usa como sinal): é ignorado, para não derrubar o cardápio e reiniciar no primeiro prato. */
export const lerRota = (hash: string, anterior = '/'): string => { const h = hash.replace(/^#/, ''); return h === '' ? '/' : h.startsWith('/') ? h : anterior }
const atual = (anterior = '/') => lerRota(location.hash, anterior)
export function useRota(): [string, (r: string) => void] {
  const [r, setR] = useState(() => atual())
  useEffect(() => { const f = () => setR(a => atual(a)); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return [r, (n: string) => { location.hash = n }]
}
// Sessão da mesa: guardada no aparelho por 90 minutos (renova a cada toque na placa), para valer entre abas e depois de fechar o navegador.
// Vencida, o app pede para encostar de novo na placa. (A validação no servidor entra com a migração de sessões.)
export const SESSAO_MS = 90 * 60 * 1000
export const lerSessao = (k: string): string | null => {
  try {
    const r = localStorage.getItem('sr:' + k); if (!r) return null
    const o = JSON.parse(r) as { v: string; ate: number }
    if (!o || typeof o.ate !== 'number' || Date.now() > o.ate) { localStorage.removeItem('sr:' + k); return null }
    return o.v
  } catch { try { return sessionStorage.getItem(k) } catch { return null } }
}
export const gravarSessao = (k: string, v: string | null) => {
  try { if (v) localStorage.setItem('sr:' + k, JSON.stringify({ v, ate: Date.now() + SESSAO_MS })); else localStorage.removeItem('sr:' + k) }
  catch { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k) } catch { /* ignora */ } }
}
const MESA = 'sr-mesa'
export const getMesa = (): string | null => lerSessao(MESA)
export const setMesa = (m: string | null) => gravarSessao(MESA, m)

const TOKEN = 'sr-placa', FIX = 'sr-mesa-fix', SLUG = 'sr-slug'
const ss = lerSessao
const sset = gravarSessao
export const getToken = () => ss(TOKEN)
export const setToken = (t: string | null) => sset(TOKEN, t)
export const getMesaFix = () => ss(FIX)
export const setMesaFix = (m: string | null) => sset(FIX, m)
export const getSlug = () => ss(SLUG) || (import.meta.env.VITE_DEFAULT_TENANT as string) || 'gastropub'
export const setSlug = (s: string) => sset(SLUG, s)

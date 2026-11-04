import { useEffect, useState } from 'react'
import { esgotadosPublicos } from './api'
import { getSlug } from './router'

/** Itens que acabaram hoje (marcados pela equipe). Atualiza sozinho a cada 10 s e ao voltar para a aba. */
export function useEsgotados(): string[] {
  const [ids, setIds] = useState<string[]>([])
  useEffect(() => {
    let vivo = true
    const carregar = () => { esgotadosPublicos(getSlug()).then(v => vivo && setIds(v)).catch(() => { /* mantém o último estado */ }) }
    carregar(); const t = setInterval(carregar, 10000)
    const vis = () => { if (!document.hidden) carregar() }
    document.addEventListener('visibilitychange', vis)
    return () => { vivo = false; clearInterval(t); document.removeEventListener('visibilitychange', vis) }
  }, [])
  return ids
}

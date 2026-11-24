import { useEffect, useState } from 'react'
import { esgotadosPublicos, menuPublico } from './api'
import { aplicarMenu } from '../data/cardapio'
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

/** Cardápio vindo do servidor (preços e itens do painel). Atualiza ao abrir e ao voltar para a aba; devolve um número que muda quando o cardápio muda. */
export function useMenuServidor(): number {
  const [v, setV] = useState(0)
  useEffect(() => {
    let vivo = true
    const carregar = () => { menuPublico(getSlug()).then(r => { if (vivo && r.length) { aplicarMenu(r); setV(x => x + 1) } }).catch(() => { /* fica o cardápio embutido */ }) }
    carregar(); const vis = () => { if (!document.hidden) carregar() }
    document.addEventListener('visibilitychange', vis)
    return () => { vivo = false; document.removeEventListener('visibilitychange', vis) }
  }, [])
  return v
}

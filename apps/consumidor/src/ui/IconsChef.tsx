import type { ReactNode } from 'react'

/** Ícones das etapas da Roleta do Chef (utensílios de cozinha). O nome da etapa é dado do restaurante; o que não tiver ícone usa o "ok". */
const P: Record<string, ReactNode> = {
  panela: <><path d="M4 10h16v7a3 3 0 01-3 3H7a3 3 0 01-3-3z" /><path d="M2 11h2M20 11h2M8 7c0-1.4 1-1.8 1-3M12 7c0-1.4 1-1.8 1-3M16 7c0-1.4 1-1.8 1-3" /></>,
  faca: <><path d="M5 19L15 9c2-2 5-3 5-3s-1 3-3 5l-4 4z" /><path d="M4 20l2.5-2.5" /></>,
  fogao: <><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="9" cy="8" r="1.8" /><circle cx="15" cy="8" r="1.8" /><circle cx="9" cy="14" r="1.8" /><circle cx="15" cy="14" r="1.8" /><path d="M7 18.5h10" /></>,
  forno: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M7 6.5h.01M11 6.5h.01" /><rect x="6.5" y="12" width="11" height="5" rx="1" /></>,
  prato: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.2" /></>,
  chef: <><path d="M7.5 19v-3.2A4.2 4.2 0 016 7.6a4.2 4.2 0 018-1.6 4.2 4.2 0 014 3.9 4.2 4.2 0 01-1.5 5.9V19z" /><path d="M7.5 19h9" /></>,
  ok: <path d="M5 12l5 5 9-10" />,
}
const chave = (n: string) => n.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
export function IconeEtapa({ nome, tam = 24 }: { nome: string; tam?: number }) {
  const k = chave(nome)
  return <svg viewBox="0 0 24 24" width={tam} height={tam} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[k] ?? P.ok}</svg>
}
/** Mesmo desenho, para dentro de um <svg> (a roda): posicionado pelo centro. */
export const IconeEtapaSvg = ({ nome, tam }: { nome: string; tam: number }) => <g transform={`translate(${-tam / 2} ${-tam / 2}) scale(${tam / 24})`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{P[chave(nome)] ?? P.ok}</g>
export const IconChef = ({ tam = 24 }: { tam?: number }) => <IconeEtapa nome="chef" tam={tam} />

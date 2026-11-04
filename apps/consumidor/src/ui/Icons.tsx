import type { ReactNode } from 'react'
const I = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>)
export const IconHome = () => <I><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></I>
export const IconCardapio = () => <I><path d="M4 4h16v16H4z" /><path d="M8 9h8M8 13h8M8 17h5" /></I>
export const IconLista = () => <I><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></I>
export const IconPrancheta = () => <I><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 11h6M9 15h4" /></I>
export const IconSino = () => <I><path d="M6 17V11a6 6 0 0112 0v6l2 2H4z" /><path d="M10 21h4" /></I>
export const IconWifi = () => <I><path d="M2 9a15 15 0 0120 0M5 13a10 10 0 0114 0M8.5 16.5a5 5 0 017 0" /><circle cx="12" cy="20" r="1" /></I>
export const IconInsta = () => <I><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></I>
export const IconEstrela = () => <I><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></I>
export const IconBusca = () => <I><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></I>
export const IconVoltar = () => <I><path d="M15 5l-7 7 7 7" /></I>
export const IconMais = () => <I><path d="M12 5v14M5 12h14" /></I>
export const IconMenos = () => <I><path d="M5 12h14" /></I>
export const IconCheck = () => <I><path d="M5 12l5 5 9-10" /></I>

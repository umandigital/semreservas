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
export const IconEstrela = ({ cheio = false }: { cheio?: boolean }) => <svg viewBox="0 0 24 24" width="24" height="24" fill={cheio ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" /></svg>
export const IconBusca = () => <I><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></I>
export const IconVoltar = () => <I><path d="M15 5l-7 7 7 7" /></I>
export const IconMais = () => <I><path d="M12 5v14M5 12h14" /></I>
export const IconMenos = () => <I><path d="M5 12h14" /></I>
export const IconCheck = () => <I><path d="M5 12l5 5 9-10" /></I>
export const IconCoracao = ({ cheio = false }: { cheio?: boolean }) => <svg viewBox="0 0 24 24" width="24" height="24" fill={cheio ? '#ff4d6d' : 'none'} stroke={cheio ? '#ff4d6d' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.5-9 9-9 9z" /></svg>
export const IconBalao = () => <I><path d="M4 5h16v11H9l-5 4z" /></I>
export const IconEnviar = () => <I><path d="M5 12l15-8-5 17-3-7z" /><path d="M12 14l8-10" /></I>
export const IconUsuario = () => <I><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></I>
export const IconPresente = () => <I><rect x="3" y="9" width="18" height="12" rx="1" /><path d="M12 9v12M3 13h18M12 9c-3 0-5-1-5-3s3-3 5 3c2-6 5-5 5-3s-2 3-5 3" /></I>
export const IconCamera = () => <I><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13.5" r="3.5" /></I>
export const IconPesquisa = () => <I><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h4" /></I>
export const IconInfo = () => <I><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></I>
export const IconConta = () => <I><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></I>
export const IconCompartilhar = () => <I><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></I>
export const IconCubo = () => <I><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" /></I>

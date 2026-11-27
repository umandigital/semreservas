import type { ReactNode } from 'react'
// Ícones de traço do design system v2 (contorno de 1.7, 24 px, herdam a cor do texto).
const I = ({ children, f = false }: { children: ReactNode; f?: boolean }) => <svg viewBox="0 0 24 24" width="24" height="24" fill={f ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
export const IcCloche = () => <I><path d="M3 17h18" /><path d="M5 17a7 7 0 0114 0" /><path d="M12 7V5.5M10.5 5.5h3" /><path d="M2.5 20.5h19" /></I>
export const IcClube = () => <I><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M12 8.6l1.1 2.3 2.5.3-1.8 1.7.5 2.5-2.3-1.3-2.3 1.3.5-2.5-1.8-1.7 2.5-.3z" /></I>
export const IcFoto = () => <I><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4" /></I>
export const IcInsta = () => <I><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></I>
export const IcG = () => <I><path d="M20.5 12.2H12v3.3h4.9A5.2 5.2 0 1112 6.8c1.3 0 2.4.5 3.3 1.2l2.3-2.3A8.4 8.4 0 1012 20.4c4.7 0 8.5-3.2 8.5-8.2z" /></I>
export const IcEstrela = ({ f = false }: { f?: boolean }) => <I f={f}><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" /></I>
export const IcRoleta = () => <I><circle cx="12" cy="11" r="7" /><circle cx="12" cy="11" r="1.4" /><path d="M12 4v14M5 11h14M7 6l10 10M17 6L7 16" /><path d="M8 21l4-3 4 3" /></I>
export const IcBolo = () => <I><path d="M5 20h14v-6H5z" /><path d="M5 14c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0" /><path d="M12 11V8M9 11V8M15 11V8" /><path d="M9 5.4v.1M12 5.4v.1M15 5.4v.1" /></I>
export const IcInicio = ({ f = false }: { f?: boolean }) => <I f={f}><path d="M3.5 11.2L12 3.8l8.5 7.4" /><path d="M5.5 10v10h13V10" /></I>
export const IcGarfo = () => <I><path d="M7 3v7M5 3v5a2 2 0 004 0V3M7 10v11" /><path d="M17 21V3c-2.4 1.4-3.6 4-3.6 7.4 0 1.6 1.4 2.6 3.6 2.6" /></I>
export const IcPedido = () => <I><rect x="5" y="4.5" width="14" height="16.5" rx="2.5" /><path d="M9 4.5V3.5h6v1M9 11h6M9 15h6" /></I>
export const IcInfo = () => <I><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.8v.2" /></I>
export const IcSeta = () => <I><path d="M5 12h14M13 6l6 6-6 6" /></I>
export const IcDir = () => <I><path d="M9 5l7 7-7 7" /></I>
export const IcCima = () => <I><path d="M6 14l6-6 6 6" /></I>
export const IcBaixo = () => <I><path d="M6 9l6 6 6-6" /></I>
export const IcCoracao = ({ f = false }: { f?: boolean }) => <I f={f}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.4a4.3 4.3 0 017.5 2.4C19.5 15.4 12 20 12 20z" /></I>
export const IcBalao = () => <I><path d="M20 11.5a7.5 7.5 0 01-11 6.6L4 19.5l1.5-4.3A7.5 7.5 0 1120 11.5z" /></I>
export const IcEnviar = () => <I><path d="M20.5 4L3.5 11l6 2.5M20.5 4l-5.5 16-5.5-6.5M20.5 4l-11 9.5" /></I>
export const IcTela = () => <I><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></I>
export const IcCarteira = () => <I><path d="M4 7.5A2.5 2.5 0 016.5 5H18v3" /><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M20.5 12.5h-4a1.5 1.5 0 000 3h4" /></I>
export const IcRelogio = () => <I><path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7L4 9" /><path d="M4 4v5h5M12 8v4.5l3 1.5" /></I>
export const IcTicket = () => <svg viewBox="0 0 48 48" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 17l30-6 4 17-30 6z" transform="rotate(-6 24 24)" /><path d="M17 27l12-9" /><circle cx="18" cy="19" r="2" /><circle cx="28" cy="27" r="2" /></svg>
export const IcChapeu = () => <svg viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 70c-8-6-10-18-2-26 4-4 9-5 13-4 2-9 11-14 20-12 8 2 13 8 13 14 8-2 15 3 16 11 1 8-4 14-11 15" /><path d="M24 70h52v10H24z" /><path d="M36 44v26M50 40v30M64 44v26" /></svg>

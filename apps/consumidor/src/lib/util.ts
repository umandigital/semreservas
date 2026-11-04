/** Curtidas de demonstração: base estável por item + a do próprio aparelho. Não representa pessoas únicas. */
export const baseCurtidas = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return 40 + (h % 120) }
export const media = (f: string) => import.meta.env.BASE_URL + f

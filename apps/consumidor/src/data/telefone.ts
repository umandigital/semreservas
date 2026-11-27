// Celular brasileiro: só dígitos para validar, máscara para mostrar. A validação do servidor é a mesma (migração 0018).
export const soDigitos = (t: string) => t.replace(/\D/g, '')
/** Aceita 11 dígitos (DDD + 9 + 8 números) ou 13 com o 55 na frente. */
export const celularValido = (t: string): boolean => { let d = soDigitos(t); if (d.length === 13 && d.startsWith('55')) d = d.slice(2); return /^[1-9][0-9]9[0-9]{8}$/.test(d) }
/** (11) 91234-5678, enquanto a pessoa digita. */
export const mascaraCelular = (t: string): string => {
  let d = soDigitos(t); if (d.startsWith('55') && d.length > 11) d = d.slice(2); d = d.slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
/** (11) 9****-5678: o número inteiro só aparece quando a pessoa edita. */
export const celularEscondido = (e164: string): string => { const d = soDigitos(e164).slice(-11); return d.length === 11 ? `(${d.slice(0, 2)}) ${d[2]}****-${d.slice(7)}` : '' }

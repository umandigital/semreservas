// Tema do restaurante: tudo é dado (cores, logo, textos). Trocar aqui não exige mexer nas telas.
// GastroPub (teste): vinho, terracota e creme, com texto creme sobre vinho (contraste alto).
export const TEMA = {
  nome: 'SemReservas GastroPub',
  logo: 'media/marca/gastropub-logo.webp',
  slogan: 'Um toque. Infinitas possibilidades.',
  cores: {
    '--bg': '#380818', '--bg0': '#1f0510', '--bg2': '#4a1226', '--bg3': '#5e1b34', '--borda': '#7a3050',
    '--laranja': '#e09060', '--txt': '#f8e8c8', '--mut': '#ecd5b0',
  } as Record<string, string>,
}
export function aplicarTema(raiz: HTMLElement = document.documentElement) {
  for (const [k, v] of Object.entries(TEMA.cores)) raiz.style.setProperty(k, v)
}

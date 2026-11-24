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

/** Molduras de foto do restaurante: textos são dados. Se existir `png` (arte SEM TEXTO, com janela transparente para a foto, em public/media/molduras), ela é usada no lugar do desenho e o app escreve título, frase e nome por cima (cor em `corTexto`). */
export type MolduraCfg = { id: string; nome: string; titulo: string[]; rodape: string; estilo: 'quadro' | 'placa' | 'vitral'; png?: string; corTexto?: string }
export const MOLDURAS: MolduraCfg[] = [
  { id: 'demos', nome: 'Demos prejuízo', titulo: ['Demos', 'prejuízo!'], rodape: 'E ainda pedimos a saideira.', estilo: 'quadro' },
  { id: 'mesa', nome: 'À mesa', titulo: ['O melhor da vida', 'acontece à mesa.'], rodape: 'E a nossa foi aqui.', estilo: 'placa' },
  { id: 'saideira', nome: 'Saideira', titulo: ['Era só uma', 'saideira.'], rodape: 'Virou história.', estilo: 'vitral' },
]

// Tema do restaurante: tudo é dado (cores, logo, textos). Trocar aqui não exige mexer nas telas.
// GastroPub (teste): vinho, terracota e creme, com texto creme sobre vinho (contraste alto).
export const TEMA = {
  nome: 'SemReservas GastroPub',
  logo: 'media/marca/gastropub-logo.webp',
  slogan: 'Um toque. Infinitas possibilidades.',
  /** Fotos do ambiente que passam no topo da Início (WebP pequeno em public/media/ambiente). A primeira é a que aparece sem animação. */
  ambiente: [{ img: 'media/ambiente/bar.webp' }, { img: 'media/ambiente/mesa.webp' }, { img: 'media/ambiente/fachada.webp' }, { img: 'media/ambiente/salao.webp' }] as { img: string; link?: string; alt?: string }[],   // link opcional: vira um slide promocional
  /** Banner do convite ao Clube (1200x360, sem texto; opcional). O texto e o botão são escritos pelo app. */
  bannerClube: '' as string, bannerClubeTexto: '#f7e9d0',
  conviteTitulo: 'Seu próximo prato por nossa conta',
  ambienteTitulo: 'Uma experiência para viver aqui',
  heroTitulo: 'Sem Reservas', heroSub: 'GASTROPUB',
  logoTransp: 'media/marca/logo-transparente.webp', chapeu: 'media/marca/chapeu.webp',
  cores: {
    // Design system v2 (tokens do tema GastroPub): canvas, superfície, divisor, ação, texto
    '--bg': '#290f19', '--bg0': '#1d0911', '--bg2': '#3a1a24', '--bg3': '#4d2733', '--borda': '#775462',
    '--laranja': '#e99361', '--txt': '#f7e9d0', '--mut': '#e2c3bd', '--ativo': '#ffb58c', '--acao2': '#994d31', '--vidro': 'rgb(62 30 40 / 78%)', '--vidro-solido': '#3e1e28', '--pontos': '#ffcf6f', '--ok-t': '#a8edc0',
  } as Record<string, string>,
}
export function aplicarTema(raiz: HTMLElement = document.documentElement) {
  for (const [k, v] of Object.entries(TEMA.cores)) raiz.style.setProperty(k, v)
}

/** Molduras de foto do restaurante: textos são dados. Se existir `png` (arte SEM TEXTO, com janela transparente para a foto, em public/media/molduras), ela é usada no lugar do desenho e o app escreve título, frase e nome por cima (cor em `corTexto`). */
export type MolduraCfg = { id: string; nome: string; titulo: string[]; rodape: string; estilo: 'quadro' | 'placa' | 'vitral'; png?: string; corTexto?: string; corRodape?: string; corNome?: string; janela?: { x: number; y: number; w: number; h: number }; layout?: Partial<{ tituloY: number; tituloPasso: number; tituloTam: number; rodapeY: number; rodapeTam: number; nomeY: number; nomeTam: number }> }
export const MOLDURAS: MolduraCfg[] = [
  { id: 'demos', nome: 'Demos prejuízo', titulo: ['Demos', 'prejuízo!'], rodape: 'E ainda pedimos a saideira.', estilo: 'quadro', png: 'media/molduras/demos.webp', corTexto: '#f3e8d0', layout: { tituloY: 215, tituloPasso: 95, tituloTam: 86, rodapeY: 1104, rodapeTam: 40, nomeY: 1268, nomeTam: 42 } },
  { id: 'mesa', nome: 'À mesa', titulo: ['O melhor da vida', 'acontece à mesa.'], rodape: 'E a nossa foi aqui.', estilo: 'placa', png: 'media/molduras/mesa.webp', corTexto: '#3b1a0a', corRodape: '#3b1a0a', janela: { x: 58, y: 418, w: 784, h: 598 }, layout: { tituloY: 214, tituloPasso: 78, tituloTam: 62, rodapeY: 1121, rodapeTam: 44, nomeY: 1268, nomeTam: 42 } },
  { id: 'saideira', nome: 'Saideira', titulo: ['Era só uma', 'saideira.'], rodape: 'Virou história.', estilo: 'vitral', png: 'media/molduras/saideira.webp', corTexto: '#f3e8d0', corRodape: '#3b1a0a', janela: { x: 61, y: 425, w: 779, h: 579 }, layout: { tituloY: 238, tituloPasso: 86, tituloTam: 74, rodapeY: 1114, rodapeTam: 44, nomeY: 1255, nomeTam: 40 } },
]

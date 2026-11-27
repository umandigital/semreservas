// Comentários de EXEMPLO para a demonstração (o restaurante real mostra só os que o dono publicou). Determinísticos por prato.
export type ComentarioEx = { autor: string; texto: string; quando: string }
const AUTORES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabi', 'Henrique', 'Isabela', 'João']
const QUANDO = ['hoje', 'ontem', 'há 2 dias', 'há 3 dias', 'há 1 semana', 'há 2 semanas']
const POR_CATEGORIA: Record<string, string[]> = {
  'Hambúrgueres': ['Pão macio e carne no ponto, voltaria só por ele.', 'O molho da casa faz toda a diferença.', 'Generoso e saiu bem quente na mesa.', 'Melhor da casa, peço sempre.'],
  'Pizzas': ['Massa leve e borda crocante.', 'Chegou rápido e bem quente.', 'Dá para dividir em dois com folga.', 'Muito queijo, do jeito que eu gosto.'],
  'Massas': ['Massa fresca e molho bem temperado.', 'Porção generosa, saí satisfeito.', 'Ponto da massa perfeito.'],
  'Petiscos': ['Ótimo para começar a mesa.', 'Crocante por fora e macio por dentro.', 'Bom para dividir com os amigos.'],
  'Porções': ['Porção farta, deu para a mesa toda.', 'Chegou sequinha e quente.', 'Vale cada centavo.'],
  'Bebidas': ['Bem gelado, na temperatura certa.', 'Refrescante, combina com tudo.', 'Sempre peço a segunda rodada.'],
  'Sobremesas': ['Doce na medida, fecha bem a noite.', 'Cremosa e bem apresentada.', 'Impossível pedir só uma colher.'],
}
const PADRAO = ['Gostei muito, voltarei.', 'Chegou rápido e bem apresentado.', 'Bom para dividir.', 'Atendimento atencioso.']
const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100003; return h }
export function comentariosDe(id: string, categoria: string): ComentarioEx[] {
  const base = POR_CATEGORIA[categoria] ?? PADRAO; const h = hash(id)
  return base.slice(0, 3 + (h % 2)).map((texto, k) => ({ texto, autor: AUTORES[(h + k * 3) % AUTORES.length], quando: QUANDO[(h + k * 2) % QUANDO.length] }))
}

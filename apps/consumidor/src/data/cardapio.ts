// DADOS DE TESTE do SemReservas GastroPub. Textos e preços inventados; mídias ilustrativas.
export type Item = {
  id: string; cat: string; nome: string; preco: number // centavos
  desc: string; ingredientes: string[]; img: string; video?: string; tags?: string[]
  modelo?: Modelo3D
  real?: boolean                       // mídia REAL do restaurante (vídeo próprio); os de teste com foto ilustrativa ficam depois no feed
}
/** Modelo 3D para "Projetar na mesa" (realidade aumentada). As medidas reais vêm do próprio arquivo (em metros). */
export type Modelo3D = {
  glb: string; glbAr?: string; ingredientesRa?: boolean; poster: string          // poster = render com fundo transparente (aparece enquanto o 3D carrega)
  medidas: string                      // texto para o cliente
  tamanhoM: [number, number, number]   // largura × altura × profundidade REAIS, em metros: o teste confere com o arquivo
  nota: string; orbita?: string
}
export const CATEGORIAS = ['Hambúrgueres', 'Pizzas', 'Massas', 'Testes', 'Petiscos', 'Porções', 'Bebidas', 'Sobremesas'] as const

const m = (f: string) => `media/${f}`
export const ITENS: Item[] = [
  { id: 'h1', cat: 'Hambúrgueres', nome: 'Clássico da Casa', preco: 3490, desc: 'Blend 160 g, queijo prato e maionese da casa.', ingredientes: ['Pão brioche', 'Blend bovino 160 g', 'Queijo prato', 'Alface', 'Tomate', 'Maionese da casa'], img: m('burger.webp'), video: m('burger-demo.mp4') },
  { id: 'h2', cat: 'Hambúrgueres', nome: 'Duplo Cheddar', preco: 4290, desc: 'Dois blends, cheddar cremoso e cebola caramelizada.', ingredientes: ['Pão brioche', '2 blends 120 g', 'Cheddar', 'Cebola caramelizada'], img: m('burger.webp') },
  { id: 'h3', cat: 'Hambúrgueres', nome: 'Bacon BBQ', preco: 3990, desc: 'Bacon crocante e molho barbecue defumado.', ingredientes: ['Pão brioche', 'Blend 160 g', 'Bacon', 'Molho barbecue', 'Cebola roxa'], img: m('burger.webp') },
  { id: 'h5', cat: 'Hambúrgueres', nome: 'Burger Quádruplo', preco: 6290, desc: 'Quatro carnes, cheddar, bacon e creme no pão brilhante.', ingredientes: ['Pão brioche', '4 carnes', 'Cheddar', 'Bacon', 'Creme da casa'], img: m('modelos/hamburguer-4-carnes-poster.webp'),
    modelo: { glb: m('modelos/hamburguer-4-carnes.glb'), glbAr: m('modelos/hamburguer-4-carnes-ar.glb'), poster: m('modelos/hamburguer-4-carnes-poster.webp'), medidas: 'Prato de 22 cm · 16 cm de altura', tamanhoM: [0.218, 0.157, 0.218], orbita: '30deg 68deg auto', nota: 'Imagem ilustrativa em tamanho real, com o prato. O lanche servido pode ter pequenas diferenças.' } },
  { id: 'h6', cat: 'Hambúrgueres', nome: 'Burger Rústico', preco: 4890, desc: 'Hambúrguer no pão achatado grelhado, com queijo derretido, alface, tomate e pepino.', ingredientes: ['Pão achatado grelhado', 'Hambúrguer bovino', 'Queijo derretido', 'Alface', 'Tomate', 'Pepino'], img: m('videos/burger-rustico-poster.webp'), video: m('videos/burger-rustico.mp4'), real: true },
  { id: 'h4', cat: 'Hambúrgueres', nome: 'Veggie de Grão-de-bico', preco: 3690, desc: 'Burger vegetal com tahine e folhas.', ingredientes: ['Pão brioche', 'Burger de grão-de-bico', 'Tahine', 'Rúcula', 'Tomate'], img: m('burger.webp'), tags: ['vegetariano'] },
  { id: 'p6', cat: 'Pizzas', nome: 'Pizza Carne e Abobrinha', preco: 5990, desc: 'Carne temperada, muita mussarela e abobrinha fatiada, finalizada com pimenta-do-reino.', ingredientes: ['Massa de fermentação lenta', 'Mussarela', 'Carne temperada', 'Abobrinha', 'Pimenta-do-reino'], img: m('videos/pizza-carne-abobrinha-poster.webp'), video: m('videos/pizza-carne-abobrinha.mp4'), real: true },
  { id: 'p1', cat: 'Pizzas', nome: 'Margherita', preco: 4990, desc: 'Molho de tomate, mussarela e manjericão.', ingredientes: ['Massa de fermentação lenta', 'Molho de tomate', 'Mussarela', 'Manjericão'], img: m('pizza.webp'), tags: ['vegetariano'] },
  { id: 'p2', cat: 'Pizzas', nome: 'Calabresa', preco: 5290, desc: 'Calabresa fatiada e cebola.', ingredientes: ['Massa', 'Mussarela', 'Calabresa', 'Cebola'], img: m('pizza.webp') },
  { id: 'p3', cat: 'Pizzas', nome: 'Quatro Queijos', preco: 5890, desc: 'Mussarela, provolone, gorgonzola e parmesão.', ingredientes: ['Massa', 'Mussarela', 'Provolone', 'Gorgonzola', 'Parmesão'], img: m('pizza.webp'), tags: ['vegetariano'] },
  { id: 'p4', cat: 'Pizzas', nome: 'Pizza do Pub', preco: 6190, desc: 'Costela desfiada, cheddar e cebola crispy.', ingredientes: ['Massa', 'Costela desfiada', 'Cheddar', 'Cebola crispy'], img: m('pizza.webp') },
  { id: 'p5', cat: 'Pizzas', nome: 'Meio a Meio', preco: 5690, desc: 'Metade mussarela com tomate-cereja e manjericão, metade calabresa.', ingredientes: ['Massa de fermentação lenta', 'Molho de tomate', 'Mussarela', 'Tomate-cereja', 'Manjericão', 'Calabresa'], img: m('pizza-meio-a-meio.webp'),
    modelo: { glb: m('modelos/pizza-meio-a-meio.glb'), ingredientesRa: true, poster: m('modelos/pizza-meio-a-meio-poster.webp'), medidas: '32 cm de diâmetro', tamanhoM: [0.32, 0.0345, 0.32], orbita: '20deg 60deg auto', nota: 'Imagem ilustrativa em tamanho real. O prato servido pode ter pequenas diferenças.' } },
  { id: 'm1', cat: 'Massas', nome: 'Fettuccine à Bolonhesa', preco: 4690, desc: 'Fettuccine fresco com molho bolonhesa de carne e lascas de parmesão.', ingredientes: ['Fettuccine', 'Molho bolonhesa', 'Carne moída', 'Tomate', 'Parmesão'], img: m('videos/fettuccine-bolonhesa-poster.webp'), video: m('videos/fettuccine-bolonhesa.mp4'), real: true },
  { id: 'x1', cat: 'Testes', nome: 'Hot Roll (teste de RA)', preco: 3890, desc: 'Rolinhos empanados e crocantes, recheados com salmão e cream cheese.', ingredientes: ['Arroz', 'Salmão', 'Cream cheese', 'Alga nori', 'Empanado crocante'], img: m('modelos/hot-roll-poster.webp'),
    modelo: { glb: m('modelos/hot-roll.glb'), poster: m('modelos/hot-roll-poster.webp'), medidas: 'Prato de 20 cm · 6 cm de altura', tamanhoM: [0.2, 0.0574, 0.2], orbita: '25deg 62deg auto', nota: 'Imagem ilustrativa em tamanho real, com o prato. O prato servido pode ter pequenas diferenças.' } },
  { id: 'x2', cat: 'Testes', nome: 'Prato Fotográfico (teste de RA)', preco: 4290, desc: 'Prato de teste de modelo 3D gerado a partir de foto, em tamanho real.', ingredientes: ['Item de teste de realidade aumentada'], img: m('modelos/prato-fotografico-poster.webp'),
    modelo: { glb: m('modelos/prato-fotografico.glb'), poster: m('modelos/prato-fotografico-poster.webp'), medidas: 'Prato de 27 cm · 6 cm de altura', tamanhoM: [0.27, 0.0568, 0.27], orbita: '25deg 62deg auto', nota: 'Imagem ilustrativa em tamanho real, com o prato. O prato servido pode ter pequenas diferenças.' } },
  { id: 'x3', cat: 'Testes', nome: 'Caveira Sem Base (teste)', preco: 1000, desc: 'Objeto de teste: modelo 3D feito por fotogrametria (várias fotos), não é um prato.', ingredientes: ['Item de teste de realidade aumentada'], img: m('modelos/caveira-sem-base-poster.webp'),
    modelo: { glb: m('modelos/caveira-sem-base.glb'), poster: m('modelos/caveira-sem-base-poster.webp'), medidas: 'Objeto de 10 cm de altura e 14 cm de comprimento', tamanhoM: [0.0974, 0.1, 0.1371], orbita: '0deg 78deg auto', nota: 'Imagem de teste em tamanho real, feita por fotogrametria.' } },
  { id: 'x4', cat: 'Testes', nome: 'Santi (teste de fotogrametria)', preco: 1000, desc: 'Objeto de teste: modelo 3D de pessoa feito por fotogrametria (várias fotos), em miniatura de 20 cm. Não é um prato.', ingredientes: ['Item de teste de realidade aumentada'], img: m('modelos/santi-20cm-poster.webp'),
    modelo: { glb: m('modelos/santi-20cm.glb'), poster: m('modelos/santi-20cm-poster.webp'), medidas: 'Miniatura de 20 cm de altura', tamanhoM: [0.0617, 0.2, 0.057], orbita: '30deg 70deg auto', nota: 'Imagem de teste em tamanho real, feita por fotogrametria.' } },
  { id: 'x5', cat: 'Testes', nome: 'Santi, cabeça e pescoço (teste)', preco: 1000, desc: 'Objeto de teste: modelo 3D de cabeça e pescoço feito por fotogrametria (várias fotos), com 20 cm de altura. Não é um prato.', ingredientes: ['Item de teste de realidade aumentada'], img: m('modelos/santi-cabeca-pescoco-20cm-poster.webp'),
    modelo: { glb: m('modelos/santi-cabeca-pescoco-20cm.glb'), poster: m('modelos/santi-cabeca-pescoco-20cm-poster.webp'), medidas: 'Objeto de 20 cm de altura e 16 cm de largura', tamanhoM: [0.1594, 0.2, 0.1974], orbita: '20deg 80deg auto', nota: 'Imagem de teste em tamanho real, feita por fotogrametria.' } },
  { id: 'pt1', cat: 'Petiscos', nome: 'Batatas na Tigela', preco: 2990, desc: 'Batatas fritas crocantes e douradas, servidas numa tigela para dividir.', ingredientes: ['Batata', 'Óleo vegetal', 'Sal'], img: m('modelos/batatas-tigela-poster.webp'),
    modelo: { glb: m('modelos/batatas-tigela.glb'), poster: m('modelos/batatas-tigela-poster.webp'), medidas: 'Tigela de 15 cm · 8 cm de altura', tamanhoM: [0.1615, 0.0834, 0.15], orbita: '25deg 62deg auto', nota: 'Imagem ilustrativa em tamanho real, com a tigela. A porção servida pode ter pequenas diferenças.' } },
  { id: 'a1', cat: 'Porções', nome: 'Batata Rústica', preco: 2490, desc: 'Batata com casca, alho e alecrim.', ingredientes: ['Batata', 'Alho', 'Alecrim', 'Sal'], img: m('fries.webp'), tags: ['vegetariano'] },
  { id: 'a2', cat: 'Porções', nome: 'Onion Rings', preco: 2690, desc: 'Anéis de cebola empanados com molho da casa.', ingredientes: ['Cebola', 'Empanado', 'Molho da casa'], img: m('fries.webp'), tags: ['vegetariano'] },
  { id: 'a3', cat: 'Porções', nome: 'Frango Crocante', preco: 3890, desc: 'Tiras de frango empanadas e molho de mostarda e mel.', ingredientes: ['Frango', 'Empanado', 'Mostarda e mel'], img: m('fries.webp') },
  { id: 'a4', cat: 'Porções', nome: 'Mix de Petiscos', preco: 5490, desc: 'Batata, onion rings e frango para dividir.', ingredientes: ['Batata', 'Onion rings', 'Frango crocante', '3 molhos'], img: m('fries.webp') },
  { id: 'b1', cat: 'Bebidas', nome: 'Chope Pilsen', preco: 1290, desc: 'Chope gelado, 300 ml.', ingredientes: ['Chope pilsen'], img: m('drink.webp') },
  { id: 'b2', cat: 'Bebidas', nome: 'IPA da Casa', preco: 1890, desc: 'IPA artesanal, 300 ml.', ingredientes: ['Cerveja IPA'], img: m('drink.webp') },
  { id: 'b3', cat: 'Bebidas', nome: 'Limonada Suíça', preco: 1190, desc: 'Limão com leite condensado, 400 ml.', ingredientes: ['Limão', 'Leite condensado', 'Gelo'], img: m('drink.webp'), tags: ['vegetariano'] },
  { id: 'b4', cat: 'Bebidas', nome: 'Refrigerante lata', preco: 700, desc: 'Lata 350 ml.', ingredientes: ['Refrigerante'], img: m('drink.webp'), tags: ['vegano'] },
  { id: 's1', cat: 'Sobremesas', nome: 'Brownie com Sorvete', preco: 1990, desc: 'Brownie quente e sorvete de creme.', ingredientes: ['Chocolate', 'Farinha de trigo', 'Ovos', 'Sorvete de creme'], img: m('dessert.webp'), tags: ['vegetariano'] },
  { id: 's2', cat: 'Sobremesas', nome: 'Petit Gâteau', preco: 2490, desc: 'Bolinho de chocolate com centro cremoso.', ingredientes: ['Chocolate', 'Ovos', 'Manteiga', 'Sorvete de creme'], img: m('dessert.webp'), tags: ['vegetariano'] },
  { id: 's3', cat: 'Sobremesas', nome: 'Gelato do Dia', preco: 1490, desc: 'Duas bolas do sabor do dia.', ingredientes: ['Leite', 'Açúcar', 'Sabor do dia'], img: m('gelato.webp'), tags: ['vegetariano'] },
  { id: 's4', cat: 'Sobremesas', nome: 'Torta de Limão', preco: 1690, desc: 'Torta gelada com merengue.', ingredientes: ['Limão', 'Leite condensado', 'Merengue', 'Biscoito'], img: m('dessert.webp'), tags: ['vegetariano'] },
]

/** Ordem do feed: 1º pratos com realidade aumentada (3D), 2º pratos com vídeo REAL do restaurante, 3º o resto (fotos e mídias de exemplo).
 *  Dentro de cada grupo vale a ordem de cadastro. O dono edita só os cadastros; a regra é esta. */
const rank = (i: Item) => (i.modelo ? 0 : i.real && i.video ? 1 : 2)
export const ITENS_FEED: Item[] = ITENS.map((it, n) => ({ it, n })).sort((a, b) => rank(a.it) - rank(b.it) || a.n - b.n).map(x => x.it)
/** Cardápio do servidor (painel do dono): preço, nome, "no cardápio" e itens novos valem para o cliente. Sem resposta do servidor, vale o cardápio embutido. */
export type LinhaMenu = { item_id: string; name: string; price_cents: number; active: boolean; category: string | null; description: string | null }
const BASE = [...ITENS]; const BASE_FEED = [...ITENS_FEED]
export function aplicarMenu(rows: LinhaMenu[]) {
  const por = new Map(rows.map(r => [r.item_id, r])); const cats = CATEGORIAS as readonly string[]
  const mexe = (b: Item[]) => b.filter(i => por.get(i.id)?.active !== false).map(i => { const r = por.get(i.id); return r ? { ...i, nome: r.name, preco: r.price_cents } : i })
  const novos: Item[] = rows.filter(r => r.active && !BASE.some(i => i.id === r.item_id) && r.category && cats.includes(r.category))
    .map(r => ({ id: r.item_id, cat: r.category as string, nome: r.name, preco: r.price_cents, desc: r.description ?? '', ingredientes: [], img: 'media/marca/gastropub-logo.webp' }))
  ITENS.length = 0; ITENS.push(...mexe(BASE), ...novos); ITENS_FEED.length = 0; ITENS_FEED.push(...mexe(BASE_FEED), ...novos)
}
export const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Configuração do estabelecimento (teste). Campo vazio = ação não aparece (nunca inventar destino).
export const CONFIG = {
  // Fundo padrão do restaurante para os pratos em 3D (qualquer CSS de background: cor, gradiente ou imagem).
  fundo3d: 'radial-gradient(ellipse 85% 70% at 50% 46%, #fbf8f3 0%, #eee6da 52%, #d3c7b6 100%)',
  wifi: { ssid: 'GastroPub-Guest', senha: 'teste1234' },
  instagram: 'https://www.instagram.com/semreservasgastropub/' as string,
  googleAvaliacao: 'https://g.page/r/CSVWk2-qgiadECE/review' as string,  // teste: perfil da Uman Digital (restaurante fictício não tem perfil no Google)
  mesas: ['1', '2', '3'],
}

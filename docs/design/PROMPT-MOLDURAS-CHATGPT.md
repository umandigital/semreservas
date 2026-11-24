# Prompt reutilizável: artes das molduras de foto (ChatGPT)

Serve para **qualquer restaurante**: troque só o que está entre `{{chaves}}`. Gere **uma arte por vez** (uma moldura por conversa ou por mensagem).

## O que o app espera da arte

| Item | Valor |
|---|---|
| Proporção | **2:3 em pé** (o ChatGPT gera 1024×1536, serve; o app ajusta para 900×1350) |
| Janela da foto | retângulo **vazio**, em 6,7% da esquerda, 31,9% do topo, 86,7% de largura e 44,4% de altura |
| Texto | **nenhum** na arte. O app escreve o título, a frase de baixo e o nome do restaurante por cima (são dados do restaurante, editáveis no painel) |
| Zona do título | topo, até 30% da altura: deixe **livre e escura/lisa**, sem desenho no meio |
| Zona da frase | faixa entre 80% e 88% da altura: livre |
| Zona do nome | base, últimos 8%: livre |
| Fundo da janela | cor **chapada #FF00FF (magenta)**, que depois vira transparente |

## Prompt (copie e preencha)

```
Crie a ARTE DE UMA MOLDURA DECORATIVA para fotos de clientes de um restaurante, em formato vertical 2:3 (1024×1536 px), para ser usada em celular.

REGRAS TÉCNICAS (obrigatórias):
1. A moldura tem uma JANELA RETANGULAR para a foto do cliente, preenchida com cor chapada magenta #FF00FF, sem textura, sem sombra e sem degradê dentro dela. A janela fica a 6,7% da borda esquerda, a 31,9% do topo, com 86,7% da largura da imagem e 44,4% da altura. Bordas retas e nítidas, cantos levemente arredondados.
2. NÃO escreva nenhum texto, letra, número, logotipo ou símbolo que pareça texto em lugar nenhum.
3. Deixe três zonas LIVRES, com fundo liso ou textura muito discreta e sem desenhos (o texto será colocado por cima depois): (a) o topo, do começo até 30% da altura; (b) uma faixa horizontal entre 80% e 88% da altura; (c) a base, nos últimos 8% da altura. Essas zonas precisam ter contraste alto com a cor de texto {{COR_DO_TEXTO}}.
4. Todos os enfeites ficam nas bordas e em volta da janela, sem invadir as zonas livres nem a janela. Nada de pessoas, rostos ou marcas conhecidas.
5. Acabamento limpo, alta resolução, bordas externas retas, sem moldura de celular, sem mockup, sem fundo branco extra em volta.

ESTILO:
- Restaurante: {{TIPO_DE_RESTAURANTE}} ({{CIDADE_OU_CLIMA_DO_LUGAR}}).
- Conceito da moldura: {{CONCEITO}}.
- Materiais e texturas: {{MATERIAIS}}.
- Paleta (use só estas cores): {{COR_PRINCIPAL}}, {{COR_SECUNDARIA}}, {{COR_DE_DETALHE}}.
- Clima: {{CLIMA, ex.: acolhedor, divertido, elegante, rústico}}.
- Detalhes decorativos pequenos nas bordas: {{DETALHES, ex.: parafusos, folhas, talheres, estrelas, lâmpadas}}.

Entregue só a imagem, sem explicação.
```

## Exemplo preenchido: SemReservas GastroPub (3 molduras)

Mesmas regras técnicas acima; só mudam os campos de estilo.

**1. Demos prejuízo** (`estilo: quadro`)
- TIPO: gastropub urbano · CLIMA: bem-humorado, descontraído
- CONCEITO: quadro-negro de bar dentro de uma moldura de madeira escura
- MATERIAIS: madeira envelhecida nas bordas, giz fosco no fundo preto das zonas livres
- PALETA: marrom madeira #7a4524, preto-carvão #26231f, terracota #e09060
- DETALHES: parafusos de metal nos cantos, um traço de giz curvo sobre a janela
- COR_DO_TEXTO: creme #f3e8d0

**2. À mesa** (`estilo: placa`)
- TIPO: gastropub acolhedor · CLIMA: caloroso, clássico
- CONCEITO: pergaminho antigo com fundo vinho e uma placa dourada no topo
- MATERIAIS: papel envelhecido nas bordas, tecido vinho, metal dourado escovado
- PALETA: vinho #380818, dourado #d9b36a, creme #e8d3a3
- DETALHES: borda tracejada fina dourada, pequenos talheres cruzados nos cantos inferiores
- COR_DO_TEXTO: marrom escuro #3b1a0a sobre a placa dourada (a placa dourada fica na zona livre do topo)

**3. Saideira** (`estilo: vitral`)
- TIPO: gastropub com clima de fim de noite · CLIMA: nostálgico, festivo
- CONCEITO: arco de vitral colorido sobre fundo vinho
- MATERIAIS: vidro colorido translúcido, chumbo escuro entre os vidros
- PALETA: vinho #4a1226, âmbar #e8a33a, vermelho #c0392b, verde #1f7a46
- DETALHES: raios de vitral saindo do alto do arco; o arco fica na parte de cima, deixando o miolo do arco liso para o título
- COR_DO_TEXTO: creme #f3e8d0

## Depois de gerar a imagem

1. **Confira a janela.** A janela magenta tem de ficar mais ou menos onde manda a tabela. Se estiver deslocada, peça no mesmo chat: "Mova a janela magenta para 6,7% da esquerda e 31,9% do topo, com 86,7% de largura e 44,4% de altura, sem mudar o resto". Se continuar errada, o app consegue ajustar (me avise).
2. **Troque o magenta por transparente e ajuste o tamanho** (computador com Python e a biblioteca Pillow):

```bash
python3 -c "
from PIL import Image
im = Image.open('arte.png').convert('RGBA').resize((900, 1350), Image.LANCZOS)
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if r > 200 and b > 200 and g < 90: px[x, y] = (0, 0, 0, 0)
im.save('moldura-demos.png', optimize=True)
"
```

3. **Mande os PNG para o Claude Code** (ou coloque em `apps/consumidor/public/media/molduras/`) e peça para ligar no `data/tema.ts` (campos `png` e `corTexto`). O app já usa a arte no lugar do desenho e escreve os textos por cima. Teste no celular com uma foto de verdade.

## Para outro cliente

Troque `TIPO_DE_RESTAURANTE`, `CIDADE_OU_CLIMA_DO_LUGAR`, `CONCEITO`, `MATERIAIS`, a paleta (as cores do tema do restaurante estão em `data/tema.ts`) e os detalhes. As regras técnicas (janela, zonas livres, sem texto) **não mudam**. Os textos de cada moldura (título e frase) são editados no painel do dono, na aba Molduras.

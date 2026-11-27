# Prompt: banner "Chope em dobro às quintas" (mesmo estilo do banner da pizza)

Segundo banner promocional do carrossel da Início. **Anexe na conversa do ChatGPT o banner da pizza** (`apps/consumidor/public/media/banners/promo-pizza-calabresa.webp`) como referência de estilo: o chope tem que parecer da mesma família (fundo vinho escuro, textura quente, selo, título grande em terracota, frase em creme, botão pílula terracota, produto grande à direita). Formato e regras são os do prompt reutilizável (`PROMPT-AVISO-PROMOCAO-CHATGPT.md`), com o **texto maior** que o da pizza.

## Prompt (copie tudo, da linha abaixo até o fim do bloco; anexe a imagem da pizza antes de enviar)

```
Crie o BANNER COMPLETO de uma promoção de restaurante, para um carrossel na tela inicial de um aplicativo de celular. Responda em português do Brasil. Anexei o banner da pizza: a arte nova deve ser da MESMA FAMÍLIA VISUAL (mesmo fundo vinho escuro com brilho quente, mesma tipografia sem serifa forte, mesmo selo em pílula no alto, título grande em terracota, frase em creme e botão pílula terracota), mas com OUTRO PRODUTO.

TEXTOS DA ARTE (escreva EXATAMENTE assim, letra por letra, com os acentos):
- Selo pequeno, no alto: QUINTAS, 19H ÀS 21H
- Título grande, em 2 linhas: CHOPE / EM DOBRO
- Frase de apoio, menor: Peça um, leve dois, só na quinta.
- Botão: Quero esse →

IMAGEM: dois copos de chope tulipa cheios, bem gelados, colarinho cremoso e alto, gotas de condensação no vidro, dourado intenso, lado a lado e levemente em ângulo, sobre uma bancada de madeira escura, com bolhas subindo e brilho quente ao fundo (luz de bar, bokeh dourado). Aparência real, apetitosa, sem marcas de cerveja e sem rótulos.

CORES (use só estas): vinho escuro #290f19 de fundo, terracota #e99361 no título e no botão, creme #f7e9d0 na frase, dourado do chope, e vinho-rosado #7a3050 no selo.

REGRAS TÉCNICAS (obrigatórias):
1. Formato horizontal 1200 × 655 px (proporção 1,83:1). Se a ferramenta só gerar tamanhos fixos, gere em 1536×1024 e recorte com Python para 1200 × 655, deixando a composição importante no centro.
2. COMPOSIÇÃO: texto à ESQUERDA (0 a 55% da largura), sobre o vinho escuro liso, com contraste altíssimo; os dois chopes à DIREITA (55 a 100%), grandes e bem iluminados. Os copos podem sair um pouco pela borda direita.
3. TEXTO GRANDE (no celular a arte aparece com cerca de 390 × 200 px): as letras do título "CHOPE / EM DOBRO" têm no mínimo 16% da altura da imagem cada linha; a frase de apoio, no mínimo 8% da altura; o botão, no mínimo 22% da largura da imagem, com texto escuro bem legível; o selo com letras de no mínimo 5% da altura.
4. Nada importante nos 5% das bordas e NADA importante nos últimos 14% da altura (ali ficam os pontinhos do carrossel). Cantos RETOS, arte de ponta a ponta, sem moldura.
5. Sem pessoas, rostos, logotipos ou marcas de cerveja.

CONFERÊNCIA E ENTREGA (use Python / análise de dados):
a. Recorte para 1200 × 655 px (LANCZOS).
b. CONFIRA O TEXTO: leia a imagem final e compare, letra por letra e acento por acento, com os textos acima ("QUINTAS, 19H ÀS 21H", "CHOPE", "EM DOBRO", "Peça um, leve dois, só na quinta.", "Quero esse →"). Se houver qualquer erro ou letra deformada, gere de novo (até 3 vezes). Me diga explicitamente que conferi.
c. Reduza uma cópia para 390 px de largura e confirme que o título, o selo e o botão continuam legíveis.
d. Salve como WebP com NO MÁXIMO 140 KB: promo-chope-quintas-1.webp. Gere 3 variações (ângulo dos copos e iluminação) e me mostre as 3 lado a lado, reduzidas a 390 px de largura. Entregue os arquivos para baixar.
Se não conseguir usar Python, avise com clareza, entregue as imagens e as medidas, e eu recorto depois.
```

## Como entra no app

- Posição: **3º destaque** do carrossel (1º institucional, 2º pizza, 3º chope, depois o banner do Clube e as fotos do ambiente).
- Toque: abre o Cardápio **direto no Chope Pilsen** (`prato: 'b1'`).
- Para a apresentação ele fica **sempre visível** (sem data de fim), mesmo que a promoção seja só às quintas das 19h às 21h. Quando o painel do dono existir, ele define dias, horário e prazo.
- O app **não aplica o desconto** (não há integração com o caixa): o garçom concede o "chope em dobro". Isso vale para a demonstração.

## Depois de baixar

Mande o arquivo ao Claude Code (sem a data de fim) e eu coloco no carrossel.

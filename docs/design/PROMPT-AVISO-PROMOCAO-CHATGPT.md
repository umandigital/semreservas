# Prompt reutilizável: banner completo de promoção do restaurante (ChatGPT)

**Atualização (27/11/2026):** o formato que funcionou e está no app é o **banner de tela cheia, 1200 × 655 px (1,8:1), sem cantos arredondados** (ele ocupa o slide do carrossel inteiro, como uma foto). O banner do Clube em 10:3 continua valendo como cartão. Use a tabela e o prompt abaixo com estas trocas: **tamanho 1200 × 655**, **cantos retos**, e o texto **maior** (título com letras de pelo menos **16% da altura**, frase de apoio com pelo menos **8%**, botão com pelo menos **22% da largura**), porque no celular a arte aparece com ~390 × 200 px e o texto do primeiro teste ficou pequeno. Deixe também a **base livre (últimos 14% da altura)** para os pontinhos do carrossel.

O banner da promoção entra **no carrossel da Início**, ao lado das fotos do ambiente e do banner do Clube. É uma **arte pronta, com texto**, igual ao banner do Clube: aparece como um cartão com cantos arredondados, e **tocar nele leva a um prato do cardápio, ao cardápio ou a uma página**. Troque só os campos entre `{{chaves}}`. O exemplo preenchido é **"Pizza de calabresa com 25% de desconto, só hoje"**.

**Dica:** anexe na conversa o **banner do Clube** (`apps/consumidor/public/media/banners/clube.webp`) como referência de estilo; o prompt pede a mesma família visual.

## O que o app exige

| Item | Valor | Por quê |
|---|---|---|
| Tamanho | **1200 × 655 px (1,8:1, tela cheia)** (o de 1200 × 360 é só para o cartão do Clube) | É a proporção do banner do Clube; cabe no carrossel sem cortar o texto e sem criar rolagem |
| Cantos | **transparentes e arredondados** (raio de 22 px em 1200 px), como o banner do Clube | O app não corta a arte |
| Margem de segurança | **nada importante nos 5% das bordas** | Evita cortes em telas diferentes |
| Texto | **dentro da arte**, em português, **sem erros de letra ou acento** | Não é editável depois: cada promoção é uma imagem nova |
| Zona do texto | **lado esquerdo (0 a 58%)**, texto claro sobre fundo escuro e liso | Contraste alto, legível pequeno |
| Zona da foto | **lado direito (58 a 100%)** | O prato em destaque |
| Botão | desenhado na arte (círculo ou pílula) | O banner inteiro é clicável; o app não desenha botão |
| Peso | WebP com até **120 KB** | Abre rápido em 4G |
| Tamanho do texto | o texto principal ocupa **pelo menos 22% da altura** da arte | No celular o banner mede cerca de 380 × 114 px; texto menor que isso não se lê |

## Prompt (copie tudo, da linha abaixo até o fim do bloco)

```
Crie o BANNER COMPLETO de uma promoção de restaurante, para ser exibido em um carrossel na tela inicial de um aplicativo de celular. Responda em português do Brasil.

TEXTOS DA ARTE (escreva EXATAMENTE assim, letra por letra, com os acentos):
- Selo pequeno, no alto: {{SELO, ex.: SÓ HOJE}}
- Título grande, em 2 linhas: {{TÍTULO LINHA 1, ex.: 25% OFF}} / {{TÍTULO LINHA 2, ex.: na pizza de calabresa}}
- Frase de apoio, menor (máximo 2 linhas): {{FRASE, ex.: Válido somente hoje, para pedir na mesa}}
- Botão: {{BOTÃO, ex.: Quero essa →}}

IMAGEM: {{PRATO, ex.: pizza de calabresa grande, queijo derretido, calabresa fatiada, borda dourada, recém-saída do forno}}, sobre {{CENÁRIO, ex.: mesa de madeira escura, tábua, luz quente, um pouco de vapor}}.

ESTILO: mesma família visual do banner do Clube que anexei (se eu não anexei: fundo carvão escuro #1f1f1f, detalhes dourados #e8c470, texto creme #fffaf0, foto realista e elegante). Cores permitidas: {{CORES, ex.: carvão #1f1f1f, dourado #e8c470, creme #fff8ec, toque de vermelho-brasa #b8352b só no selo}}. Clima: {{CLIMA, ex.: urgente, quente, apetitoso}}.

REGRAS TÉCNICAS (obrigatórias):
1. Formato horizontal 1200 × 655 px (proporção 1,83:1). Se a ferramenta só gerar tamanhos fixos, gere em 1536×1024 e recorte com Python para 1200 × 655, deixando a composição importante no centro.
2. COMPOSIÇÃO: texto à ESQUERDA (0 a 58% da largura), sobre fundo escuro liso, com contraste altíssimo; foto do prato à DIREITA (58 a 100%), grande, bem iluminada, levemente inclinada; botão entre os dois ou na base do texto, no estilo do banner do Clube (círculo ou pílula dourada com texto escuro).
3. HIERARQUIA DO TEXTO: o título ("25% OFF") é o maior elemento da arte, com letras de no mínimo 16% da altura total da imagem; o selo vem pequeno no alto; a frase de apoio é menor, mas ainda legível quando a imagem for reduzida a 380 px de largura.
4. Nada importante nos 5% das bordas e NADA importante nos últimos 14% da altura (ali ficam os pontinhos do carrossel). Cantos RETOS, arte de ponta a ponta, sem moldura.
5. Tipografia: sem serifa, forte e limpa, no estilo do banner do Clube. Sem efeitos que atrapalhem a leitura (sem contorno grosso, sem texto curvo).
6. Sem pessoas, rostos, logotipos de outras marcas ou selos de aplicativos.

CONFERÊNCIA E ENTREGA (use Python / análise de dados):
a. Recorte para 1200 × 655 px (LANCZOS).
b. CONFIRA O TEXTO: leia a imagem final e compare, letra por letra e acento por acento, com os textos acima. Se houver qualquer erro ou letra deformada, gere de novo (até 3 vezes). Me diga explicitamente que conferi.
c. Reduza uma cópia para 380 px de largura e confirme que o título e o botão continuam legíveis.
d. Salve como WebP com NO MÁXIMO 140 KB: banner-promocao-1.webp. Gere 3 variações (ângulo do prato e iluminação) e me mostre as 3 lado a lado, reduzidas a 380 px de largura. Entregue os arquivos para baixar.
Se não conseguir usar Python, avise com clareza, entregue as imagens e as medidas, e eu recorto depois.
```

## Exemplo preenchido (GastroPub, pizza de calabresa 25% só hoje)

| Campo | Valor |
|---|---|
| Selo | SÓ HOJE |
| Título | 25% OFF / na pizza de calabresa |
| Frase | Válido somente hoje, para pedir na mesa |
| Botão | Quero essa → |
| Imagem | pizza de calabresa grande, queijo derretido, calabresa fatiada, cebola, borda dourada, recém-saída do forno |
| Cenário | mesa de madeira escura, tábua, luz quente, um pouco de vapor |
| Cores | carvão #1f1f1f, dourado #e8c470, creme #fff8ec e vermelho-brasa #b8352b só no selo |
| Clima | urgente, quente, apetitoso |

## Como o banner funciona no app

1. Você coloca o arquivo no projeto (ou o Claude Code coloca) e informa **para onde o toque leva** (um prato do cardápio, o cardápio ou um link) e **quem vê** (todos, só quem não é do Clube, só quem é).
2. Ele entra no **carrossel da Início** como um cartão. Os rótulos da marca saem enquanto o banner está na tela, para não sobrepor o texto da arte.
3. **Prazo:** o banner só aparece enquanto a promoção vale. Hoje isso é configurado no código do tema; **o painel do dono para criar e agendar banners vem depois** (precisa de migração e de envio de imagem). Por isso, como o texto fica dentro da arte, **cada promoção é uma imagem nova**.

## Depois de baixar

Mande o arquivo ao Claude Code com: **para onde o toque leva**, **quem vê** e **até que dia vale**.

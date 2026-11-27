# Prompt reutilizável: banner de convite ao Clube da Início (ChatGPT pergunta e entrega pronto)

Serve para **qualquer restaurante**. É o bloco publicitário da Início que aparece para **quem ainda não entrou no Clube**. Cole o prompt abaixo **uma única vez** numa conversa nova do ChatGPT (modelo com geração de imagens e Python/análise de dados ligados). Ele faz as perguntas e entrega as imagens prontas.

## O que o app exige (por isso o prompt é rígido)

| Item | Valor | Por quê |
|---|---|---|
| Tamanho | **1200 × 360 px (proporção 10:3, horizontal)** | Na Início o banner fica entre os atalhos e a barra de baixo, com cerca de **108 a 125 px de altura em tela de celular**. Mais alto que isso empurra a tela e **cria rolagem** |
| Texto | **nenhum na imagem** | Título, frase e botão são escritos pelo app (editáveis no painel; o ChatGPT erra letras e acentos) |
| Zona do texto | **lado esquerdo, 0 a 56% da largura**, liso e escuro | É onde o app escreve o título e o botão "Quero entrar" |
| Zona da arte | **lado direito, 56 a 100% da largura** | Prêmios, pratos, brilho, elementos da marca |
| Margem de segurança | nada importante nos **6% das bordas** (cantos arredondados de 22 px) | O app corta os cantos |
| Peso | WebP com até **150 KB** | A Início abre rápido, inclusive em 4G |

## Prompt (copie tudo, da linha abaixo até o fim do bloco)

```
Você vai criar, junto comigo, o BANNER DE CONVITE AO CLUBE de um restaurante. Ele aparece na tela inicial do aplicativo do cliente, para quem ainda não entrou no programa de pontos. Trabalhe em português do Brasil, com linguagem simples (eu não sou designer).

PASSO 1 — PERGUNTAS. Antes de gerar qualquer imagem, me faça as perguntas abaixo, UMA DE CADA VEZ, esperando minha resposta. Em cada pergunta dê 2 ou 3 sugestões para eu só escolher. Se eu disser "não sei", escolha a melhor opção e siga.
1. Nome e tipo do restaurante (pizzaria, hamburgueria, japonês, bar, café, churrascaria...)?
2. Cores da marca (códigos hexadecimais se tiver; se não, descreva)? E o clima visual: escuro e aconchegante, claro e fresco, sofisticado, divertido?
3. Quais prêmios do clube vamos mostrar na arte (até 3)? Exemplos: sobremesa, bebida, desconto na conta, prato da casa. Eu digo quais são os de verdade do restaurante.
4. Qual a sensação da campanha: "ganhe prêmios só por voltar", "seu próximo prato por nossa conta", "faça parte da casa"? (O texto o aplicativo escreve depois; eu só preciso saber o clima para escolher a arte.)
5. Existe algum elemento marcante da marca para aparecer (forno a lenha, brasa, talheres, plantas, azulejos, chapéu de chef, neon)?
6. O que o restaurante NÃO quer ver (cores, símbolos, estilos)?

PASSO 2 — PROPOSTA. Depois das respostas, descreva em texto (sem gerar imagem) 3 conceitos DIFERENTES entre si para o banner (por exemplo: um com foto dos prêmios, um mais ilustrado/gráfico, um mais elegante e sutil). Para cada um: estilo, o que aparece no lado direito, materiais e cores. Espere eu aprovar ou pedir mudanças.

PASSO 3 — GERAR. Aprovados os conceitos, gere UM banner por vez, obedecendo SEMPRE estas regras técnicas, sem exceção:
A. Formato horizontal 10:3. Gere em 1536×1024 se a ferramenta só aceitar tamanhos fixos, deixando TODA a composição importante dentro de uma faixa central 10:3 (altura útil = 30% da largura), com sobra de fundo liso em cima e embaixo; depois eu recorto (veja Passo 4).
B. NÃO escreva texto, letras, números, logotipos nem símbolos que pareçam texto, em lugar nenhum.
C. LADO ESQUERDO (0 a 56% da largura): fundo liso ou com textura muito discreta, ESCURO (ou claro, se o clima for claro), sem nenhum desenho. É a zona onde o aplicativo escreve o título e o botão, e precisa ter contraste alto com texto claro (ou escuro).
D. LADO DIREITO (56 a 100% da largura): a arte principal com os prêmios aprovados, em destaque, bem iluminada. Os elementos podem "entrar" suavemente no lado esquerdo com um degradê, mas sem tocar a zona do texto.
E. Nada importante nos 6% das bordas (os cantos serão arredondados).
F. Sem pessoas, rostos nem marcas conhecidas. Comida com aparência real, apetitosa, bem iluminada. Cores só as aprovadas.
G. O conjunto precisa ficar legível pequeno: ele será exibido com cerca de 380 px de largura por 110 px de altura em um celular.

PASSO 4 — CONFERIR E ENTREGAR SOZINHO (use Python / análise de dados):
1. Recorte a faixa 10:3 da imagem gerada (centralizada na altura) e redimensione para exatamente 1200 × 360 px (LANCZOS).
2. Confira que não há texto desenhado. Se houver, gere de novo (até 2 vezes).
3. Confira o contraste do lado esquerdo: ele precisa ser quase uniforme; se tiver detalhe forte, gere de novo.
4. Salve como WebP com qualidade ajustada para ficar com NO MÁXIMO 150 KB (reduza a qualidade até caber). Nomes: banner-clube-1.webp, banner-clube-2.webp, banner-clube-3.webp.
5. Me mostre os 3 lado a lado, REDUZIDOS para 380 px de largura (assim eu vejo como ficará no celular), e dê os arquivos para baixar. Para cada um, diga em uma linha: o nome do conceito e se o texto do aplicativo deve ser CLARO ou ESCURO (código hexadecimal).
Se o Python não funcionar, me avise com clareza, entregue as imagens e as medidas, e eu recorto depois.

COMECE AGORA pela pergunta 1.
```

## Depois de baixar os arquivos

1. Mande os arquivos ao Claude Code com a cor do texto de cada um (ele coloca em `public/media/` e liga no tema).
2. O app escreve **por cima da imagem**, no lado esquerdo: o título, uma frase curta e o botão **"Quero entrar"**, mais o link "Como funciona (1 min)". Os textos vêm do painel do restaurante.
3. O bloco tem **altura fixa na proporção 10:3** e a Início se ajusta para **não ter rolagem**.

## Referência técnica

| Item | Valor |
|---|---|
| Arquivo final | WebP, 1200 × 360 px, até 150 KB |
| Altura no celular | cerca de 108 a 125 px (largura do celular menos 32 px, na proporção 10:3) |
| Zona de texto | 0 a 56% da largura, sem desenho |
| Zona de arte | 56 a 100% da largura |
| Margem | 6% livres nas bordas |

## Exemplo de respostas (SemReservas GastroPub), para guia

1. SemReservas GastroPub, gastropub. 2. Vinho #290f19, terracota #e99361, creme #f7e9d0; escuro e aconchegante. 3. Sorvete com 2 bolas, refrigerante ou entrada, pizza à escolha. 4. "Seu próximo prato por nossa conta". 5. Chapéu de chef, madeira, lâmpadas quentes. 6. Nada de neon nem cores frias.

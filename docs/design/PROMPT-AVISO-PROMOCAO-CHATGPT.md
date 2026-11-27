# Prompt reutilizável: imagem do aviso do restaurante (promoção) para o ChatGPT

Serve para **qualquer promoção de qualquer restaurante**. A imagem aparece no espaço de baixo da Início (o mesmo do convite ao Clube), então tem **altura fixa e a tela não pode rolar**. Troque só os campos entre `{{chaves}}`; o exemplo preenchido abaixo é a promoção **"Pizza de calabresa com 25% de desconto, só hoje"** do GastroPub.

## O que o app exige

| Item | Valor | Por quê |
|---|---|---|
| Tamanho | **1200 × 360 px (10:3, horizontal)** | O aviso ocupa cerca de 108 a 126 px de altura no celular. Mais alto que isso cria rolagem |
| Texto | **nenhum na imagem** | "25% OFF", "Só hoje", o nome do prato e o botão são escritos pelo app e editados no painel. O ChatGPT erra letras e acentos |
| Zona do texto | **lado esquerdo, 0 a 56% da largura**, liso e escuro | O app escreve ali o selo "Só hoje", o "25% OFF" grande, o prato e o botão |
| Zona da arte | **lado direito, 56 a 100% da largura** | O prato, em destaque |
| Margem | nada importante nos **6% das bordas** | Cantos arredondados de 22 px |
| Peso | WebP até **150 KB** | Abre rápido em 4G |

## Prompt (copie tudo, da linha abaixo até o fim do bloco)

```
Crie a IMAGEM DE FUNDO de um aviso de promoção de restaurante, para a tela inicial de um aplicativo de celular. Responda em português do Brasil.

PROMOÇÃO: {{PROMOÇÃO, ex.: pizza de calabresa com 25% de desconto, só hoje}}
PRATO EM DESTAQUE: {{PRATO, ex.: pizza de calabresa grande, bem recheada, queijo derretido, calabresa fatiada, borda dourada}}
CLIMA: {{CLIMA, ex.: quente, apetitoso, urgente, "só por hoje"}}
CORES (use só estas): {{COR 1}}, {{COR 2}}, {{COR 3}}
RESTAURANTE: {{TIPO E ESTILO, ex.: gastropub aconchegante, madeira escura, luz quente}}

REGRAS TÉCNICAS (obrigatórias, sem exceção):
1. Formato horizontal 10:3. Gere em 1536×1024 se a ferramenta só aceitar tamanhos fixos, deixando TODA a composição importante dentro de uma faixa central com altura igual a 30% da largura (proporção 10:3), com sobra de fundo liso em cima e embaixo; depois recorto com Python.
2. NÃO escreva nenhum texto, letra, número, porcentagem, preço, logotipo ou símbolo que pareça texto, em lugar nenhum. O aplicativo escreve tudo depois.
3. LADO ESQUERDO (0 a 56% da largura): fundo liso ou com textura muito discreta, ESCURO, sem nenhum desenho, para receber texto claro com contraste alto. Pode ter um degradê suave em direção ao prato.
4. LADO DIREITO (56 a 100% da largura): o prato em destaque, grande, bem iluminado, levemente inclinado, com aparência real e apetitosa. Pode sair um pouco pela borda direita. Brasas, vapor ou brilho quente ao fundo para dar sensação de urgência e "acabou de sair do forno", sem poluir.
5. Nada importante nos 6% das bordas (os cantos serão arredondados).
6. Sem pessoas, rostos nem marcas conhecidas.
7. Precisa funcionar pequeno: será exibido com cerca de 380 px de largura por 115 px de altura.

DEPOIS DE GERAR, FAÇA SOZINHO COM PYTHON / ANÁLISE DE DADOS:
a. Recorte a faixa 10:3 centralizada na altura e redimensione para exatamente 1200 × 360 px (LANCZOS).
b. Confirme que não há texto desenhado; se houver, gere de novo (até 2 vezes).
c. Confirme que o lado esquerdo está quase uniforme e escuro; se tiver detalhe forte, gere de novo.
d. Salve como WebP com NO MÁXIMO 150 KB (reduza a qualidade até caber), com o nome aviso-promocao.webp.
e. Gere 3 variações diferentes (ângulo e iluminação do prato) e me mostre as 3 lado a lado REDUZIDAS para 380 px de largura, para eu ver como ficam no celular. Entregue os arquivos para baixar (aviso-promocao-1.webp, -2 e -3) e diga, para cada um, se o texto do aplicativo deve ser CLARO ou ESCURO (código hexadecimal).
Se não conseguir usar Python, avise com clareza, entregue as imagens e as medidas, e eu recorto depois.
```

## Exemplo já preenchido (GastroPub, pizza de calabresa 25% só hoje)

- **{{PROMOÇÃO}}:** pizza de calabresa com 25% de desconto, só hoje
- **{{PRATO}}:** pizza de calabresa grande, bem recheada, queijo derretido, calabresa fatiada, cebola, borda dourada
- **{{CLIMA}}:** quente, apetitoso, urgente
- **{{COR 1, 2, 3}}:** vinho #290f19, terracota #e99361, creme #f7e9d0
- **{{RESTAURANTE}}:** gastropub aconchegante, madeira escura, luz quente, brasas ao fundo

## Como o aviso funciona no app (a construir depois que a imagem estiver pronta)

O dono cria o aviso no painel: **imagem**, **título** ("25% OFF"), **frase** ("Pizza de calabresa"), **selo** ("Só hoje"), **botão** (leva a um prato do cardápio, ao cardápio ou a um link) e **quando vale** (hoje, de tal dia a tal dia). O app esconde o aviso sozinho quando o prazo termina. Na Início ele aparece **acima da faixa de pontos**, abaixo só do chamado de garçom aberto.

## Depois de baixar

Mande o arquivo ao Claude Code com a cor do texto. Para trocar de promoção, gere outra imagem com este mesmo prompt.

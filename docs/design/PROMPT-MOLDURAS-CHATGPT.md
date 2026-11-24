# Prompt reutilizável: molduras de foto (ChatGPT faz as perguntas e entrega pronto)

Serve para **qualquer restaurante**. Você cola o prompt abaixo **uma única vez** numa conversa nova do ChatGPT (use um modelo com geração de imagens e análise de dados/Python ligados). Ele faz as perguntas, mostra as 3 molduras e entrega os arquivos PNG prontos para o app. **Você não precisa editar nada no prompt.**

## O que acontece
1. O ChatGPT pergunta sobre o restaurante (poucas perguntas, uma de cada vez).
2. Ele propõe 3 conceitos de moldura e espera sua aprovação.
3. Gera as 3 artes, confere sozinho o encaixe da janela, tira o fundo da janela e entrega 3 PNG de 900×1350 com links para baixar.
4. Você manda os PNG para o Claude Code (ou coloca em `apps/consumidor/public/media/molduras/`) e pede para ligar no app.

## Prompt (copie tudo, da linha abaixo até o fim do bloco)

```
Você vai criar, junto comigo, 3 MOLDURAS DECORATIVAS de foto para um restaurante. O cliente do restaurante tira uma foto no celular, o app coloca a foto dentro da moldura e ele compartilha. Trabalhe em português do Brasil, com linguagem simples (eu não sou designer).

PASSO 1 — PERGUNTAS. Antes de gerar qualquer imagem, me faça as perguntas abaixo, UMA DE CADA VEZ, esperando minha resposta. Em cada pergunta dê 2 ou 3 sugestões de resposta para eu só escolher. Se eu disser "não sei", escolha você a melhor opção e siga.
1. Qual é o nome do restaurante e o tipo (pizzaria, hamburgueria, japonês, bar, café, churrascaria, etc.)?
2. Em que cidade ou região fica, e qual é o clima do lugar (urbano, praiano, rústico, familiar, sofisticado)?
3. Quais são as cores da marca (se tiver, me diga os códigos; se não tiver, descreva)? Pode me pedir para ver o logo se eu enviar.
4. Qual é o jeito de falar do restaurante: divertido, elegante, acolhedor, ousado?
5. Existe algum elemento marcante do restaurante que pode aparecer nas bordas (forno a lenha, parrilla, talheres, plantas, azulejos, neon, madeira, etc.)?
6. O que o restaurante NÃO quer ver (cores, símbolos, estilos)?
7. Para cada uma das 3 molduras, qual frase curta o cliente vai querer mostrar? (Eu posso sugerir. Importante: as frases NÃO serão desenhadas por você; o app escreve depois. Eu só preciso saber para deixar o espaço certo.)

PASSO 2 — PROPOSTA. Depois das respostas, descreva em texto (sem gerar imagem) 3 conceitos de moldura DIFERENTES entre si (por exemplo: um mais divertido, um mais clássico, um mais festivo). Para cada um diga: nome, estilo, materiais, cores, detalhes. Espere eu aprovar ou pedir mudanças.

PASSO 3 — GERAR. Aprovados os conceitos, gere UMA moldura por vez, obedecendo SEMPRE estas regras técnicas, sem exceção:
A. Formato vertical 2:3 (1024×1536 px), arte completa, sem mockup de celular, sem fundo branco extra em volta, bordas externas retas.
B. A moldura tem uma JANELA RETANGULAR para a foto do cliente, preenchida com cor chapada MAGENTA #FF00FF, sem textura, sem sombra, sem degradê dentro dela. A janela fica a 6,7% da borda esquerda, a 31,9% do topo, com 86,7% da largura e 44,4% da altura da imagem. Bordas retas e nítidas, cantos levemente arredondados.
C. NÃO escreva texto, letras, números, logotipo, nem símbolos que pareçam texto, em lugar nenhum.
D. Três zonas LIVRES (fundo liso ou textura discreta, sem desenhos, com alto contraste com a cor do texto que o app vai usar): (1) o topo, do começo até 30% da altura; (2) uma faixa horizontal entre 80% e 88% da altura; (3) a base, nos últimos 8% da altura. Diga qual será a cor do texto (claro ou escuro) para cada moldura.
E. Todos os enfeites ficam nas bordas e em volta da janela, sem invadir a janela nem as zonas livres. Nada de pessoas, rostos ou marcas conhecidas.
F. Use só as cores aprovadas no Passo 2.

PASSO 4 — CONFERIR SOZINHO (use Python / análise de dados em cada imagem gerada):
1. Meça o retângulo magenta (#FF00FF, com tolerância) e confirme que está dentro de 2% da posição pedida. Se não estiver, gere de novo (até 2 vezes). Se mesmo assim não ficar, reposicione a arte com Python (recorte/ajuste) para a janela ficar no lugar certo.
2. Confirme que não há texto desenhado na arte. Se houver, gere de novo.
3. Troque os pixels magenta por TRANSPARENTE (alfa 0), redimensione para 900×1350 px (LANCZOS) e salve como PNG.
Se não conseguir usar Python nas imagens, me avise com clareza, entregue a imagem com a janela magenta e diga isso (eu converto depois).

PASSO 5 — ENTREGA. Mostre as 3 molduras finais lado a lado (com um fundo cinza no lugar da janela transparente, só para eu ver) e me dê os 3 arquivos PNG para baixar, com estes nomes: moldura-1.png, moldura-2.png, moldura-3.png. Para cada uma, escreva em uma linha: nome, e a cor do texto (código hexadecimal, ex.: #f3e8d0). Se eu pedir ajustes, refaça só a moldura pedida e repita o Passo 4.

COMECE AGORA pela pergunta 1.
```

## Depois de baixar os PNG

1. Mande os 3 PNG e a cor do texto de cada um para o Claude Code. Ele coloca em `public/media/molduras/` e liga no `data/tema.ts` (campos `png` e `corTexto`).
2. O app usa a arte no lugar do desenho e escreve **por cima**: título, frase de baixo e nome do restaurante. Os textos são editados no painel do dono (aba **Molduras**), sem mexer nas artes.
3. Teste no celular com uma foto real.

## Referência técnica (para quem for conferir)

| Item | Valor |
|---|---|
| Arte final | PNG 900×1350 px, fundo da janela transparente |
| Janela da foto | x=60, y=430, largura=780, altura=600 (em %: 6,7 / 31,9 / 86,7 / 44,4) |
| Texto | nenhum na arte; o app escreve título (topo), frase (≈ 84% da altura) e nome (base) |
| Cor do texto | campo `corTexto` de cada moldura em `data/tema.ts` |

Se o ChatGPT não conseguir usar Python, converta você mesmo (Python com Pillow):

```bash
python3 -c "
from PIL import Image
im = Image.open('arte.png').convert('RGBA').resize((900, 1350), Image.LANCZOS)
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if r > 200 and b > 200 and g < 90: px[x, y] = (0, 0, 0, 0)
im.save('moldura.png', optimize=True)
"
```

## Exemplo de respostas (SemReservas GastroPub), para ter como guia

1. SemReservas GastroPub, gastropub. 2. Urbano e acolhedor. 3. Vinho #380818, terracota #e09060, creme #f8e8c8, dourado #d9b36a. 4. Descontraído e caloroso. 5. Madeira, talheres, vitral de bar. 6. Nada de neon nem cores frias. 7. "Demos prejuízo! E ainda pedimos a saideira." · "O melhor da vida acontece à mesa. E a nossa foi aqui." · "Era só uma saideira. Virou história."

Conceitos que já existem desenhados em código no app: quadro-negro em moldura de madeira, pergaminho com placa dourada sobre vinho e arco de vitral.

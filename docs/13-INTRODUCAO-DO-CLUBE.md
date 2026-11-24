# Vídeo de introdução do Clube (versão 3, 24/11/2026)

Animação **feita em código** (CSS e SVG, sem arquivo de vídeo e sem biblioteca nova), com cerca de **1 minuto e 36 segundos**, que ensina o Clube **por exemplos**. **Serve para qualquer estabelecimento**: o roteiro não cita restaurante, prato nem valor real; todo número é **exemplo** (etiqueta "Exemplo" em cada cena) e a penúltima cena diz que **cada restaurante escolhe os seus números e prêmios**. Só o nome do Clube (abertura) e o do restaurante (rodapé) vêm do tema.

## Onde aparece
- Na **primeira vez** que uma pessoa do Clube abre a aba Clube; depois só pelo link.
- O link **"Ver como o Clube funciona (1 minuto)"** fica na aba Clube para **todos**, inclusive quem ainda não entrou (serve de apresentação para cliente e convite para entrar).
- Pode ser fechada a qualquer momento (X, Esc).

## Como é contada
O **S da marca** é o guia: se desenha na abertura e suas ondas pulsam (o "toque"); aparece na placa da mesa e no celular. A pessoa de exemplo é **a Ana**. Cada cena tem: título, **"Passo N de 5"** quando é um passo, o desenho animado, **legenda grande** (maior que 18 px) e **"Em uma frase"**.

| # | Cena | Seg | O que se vê |
|---|---|---|---|
| 0 | Abertura | 6 | O S se desenha; nome do Clube |
| 1 | O que é o Clube | 10 | Ana, cartão do Clube com pontos subindo (+30, +30, +30) e um prêmio |
| 2 | **Passo 1:** Entre no Clube | 11 | Celular: "Entrar com Google", toque, "Falta só um passo" (nome e aniversário sendo digitados), "+50" |
| 3 | **Passo 2:** Ganhe a cada visita | 11 | Mesa, placa com o S, celular encosta, "Visita registrada! +30", selo "1 vez por dia" |
| 4 | **Passo 3:** Volte e ganhe mais | 12 | Calendário: visitas marcadas (+30), bônus "voltou em menos de 7 dias" e "3 visitas no mês" |
| 5 | **Passo 4:** Outras formas de ganhar | 13 | Opinião (+10), foto com moldura (+15), indicar amigo (+100) e barra de limite |
| 6 | **Passo 5:** Troque por um prêmio | 13 | Barra de pontos chega ao prêmio, toque em Trocar, comprovante com código, garçom confirma |
| 7 | Seus dois números | 11 | "Seus pontos" 200 → 0 → 30; "Total ganho" 200 → 200 → 230, contando a história da Ana |
| 8 | Cada restaurante tem as suas regras | 9 | Três restaurantes de exemplo com valores diferentes |
| 9 | Dúvidas comuns | (a pessoa toca) | 5 perguntas que abrem a resposta |
| 10 | Pronto! | (a pessoa toca) | 3 passos em resumo, "Ver todas as formas de ganhar" e "Ver de novo" |

Roteiro (textos, ordem e duração) está em `apps/consumidor/src/data/introClube.ts`; o desenho de cada cena, em `screens/IntroClube.tsx`.

## Controles e acessibilidade
- Avança sozinho; **tocar no desenho pausa/continua**; botões grandes **Voltar, Pausar/Continuar, Próximo**; barras de progresso no topo; lista de **Capítulos**; teclado (setas, espaço, Esc).
- **Reduzir movimento**: sem avanço automático; cada cena mostra o quadro final, com botão Próximo.
- Texto creme sobre vinho, legenda e botões grandes; nada pisca.

## Fora do vídeo, de propósito
Roleta do Chef e aniversário explicam-se nas próprias telas.

## Testes
`introClube.test.ts`: ids únicos, legenda e título, duração entre 1 e 2 minutos, passos de 1 a 5 em ordem e **roteiro genérico** (nenhum texto cita restaurante, prato ou valor em reais). O desenho e o movimento foram conferidos gravando o app no navegador; **não foi testado em aparelho real**.

## Mudou em relação à versão 2
A v2 montava os capítulos a partir das regras ligadas do restaurante e usava só ícones em fila. A v3 usa **exemplos fixos e genéricos** (decisão do fundador: o vídeo serve a todos os estabelecimentos) e um **roteiro de passos com a mesma personagem**. Por isso o vídeo **não promete nada específico**: os valores reais estão na tela do Clube.

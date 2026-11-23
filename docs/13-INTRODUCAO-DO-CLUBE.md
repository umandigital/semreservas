# Introdução animada do Clube (especificação, versão 2, 23/11/2026)

Animação **feita em código** (sem arquivo de vídeo), **explicativa e completa**, que ensina o Clube na primeira entrada para **não deixar dúvidas**. Tem **capítulos curtos** (cerca de 1min40 no total), que a pessoa pode pular, rever ou fechar. Não substitui um Clube simples; ajuda a entender.

## 1. Quando aparece
- **Só para quem se cadastrou e está logado**, e **só ao tocar na aba Clube** (nunca abre sozinha na Início).
- **Aparece na primeira sessão** em que a pessoa abre o Clube. Pode ser **fechada** a qualquer momento (X grande e "Pular").
- Depois de vista ou fechada, **não abre de novo sozinha**. Para rever: link **"Como o Clube funciona"** dentro da aba Clube.
- Quem não está logado não vê nada disso (visitante não tem Clube).
- Memória do "já viu": **no perfil da pessoa (servidor)**, com cópia no aparelho; assim não repete em outro celular. Não é dado sensível.

## 2. Valores são exemplos
Todos os números da animação (pontos, prêmios, marcos) vêm marcados como **"Exemplo"** numa etiqueta discreta, uma vez por cena. Eles **não são os do restaurante**: os reais aparecem na tela do Clube logo depois. Assim a animação nunca fica errada quando o dono mudar valores (regra 9: tudo é dado).

## 3. O gimmick: o "S" do SemReservas
O **S da marca** (com as ondas de aproximação, a "assinatura" do toque) é o **guia** da animação: ele se desenha, pulsa as ondas, **vira o celular tocando a placa**, se divide em ícones de ações, se transforma em **cartão de prêmio** e termina de volta como S. Cores no app: S em **creme** com ondas **terracota** sobre o vinho (no logo oficial o S é roxo e laranja; usar a versão do tema do restaurante, ver `docs/design/TEMA-DO-RESTAURANTE.md`).

## 4. Roteiro em capítulos (cerca de 100 segundos)
Cada capítulo: **no máximo 4 elementos**, legenda de **18 pontos ou mais**, creme sobre vinho, e uma **frase-resumo** que fica na tela no fim ("Em uma frase: ..."). Valores marcados **"Exemplo"**. Sem som obrigatório.
| # | Capítulo (tempo) | O que se vê (movimento) | Legenda |
|---|---|---|---|
| 0 | **Abertura** (3 s) | O S se desenha, as ondas pulsam | "Bem-vindo ao Clube SemReservas GastroPub" |
| 1 | **O que é o Clube** (8 s) | O S vira um cartão de membro; os pontos entram nele; do cartão sai um prêmio | "No Clube você ganha pontos e troca por prêmios do restaurante." Em uma frase: **pontos viram prêmios.** |
| 2 | **Ganhe pontos por visita** (14 s) | A mesa, a placa e o celular; as ondas do S ligam celular e placa; sobe "+30 pontos" (Exemplo); um selo "1 por dia" | "Encoste o celular na placa da sua mesa. Cada visita dá pontos, uma vez por dia." "Os pontos saem quando você faz o pedido ou pede a conta pelo app." Em uma frase: **cada visita dá pontos.** |
| 3 | **Mais jeitos de ganhar** (12 s) | O S se abre em 4 ícones com rótulo (foto com moldura, indicar um amigo, seguir no Instagram, comentar um prato); cada um solta seus pontos que somam | "Usar o app também dá pontos. Algumas ações têm limite por mês." Em uma frase: **usar o app dá pontos.** |
| 4 | **Seus dois números** (12 s) | Dois marcadores lado a lado: "Seus pontos" (sobe e desce) e "Total ganho" (só sobe); um prêmio é trocado: "Seus pontos" cai, "Total ganho" fica | "'Seus pontos' é o que você pode gastar. 'Total ganho' só aumenta: é a sua história no Clube." Em uma frase: **trocar gasta seus pontos, não o total.** |
| 5 | **Os prêmios** (12 s) | Uma barra com marcos (Exemplo: 200, 500, 1000); cartões de prêmio se acendem conforme a barra passa | "Cada prêmio tem um preço em pontos. Quando você chega lá, ele é liberado. Troque agora ou continue juntando para um prêmio maior." Em uma frase: **você escolhe quando trocar.** |
| 6 | **Como trocar** (16 s) | Passo a passo em 4 telas: toque em "Trocar", confirme "Os pontos saem na hora", o comprovante aparece com código e animação, chame o garçom e mostre | "1. Toque em Trocar. 2. Confirme. 3. Mostre o comprovante ao garçom. A troca é na mesa, uma por visita, e o comprovante vale 30 minutos." Em uma frase: **trocou, mostrou, recebeu.** |
| 7 | **Regras de segurança** (10 s) | O S vira um cadeado sobre o cartão; um calendário mostra o aviso de validade | "Os pontos são só seus e ficam na sua conta. Só ganha quem está logado e no restaurante. Pontos podem ter validade: avisamos 30 dias antes." Em uma frase: **seus pontos são seus.** |
| 8 | **Dúvidas comuns** (a pessoa toca) | Lista de 5 perguntas; cada uma abre a resposta com ícone | ver abaixo |
| 9 | **Resumo e fecho** (5 s) | As 4 frases-resumo em fila; o S volta ao centro; botão terracota "Entendi" e link "Ver de novo" | "Os valores desta animação são exemplos. Os do restaurante estão na tela do Clube." |
**Dúvidas comuns (capítulo 8, respostas curtas):**
1. "E se eu não estiver no restaurante?" Você vê seus pontos, mas **ganha e troca só na mesa**.
2. "E se esquecer de encostar a placa?" **Não há pontos retroativos.** Encoste na próxima visita.
3. "Posso trocar em outro dia?" **Sim**, com o seu prêmio liberado, na mesa, uma troca por visita.
4. "Perco o total se eu trocar?" **Não.** O total ganho nunca diminui.
5. "Preciso mostrar algo ao garçom?" **Só o comprovante da troca.** Para ganhar pontos, não.
Os textos e números dessas respostas vêm da configuração do restaurante (limite mensal, validade, prazo do comprovante). Os números do vídeo são **sempre exemplos**.

## 5. Comportamento e acessibilidade
- Toque na tela **avança**; segurar **pausa**; "Pular" e X sempre visíveis (alvo de 56 pontos ou mais); **lista de capítulos** (pode pular para o que quiser e rever só um); "Voltar" ao capítulo anterior; pontinhos de progresso.
- **Respeita "reduzir movimento"**: vira uma sequência de 5 telas estáticas com botão "Próximo".
- Nada de piscar rápido (máximo 3 por segundo).
- Textos vêm da configuração (nome do restaurante, nome do Clube, ações, tema); nada fixo no código.
- **Sem som na versão 1.** A locução fica como extra futuro (botão de som, legenda sempre à vista); depende de voz sintética em português do Brasil ou de gravação.
- Peso mínimo: CSS e SVG, sem biblioteca de animação nova; carrega sob demanda, só quando a aba Clube é aberta pela primeira vez.
- Teste: abre só para logado; não abre para visitante nem na Início; não repete após fechar; abre de novo pelo link; capítulos navegáveis; dúvidas abrem e fecham; versão sem movimento.
- Nome do segundo número: usei **"Total ganho"** (a definição pede evitar "acumulado"); confirmar.

## 6. Roleta e aniversário fora do Clube (decisão de 23/11/2026)
- **Aba Clube:** pontos, prêmios para trocar (**"Meus prêmios"**), extrato e como ganhar pontos.
- **Extras, com entrada própria na Início:** botão **"Roleta do Chef"** (ícone de chapéu de chef) e botão **"Meu aniversário"** (ícone de bolo). Não ficam dentro da aba Clube.
- - Cada extra tem **dinâmica própria**, com **seus próprios prêmios, validade e área de troca**, dentro da própria Roleta e do próprio aniversário. **Não entram** no extrato nem em "Meus prêmios" do Clube. A validade sempre à vista e o aviso no próximo login valem para eles também (`docs/10`, seção 13b).

## 7. Construção
Faz parte do **Bloco A (layout do cliente)**, depois do cadastro e da aba Clube. Componente único de animação com os 10 capítulos, controlado por dados.

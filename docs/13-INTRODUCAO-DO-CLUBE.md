# Introdução animada do Clube (especificação, 23/11/2026)

Animação curta, **feita em código** (sem arquivo de vídeo), que explica o Clube na primeira entrada. Não substitui um Clube simples; só ajuda a entender.

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

## 4. Roteiro (cerca de 33 segundos; legenda grande o tempo todo)
Cada cena: **no máximo 4 elementos**, texto de **18 pontos ou mais**, legenda creme sobre vinho, sem som obrigatório.
| Tempo | Cena | O que se vê (movimento) | Legenda |
|---|---|---|---|
| 0 a 3 s | **Abertura** | O S se desenha em traço, as ondas pulsam duas vezes | "Bem-vindo ao Clube SemReservas GastroPub" |
| 3 a 11 s | **1. Encoste e ganhe** | O celular se aproxima da placa da mesa; as ondas do S ligam os dois; sobe um "+30 pontos" (Exemplo) e o contador gira | "Cada visita ao restaurante dá pontos." |
| 11 a 19 s | **2. Mais jeitos de ganhar** | O S se abre em 4 ícones com rótulo (foto com moldura, indicar amigo, Instagram, comentar prato); cada um solta seus pontos que somam no contador | "Usar o app também dá pontos." |
| 19 a 27 s | **3. Troque por prêmios** | Uma barra enche com marcos; o S vira um cartão de prêmio ("Sorvete", Exemplo); aparece o botão "Trocar" e o comprovante sobe | "Junte pontos e troque por prêmios, na mesa, quando quiser." |
| 27 a 33 s | **4. São seus** | O S abraça o contador; ele passa de uma mesa para outra | "Seus pontos ficam na sua conta, em qualquer visita." |
| 33 s | **Fecho** | O S volta ao centro; botão terracota grande "Entendi" e link "Ver de novo" | "Os valores desta animação são exemplos. Os do restaurante estão na tela do Clube." |
A **Roleta do Chef** e o **aniversário** não aparecem aqui: estão **fora do Clube** (seção 6).

## 5. Comportamento e acessibilidade
- Toque na tela **avança** a cena; segurar **pausa**; "Pular" e X sempre visíveis (alvo de toque de 56 pontos ou mais); pontinhos de progresso.
- **Respeita "reduzir movimento"**: vira uma sequência de 5 telas estáticas com botão "Próximo".
- Nada de piscar rápido (máximo 3 por segundo).
- Textos vêm da configuração (nome do restaurante, nome do Clube, ações, tema); nada fixo no código.
- **Sem som na versão 1.** A locução fica como extra futuro (botão de som, legenda sempre à vista); depende de voz sintética em português do Brasil ou de gravação.
- Peso mínimo: CSS e SVG, sem biblioteca de animação nova; carrega sob demanda, só quando a aba Clube é aberta pela primeira vez.
- Teste: abre só para logado; não abre para visitante nem na Início; não repete após fechar; abre de novo pelo link; versão sem movimento.

## 6. Roleta e aniversário fora do Clube (decisão de 23/11/2026)
- **Aba Clube:** pontos, prêmios para trocar (**"Meus prêmios"**), extrato e como ganhar pontos.
- **Extras, com entrada própria na Início:** botão **"Roleta do Chef"** (ícone de chapéu de chef) e botão **"Meu aniversário"** (ícone de bolo). Não ficam dentro da aba Clube.
- Premissa a confirmar: os **prêmios** ganhos nos extras (pizza da Roleta, presente de aniversário) aparecem também em **"Meus prêmios"**, com etiqueta da origem, para a troca ficar num só lugar.

## 7. Construção
Faz parte do **Bloco A (layout do cliente)**, depois do cadastro e da aba Clube. Componente único de animação com as 5 cenas, controlado por dados.

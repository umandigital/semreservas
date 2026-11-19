# Prompts para o ChatGPT (imagens e telas do layout final)

Como usar: abra uma conversa nova no ChatGPT (modelo com geração de imagens), **cole o BLOCO-BASE primeiro**, depois um prompt por vez. Peça sempre 2 variações. Revise os textos das imagens (a ferramenta erra acentos). Peça "sem logotipo, deixe um retângulo cinza escrito LOGO" e eu aplico o logo oficial depois (o logo aprovado não pode ser redesenhado).

## BLOCO-BASE (cole antes de tudo)
```
Você é diretor de arte de um app mobile para restaurantes chamado SEMRESERVAS (marketing de relacionamento gastronômico, slogan "Um toque. Infinitas possibilidades."). O cliente abre o app encostando o celular numa placa NFC na mesa.
Gere SEMPRE telas de celular em retrato 9:19,5 (1080x2340), apenas a tela, sem moldura de aparelho, estilo mockup de produto digital limpo.
Identidade visual obrigatória:
- Fundo roxo profundo #2A1148, painéis #3B1A63 e #4A2578, destaque laranja #FF7A1A para botões principais e itens ativos, texto branco, texto secundário #D9CDEA. Erro vermelho #E5322D, sucesso verde #2FBF71.
- Cantos arredondados (14 px), botões altos (mínimo 48 px), alto contraste, fonte sem serifa moderna e legível (estilo Inter/Roboto), tamanho de texto generoso.
- Barra inferior com 4 abas: Início, Cardápio, Pedido, Prêmios (ícones de linha, aba ativa em laranja).
- O restaurante é o protagonista: no topo vai o LOGO DO RESTAURANTE (desenhe só um retângulo cinza com a palavra LOGO). NÃO desenhe nem invente o logotipo da SEMRESERVAS.
- Fotos de comida realistas, apetitosas, iluminação quente, fundo de mesa de madeira.
- Todos os textos em português do Brasil, com acentos corretos; use exatamente os textos que eu indicar, sem inventar outros.
- Não invente telefone, endereço, e-mail ou preços fora dos que eu indicar.
```

## TELAS

### 1. Entrada (dois caminhos)
```
Tela de boas-vindas. Topo: LOGO DO RESTAURANTE grande e centralizado. Título: "Bem-vindo ao SemReservas GastroPub". Dois cartões grandes empilhados:
(1) cartão laranja destacado: ícone de presente, título "Entrar no Toque Premiado", lista de 4 vantagens com ícones: "Ganhe pontos a cada visita", "Troque por cafezinho, sobremesa e prato grátis", "Promoção de aniversário", "Concorra a prêmios do mês", botão branco "Entrar ou cadastrar".
(2) cartão roxo discreto: "Continuar sem cadastro" e abaixo em texto pequeno "Você vê o cardápio e chama o garçom, mas não participa do clube de prêmios."
Rodapé pequeno: "SEMRESERVAS · uma tecnologia UmanDigital".
```

### 2. Home
```
Tela inicial do app. Cabeçalho fixo: LOGO DO RESTAURANTE à esquerda; à direita um botão "Entrar" (contorno) e um botão laranja "Chamar garçom" com ícone de mão levantada (NÃO usar sino).
Abaixo: um banner fechável (X no canto) "Cadastre-se no Toque Premiado e ganhe 50 pontos agora", imagem de fundo de prato.
Depois, 4 atalhos grandes em grade 2x2: "Cardápio", "Meu pedido", "Toque Premiado", "Serviços".
Um carrossel horizontal "Pratos do dia" com 3 fotos de pratos.
Rodapé institucional discreto no fim da rolagem: logo cinza "SEMRESERVAS · Um toque. Infinitas possibilidades." e "Uma tecnologia UmanDigital".
```

### 3. Cardápio estilo Reels (visitante e logado)
```
Duas telas lado a lado do cardápio em tela cheia, estilo Instagram Reels. Foto vertical de um hambúrguer ocupando quase toda a tela.
Tela A (visitante, sem login): abas de categorias no topo (Hambúrgueres, Pizzas, Porções, Bebidas), ícone de busca; embaixo, nome do prato "Burger Quádruplo", preço "R$ 62,90", legenda em 2 linhas no estilo do Instagram "Quatro carnes suculentas, cheddar derretido e bacon crocante no pão brilhante…" com "mais" em destaque no final, botão laranja "Adicionar" e botão contorno "Projete na mesa" com ícone de cubo. SEM curtir, SEM comentar, SEM compartilhar.
Tela B (logado): igual, mais uma coluna lateral discreta com apenas um coração (salvar).
```

### 4. Meu pedido
```
Tela "Meu pedido". Título e subtítulo "Mesa 3". Lista de 3 itens, cada um num cartão com miniatura da foto, nome, quantidade com botões − e +, e abaixo de cada item: ícone "i" para ver ingredientes e um campo "Observação (ex.: sem cebola)" com atalhos em chips: "Sem cebola", "Sem azeitona", "Sem picles", "Ponto da carne". Itens: "Burger Quádruplo", "Batata Rústica", "Refrigerante Lata". NÃO mostrar preços.
No rodapé fixo, UM único botão laranja grande: "CHAMAR GARÇOM". Nenhum outro botão de ação.
```

### 5. Garçom a caminho
```
Tela de alto contraste para o cliente mostrar ao garçom. Faixa verde no topo com ícone: "Garçom a caminho". Subtítulo: "Mostre a tela do seu celular para ele." Lista GRANDE e legível: "2 × Burger Quádruplo — sem cebola", "1 × Batata Rústica", "1 × Refrigerante Lata". Fonte muito grande, fundo escuro, sem preços. Abaixo, botão contorno "Fazer outro pedido".
```

### 6. Toque Premiado (clube)
```
Tela "Toque Premiado". Topo: saudação "Olá, Ana" e saldo grande "260 pontos". Barra de progresso horizontal em laranja mostrando o caminho até 1000 pontos, com 4 marcos ao longo da barra: 100 (cafezinho), 250 (sobremesa), 500 (bebida ou entrada), 1000 (prato grátis), marcos já alcançados preenchidos.
Seção "Seus prêmios": 4 cartões com ícone ilustrado e o texto "Cafezinho — 100 pts (resgatável)", "Sobremesa da casa — 250 pts (resgatável)", "Bebida ou entrada — faltam 240 pts", "Prato à escolha — faltam 740 pts".
Seção "Como ganhar pontos" em lista com ícones: "Visitar o restaurante +20", "Seguir no Instagram +30", "Avaliar no Google +100", "Responder à pesquisa +20".
Botão laranja "Ver extrato".
```

### 7. Aniversário
```
Cartão de promoção de aniversário em tela cheia, clima de festa mas elegante (confetes sutis, balões laranja e roxos). Título "Seu aniversário, nossa festa". Duas opções em cartões: "Traga 5 acompanhantes e seu prato é por nossa conta" e "No dia do aniversário, chame o garçom, mostre um documento e ganhe uma sobremesa da casa". Botão laranja "Quero participar". Texto pequeno: "Válido na semana do seu aniversário. Regras no regulamento."
```

### 8. Serviços
```
Tela "Serviços" com 5 itens em lista de cartões grandes com ícone à esquerda: "Wi-Fi do restaurante" (com botão "Copiar senha"), "Siga no Instagram +30 pts", "Avalie no Google +100 pts", "Sua opinião" (pesquisa), "Falar com o restaurante". Nada de "Chamar garçom" nesta tela.
```

### 9. Pós-conta
```
Tela exibida depois do cliente pedir a conta. Faixa verde: "Conta a caminho!". Título "Gostou? Ganhe pontos agora". Quatro cartões de ação com ícone e pontos: "Avalie no Google +100", "Siga no Instagram +30", "Curta os pratos que amou +10", "Deixe um comentário +20". Embaixo, uma linha com miniaturas dos pratos que a pessoa pediu, cada uma com um coração.
```

### 10. Sessão vencida
```
Tela simples e amigável: ícone de relógio, título "O tempo conectado venceu", texto "Para continuar, aproxime o celular da placa da sua mesa.", ilustração de um celular encostando numa placa NFC acrílica sobre a mesa, texto pequeno "Sem placa à vista? Chame alguém do salão."
```

### 11. Painel do dono, desktop (Toque Premiado)
```
Tela de computador (1920x1080) de um painel de gestão, mesma paleta roxo/laranja, menu lateral à esquerda (Resumo, Atendimento, Toque Premiado, Cardápio, Link da equipe). Tela "Toque Premiado" com três blocos: tabela "Ações que dão pontos" (ação, pontos, limite, botão editar), lista "Prêmios por nível" (100, 250, 500, 1000), e bloco "Extrato recente" (cliente, ação, pontos, data). No topo, cartões de resumo: "Cadastros no mês", "Resgates no mês", "Cliente do mês".
```

## IMAGENS DE APOIO (peça fundo transparente ou fundo roxo liso)

### A1. Ícones dos prêmios
```
Conjunto de 4 ícones ilustrados em estilo flat 3D suave, 512x512 cada, fundo transparente, paleta laranja #FF7A1A e roxo #4A2578 com brilhos pontuais: xícara de café expresso, sobremesa em taça, copo com bebida e porção de entrada, prato de comida com cloche. Mesma luz e mesmo traço nos 4.
```

### A2. Medalhas dos níveis
```
4 medalhas circulares em sequência crescente de brilho (bronze, prata, ouro, ouro com coroa), cada uma com um símbolo de toque (três ondas curvas de NFC) no centro, fundo transparente, 512x512.
```

### A3. Troféu do cliente do mês
```
Ilustração de troféu de cliente do mês com camiseta e caneca ao lado, estilo flat 3D, fundo transparente, 1024x1024, sem texto.
```

### A4. Cena "um toque"
```
Ilustração vertical de mão segurando um celular que encosta numa placa de acrílico em pé sobre mesa de restaurante, ondas laranja saindo do ponto de contato, fundo roxo #2A1148, sem texto, estilo editorial.
```

### A5. Ícone de chamar garçom
```
Ícone de linha 96x96, traço branco de 4 px, mão levantada chamando atendimento (NÃO sino), fundo transparente. Versão preenchida em laranja #FF7A1A.
```

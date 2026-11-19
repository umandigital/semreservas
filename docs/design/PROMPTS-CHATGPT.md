# Prompts para o ChatGPT (imagens e telas do layout final)

> **Atenção:** o arquivo `PROMPT-ATUALIZACAO-CHATGPT.md` é a especificação completa e prevalece sobre este (abas, regras de visitante/logado, textos exatos e lista de proibições). Use este só como apoio.

Como usar: abra uma conversa nova no ChatGPT (modelo com geração de imagens), **cole o BLOCO-BASE primeiro**, depois um prompt por vez. Peça sempre 2 variações. Revise os textos das imagens (a ferramenta erra acentos). Peça "sem logotipo, deixe um retângulo cinza escrito LOGO" e eu aplico o logo oficial depois (o logo aprovado não pode ser redesenhado).

## BLOCO-BASE (cole antes de tudo) — tema SemReservas GastroPub
Anexe junto o arquivo do logo do GastroPub (o logo em letras cursivas com o gorro de chef) e diga: "use o logo anexado exatamente como está, sem redesenhar, só aplique no topo".
```
Você é diretor de arte de um app mobile para o restaurante SemReservas GastroPub, feito pela plataforma SEMRESERVAS (marketing de relacionamento gastronômico, slogan "Um toque. Infinitas possibilidades."). O cliente abre o app encostando o celular numa placa NFC na mesa.
Gere SEMPRE telas de celular em retrato 9:19,5 (1080x2340), apenas a tela, sem moldura de aparelho, estilo mockup de produto digital limpo e caloroso (gastropub aconchegante, premium, descontraído).
Paleta obrigatória, extraída do logo do restaurante:
- Fundo vinho escuro #380818; painéis e cartões em tons de vinho um pouco mais claros (#4A1226 e #5E1B34); destaque terracota/laranja suave #E09060 para botões principais, itens ativos e títulos de destaque; texto principal creme #F8E8C8; texto secundário creme com 70% de opacidade. Aviso/erro #E5322D, sucesso #2FBF71.
- Cantos arredondados (14 px), botões altos (mínimo 48 px), alto contraste, fonte sem serifa moderna e legível (estilo Inter/Roboto). Títulos curtos podem usar uma fonte manuscrita/cursiva parecida com a do logo, nunca em textos longos.
- O logo do restaurante (anexado) fica no cabeçalho; NÃO invente outro logo. Se eu não anexar o logo, desenhe só um retângulo cinza com a palavra LOGO.
- Barra inferior com 4 abas: Início, Cardápio, Pedido, Prêmios (ícones de linha creme, aba ativa em terracota).
- O restaurante é o protagonista; a marca SEMRESERVAS só aparece pequena no rodapé institucional.
- Fotos de comida realistas, apetitosas, iluminação quente, mesa de madeira escura.
- Todos os textos em português do Brasil, com acentos corretos; use exatamente os textos que eu indicar, sem inventar outros.
- Não invente telefone, endereço, e-mail ou preços fora dos que eu indicar.
```

### Áreas personalizáveis pelo restaurante (peça ao ChatGPT para deixá-las bem marcadas)
Na Home há um **banner principal** (imagem do restaurante, título e botão), uma faixa de **destaque do dia** e o **cartão de promoção** (aniversário). O dono troca imagem, textos e cores pelo sistema. Veja `docs/design/TEMA-DO-RESTAURANTE.md` para o tamanho das imagens (banner 1080×1350 px, zona segura ao centro).

## TELAS

### 1. Entrada (dois caminhos)
```
Tela de boas-vindas. Topo: LOGO DO RESTAURANTE grande e centralizado. Título: "Bem-vindo ao SemReservas GastroPub". Dois cartões grandes empilhados:
(1) cartão terracota destacado: ícone de presente, título "Entrar no Toque Premiado", lista de 4 vantagens com ícones: "Ganhe pontos a cada visita", "Troque por cafezinho, sobremesa e prato grátis", "Promoção de aniversário", "Concorra a prêmios do mês", botão creme "Entrar ou cadastrar".
(2) cartão vinho discreto: "Continuar sem cadastro" e abaixo em texto pequeno "Você vê o cardápio e chama o garçom, mas não participa do clube de prêmios."
Rodapé pequeno: "SEMRESERVAS · uma tecnologia UmanDigital".
```

### 2. Home
```
Tela inicial do app. Cabeçalho fixo: LOGO DO RESTAURANTE (anexado) à esquerda; à direita um botão "Entrar" (contorno) e um botão terracota "Chamar garçom" com ícone de mão levantada (NÃO usar sino).
Abaixo: um BANNER PRINCIPAL grande (proporção 4:5, imagem do restaurante ou do prato-assinatura, com título curto sobre a imagem e um botão; deixe a área central livre de texto, é a zona segura que o dono vai trocar). Depois, um aviso fechável (X no canto): "Cadastre-se no Toque Premiado e ganhe 50 pontos agora".
Depois, 4 atalhos grandes em grade 2x2: "Cardápio", "Meu pedido", "Toque Premiado", "Serviços".
Um carrossel horizontal "Pratos do dia" com 3 fotos de pratos.
Rodapé institucional discreto no fim da rolagem: logo cinza "SEMRESERVAS · Um toque. Infinitas possibilidades." e "Uma tecnologia UmanDigital".
```

### 3. Cardápio estilo Reels (visitante e logado)
```
Duas telas lado a lado do cardápio em tela cheia, estilo Instagram Reels. Foto vertical de um hambúrguer ocupando quase toda a tela.
Tela A (visitante, sem login): abas de categorias no topo (Hambúrgueres, Pizzas, Porções, Bebidas), ícone de busca; embaixo, nome do prato "Burger Quádruplo", preço "R$ 62,90", legenda em 2 linhas no estilo do Instagram "Quatro carnes suculentas, cheddar derretido e bacon crocante no pão brilhante…" com "mais" em destaque no final, botão terracota "Adicionar" e botão contorno "Projete na mesa" com ícone de cubo. SEM curtir, SEM comentar, SEM compartilhar.
Tela B (logado): igual, mais uma coluna lateral discreta com apenas um coração (salvar).
```

### 4. Meu pedido
```
Tela "Meu pedido". Título e subtítulo "Mesa 3". Lista de 3 itens, cada um num cartão com miniatura da foto, nome, quantidade com botões − e +, e abaixo de cada item: ícone "i" para ver ingredientes e um campo "Observação (ex.: sem cebola)" com atalhos em chips: "Sem cebola", "Sem azeitona", "Sem picles", "Ponto da carne". Itens: "Burger Quádruplo", "Batata Rústica", "Refrigerante Lata". NÃO mostrar preços.
No rodapé fixo, UM único botão terracota grande: "CHAMAR GARÇOM". Nenhum outro botão de ação.
```

### 5. Garçom a caminho
```
Tela de alto contraste para o cliente mostrar ao garçom. Faixa verde no topo com ícone: "Garçom a caminho". Subtítulo: "Mostre a tela do seu celular para ele." Lista GRANDE e legível: "2 × Burger Quádruplo — sem cebola", "1 × Batata Rústica", "1 × Refrigerante Lata". Fonte muito grande, fundo escuro, sem preços. Abaixo, botão contorno "Fazer outro pedido".
```

### 6. Toque Premiado (clube)
```
Tela "Toque Premiado". Topo: saudação "Olá, Ana" e saldo grande "260 pontos". Barra de progresso horizontal em terracota mostrando o caminho até 1000 pontos, com 4 marcos ao longo da barra: 100 (cafezinho), 300 (sobremesa), 600 (chope ou entrada), 1000 (prato grátis), marcos já alcançados preenchidos.
Seção "Seus prêmios": 4 cartões com ícone ilustrado e o texto "Cafezinho — 100 pts (resgatável)", "Sobremesa da casa — 300 pts (faltam 40 pts)", "Chope ou entrada — 600 pts (faltam 340 pts)", "Prato à escolha — 1000 pts (faltam 740 pts)".
Seção "Como ganhar pontos" em lista com ícones: "Visitar o restaurante +40", "Seguir no Instagram +30", "Avaliar no Google +100", "Responder à pesquisa +20".
Botão terracota "Ver extrato".
```

### 7. Aniversário
```
Cartão de promoção de aniversário em tela cheia, clima de festa mas elegante (confetes sutis em terracota e creme, balões vinho e terracota). Título "Seu aniversário, nossa festa". Um cartão principal: "50% de desconto na comida do seu pedido" com 3 regras em lista: "Venha com no mínimo 5 acompanhantes", "Vale para comida, não vale para bebida", "Mostre um documento ao garçom". Botão terracota "Quero participar". Texto pequeno: "Válido na semana do seu aniversário. Regras no regulamento."
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
Tela de computador (1920x1080) de um painel de gestão, mesma paleta vinho/terracota/creme, menu lateral à esquerda (Resumo, Atendimento, Toque Premiado, Cardápio, Link da equipe). Tela "Toque Premiado" com três blocos: tabela "Ações que dão pontos" (ação, pontos, limite, botão editar), lista "Prêmios por nível" (100, 250, 500, 1000), e bloco "Extrato recente" (cliente, ação, pontos, data). No topo, cartões de resumo: "Cadastros no mês", "Resgates no mês", "Cliente do mês".
```

## IMAGENS DE APOIO (peça fundo transparente ou fundo vinho liso)

### A1. Ícones dos prêmios
```
Conjunto de 4 ícones ilustrados em estilo flat 3D suave, 512x512 cada, fundo transparente, paleta terracota #E09060, creme #F8E8C8 e vinho #5E1B34 com brilhos pontuais: xícara de café expresso, sobremesa em taça, copo com bebida e porção de entrada, prato de comida com cloche. Mesma luz e mesmo traço nos 4.
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
Ilustração vertical de mão segurando um celular que encosta numa placa de acrílico em pé sobre mesa de restaurante, ondas laranja saindo do ponto de contato, fundo vinho #380818, sem texto, estilo editorial.
```

### A5. Ícone de chamar garçom
```
Ícone de linha 96x96, traço branco de 4 px, mão levantada chamando atendimento (NÃO sino), fundo transparente. Versão preenchida em terracota #E09060.
```

# Análise de UX/UI do pacote de telas (23/11/2026)

Analisei **79 telas do app** (pacote B) e **44 telas do painel do estabelecimento** (pacote A), mais o app **como está implementado** hoje (`apps/consumidor`). As 19 telas de delivery ficaram de fora (módulo futuro).

## 1. Veredito
- **A linha visual está certa** (vinho, terracota e creme, ilustrações, logo). Não mexer.
- **O peso vem da quantidade de coisas por tela e do número de telas que dizem o mesmo.** O cliente chega para pedir um prato e é recebido por faixas, cartões, selos "Exemplo", tabelas de pontos e dois botões por tela.
- **O Clube é o ponto mais pesado**: a tela de pontos tem 7 blocos e letra de 11 a 13 pt, e a explicação do Clube é uma tabela.
- **O painel tem 44 telas; o teste precisa de 7.** O restante é útil depois, mas hoje cria a sensação de sistema complicado antes de o primeiro cliente usar.
- **Há inconsistências** entre as telas e as decisões já tomadas (seção 4). Algumas fariam o app prometer o que o sistema não entrega.

## 2. Problemas do app, por prioridade
| # | Problema | Onde aparece | Efeito | Correção |
|---|---|---|---|---|
| 1 | **Cabeçalho de 2 a 3 linhas** (logo + usuário; Mesa + Chamar garçom; título) ocupa cerca de **22% da altura** | todas as telas do Clube, Roleta e Pós-conta | menos conteúdo, mais rolagem, ruído | **Uma linha só**: logo pequeno, "Mesa 3", "Chamar garçom". O nome e os pontos da pessoa vão **dentro** da tela do Clube, não no cabeçalho |
| 2 | **Três fluxos de avaliação** que se sobrepõem: Pesquisa rápida, "Avalie seus pratos" (sanfona) e "Como foi a visita?" | telas 11, N12, C1 a C5 | o cliente não sabe qual usar; 5 estados (A avaliar, Em avaliação, Pendente, Avaliado, Dispensado) | **Um só fluxo**, "Como foi a visita?" (seção 3.4) |
| 3 | **Tela de pontos densa**: Saldo, Acumulado, marcos, prêmios, tabela "Como ganhar pontos" em 3 colunas, aniversário, visitas no mês | `N01-premios-logado-v2` | texto de 11 a 13 pt, 7 blocos | usar a v4 (`N01-clube-logado-v4`) como base e **cortar para 4 blocos** (seção 3.3) |
| 4 | **Texto pequeno**: chips de categoria, rótulos da barra inferior, tabelas de pontos, "Exemplo", legendas | Cardápio, Home (serviços), Clube | contraria a regra de 18 pt (nunca menos de 16) | piso de **16 pt** em tudo; **18 pt** no texto principal; rótulos da barra com 16 pt |
| 5 | **Home com 12 atalhos** no app implementado (3 grupos de 4) e 7 blocos no mockup | `Home.tsx`, `01_Inicio` | decidir demora; o essencial se perde | **4 blocos** (seção 3.1) |
| 6 | **Meu pedido com dois botões** ("Chamar o garçom" e "Mostrar pedido") e um campo de observação **por item** | `05_Meu_pedido` | dúvida sobre qual toca; lista longa | **um botão**, "Chamar garçom"; observação vira link "Observação" que abre o campo |
| 7 | **Duas famílias de cartão**: creme (explicações) e vinho (dados) misturadas na mesma tela | N04, N06, C3, C5 | tela parece colada de dois designs | **vinho é o padrão**; **creme só para "papel"**: comprovante e aviso em tela cheia |
| 8 | **Ícones da barra inconsistentes**: troféu, presente, estrela, cartão, garfo cruzado vs garfo, carrinho vs sino | 01 a 14, N13, R6, R9, R10 | quebra a regra "nada de troféu"; a aba muda de ícone | **um conjunto fixo** de 5 ícones (seção 3.6) |
| 9 | **Aniversário em duas telas quase iguais** (app e pública) com 6 regras | N06 | leitura longa | **uma tela**, com **3 regras** e o botão principal |
| 10 | **Selos de "Exemplo", "Demonstração", "Protótipo em estudo"** em quase toda tela | R*, C*, 08, 14 | ruído e desconfiança | só em **modo demonstração** do app, **um selo** pequeno no rodapé |
| 11 | **Roleta**: 20 fatias, "Faca sem fio", "Nem todo giro traz uma etapa" | R1, R3, R6 | contradiz a regra atual (cada giro dá uma etapa; o 5º ganha) | refazer com **5 fatias** (seção 3.5) |
| 12 | **Efeitos demais**: dupla moldura, brilho dourado no botão "Como foi a visita?", confete em várias telas | C2, N02, R* | competem com a ação principal | efeito só em **2 momentos**: troca realizada e prêmio da Roleta |

## 3. O que muda, tela a tela (alvo da versão de testes)

### 3.1 Início (4 blocos)
1. **Cabeçalho** de uma linha (seção 2, item 1).
2. **Cartão principal**: foto pequena do ambiente + botão grande **"Ver cardápio"**.
3. **Dois cartões lado a lado**: **"Meu pedido"** e **"Clube"** (visitante vê "Entrar").
4. **Serviços** em grade de 6 botões com ícone e rótulo de 16 pt ou mais: Wi-Fi, Pedir a conta, Fotos com moldura, Instagram, Avalie no Google, **Como foi a visita?**
Quando houver: **faixa "Roleta do Chef"** (só se há giro ou progresso) e **"Meu aniversário"** (só se o cadastro tem a data). **Saem da Início**: "Conecte-se", "Sua experiência", "Compartilhar o cardápio" (vai para dentro de Fotos), "Contato SemReservas" (vai para Sobre), banner de login com texto longo (vira um botão "Entrar" no cabeçalho).

### 3.2 Cardápio e prato
- Manter o feed (3D, vídeos, fotos), os chips (**16 pt**) e o botão **"Adicionar ao pedido"** como única ação principal; "Projete na mesa" fica como botão secundário.
- **Tirar o coração e o balão da lateral** (curtir e comentar só depois da conta).

### 3.3 Clube (4 blocos)
1. **Seus pontos** (número grande) e a barra com os marcos.
2. **Você pode trocar** + lista de prêmios com **"Trocar"**.
3. **Como ganhar pontos**: botão que abre a **lista completa** (`docs/13`), em vez da tabela na tela.
4. **Extrato** (link) e **"Como o Clube funciona"** (link para a animação).
Tirar: faixa "Como funciona o Clube" fixa no topo (vira link; a animação abre uma vez), "Saldo/Acumulado" (usar "Seus pontos" e, no extrato, "Total ganho"), "Toque Premiado", "pts", aniversário e visitas do mês dentro do Clube.

### 3.4 "Como foi a visita?" (um só fluxo, em 3 passos na mesma tela)
1. **Nota geral** com 5 estrelas (um toque). Já vale pontos.
2. **Contar mais (opcional)**: para cada prato do pedido, **"Gostei"** ou **"Pode melhorar"**, e um campo de comentário.
3. **Fechamento**: **Instagram** e **Avalie no Google** (cada um com "Abrir" e os pontos do `docs/10`, e a pergunta antes de sair).
Remove: sanfona, "Dispensar", "Desfazer", "Pendente", "Em avaliação", a tela "Pesquisa rápida" separada e o "Pós-conta" separado. O aviso **"Comentários aparecem após aprovação"** vai para uma linha única.

### 3.5 Roleta do Chef
- **5 fatias** (Panela, Faca, Fogão, Forno, Prato), todas com ícone grande e nome.
- Cada giro **sempre dá uma etapa nova**; no 5º, o prêmio. Telas: R0 Giro liberado, R1 Roleta, R2 Girando, R3 Resultado (sempre positivo), R4 Falta só 1, R5 Prêmio, R6 Como funciona, R7 Indisponível. **Fora**: R3 "sem etapa", "Faca sem fio", R8 e R9 viram estados do R5 e do R1.
- Abre pelo botão da **Início**, **não** pela aba Clube; a barra inferior não marca "Clube".

### 3.6 Barra inferior e navegação
- **Cinco abas fixas**: Início (casa), Cardápio (garfo e faca), Pedido (prancheta), Clube (cartão de membro), Sobre (i). Mesmo conjunto em **todas** as telas, sempre com **rótulo de 16 pt**. Telas de ação em tela cheia (Roleta girando, comprovante, comemoração) **sem barra**.

### 3.7 Entrada e cadastro
- Manter `N19` (escolher acesso) e `N20-cadastro-v2` (falta só um passo), mais `N21` (código). **Descartar** `N19-informar-email` e `N20-cadastro-email` (são o mesmo passo com outro nome). A tela de **sessão vencida** (N14) fica como está.
- **Indicar amigo (N13)**: refazer no mesmo cabeçalho e barra das demais.

### 3.8 Sobre e Minha conta
- Trocar o slogan "Muito além da mesa" por **"Um toque. Infinitas possibilidades."**; "Meu Clube" vira "Clube".

### 3.9 Regras visuais (código)
- **Tamanhos mínimos:** texto principal 18 pt; secundário e rótulos 16 pt; botão principal 56 pt de altura; toque mínimo de 48 pt.
- **Cores e textos no código**: já ficam em `CONFIG`/dados; o Clube passa a ler **todas** as regras, textos e valores de um arquivo de configuração por restaurante (`data/clube.ts`), nunca da tela.
- **Peso técnico:** o 3D carrega só quando o item aparece; imagens da Início em WebP pequeno; sem biblioteca nova de animação (CSS e SVG).

## 4. Inconsistências com o sistema e as decisões
| # | Onde | Diz | Deveria dizer / fazer |
|---|---|---|---|
| 1 | `08_Meu_Clube_pontos` | "Compra confirmada +40 pontos" e "não há pontos por seguir o Instagram" | Pontos **não** vêm de compra; Instagram dá **+20** |
| 2 | **Painel** `N17` Resumo | "Compras validadas 31", "Validados" na jornada do pedido | O sistema **não valida compra** (sem caixa). Mostrar **"Pedidos enviados ao garçom"** e **"Trocas de prêmios"** |
| 3 | `Clube.tsx` (código) | "Compras validadas pela equipe", "Aproximar o celular da placa não gera pontos", "Não damos pontos por avaliações no Google" | Visita (placa, logado) **dá +30**; Google **dá pontos pelo toque**; sem "validação da equipe" |
| 4 | `Clube.tsx` (código) | Prêmios 500, 800 e 1200 pontos | Catálogo de teste: **200, 350, 500, 1000** (`docs/10`, seção 12) |
| 5 | `N01-premios-logado-v2` | "Toque Premiado", "Saldo/Acumulado", "pts", aba "Prêmios" com troféu | **"Clube"**, "Seus pontos", "pontos", aba **Clube** com cartão |
| 6 | `N11-pos-conta-logado-v3` | Google "+10" | Google **+20** (valor de teste) |
| 7 | `LEIA-ME` do pacote B | "Avaliações públicas no Google não devem receber pontos" | Decisão de 23/11: pontos **só pelo toque que abre a página**, com o cliente optando (`docs/10`) |
| 8 | Painel `G2` Catálogo | Prêmios 200, 350, 600, 900 e "R$ 20 de desconto" | 200, 350, 500, 1000; **30% (até R$ 30, conta mínima R$ 80)** |
| 9 | Roleta `R1`, `R3`, `R6` | 20 fatias, "nenhuma etapa desta vez", "nem todo giro traz uma etapa" | 5 fatias; **todo giro dá etapa**; 5º giro ganha |
| 10 | Roleta (todas) | Aba **Clube** ativa | Roleta fica **fora** do Clube |
| 11 | `Sobre` | Slogan antigo | "Um toque. Infinitas possibilidades." |
| 12 | `05_Meu_pedido` | "Sem os 10% do garçom" | Retirar (não foi definido) |
| 13 | `Home.tsx` (código) | "Minha seleção", "Clube e prêmios", textos "Simulação: abriria o Instagram" | **"Meu pedido"**, **"Clube"**, links reais configuráveis |
| 14 | Painel, menu lateral | 9 itens em umas telas e 12 a 14 em outras (Campanhas, Desempenho, Configurações aparecem só em algumas) | **Menu fixo de 7 itens** em todas |
| 15 | Painel `N17` | "74% NFC / 26% QR" sem amostra | **"dados insuficientes"** abaixo da amostra mínima (regra 8) |
| 16 | Painel | "Teste da experiência" (N55) como tela do cliente | É **checklist interno do fundador**; sai do painel e vai para `docs/` |
| 17 | App (várias) | "Mostrar pedido" e "Editar pedido" no mesmo fluxo de garçom | Um fluxo: **Chamar garçom** → "Garçom a caminho" → "Cancelar chamado" |
| 18 | Barra inferior | Ícones diferentes por tela | Conjunto único (3.6) |

## 5. Painel do estabelecimento: de 44 para 7
**Menu fixo, 7 itens**, em desktop (a fila de chamados da equipe continua no celular):
1. **Resumo**: acessos, pedidos enviados ao garçom, visitas com pontos, trocas, cadastros. Só o que o sistema mede; amostra mínima; mediana.
2. **Atendimento**: fila de chamados em tempo real (a tela `N15` do celular é a mesma, com o link da equipe).
3. **Clube**: **uma tela com abas** — Regras de pontos (`N31`), Prêmios (`G2`) e Trocas (`N19`).
4. **Cardápio**: lista, **novo item** (`N39`) com mídia 3D e vídeo no mesmo formulário.
5. **Aparência**: logo, cores, textos, destaques da Início.
6. **Roleta e aniversário** (extras): ligar/desligar e valores, na mesma tela.
7. **Configurações**: dados da unidade, horário, placas NFC/QR, Wi-Fi, Instagram, Google, equipe.
**Fica para depois:** campanhas e desempenho, insights, moderação, pesquisa, indicações, delivery, promoções, canais de entrada, permissões detalhadas e clientes do Clube.
**Regras do painel:** letra de **14 px ou mais** (hoje 11 a 12), **uma ação principal por tela** ("Salvar"), confirmação antes de ajuste de pontos, e **toda ação sensível gravada em `audit_logs`**. O **portal geral SemReservas (Master)** fica para depois, como combinado.

## 6. Versão de testes do SemReservas GastroPub
**Fase T1: app em modo demonstração (sem banco).** Dá para o fundador testar no celular já:
Início e Clube simplificados; cadastro em 2 passos; visita (+30), regras de pontos e **todas as ações** com limites; troca com comprovante e prêmio guardado com validade; introdução animada do Clube; "Como foi a visita?" único; Roleta do Chef (modo demonstração); Meu aniversário; Indicar amigo. Tudo rotulado como demonstração.
**Fase T2: banco** (`apps/api/migrations/0005` em diante: membros, extrato imutável, catálogo, trocas, roleta, aniversário) com testes de isolamento. **Depende de o Supabase ser restaurado**; cada migração será colada por você no SQL Editor, antes do merge.
**Fase T3: painel do proprietário** (os 7 itens da seção 5).
**Depois:** campanhas, delivery, portal Master.
**Ordem na T1:** (1) cabeçalho, barra, Início e Pedido; (2) Clube e extrato; (3) cadastro e entrada; (4) "Como foi a visita?"; (5) introdução do Clube; (6) Roleta e aniversário.

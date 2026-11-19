# Indefinições, ações de pontuação e catálogo de prêmios

Atualizado em 19/11/2026. Legenda: **A** = bloqueia o Bloco A (telas), **B** = bloqueia a sessão de 90 min (banco), **C** = bloqueia o Toque Premiado, **D** = depois, **F2/F3** = fases futuras.

---
## PARTE 1. Lista de indefinições

### 1.1 Decisões de produto (só você responde)
| # | Tema | Pergunta | Minha recomendação | Bloqueia |
|---|---|---|---|---|
| 1 | Login do cliente | Como entra: **e-mail com código**, **WhatsApp** ou **Google**? | E-mail com código (funciona com o Supabase pronto, sem custo por mensagem). Google pode entrar depois como atalho. | C |
| 2 | Pontos: gasta ou acumula? | Ao resgatar um prêmio os pontos **são descontados** (como moeda) ou os níveis são **marcos acumulados** (sem desconto)? | **Saldo que se gasta**, com a barra mostrando o próximo prêmio. Os marcos acumulados enchem o restaurante de prêmios de graça. | C |
| 3 | Validade dos pontos | Pontos expiram? Em quanto tempo? | Expiram em **12 meses** sem visita (incentiva o retorno e limita o passivo). | C |
| 4 | Cupom de resgate | Quem dá baixa? Quantos por visita? Acumulam? | Garçom dá baixa por um campo "Validar cupom" no painel da equipe; **1 cupom por visita**; não acumulam com a promoção de aniversário. | C |
| 5 | Aniversário | "Seu pedido" é só o do aniversariante? A conta de 5 acompanhantes é conferida como? | Só o pedido do aniversariante; o **garçom conta** as pessoas da mesa e confere o documento. | C |
| 6 | Aniversário: antifraude | A data de nascimento pode ser alterada? | Editável **uma vez**, e o benefício só vale se a data foi cadastrada com **30 dias de antecedência**. | C |
| 7 | Cliente do mês | Critério de desempate, prêmio real, como divulgar, se o cliente vê a própria posição. | Critério: **dias com visita** no mês (1 por dia); empate: quem visitou primeiro no mês; o cliente vê só a própria contagem; divulgação só com autorização marcada. | D |
| 8 | Pontos por Instagram e Google | O sistema só sabe que o cliente **tocou** no link, não que seguiu ou avaliou. Aceita pontuar pelo toque? | Aceitar para o teste, **1 vez por pessoa**, e avisar o dono disso no painel. Para um controle real, só com integração oficial (futuro). | C |
| 9 | Comentários e curtidas (depois da conta) | Onde os comentários **aparecem**? Públicos no cardápio, só para o dono, ou moderados? | Aparecem **só para o dono** no começo. Público só com moderação, mais tarde. | D |
| 10 | Pedido: o que vira | O "Meu pedido" é só a **lista para o garçom** (sem enviar à cozinha)? Mostra subtotal? | Sim, só lista para o garçom; mostra subtotal ao cliente e nenhum preço na tela do garçom. | A |
| 11 | Pedido adicional | "Fazer outro pedido" cria uma lista separada, com horário, e chama o garçom de novo. Confirma? | Sim. | A |
| 12 | Chamado e distância | A verificação por distância fica **desligada** com a sessão de 90 min? O bloqueio de aparelho por trote continua? | Distância desligada; o limite por aparelho e a marcação de trote **continuam**. | B |
| 13 | Sessão de 90 min | Vale uma sessão por dia ou renova a cada toque na placa? Há limite máximo por dia? | **Renova a cada toque**; máximo de 3 sessões por aparelho por dia. | B |
| 14 | Home | Quantos banners? "Destaque do dia" é escolhido pelo dono ou automático? | Até 5 banners; destaque **escolhido pelo dono**. | A |
| 15 | Serviços | "Falar com o restaurante" abre WhatsApp, telefone ou e-mail? "Fotos com moldura" entra? | WhatsApp (se o restaurante tiver); **Fotos com moldura** só na Fase 2. | A |
| 16 | Busca e lista no cardápio | Manter a opção de **lista** além do feed, como está hoje? (pergunta 6 antiga) | Manter. | A |
| 17 | Entrada | Aparece **uma vez por visita** ou a cada abertura? | Uma vez por sessão. | A |
| 18 | Planos | Foto, Vídeo e 3D: ativação e mensalidade, trial, preços. | Ativação por produção do material; mensalidade por armazenamento e suporte; pacote de mídia por faixa. Valores só na Fase 3. | F3 |
| 19 | Rodapé Uman | Quais os dois links? Qual logo da Uman? | Site da Uman e site do SemReservas. | A |
| 20 | Rodízio (Pulpo) | Limite de pedidos pendentes por mesa; tela de sabor. | Decidir na Fase 2, com a Pulpo. | F2 |
| 21 | Tipo de operação da Pulpo | À la carte, rodízio, delivery ou mais de um? | Definir antes da Fase 2. | F2 |
| 22 | Buffet do dia | Vale a pena construir? | Validar com 2 buffets antes. | F3 |

### 1.2 O que depende de material ou de ação sua
| # | Item | Situação |
|---|---|---|
| 23 | **Projeto Supabase pausado** | Reativar em `supabase.com/dashboard/project/sfkizybwaclittzapafy` (**Restore project**). Sem isso o painel mostra "SEM CONEXÃO" e nada que usa o banco funciona. Para produção, avaliar o plano pago (o gratuito pausa por inatividade). |
| 24 | Logo do GastroPub sem fundo | Recebido com o fundo vinho dentro. Preciso de PNG transparente ou SVG para trocar a cor do tema. |
| 25 | Logo da Uman | Para o rodapé. |
| 26 | Wi-Fi guest do GastroPub | Nome da rede e senha (de teste, se for fictício). |
| 27 | Contato do restaurante | Canal do "Falar com o restaurante". |
| 28 | Legenda de cada prato | Texto do proprietário. Posso redigir uma versão de teste. |
| 29 | Cardápio real e fotos | Itens, preços, fotos e alérgenos (hoje é de teste). |
| 30 | Aprovação dos prêmios e valores | Ver Parte 3; incluir o **teto de valor** do prato grátis. |
| 31 | Regulamento, política de privacidade e termo de uso | Quem revisa (jurídico)? Prazo? Necessário antes de abrir o cadastro de aniversário e do clube. |
| 32 | Tablet da equipe | O GastroPub tem tablet ligado na tomada para o painel? |
| 33 | Placas e tags NFC | Chegam na semana indicada por você; a URL gravada deve ser curta e estável, não o endereço de teste. |
| 34 | Endereço definitivo | Manter `/semreservas` ou ir para a raiz do domínio? Define a URL gravada na tag. |

### 1.3 Pontos técnicos em aberto
| # | Item | Situação |
|---|---|---|
| 35 | **Realidade aumentada: escala** | Em um aparelho o prato ficou ~19% menor que o real (erro de escala do ARCore). Funciona bem no teste mais recente. Falta testar em **outros celulares** e decidir se oferecemos calibração por aparelho. |
| 36 | RA no **iPhone** | O Safari não tem WebXR; o caminho é Quick Look. **Nunca testado** em iPhone real. |
| 37 | Aviso sonoro com o painel minimizado | O painel instalado já alerta com som e pisca; o **push** (notificação do sistema) ainda não foi entregue. |
| 38 | "Esqueci a senha" do dono | Não implementado. |
| 39 | Painel da equipe: separar "sem internet" de "servidor indisponível" | Proposto, aguardando seu OK. |
| 40 | Mesa sem sessão e domínio novo | O app guarda a mesa por navegador **e por domínio**: no endereço novo é preciso abrir o link da placa de novo. |
| 41 | Links das placas de teste | Hoje só estão no banco. Posso listar no painel do dono, com QR. Aguardando seu OK. |
| 42 | Painel da equipe instalado no domínio antigo | Continua funcionando, mas é outra instalação. |

---
## PARTE 2. Todas as ações que dão pontos

### 2.1 Ações definidas (valores sugeridos, o dono ajusta)
| # | Ação | Pontos | Limite | Como o sistema valida |
|---|---|---|---|---|
| P1 | Cadastrar-se | 50 | 1 vez por pessoa | conta criada com e-mail confirmado |
| P2 | Visita (encostar na placa, logado) | 40 | 1 por dia | placa válida + sessão aberta |
| P3 | Bônus de frequência: 3 visitas diferentes no mesmo mês | 60 | 1 por mês | conta os dias com visita |
| P4 | Seguir no Instagram | 30 | 1 vez por pessoa | toque no link (não comprova o "seguir") |
| P5 | Avaliar no Google | 100 | 1 vez por pessoa | toque no link (não comprova a avaliação) |
| P6 | Responder à pesquisa da visita | 20 | 1 por visita | pesquisa enviada |
| P7 | Compartilhar com a marca | 30 | 1 por semana | toque em compartilhar (não comprova a postagem) |

### 2.2 Ações do pós-conta que **ainda não têm pontos definidos**
Estão na tela pós-conta, mas falta você dizer se pontuam e quanto: **curtir os pratos que amou** (sugestão +10, até 3 por visita) e **deixar um comentário** (sugestão +20, 1 por visita, com moderação).

### 2.3 Ações que **não foram incluídas**, para você decidir
- Indicar um amigo que se cadastra (+50 para quem indicou).
- Primeira visita do mês (extra) ou **visita em dia de baixo movimento** (ex.: terça, +20).
- Aniversário: visita na semana do aniversário (pontos extras além do desconto).
- Postar foto e marcar o restaurante.
- Experimentar um prato novo do cardápio.
- Check-in de grupo: mesa com 4 ou mais pessoas logadas.
Nada disso entra se você não pedir.

### 2.4 Regras gerais de pontuação
- Cada ponto vira uma **linha de extrato** (quem, quando, ação, valor, origem); o dono audita no painel.
- Pontos pertencem à **pessoa logada**, nunca à mesa nem ao aparelho.
- Limites por ação e por dia impedem fraude; o dono pode desligar qualquer ação.
- Os valores acima entram no sistema como dado, nunca fixos no código.

---
## PARTE 3. Catálogo de prêmios que o proprietário pode escolher

O dono monta a lista dele: **nome, descrição, pontos, imagem, validade do cupom (padrão 24 h), limite por mês (estoque), dias e horários em que vale, e categoria elegível** (comida, bebida, tudo). Exemplos por faixa:

### Faixa 100 pontos (primeira visita; custo baixo)
- Cafezinho ou café expresso
- Água ou refrigerante em lata
- Molho extra da casa
- Adesivo, imã ou chaveiro da marca
- Upgrade de tamanho da bebida
- Brinde de boas-vindas (bala ou bombom)

### Faixa 300 pontos
- **Sobremesa da casa** (porção pequena)
- Petisco pequeno
- Drink sem álcool ou suco
- 10% de desconto na comida da próxima visita
- Segunda porção de molho + batata pequena

### Faixa 600 pontos
- **Chope, refrigerante ou entrada**
- Porção de batata ou de aperitivo
- 15% de desconto na comida
- Combo lanche + bebida simples
- Sobremesa + café

### Faixa 1000 pontos (topo, com teto de valor)
- **Prato à escolha grátis** (teto de valor definido pelo dono)
- Hambúrguer + bebida
- Camiseta ou caneca da casa
- Rodízio grátis (para restaurantes de rodízio)
- Pizza média grátis (pizzarias)

### Faixa 1500 pontos ou mais (opcional, clientes fiéis)
- Jantar para dois (valor máximo definido)
- Degustação ou experiência do chef
- Mesa reservada no evento do mês
- Kit da casa (camiseta + caneca + brinde)

### Exemplos por tipo de restaurante
| Tipo | Sugestões |
|---|---|
| Gastropub / bar | cafezinho, chope, porção, hambúrguer grátis, caneca |
| Pizzaria | refrigerante, borda recheada, pizza broto, pizza média grátis |
| Rodízio | sobremesa, bebida, desconto no rodízio, rodízio grátis |
| Café / confeitaria | café, fatia de bolo, torta inteira, kit de presente |
| Buffet | sobremesa, suco, desconto no quilo, refeição grátis |
| Delivery | taxa de entrega grátis, bebida, sobremesa, desconto na próxima entrega |

### Boas práticas (para o dono)
- Use prêmios de **custo baixo** nas faixas iniciais (cafezinho custa centavos e traz o cliente de volta).
- O **prato grátis** custa ao restaurante em torno de 30% do preço, e quem chega lá visitou muitas vezes.
- Prefira **desconto em comida** a dinheiro; limite por mês para controlar o custo.
- Cupom com **validade** (24 h) e **uso único** evita abuso.
- Revise os prêmios a cada trimestre pelo extrato de resgates no painel.

### Ritmo para alcançar cada faixa (com os valores sugeridos)
Considera cadastro e Instagram na 1ª visita (80 pontos) mais visitas de 40 pontos e o bônus de 60 pontos a cada mês com 3 visitas ou mais. Sem Google nem pesquisa; com eles o ritmo é maior.
| Cliente | 100 | 300 | 600 | 1000 |
|---|---|---|---|---|
| 2 visitas por semana (~380 pts/mês) | 1ª visita | ~3 semanas | ~1,5 mês | ~3 meses |
| 1 visita por semana (~220 pts/mês) | 1ª visita | ~1 mês | ~2,5 meses | ~4,5 meses |
| 1 visita por mês (40 pts/mês, sem bônus) | 2ª visita | ~7 meses | não alcança antes de expirar | não alcança |
O último caso mostra por que a **validade de 12 meses** faz sentido: quem aparece raramente não acumula o suficiente para o prato grátis.

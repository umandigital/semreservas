# Ajustes do MVP, primeira leva (doc do fundador de 19/11/2026)

Documento de trabalho: cada item do `Ajuste_MVP_Sem_Reservas.docx` com **decisão**, **resposta às perguntas** e **o que muda no sistema**. O que está marcado ✅ foi decidido; ⏳ aguarda você.

## Decisões já tomadas
| # | Decisão | Valor |
|---|---|---|
| D1 | Sessão por tempo, sem bloqueio por distância | ✅ **90 min por placa**, configurável por restaurante. Vencida: "O tempo conectado venceu. Aproxime o celular da placa para continuar." |
| D2 | Várias pessoas na mesma mesa | ✅ **Sessão por aparelho, chamado por mesa** (1 aberto por mesa, como hoje). Pontos são da **pessoa logada**, nunca da mesa. |
| D3 | Nome do programa de pontos | ✅ **Toque Premiado** (cada restaurante pode renomear) |
| D4 | Tela do Pedido | ✅ "Meu pedido", 1 único CTA **CHAMAR GARÇOM**, tela "Garçom a caminho", ingredientes e observações por item, pedido novo separado |

## Mapa dos itens (numeração = ordem do documento)

### Entrada, header e home
| Item | Decisão e resposta | Mudança no sistema |
|---|---|---|
| 7. Entrada com dois caminhos | Tela de boas-vindas: **Entrar no Toque Premiado** (lista as vantagens) ou **Continuar sem cadastro** (diz: "sem pontos e sem prêmios"). | Reescrever `BoasVindas`; guardar a escolha na sessão. |
| 14. Header | Sempre: **logo do restaurante**, **Entrar** e **Chamar garçom** (ícone de mão/campainha de mesa, **não sino**). Sem sessão de mesa, "Chamar garçom" explica "aproxime o celular da placa". | Novo `Header`; remove o sino. |
| 15. Aviso de cadastro na home | Pode ser **fechado** (X) e não volta naquele aparelho por 7 dias. | Estado local com data. |
| 18 e 19. Ações para não logados / vantagens do cadastro | Ações que exigem login (curtir, salvar, comentar, compartilhar com pontos) **não aparecem** para visitante. Em vez delas, um único bloco discreto "Cadastre-se e ganhe pontos" com a lista de vantagens. | Esconder UI por estado de login. |
| 20. Contato SemReservas | Sai da tela. **Rodapé** discreto: logo SEMRESERVAS + slogan + "**Uma tecnologia UmanDigital**" (logo Uman) com os dois links. Vale misturar? **Sim, no rodapé**: o restaurante segue protagonista (regra da identidade aprovada) e a Uman ganha vitrine para quem quer site/sistema. Nunca no topo nem em destaque. | Componente `RodapeInstitucional`; links configuráveis. |

### Cardápio
| Item | Decisão | Mudança |
|---|---|---|
| 17. Ingredientes → legenda estilo Reels | Novo campo **legenda** por prato, texto único do proprietário (lúdico, publicitário ou seco), cortado em 2 linhas com "**…mais**" que expande. **Ingredientes** continuam como lista própria, **só no Pedido** (ícone) e no cartaz da RA. | Campo `legenda` em `ITENS` e no editor do dono. |
| 16. Curtir/comentar/compartilhar antes de comer não faz sentido | Concordo. Passam para **depois da conta**: ao tocar "Pedir a conta", abre "Conta a caminho! Ganhe pontos: ⭐ avalie no Google, 📷 siga no Instagram, ❤️ curta os pratos que amou, 💬 comente". Antes de comer o feed tem só **Adicionar** e a RA. | Remove ações sociais do reel; nova tela pós-conta. |
| 13. RA, Foto, Vídeo, 3D como planos | Ver "Planos" abaixo. | Só comercial. |

### Pedido (itens 1, 2, 21 e 22)
- "Minha seleção" vira **Meu pedido**.
- **Códigos** que aparecem hoje: são o identificador curto do pedido para o garçom localizar na hora e para a pessoa mostrar sem ler a lista inteira. Com o novo fluxo (a lista aparece direto na tela do garçom), **o código sai** da tela do cliente e fica só no registro.
- Um único CTA grande: **CHAMAR GARÇOM**. Ao tocar: tela cheia "**Garçom a caminho. Mostre a tela do seu celular para ele.**" com a lista (quantidade × nome, observações), **sem preços**.
- Por item: ícone **ⓘ ingredientes** (abre lista e alérgenos) e campo **observação** com atalhos rápidos (*sem cebola, sem azeitona, sem picles, ponto da carne…* configuráveis).
- **Pedidos novos** (mais bebidas): resposta à sua pergunta, **sim, funciona e é simples**: depois do primeiro pedido, a tela mostra "**Fazer outro pedido**". Cada pedido é uma lista separada com seu horário; tocar em "Chamar garçom" de novo abre um novo chamado (o painel da equipe já separa chamados por mesa e motivo). A lista de pedidos da mesa fica na tela para o cliente ver o que já pediu.

### Toque Premiado (itens 3, 4, 5, 6, 8, 9 e 10)
Tudo é **configurável pelo proprietário** e **auditável**: cada ponto vira uma linha de extrato (quem, quando, ação, valor) e o painel do dono lista as ações e filtra por pessoa. Valores abaixo são **exemplos** para o dono ajustar.

**Como ganhar pontos (extrato de ações)**
| Ação | Pontos (exemplo) | Regra antifraude |
|---|---|---|
| Cadastrar-se | 50 | 1 vez por pessoa |
| Visita (tocar a placa) | 20 | 1 por dia, só com login |
| Seguir no Instagram (clique) | 30 | 1 vez; o clique é a intenção, não se prova a ação (disclaimer ao dono) |
| Avaliar no Google (clique) | 100 | 1 vez por pessoa; idem |
| Avaliar na pesquisa interna | 20 | 1 por visita |
| Compartilhar/postar com marca | 30 | limite por semana |
| Aniversário (visita no mês) | prêmio especial | validado pelo garçom |

**Níveis e prêmios (barra de progresso na tela)**
| Pontos | Prêmio (exemplo) |
|---|---|
| 100 | Cafezinho |
| 250 | Sobremesa da casa |
| 500 | Bebida ou entrada |
| 1000 | **Prato à escolha grátis** (máximo) |

- Tela: saldo, **barra** até o próximo prêmio, lista dos prêmios com o que falta, extrato.
- **Resgate**: o cliente gera um cupom (código curto, uso único, vale 24 h). O garçom confere e **dá baixa no painel da equipe** (campo "validar cupom"). Esse é o único acréscimo ao painel simples da equipe.
- **Aniversário** (item 4): dois modos, o dono escolhe: (a) **Traga 5 acompanhantes e seu prato é de graça**; (b) **sobremesa da casa**, validada pelo garçom que confere a identidade. A data de aniversário é pedida no cadastro; o benefício vale na semana do aniversário.
- **Cliente do mês** (item 8): ranking por **dias com visita** no mês, não por gasto. Prêmio especial (camiseta, caneca…) e **divulgação nas redes só com autorização dada no cadastro** (LGPD).
- Painel do proprietário: tela **Toque Premiado** para editar ações, valores, prêmios, aniversário e ver extrato, resgates e ranking.

### Sessão e mesa (itens 11 e 12)
- **Vários na mesma mesa**: sem problema com a decisão D2. Cada aparelho tem a sua sessão de 90 min; pontos só para quem está logado; o garçom vê **um** chamado por mesa. Risco aceito: duas pessoas podem pedir o mesmo atendimento, o painel mostra um só.
- **Tempo em vez de distância**: reduz trote (quem está longe não tem a placa) e simplifica (some a permissão de localização). Os campos de distância seguem no banco, desligados.

### Planos (item 13)
Minha opinião: **a diferença entra nos dois**.
- **Ativação**: paga a **produção do material** (foto < vídeo < 3D, que dá mais trabalho de modelagem e conferência de tamanho).
- **Mensalidade**: cobre **armazenamento, hospedagem e suporte** da mídia; plano base único por restaurante e um **pacote de mídia** por faixa (até N pratos em 3D/RA).
- Os preços ficam como dado configurável; não fixamos valores no sistema.

### Serviços (item 23)
Sugestão do que entra: **Wi-Fi** (nome e senha com copiar), **Siga no Instagram** (+pontos), **Avalie no Google** (+pontos), **Sua opinião** (pesquisa), **Falar com o restaurante** (WhatsApp/telefone configurável). **Chamar garçom** sai daqui (vai para o header e para o Pedido). **Fotos com moldura** fica para a Fase 2.

## Ordem de execução proposta
1. **Bloco A, só tela (rápido):** header, entrada com dois caminhos, home com aviso fechável, legenda "…mais", esconder ações para visitante, rodapé institucional, Serviços, Meu pedido com CTA único.
2. **Bloco B, banco:** sessão de 90 min (tabela de sessões, validação no chamado), migração 0005.
3. **Bloco C, Toque Premiado:** extrato de pontos, níveis, cupom e baixa pelo garçom, aniversário, tela do dono.
4. **Bloco D:** pós-conta (pontos), ranking mensal, pedidos adicionais.

## Pendente de você ⏳
- Logo vetorial do SemReservas (o arquivo veio cortado) e logo Uman para o rodapé.
- Instagram e link de avaliação do Google do GastroPub; Wi-Fi guest.
- Prêmios e valores reais do Toque Premiado do GastroPub; regra do aniversário (a ou b).
- Texto da **legenda** de cada prato (posso redigir uma versão de teste).
- Revisão jurídica do regulamento do clube e da política de privacidade (já pendente da Fase 2).

# 01 — Documento consolidado de escopo e decisões

**SEMRESERVAS — Marketing de relacionamento gastronômico**  
**Versão:** handoff técnico v1.0 / 04-11-2026  
**Natureza:** especificação consolidada para revisão antes do MVP; não são funcionalidades já implementadas.

## 1. Identidade do negócio

A SEMRESERVAS é um serviço SaaS multiestabelecimento para aproximar clientes de restaurantes, bares, pizzarias, cafeterias e gelaterias por meio de experiências digitais acessadas por **TAGs NFC**, QR Code e links. O núcleo de valor é gerar **interação mensurável, relacionamento, fidelização e inteligência de marketing** para o negócio; a TAG é o canal físico mais reconhecível, não o produto inteiro.

A SEMRESERVAS complementa sistemas de PDV, caixa, estoque, cozinha, gestão fiscal e logística existentes. Não os substitui e não contabiliza vendas sem validação confiável. Não faz reservas de mesas. Não requer aplicativo nativo. O consumidor usa navegador no telefone.

### Três pilares aprovados

- **Experiência:** descoberta visual do cardápio, feed com fotos/vídeos, produtos expandidos, ingredientes, montagem de seleção e acesso a serviços.
- **Relacionamento:** clube, pontos, recompensas, campanhas, pesquisas, sugestões e participação nas interações.
- **Inteligência:** coleta proporcional de eventos, indicadores de engajamento, relatórios mensais com recomendações produzidas por IA e conferência.

### Objetivo comercial B2B

O cliente contratante é o **dono ou gestor** do estabelecimento, não o consumidor final. A venda inicial acontece presencialmente em Bagé/RS, demonstrando no próprio celular a experiência NFC no display de acrílico. O relatório mensal entregue proativamente ajuda a traduzir as interações em oportunidades de marketing, sem prometer aumento de faturamento.

### Execução confirmada

- Desenvolvimento conduzido pelo fundador com apoio de ferramentas de IA; sem terceirização integral prevista.
- Criação do **SEMRESERVAS RESTOPUB**, estabelecimento fictício funcional usado como laboratório e demonstração.
- Após protótipo e MVP estáveis, **PULPO Cozinha Criativa**, em Bagé/RS, será o primeiro piloto real proposto.
- Início comercial local e consultivo, porta a porta.

## 2. Marca e personalização

Usar **sem redesenhar** o logo aprovado fornecido pelo projeto: símbolo S com ondas NFC em laranja, palavra SEM em roxo e RESERVAS em laranja, tipografia aprovada. A customização do webapp deve colocar a **marca do estabelecimento em primeiro plano**, mantendo uma identificação discreta SEMRESERVAS/contato em rodapé ou área "Sobre a tecnologia". Nenhuma customização deve demandar fork de código: tokens visuais, logotipo, banner, textos, ordem de seções, categorias, módulos e mídias são dados da unidade.

Para o RESTOPUB, há uma identidade demonstrativa com roxo/laranja. Para a PULPO, cores e conteúdo são **proposta visual temporária**: o Instagram não pôde ser consultado integralmente neste ambiente; nenhum logo, fotografia, preço ou cardápio foi validado pelo estabelecimento. O protótipo distingue isso claramente.

## 3. Contextos de acesso

1. **Mesa/salão:** TAG NFC 213 e QR Code, com URL curta pública que identifica a origem/estabelecimento, **sem número de mesa obrigatório**. O display pode circular pelas mesas; o garçom anota a mesa ao atender.
2. **Casa/delivery:** ímã com NFC apropriado para metal e QR, link público ou site do restaurante; montagem e encaminhamento de pedido a WhatsApp, sem pagamento online inicial (no roadmap, sujeito à priorização).
3. **Sites e campanhas:** URL contextualizada, com origem rastreável quando possível.

Os identificadores NFC/QR não autenticam pessoas. A URL é permanente e reatribuível no servidor se o suporte retornar. Depois de gravada e testada, a TAG deve ser bloqueada contra regravação; não tratar o bloqueio como prova de autenticidade criptográfica da origem.

## 4. O que o cliente faz SEM login

Acesso ao estabelecimento via NFC/QR/site; Home; cardápio; fotos/vídeos/ingredientes; busca e filtros por categoria dentro do feed; montar e revisar seleção; apresentar pedido ao garçom (em tela de contraste elevado **sem preços**); iniciar chamado de atendimento/conta; abrir Instagram; abrir link de avaliação espontânea no Google; ver dados de Wi-Fi de convidados e copiar senha; ver campanhas e benefícios públicos; abrir pesquisa interna opcional; gerar fotos com molduras e baixar/compartilhar; compartilhar produtos; curtir e favoritar localmente com limites antifraude (não são compras validadas).

Uma visita anônima não deve ser bloqueada por modal de cadastro. O app pode criar identificador de sessão pseudônimo de curta duração para antifraude e métricas agregadas, observando privacidade e transparência.

## 5. O que EXIGE identidade e/ou validação

- **Carteira de pontos**, histórico pessoal, acumulação associada à pessoa e resgate: identificação e pertencimento ao clube; crédito depende de regra e validação servidor/equipe.
- **Comentários públicos persistentes** associados a perfil: preferir conta identificada, moderação e regras de convivência. Avaliação interna de prato com selo "compra verificada" exige prova de consumo; outros depoimentos sem verificação devem ser rotulados.
- **Ações internas pontuáveis:** usuário identificado e critérios objetivos; pesquisa anônima pode existir, mas não pontua.
- **Gestor, operador de atendimento e admin Master:** autenticação segura e autorização por papel/estabelecimento.
- **Marketing personalizado:** autorização/hipótese legal apropriada por finalidade; login não implica consentimento publicitário.

Não condicionar a avaliação pública no Google a login na SEMRESERVAS nem dar pontos, brinde ou qualquer vantagem por isso. Não afirmar que cliques no Instagram comprovam curtidas/seguidores.

## 6. Experiência do consumidor: estrutura aprovada para esta proposta de UI

- **Home inicial personalizada** por estabelecimento, mostrando as 4 ações mais relevantes com rótulos legíveis (cardápio, pedido, clube, chamar garçom) e grupos secundários (presença digital, serviços/conexão, experiências/pesquisas).
- **Rodapé fixo** com Início, Cardápio, Pedido, Clube e Serviços; cabeçalho compacto com marca do estabelecimento e ações rápidas.
- **Cardápio em feed vertical** tipo Instagram/Reels. Foto ou vídeo; nome e preço destacados; descrição/ingredientes apresentados em gradiente sobre a mídia, expansíveis por toque/deslize; curtidas, comentário, favorito, compartilhar e botão primário adicionar ao pedido.
- **Categorias visíveis como chips/destaques**, com seleção filtrando o feed. Não existe tela obrigatória de cardápio em lista por categoria nesta versão.
- **Pelo menos 4 produtos de demonstração por categoria** no RESTOPUB e PULPO, com mídias ilustrativas quando não há fotografias reais.
- **Pedido do cliente:** quantidades, observações e subtotal estimado; **modo garçom** exibido somente após clique, com itens/quantidades/código de apresentação, sem preço. Abaixo da lista deve haver botão "Chamar garçom".
- **Chamado de garçom:** sinal visual muito destacado e som no painel operacional após ativação humana do áudio. Sem mesa vinculada ao QR/NFC, solicitar região aproximada/descrição opcional e oferecer código de 4 caracteres/dígitos a ser mostrado; confirmar presencialmente. A viabilidade operacional precisa ser testada na PULPO antes de habilitar no local.

## 7. Três áreas do sistema

**A. Webapp do consumidor:** experiência pública, interações, seleção de pedido, clube, serviços e mídia. Exibição e capacidades dependem da configuração da unidade.

**B. Painel Master SEMRESERVAS:** criar/gerir estabelecimentos e unidades; status de teste/ativo/pausado; publicação da Home; configuração de identidade; importação de produtos; catálogo de mídia; feature flags; NFC/QR; usuários e permissões; suporte, operações; custos; fila e aprovação dos relatórios. Mudanças de configuração chegam ao consumidor sem fork ou nova compilação.

**C. Painel do proprietário/equipe:** indicadores e relatórios claros, engajamento por produto, campanhas, clube e recompensas, pesquisas e comentários, operação de atendimento e alertas. O proprietário não gerencia clientes de outros estabelecimentos. O painel pode exibir funções distintas para proprietário, gerente e atendente, conforme papel.

## 8. Recurso crítico: fila de atendimento

O "chamar garçom" não pode ser um botão cosmético. A aplicação precisa ter confirmação real de recebimento e fila monitorada, com estados `PENDING → ACKNOWLEDGED → RESOLVED` (ou `CANCELLED`/`EXPIRED` quando aplicável), registros de tempo e responsável, deduplicação e indicadores. O painel exibe alerta de prioridade alta, contador, área informada, código, momento da chamada e botões para assumir/concluir. O áudio só pode ser prometido após o operador habilitar o som, e a operação deve ter alternativa visual sempre disponível.

**Risco pendente:** sem número fixo de mesa e sem localização indoor, o sistema não sabe onde a pessoa está. A solução mínima proposta é código + área aproximada opcional + conferência humana. Se isso se mostrar insuficiente, o recurso fica desabilitado até haver solução operacional — sem renunciar à portabilidade dos displays.

## 9. Relatório mensal com IA e revisão humana

O proprietário terá dashboard e receberá periodicamente um relatório proativo, gerado a partir de contagens verificáveis, com análise assistida por IA e conferência. O relatório apresenta: acessos, origem NFC/QR/site, exploração e mídia de produtos, curtidas/favoritos/quero provar, comentários moderados, pesquisas e sugestões, clube e pontos validados, recompensas, chamadas atendidas e seus tempos, participação em campanhas, links externos, fotos e molduras (aberturas, artes geradas, downloads e compartilhamentos iniciados). Cada insight responde: **o que observamos, o que isso pode significar, o que testar e como medir**; deve expor amostra, limites e ausência de dados.

**Sem vendas presumidas.** Não interpretar pedido montado como venda. Sem PDV integrado, nenhuma receita ou aumento de faturamento pode ser atribuído à SEMRESERVAS. Não confundir clique para Google com avaliação publicada; nem clique em Instagram com curtida/seguidor.

## 10. Sequência de implantação

**Marco 0 — materiais:** homologar TAG 213, TAG 215 blindada para metal, displays, gravação de URL e bloqueio permanente após testes. **Marco 1 — RESTOPUB funcional:** todas as principais jornadas simuladas e integração das três áreas. **Marco 2 — MVP operacional:** multiestabelecimento, autorização, NFC/QR, cardápio, pedido presencial, telemetria confiável, publicação/feature flags, clube básico e relatórios. **Marco 3 — piloto PULPO:** obter dados, marca, cardápio e consentimentos reais; operar com equipe treinada e medir adoção. **Marco 4 — Bagé:** venda presencial com demonstração e teste comercial controlado.

## 11. Comercial: valores são apenas referência

Tabelas anteriores citavam planos Iniciante/Presença/Relacionamento/Negócios, Delivery e SEMRESERVAS Social. Após reavaliações, houve proposta de plano principal mais simples, sem aprovação comercial definitiva. **Não programar preços rígidos ou planos por nome no front-end.** Modelar catálogo de planos, entitlements, limites, testes e serviços adicionais configuráveis. Teste gratuito de 30 dias e dispensa promocional de ativação são **propostas para validação**, não regras aprovadas.

Produção de vídeos especiais/IA gastronômica é um serviço separado do software; usuário pode subir fotos e vídeos próprios no limite técnico definido. WhatsApp Marketing automatizado é adicional pago e deve respeitar opt-in e requisitos da plataforma externa.

## 12. Status e decisões

| Item | Status nesta entrega |
|---|---|
| Marca SEMRESERVAS e logo visual fornecido | Aprovado; não redesenhar |
| Três pilares; NFC protagonista; SaaS web | Aprovado |
| Nenhuma reserva de mesa; sem substituição de PDV | Aprovado |
| Login opcional ao consumidor; obrigatório para pontos pessoais | Diretriz consistente com Documento Mestre + refinamento confirmado |
| Sem número de mesa na TAG/placa, displays móveis | Decisão posterior explícita |
| Pedido mostrado ao garçom sem preço e com código | Decisão posterior explícita |
| Painel do proprietário com alerta visual forte e som | Requisito solicitado; validar política do navegador |
| Fluxo de localização de cliente para atender chamado | Proposto / validar no piloto |
| Home customizada sem código por estabelecimento | Diretriz posterior explícita |
| Personalização real de PULPO (logo, preços, fotos) | Pendente de dados aprovados |
| Comentários por produto, fotos e rankings | Propostos / implementação faseada |
| Relatório mensal proativo gerado por IA e revisado | Proposta estratégica prioritária |
| Conjunto exato do MVP, stack, fornecedores, custos | Pendente de revisão com Claude Code |

## 13. Fora do escopo do MVP

Reservas de mesas; pagamento online; integração obrigatória com PDV/estoque/cozinha; atribuição de vendas; logística; rede social entre estabelecimentos; sorteios/campanhas aleatórias sem análise jurídica; postagem automática no Instagram; confirmação automática de curtidas/avaliações externas; upload público irrestrito de fotos e vídeos; automação indiscriminada de WhatsApp; análises pessoais sensíveis; geolocalização indoor via NFC público.

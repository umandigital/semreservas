# Portal SemReservas (Master): funcionalidades e métricas (especificação completa)

Versão 1, 20/11/2026. É o painel da **plataforma**, usado só pela equipe SemReservas/UmanDigital para criar, configurar, operar e cobrar os restaurantes. Layout simples. Marcações: **[existe]**, **[Fase 1/2/3]**. Segue os princípios do `docs/adr/0002-multitenant-desde-o-dia-1.md`: tudo é dado, nada de código por cliente.

## 0. Princípios
1. **Um produto, muitos restaurantes**: o que muda por cliente é configuração (tipo, módulos, marca, cardápio), nunca código.
2. **Onboarding repetível e medido**: o tempo gasto para ativar um restaurante é a métrica que decide se o SaaS escala.
3. **Nada some sem rastro**: toda ação do Master é auditada; ver como o proprietário é **somente leitura** e registrado.
4. **Publicar com segurança**: rascunho → prévia → publicar → reverter, para marca, home, cardápio e módulos.
5. **Isolamento provado**: testes automáticos de que um restaurante nunca vê nem altera outro.
6. **Sem promessas que o sistema não mede**: relatórios só com dados aferidos e revisão humana.

## 1. Papéis do Master
| Papel | Pode |
|---|---|
| **Administrador** | tudo, inclusive usuários do Master, planos, exclusão e dados pessoais |
| **Operações** | criar e configurar restaurantes, catálogo e mídia, placas, publicar, relatórios |
| **Suporte** | ver como o proprietário (leitura), tickets, trocar link da equipe, reativar aparelho; não altera plano nem exclui |
| **Financeiro** | planos, assinaturas, faturas, trials; não vê dados pessoais |
| **Somente leitura** | consulta e relatórios |
**MFA obrigatório** para Administrador e Operações; sessões revogáveis; todo login e toda ação no registro de auditoria.

## 2. Menu do portal
Visão geral · Estabelecimentos · Onboarding · Módulos e funcionalidades · Marca e Home · Catálogo e mídia · Modelos 3D/RA · Placas NFC/QR · Toque Premiado (modelos) · Relatórios · Planos e cobrança · Suporte · Custos e saúde · Auditoria e privacidade · Usuários do Master · Configuração global

---
## 3. Funcionalidades por módulo

### 3.1 Visão geral [Fase 1]
- **Painel da plataforma**: restaurantes por status (rascunho, teste, ativo, pausado, encerrado), novos no mês, em trial e dias restantes.
- **Saúde**: uptime, erros por minuto, tempo de resposta do banco, **projeto do banco pausado ou perto do limite** (alerta), espaço de armazenamento e tráfego.
- **Fila de trabalho**: relatórios a revisar, tickets abertos, placas pendentes, cardápios aguardando validação, trials vencendo.
- **Atalhos**: criar restaurante, abrir o último relatório, ver incidentes.

### 3.2 Estabelecimentos [Fase 1 (script) → Fase 2 (interface)]
- **Lista** com busca, filtros (status, tipo, plano, cidade) e colunas: nome, tipo, status, plano, dias de trial, último acesso, saúde.
- **Criar restaurante** (assistente na seção 3.3).
- **Ficha do restaurante**: dados (razão social, nome, CNPJ opcional, endereço, fuso horário, contato), **tipo de operação** (à la carte, delivery, rodízio, buffet com carta), **unidades**, endereço público (`slug`), responsável, status e histórico de mudanças de status.
- **Ações**: pausar (o app mostra aviso amigável), reativar, encerrar (com exportação dos dados), duplicar configuração de outro restaurante, **ver como proprietário** (somente leitura, registrado).

### 3.3 Onboarding (assistente com checklist e cronômetro) [Fase 2]
Passos, cada um com **tempo gasto registrado**:
1. Dados e tipo de operação · 2. Módulos e plano (padrões por tipo) · 3. Marca: logo, cores, banner · 4. Cardápio: importar e validar · 5. Mesas e placas: vincular · 6. Toque Premiado: aplicar modelo de prêmios · 7. Textos legais: regulamento e política (modelo) · 8. Prévia no celular · 9. Convite do proprietário e do gerente · 10. Publicar · 11. **Teste final** (checklist de aceite: chamado, painel da equipe, RA, cupom).
Saída: **tempo total de onboarding** e número de correções (métrica de sustentabilidade).

### 3.4 Módulos e funcionalidades [Fase 1]
- **Interruptores por restaurante** (fonte da verdade do que aparece e do que a API aceita): `menu_feed`, `selection_for_waiter`, `waiter_call`, `kitchen_request`, `order_whatsapp`, `daily_board`, `ar_3d`, `loyalty`, `birthday`, `comments`, `surveys`, `wifi`, `instagram`, `google_link`, `photo_frames`.
- **Limites**: máximo de pratos em 3D, de banners, de usuários, de placas.
- **Dependências** (ex.: `birthday` exige `loyalty`) e **efeito imediato**: ao desligar um módulo, o botão some no cliente **e** a API recusa novas chamadas; histórico preservado.
- **Pacotes por tipo** (à la carte, delivery, rodízio, buffet) como modelos aplicáveis.

### 3.5 Marca e Home [Fase 2]
Mesmas telas da aba Aparência do proprietário, **com poderes extras**: criar temas-modelo, travar campos, definir a marca padrão do rodapé, prévia em vários tamanhos de celular, publicação com **rascunho e reversão**, histórico de versões.

### 3.6 Catálogo e mídia [Fase 2/3]
- **Importação de cardápio por planilha** com modelo para baixar, **validação linha a linha** (campos, preços, categorias) e relatório de erros.
- **Fila de revisão**: itens sem foto, sem legenda, sem alérgenos; aprovar para publicar.
- **Biblioteca de mídia**: fotos e vídeos por restaurante, conversão para WebP/MP4 leve, peso e dimensões, onde cada arquivo é usado, **custo de armazenamento e tráfego por restaurante**.

### 3.7 Modelos 3D/RA [Fase 1/2]
- **Envio do `.glb`** com **validação automática**: unidade em metros, **tamanho real ± 3% do declarado**, base em y = 0, centrado, sem extensões obrigatórias, peso ≤ 6 MB.
- **Versão leve para RA** (até ~50 mil triângulos, texturas ≤ 2048 px) e **capa transparente** geradas pela plataforma.
- Catálogo de modelos, **medidas reais** (ex.: "Prato de 27 cm · 6 cm de altura"), nota legal ("imagem ilustrativa") e quais pratos usam cada modelo.
- **Compatibilidade**: relatório por aparelho (Android com ARCore, iPhone) e **calibração opcional por aparelho**.
- Fila de produção (orçamento de mídia à parte).

### 3.8 Placas NFC/QR [Fase 1/2]
- **Inventário de tags** (NTAG213 display, NTAG215 ímã): lote, quantidade, custo, status (em estoque, gravada, travada, instalada, revogada).
- **Gravação**: URL curta e estável; checklist **ler, confirmar e só então travar**; regravar enquanto não travada.
- **Vínculo placa → restaurante → mesa**, corrigível sem regravar a tag; token ativo/revogado; histórico de leituras (data, resultado).
- **Gerador de placas** (PDF com QR e número da mesa) por restaurante.
- **Alertas**: placa sem leitura há X dias, token usado após revogação, leituras fora do padrão.

### 3.9 Toque Premiado: modelos [Fase 2]
Biblioteca de **modelos de ações e prêmios por tipo de restaurante** (gastropub, pizzaria, rodízio, café, buffet, delivery) que o onboarding aplica e o proprietário ajusta. Limites globais de segurança (ex.: pontos máximos por dia, cupom máximo por visita) que o proprietário **não** pode ultrapassar. **Alertas globais de fraude** e investigação de contas suspeitas (sem acesso a dados pessoais além do necessário).

### 3.10 Relatórios [Fase 2/3]
Pipeline: **Rascunho → Gerado → Validado → Revisão humana → Aprovado → Entregue**.
- Agendamento mensal por restaurante; **Etapa A** (agregação determinística) e **B** (validação) automáticas; **C, D, E** (IA: oportunidades, redação, revisão lógica) só com dados agregados.
- **Tela de revisão**: texto ao lado das evidências (consultas e números), aprovação, devolver com comentário, **bloqueios automáticos** (dado inventado, percentual sem denominador, promessa de venda).
- **Entrega**: painel do proprietário e e-mail, com registro de envio; **custo de IA e tempo de revisão por relatório**.
- Modelos de relatório versionados; relatório manual no começo.

### 3.11 Planos e cobrança [Fase 3]
- **Planos como dado**: ativação (uma vez, por tipo de mídia: foto, vídeo, 3D), mensalidade, pacotes de mídia, limites, período de trial (padrão 30 dias, **limite de lojas em trial**).
- **Assinaturas**: restaurante × plano × início × próxima cobrança × status (trial, ativa, em atraso, cancelada).
- **Cobrança** com gateway (a escolher), faturas, recibos, reenvio; cupons comerciais; histórico de preços.
- **Contrato**: modelos, aceite com data, comodato dos suportes físicos.
- Nenhum valor fixo no código.

### 3.12 Suporte [Fase 2]
- **Tickets**: abertos pelo proprietário (Ajuda) ou pelo Master; prioridade, responsável, histórico, tempo de primeira resposta e de solução.
- **Ver como proprietário** (somente leitura, registrado, com motivo).
- **Ferramentas**: trocar link da equipe, reativar aparelho pausado, reenviar convite, recalcular métricas, reabrir cupom.
- **Base de respostas** (perguntas frequentes) e **incidentes** com status público simples.

### 3.13 Custos e saúde [Fase 2/3]
Por restaurante e total: armazenamento, tráfego (inclusive vídeo), banco, **IA (tokens)**, mensagens (e-mail/SMS), horas de onboarding e de suporte, **custo por restaurante** e **margem estimada** (receita do plano − custo). Alerta de **limite do plano da infraestrutura** (projeto pausado, cota perto do fim).

### 3.14 Auditoria e privacidade [Fase 1/2]
- **Registro de auditoria** pesquisável: quem, quando, onde, antes e depois, IP.
- **Testes de isolamento** automáticos entre restaurantes, exibidos com data da última execução.
- **LGPD**: pedidos de exportação e exclusão de dados (com prazo e status), **consentimentos versionados** (qual texto, quem aceitou, quando, retirada), política de retenção (eventos brutos 90 dias, agregados por mais tempo, extrato de pontos conforme obrigação).
- **Rotação de segredos** e tokens; histórico de acessos do Master.

### 3.15 Usuários do Master [Fase 2]
Convite, papéis, MFA, sessões ativas, revogação, último acesso, **separação de funções** (quem aprova não é quem gera).

### 3.16 Configuração global [Fase 2]
Rodapé institucional ("SEMRESERVAS · Marketing de relacionamento gastronômico · Um toque. Infinitas possibilidades. · Uma tecnologia UmanDigital" e links), textos legais padrão, limites padrão (taxa de chamados, sessões por aparelho, duração da sessão = 90 min), domínios e e-mails de envio, janelas de manutenção, feature flags da própria plataforma.

---
## 4. Catálogo de métricas do Master

### 4.1 Negócio e escala
| Métrica | Definição |
|---|---|
| Restaurantes por status | Contagem por status |
| Trials ativos e conversão | Trials iniciados × convertidos em pago |
| **Tempo de onboarding** | Horas do "criar" ao "publicar" (mediana e por etapa) |
| Correções pós-publicação | Edições de cardápio e marca nos primeiros 7 dias |
| Receita recorrente mensal | Soma das mensalidades ativas |
| Cancelamentos | Restaurantes cancelados e motivo |
| Uso por módulo | % de restaurantes e de sessões que usam cada módulo |

### 4.2 Produto e engajamento (agregados, sem dados de clientes finais)
Aberturas e sessões por restaurante (série) · aderência ao fluxo NFC (leituras por placa e por dia) · **atendimentos pendentes** e tempo de primeira resposta (mediana) · **taxa de ativação do clube** (cadastros ÷ sessões qualificadas) · uso de RA (abertas, fixadas, falhas, aparelhos) · cliques de saída por canal.

### 4.3 Operação e suporte
Tickets por restaurante e por mês, por motivo · tempo de primeira resposta e de solução · incidentes e duração · **tempo de revisão por relatório** · relatórios entregues no prazo.

### 4.4 Custos
Custo por restaurante (infraestrutura, mídia, IA, mensagens) · custo de IA por relatório · horas de onboarding e de suporte × valor da hora · **margem por restaurante**.

### 4.5 Saúde técnica
Disponibilidade · latência e erros por função (RPC) · tamanho do banco e da mídia · tráfego · **status do projeto do banco (ativo/pausado)** · última execução dos testes de isolamento · último backup e **último teste de restauração**.

### 4.6 O que o Master não afirma
Não atribui vendas, seguidores nem avaliações à plataforma; não mostra dados pessoais de clientes finais sem necessidade e autorização; não compara restaurantes por nome publicamente.

---
## 5. Dados necessários (acréscimos)
`tenants` (status, tipo, plano, trial), `tenant_modules` com limites **[existe]**, `units`, `plans`, `subscriptions`, `invoices`, `onboarding_runs` e `onboarding_steps`, `media_assets`, `models_3d`, `nfc_tags`, `nfc_batches`, `tag_reads`, `reward_templates`, `report_jobs`, `report_versions`, `support_tickets`, `incidents`, `master_users`, `master_roles`, `cost_entries`, `privacy_requests`, `audit_logs` **[existe]**. Todas com testes de isolamento e RLS.

## 6. Ordem de construção proposta
1. **Base do Master**: login com MFA, papéis, auditoria, lista e ficha de estabelecimentos, módulos.
2. **Onboarding com cronômetro** + marca e Home (reaproveita Aparência do proprietário).
3. **Placas NFC/QR** (inventário, vínculo, gerador) e **Catálogo e mídia** (importação, 3D).
4. **Relatórios** (pipeline com revisão humana).
5. **Suporte e Custos**, depois **Planos e cobrança**.

## 7. Dependências de decisão
Quem será o provedor de login e cobrança, política de MFA, limites padrão de módulos, preços (só na Fase 3), contrato e comodato, retenção de dados e quem revisa os textos legais.

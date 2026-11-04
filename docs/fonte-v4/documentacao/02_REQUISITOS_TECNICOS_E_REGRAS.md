# 02 — Requisitos técnicos, módulos e regras de negócio

**Finalidade:** implementar um único SaaS multiestabelecimento, configurável e seguro, sem perder a leveza da experiência do consumidor.

## 1. Premissas arquiteturais obrigatórias

**P01.** O cliente acessa NFC/QR/link sem login e sem aplicativo instalado.  
**P02.** Nenhuma TAG identifica ou autentica uma pessoa, mesa ou pagamento.  
**P03.** Não existe número da mesa na TAG, QR ou apresentação inicial. O garçom identifica a mesa presencialmente.  
**P04.** Multi-tenancy verdadeiro: cada leitura/escrita autorizada usa contexto de tenant obtido de dados/credenciais confiáveis do servidor. Nunca confiar em `tenant_id` informado isoladamente pelo navegador.  
**P05.** Páginas públicas apenas expõem dados publicados e permitidos. Preços e vantagens têm validação de servidor antes de qualquer efeito econômico.  
**P06.** Funções e limites são configuráveis no Master por estabelecimento sem deploy; feature flags valem no servidor e no cliente.  
**P07.** Dados pessoais e marketing dependem de finalidades específicas e obrigações da LGPD.  
**P08.** Recompensas garantidas por regras objetivas; nunca oferecer vantagem por avaliar publicamente no Google.  
**P09.** Insights nunca são confundidos com comprovação de vendas, seguidores, curtidas externas ou avaliações publicadas.  
**P10.** Se equipe não monitorar a fila, `waiter_call` deve poder ficar desativado; nunca criar uma fila invisível.

## 2. Roles (papéis)

- `VISITOR`: sessão pública anônima. Navega, seleciona, acessa links e serviços públicos, compartilha, pode interagir localmente sob limites.
- `MEMBER`: visitante identificado/autenticado. Mantém conta, preferências persistentes, carteira por estabelecimento, pontos e histórico.
- `STAFF`: funcionário do estabelecimento. Assumir/concluir chamados, validar compras/recompensas autorizadas, sem acesso irrestrito a relatórios pessoais.
- `MANAGER`: gestor com direitos operacionais/comerciais delegados: produtos, campanhas, respostas, clube conforme autorizações.
- `OWNER`: proprietário. Acessa indicadores, relatórios, gestão de sua(s) unidade(s), políticas elegíveis conforme contrato.
- `MASTER_OPERATOR`: equipe da SEMRESERVAS com acesso operacional restrito a tenants atribuídos, suporte e revisão de conteúdo.
- `MASTER_ADMIN`: criação de tenants, planos/recursos, IDs NFC, permissões, relatórios, auditoria.
- `SYSTEM_WORKER`: identidade de serviço para jobs e outbox; nunca login interativo humano.

## 3. Matriz mínima de permissão

| Ação | Visitante | Member | Staff | Manager/Owner | Master |
|---|---:|---:|---:|---:|---:|
| Navegar cardápio publicado | Sim | Sim | Sim | Sim | Prévia |
| Instagram/Google/Wi-Fi público | Sim | Sim | Sim | Sim | Configurar |
| Montar seleção/mostrar garçom | Sim | Sim | — | — | Configurar |
| Chamar atendimento | Sim, limitado | Sim, limitado | — | — | Habilitar/desabilitar |
| Consultar carteira individual | Não | Própria | Operação autorizada | Agregado | Suporte restrito |
| Creditar pontos por compra validada | Não | Não | Se delegado | Sim, autorizado | Auditoria |
| Resgatar recompensa | Não | Solicitar própria | Confirmar | Administrar regras | Configurar limites |
| Comentar produto | Proposto: não publicamente | Sim, moderado | Moderar se autorizado | Moderar com trilha | Política global |
| Editar catálogo/campanhas | Não | Não | Opcional mínimo | Sim | Suporte autorizado |
| Visualizar todas as lojas | Não | Não | Não | Só suas unidades | Conforme escopo de papel |
| Alterar plano/feature flag global | Não | Não | Não | Não | Master Admin |
| Concluir chamado | Não | Não | Sim | Sim | Suporte específico |
| Gerar/aprovar relatórios com IA | Não | Não | Não | Ler relatório | Worker gera; Master aprova |

## 4. Requisitos funcionais (RF) e critérios

### RF-001 — Roteamento por ponto NFC/QR

**Input:** `GET /r/{public_tag_token}`. O backend resolve token opaco → ponto ativo → tenant/unidade/contexto. **Output:** redirect seguro a URL pública de estabelecimento com evento de origem (sem PII explícita). Token não revela informações internas nem representa autorização. TAG bloqueada contra escrita depois de gravar/testar URL. Revogação/realocação muda vínculo no servidor. **Aceite:** placa desativada não abre catálogo privado; placa realocada reaponta sem regravação.

### RF-002 — Home configurável

Admin Master cadastra título, texto, logotipo, banner/hero, cores (tokens com contraste), ordem de grupos, atalhos, etiquetas, categorias e recursos habilitados. Guardar `draft`, `published` e histórico com `published_at`/autor para reversão. **Aceite:** alteração publicada aparece em até ciclo de cache previsto, sem recompilar frontend; alteração de tema não modifica dados de outra loja.

### RF-003 — Publicação de catálogo

Gerir categorias, produtos, nomes, descrições, ingredientes declarados, alergênicos fornecidos e validados pelo estabelecimento, preços por canal, disponibilidade informada, fotos/vídeos e ordenação. Opções adicionais, quantidades, restrições e validação de preço no servidor quando usadas. Não inventar ingredientes com IA. **Aceite:** cliente não vê produto inativo; preço e observações mantêm consistência; mídia tem poster e fallback.

### RF-004 — Feed gastronômico

Scroll vertical com foto/vídeo, mídia responsiva e preguiçosa; reprodução automática de vídeo **sem áudio** apenas quando visível, respeitando preferências de redução de movimento. Uma ficha apresenta nome, preço, descrição resumida, ingredientes expansíveis, botão de adicionar, curtir, comentar (se ativo), salvar e compartilhar. Categorias são filtros/destaques; não implementar tela extra de catálogo em lista neste handoff. **Aceite:** 4 ou mais produtos de demonstração em cada categoria; mídia não impede leitura do preço; menu permanece utilizável sem vídeo/IA.

### RF-005 — Montador de pedido presencial

Carrinho local/servidor opcional, edição de quantidades, observações e opções; subtotal visível **para o consumidor**. Botão destacado **"Clique aqui e mostre para o garçom seu pedido"** abre cartão em alto contraste, com quantidade, produto, adicionais, observações e código temporário, mas **sem qualquer valor**. Abaixo da lista: botão **"Chamar garçom"**. A equipe anota mesa e lança no sistema próprio. **Aceite:** garçom lê sem rolagem desnecessária até certo tamanho; sem preço visível no modo específico, inclusive oculto em elementos de acessibilidade/impressão; não declarar venda confirmada.

### RF-006 — Atendimento em tempo quase real

`service_request` criado pelo público (login não obrigatório) sob limites de taxa e antifraude. Incluir `zone_label` livre de PII e `locator_note` opcional, código curto para conferência e *capability token* secreto para o próprio visitante consultar situação. Estados: `PENDING`, `ACKNOWLEDGED`, `RESOLVED`, `CANCELLED`, `EXPIRED`. Painel da equipe usa canal SSE autenticado com fallback polling; exibe alerta vermelho/laranja de grande destaque, contador e botão **"Ativar som"**. Som depende de gesto humano. Todo evento fica no histórico. **Aceite:** novo chamado aparece no painel de outro dispositivo em poucos segundos, sem depender do mesmo navegador; somente equipe daquela unidade o recebe; não há dupla confirmação em concorrência; dedupe previne spam; fallback visual sempre funciona. **Gate de piloto:** rotina de localização do consumidor definida e equipe comprometida a monitorar.

### RF-007 — Links externos

Instagram e página pública de avaliação Google acessíveis sem login. Evento de saída gerado antes de redirecionar via URL controlada; nunca classificar o clique como curtida/avaliação. Nenhum cupom/ponto/brinde por avaliação Google. Não direcionar só pessoas satisfeitas para avaliação externa. **Aceite:** link configurado leva à página correta; campos ausentes ocultam ação, sem destino inventado; indicadores nomeados "Cliques para...".

### RF-008 — Wi-Fi de convidados

Exibir SSID, senha de **rede guest** quando o restaurante optar por publicá-la, botão copiar e orientação de conexão manual. Opcional QR de Wi-Fi apenas quando tecnicamente adequado ao contexto. Sem prometer que webapp conectará diretamente aparelhos ao roteador. **Aceite:** botão copia quando permitido e oferece fallback legível.

### RF-009 — Login/identidade opcional

Login é oferecido **quando há benefício pessoal ou recurso persistente**: criar/consultar carteira, pontos, recompensas, lista de favoritos sincronizada, comentários moderados. Preferir autenticação por código temporário, e-mail ou provedor confiável; implementação final escolhida em ADR. Não impedir acesso ao restante da Home. **Aceite:** visitante conclui pedido sem cadastro; interface de login não bloqueia navegação.

### RF-010 — Fidelização

Wallet por `tenant_id + member_id`, saldo calculado a partir de ledger imutável; regras de crédito e resgate parametrizadas com versionamento, janela temporal, limites, idempotência; validação de compra feita por atendente autorizado ou código de comprovação confiável. Consentimento de marketing separado. **Aceite:** mesma ação/comprovante não credita duas vezes; não há saldo negativo; créditos estornados são novas transações e auditados.

### RF-011 — Comentários, curtidas e avaliações internas

Curtidas anônimas podem ser oferecidas com anti-spam e dedupe imperfeita, sem fingir um número de pessoas únicas; favoritos anônimos podem viver localmente. Comentários públicos persistentes exigem moderação, termos, denúncia e perfil autenticado (proposta); críticas legítimas não podem ser ocultadas seletivamente por nota. Avaliação de produto ligada a compra comprovada distingue verificada e não verificada. **Aceite:** moderação e privacidade; nenhum conteúdo ofensivo é publicado automaticamente no MVP.

### RF-012 — Fotos com molduras

3–5 templates universais, injetando cores e marca do tenant; foto selecionada com permissão e processada prioritariamente via Canvas no navegador; download e compartilhamento por Web Share quando suportado, fallback de download. Não armazenar fotos no backend por padrão. Medir início da ferramenta, template escolhido, arte gerada, download, share iniciado. **Aceite:** nada indica que uma postagem externa foi publicada; fotos não persistem em servidor sem consentimento e retenção explícitos.

### RF-013 — Pesquisas e sugestões

Pesquisa de satisfação interna e caixa de sugestões, com validação de tamanho, rate limiting, moderação quando exposição pública. Sem login obrigatório para uma resposta não premiada; se pontuável, exigir identificação + ação válida + limites. **Aceite:** resposta anônima jamais gera pontos individuais automaticamente; relatório contém contagem de respostas e base.

### RF-014 — Painel proprietário

Indicadores simples e relatórios acessíveis, dados por período, produto/campanha, interações com links externos, conteúdos de moldura, satisfação e recompensas verificadas; alerta de atendimento sempre proeminente. Permissões por unidade. Eventos históricos agregados não devem ser confundidos com resultados comerciais. **Aceite:** gestor não acessa outra unidade; métricas explicam o que contam.

### RF-015 — Master SEMRESERVAS

Cadastro/onboarding de tenants, identidade, catálogo, planos/entitlements configuráveis, período de teste, TAGs, convites e permissões, suporte, revisão de relatórios, logs/auditoria. Cada operação de mudança sensível exige confirmação, usuário responsável e audit trail. **Aceite:** novo tenant configurado sem edição de código; desativar feature não apaga registros antigos; conta suspensa não publica dados indevidamente.

### RF-016 — Observabilidade e telemetria

Eventos padronizados com `tenant_id`, `event_name`, `occurred_at`, `session_id` pseudônimo, `source`, `context`, `product_id` opcional e schema version. Deduplicação cliente+servidor, bot filtering, sampling quando necessário, controles de retenção. **Aceite:** contagens reprodutíveis com consultas determinísticas; eventos incompletos são descartados/estudados, não completados por IA.

### RF-017 — Relatório mensal assistido por IA

Pipeline: agregações determinísticas → qualificação de dados → regras de insights → modelo de linguagem com dados resumidos e estruturados → validação de retorno → revisão humana → publicação/exportação/envio quando aprovado. A IA não terá acesso desnecessário a PII ou dados de outras lojas e não poderá publicar recomendações nem acionar campanhas sozinha. **Aceite:** cada insight aponta base, período, amostra, limitação e teste sugerido; relatório nunca contém vendas presumidas.

### RF-018 — Delivery próprio (incremento separado)

Ímã NFC blindado para metal, QR, URL pública, contexto casa, seleção para entrega/retirada e envio por WhatsApp do estabelecimento; sem pagamento online inicial e sem promessa de confirmação automática. Pode ser planejado como fase após jornada de mesa se isso reduzir risco do MVP. Não mudar posicionamento comercial para delivery.

## 5. Regras transversais (RB)

- **RB01 — isolamento:** `tenant_id` proveniente do contexto autorizado no servidor; índices compostos e consultas filtradas; row-level security opcional recomendada como defesa adicional.
- **RB02 — login independente de consentimento:** termos, política, tratamento de dados e aceite promocional precisam de registros separados.
- **RB03 — limites de abuso:** rate limit por origem, sessão e tenant; captcha adaptativo, dedupe para feedback/curtidas/chamados; não expor PII em comentários ou relatórios.
- **RB04 — preço:** backend valida regras e snapshot de seleção; preços em carrinho são estimativa para o consumidor; versão do garçom não mostra valores.
- **RB05 — tempo real:** servidor é fonte de verdade; painel staff revalida requisições ao receber eventos; replay de SSE com cursor após reconexão; transições idempotentes.
- **RB06 — som:** usuário da equipe habilita explicitamente áudio; manter opção de silenciar; não depender do som como único canal de alerta.
- **RB07 — sem mesa:** localização por zona/descrição/código e validação presencial; nunca inventar número de mesa na API ou nos relatórios.
- **RB08 — conteúdo de cardápio:** declarar alergênicos/ingredientes com informação do estabelecimento; IA não inventa.
- **RB09 — desabilitação:** o backend bloqueia execução e o front oculta botão; preservar histórico.
- **RB10 — canais externos:** clique de saída registrado ≠ ação concluída na plataforma de terceiros.
- **RB11 — livre de dependência de IA:** todo fluxo crítico funciona mesmo se fornecedor de IA falhar.
- **RB12 — dados fictícios:** protótipos são simulados; nenhuma tela pode insinuar que números demonstrativos são resultados reais da PULPO.

## 6. Não funcionais / quality gates

**Mobile:** viewport 320–430 px, área de toque mínima recomendada 44 × 44 CSS px, texto legível, barra de navegação persistente, sem scroll horizontal involuntário. **Performance:** lazy-loading de imagem/vídeo, CDN, posters WebP/AVIF, video mobile adaptativo; sem autoplay de áudio; metas de Core Web Vitals aferidas em aparelhos reais e rede móvel antes do piloto. **Acessibilidade:** WCAG 2.2 AA como referência, foco visível, leitores de tela, redução de movimento, contraste, fallback textual. **Disponibilidade:** mecanismos de health check, logs, backup, recuperação e alertas definidos com RPO/RTO pendentes. **Segurança:** HTTPS, cookies protegidos, políticas CSP, dependências auditadas, testes de IDOR e tenant leakage, secrets fora do código. **Observabilidade:** correlação request_id + tenant_id (sem PII); registros de falha de envio de chamados/SSE/IA. **Manutenibilidade:** modularização de produto, OpenAPI, migrations e testes automatizados.

## 7. Critérios de liberação do recurso de garçom

O botão só pode ser habilitado em loja real quando: (i) operação tem painel/dispositivo ligado, (ii) equipe treinada para assumir e localizar solicitações, (iii) canal de fallback operacional documentado, (iv) som habilitado/alternativa visual, (v) testes em horários de pico e baixa demanda, (vi) controle de abuso, (vii) configuração de zonas de atendimento, (viii) chamados pendentes não ficam invisíveis após reconexão. Se falhar, desabilitar temporariamente, registrar o motivo e informar o consumidor de forma clara.

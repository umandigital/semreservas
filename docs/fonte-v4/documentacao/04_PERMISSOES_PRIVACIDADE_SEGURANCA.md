# 04 — Identidade, login mínimo, autorização, segurança e privacidade

## 1. Decisão de UX: o visitante não é obrigado a criar conta

O acesso a um cardápio via NFC ou QR deve **funcionar imediatamente**. Obrigar cadastro antes de mostrar pratos, Instagram, avaliações espontâneas, Wi-Fi ou serviços enfraquece o diferencial. A identificação serve para vincular ações verificáveis a uma pessoa — não para liberar o conteúdo público.

| Funcionalidade | Login do consumidor | Autorização e justificativa |
|---|---|---|
| Home, cardápio, busca, fotos/vídeos, ingredientes | Não | GET público para tenant publicado |
| Montagem do pedido, subtotal e mostrar ao garçom | Não | Sessão anônima e código de apresentação não autenticador |
| Chamar garçom, pedir conta | Não, mas controle de abuso | Limitador e código de chamado; estado protegido por token de capacidade |
| Instagram / Google / site / compartilhar produto | Não | Registra apenas saída/ação iniciada; sem prêmio externo |
| Wi-Fi de convidados | Não | Mostrar rede convidada, copiar senha; não controlar Wi-Fi do aparelho |
| Fotos com molduras, baixar/compartilhar | Não | Processar localmente no navegador; não guardar foto por padrão |
| Pesquisa interna/sugestão não pontuável | Não | Validar, limitar, transparência de coleta; não atrelar identidade |
| Curtir produto | Não é obrigatório | Dedupe frágil em anonimato; informar que é interesse, não pessoa única |
| Favoritos locais | Não | Pode sumir ao limpar navegador; para sincronizar, autenticar |
| Publicar comentário persistente (proposta) | Sim | Responsabilização e moderação; leitura pública, escrita restrita |
| Avaliar prato como consumo comprovado | Identidade + consumo verificado | Rotular verificado; sem compra, não assumir consumo |
| Entrar no clube, ver carteira, pontos e histórico | Sim | Conta pessoal e carteira por tenant |
| Solicitar e resgatar recompensa | Sim + saldo elegível | Débito idempotente, validação por operador |
| Créditos de pontos por compra | Sim + validação transacional | Atendente autorizado ou integração futura |
| Marketing com dados pessoais | Autorização/fundamento específico | Consentimento/opt-out separados do login |
| Proprietário / equipe / Master | Sim, sempre | RBAC/ABAC + tenant e unidade |

### Raciocínio de produto

Não abrir um cadastro para obter métricas de clique. A SEMRESERVAS pode medir sessões anônimas agregadas, com controles de privacidade. A coleta pessoal deve ser proporcional ao benefício oferecido, informada e protegida. Menor atrito de entrada tende a favorecer a experimentação, mas isso é hipótese a validar, não resultado comprovado.

## 2. Identidade e sessão

**Public visitor:** sessão pseudônima e curta, cookie `SameSite=Lax` e `Secure` se tecnicamente necessário; analytics com minimização, retenção e consentimento quando aplicável; identidade aleatória sem dados pessoais explícitos. **Member:** login por código de uso único, link mágico ou provedor confiável, escolhido via ADR; sessão HTTP-only, rotação e revogação; nunca expor refresh token em localStorage. **Equipe e gestão:** login obrigatório, autenticação forte, MFA recomendado para Master e Owner, TTL adequado, sessão revogável, papéis atribuídos, logs. **Serviços:** credenciais máquina-máquina isoladas.

### Modelo de consentimento

Armazenar finalidade, versão do texto, base/consentimento quando aplicável, origem, `timestamp` e retirada. Não assumir que cadastrar-se no clube autoriza publicidade. Não misturar aceitação de termos com opt-in de WhatsApp Marketing. Conformidade jurídica e textos finais devem passar por revisão específica.

## 3. Multi-tenancy e segurança de dados

- Tabelas com `tenant_id` explícito; acesso a registros privados requer `principal` autenticado, papel, tenants/unidades autorizados e recurso específico.
- Consultas usam filtro de tenant na primeira camada e testes automatizados de separação. Quando possível, políticas PostgreSQL RLS reforçam isolamento.
- Nunca confiar em `tenant_id` vindo apenas do corpo da request para autorizar operação. URLs públicas resolvem somente dados publicados.
- Evitar armazenar tokens, segredos, respostas de pesquisas individuais ou fotos em logs de analytics/LLM.
- Identificadores curtos visíveis (código do pedido/garçom) são **apresentação**, nunca autenticadores.
- Diferenciar `owner` e `staff`: equipe pode assumir chamado, mas não exportar relatórios pessoais do clube.
- Cross-tenant em contas de consumidor: membro pode integrar programas de lojas diferentes, mas cada carteira e preferências são isoladas por tenant.

## 4. Segurança antifraude e abuso

**Chamados anônimos:** limite por sessão/dispositivo/origem, 1 aberto por tipo/tenant, dedupe e anti-replay, tamanho máximo de nota, timeouts e fallback. Não suprimir permanentemente solicitações legítimas por bloqueio automático. Equipe precisa identificar local por área e código.

**Engajamento:** curtidas e favoritos anônimos não representam pessoas únicas; rate limit e deduplicação impedem spam básico mas não garantem unicidade. Comentários exigem moderação, sanitização, escape de HTML, denúncia, direito de resposta e política transparente.

**Fidelidade:** ledger imutável, chave idempotente por evento elegível, travas em banco para impedir resgates concorrentes, critérios de validade, expiração, estorno com transação própria, auditoria de quem validou a compra, limites por período. Não atribuir pontos apenas por abertura NFC/QR; não atribuir por avaliação Google.

**Compra validada:** exigir evidência suficiente da operação, sem depender de simples pedido preparado. O estabelecimento mantém PDV e caixa próprios. Integração posterior só com contrato e escopo específico.

**NFC:** NTAG213 para displays e NTAG215 com proteção contra metal para ímãs conforme compras informadas; URLs curtas; procedimento de leitura, confirmação e bloqueio permanente. Senha de TAG opcional não substitui mecanismos seguros do domínio. Substituição física por outra TAG/QR fraudulento requer inspeção e identidade visual confiável do suporte.

## 5. Dados pessoais e LGPD

A SEMRESERVAS e cada estabelecimento deverão definir contratos, papéis de controlador/operador por finalidade, registros de tratamento, canais de atendimento, política de privacidade, retenção/eliminação e gestão de consentimento. A arquitetura deve permitir exportar informações pessoais, excluir/anônimizar quando aplicável, revogar consentimentos e gerenciar titulares. Nenhum dado de comportamento deve ser usado para inferir saúde, crenças, sexualidade, psicologia sensível, crédito ou personalidade. Recomendações de marketing são **agregadas por produto/período**, não avaliações íntimas de clientes.

### Matriz simplificada de dados

| Dados | Necessidade | Retenção inicial proposta | Observação |
|---|---|---|---|
| Sessão pseudônima e evento de clique | Métricas de experiência / integridade | Prazo curto a validar (ex.: 90 dias raw) | Agregados podem durar mais |
| Nome/e-mail do member | Carteira e autenticação | Enquanto relação/obrigação justificar | Direitos dos titulares |
| Ledger de pontos | Auditoria financeira da fidelidade | Conforme obrigações e política específica | Registros imutáveis com minimização |
| Comentário público | Participação e prova social | Conforme regra de moderação/retirada | Evitar PII no conteúdo |
| Nota de atendimento | Localização operacional | Curtíssima; eliminar após ciclo definido | Não permitir informações sensíveis |
| Foto para moldura | Arte local | Não armazenar no servidor por padrão | Arquivo gerado no dispositivo |
| Dados do relatório | Agregados por período | Prazo contratual definido | Não confundir com dado pessoal identificado |
| Prompt/resposta de IA | Produção de insight | Mínimo necessário e anonimizado | Revisão de fornecedor e contratos |

Os prazos acima são **sugestões técnicas**, não período legal aprovado. Consultar assessor jurídico e ANPD.

## 6. Acesso, logging e incidentes

- HTTPS em produção; cookies HTTP-only/Secure/SameSite; CSRF nos pontos adequados; CORS restrito; headers CSP/HSTS, validação de links para evitar open redirect.
- Senhas nunca armazenadas em texto simples; provedores de autenticação com segurança madura, rotação de credenciais, MFA para acesso sensível.
- Não usar código de pedido, código curto da TAG ou identificador de chamado como chave de autenticação.
- Rate limit também nas APIs públicas de eventos, pesquisas, pontos e fotos.
- Auditoria de ação sensível: ator, papel, tenant, recurso, antes/depois, motivo, data, correlation ID; não registrar segredo/senha ou PII desnecessária.
- Backups testados com restore, monitoramento de serviço, procedimento de incidentes, runbook, logs de falha de notificação e job.
- Dependências auditadas e policy de atualização; revisão de prompt injection em entradas de usuários antes de qualquer análise por IA.
- Dados agregados do proprietário não devem sair em logs de LLM sem necessidade; usar tenant isolation no pipeline de IA.

## 7. Segurança de áudio e alertas do garçom

O som pode falhar se navegador impedir autoplay, se aba estiver suspensa, aparelho bloqueado, volume desativado, rede indisponível ou permissões negadas. A equipe precisa clicar em **Ativar som** no início do turno. O painel deve exibir um banner e um contador alto contraste, com mecanismos de reconexão, fila persistente no backend e possibilidade de reinspeção manual. Uma recepção sem operador logado e monitorando não pode anunciar ao cliente que a chamada foi atendida.

**SLA de atendimento** é política operacional pendente por estabelecimento. Não atribuir prazo automático antes da PULPO validar. Em mudança de status: `PENDING` (servidor aceitou) → `ACKNOWLEDGED` (equipe assumiu) → `RESOLVED` (equipe concluiu); cada mudança guardará quem e quando.

## 8. Referências externas

NXP: https://www.nxp.com/products/NTAG213_215_216  
Google reviews: https://support.google.com/contributionpolicy/answer/7400114  
MDN Web Audio: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay  
MDN Web Share: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share

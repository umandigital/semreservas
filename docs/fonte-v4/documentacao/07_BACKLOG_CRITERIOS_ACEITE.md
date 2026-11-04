# 07 — Backlog inicial, ordem de implementação e critérios de aceite

Este documento organiza uma **proposta de corte de MVP** para revisão pelo Claude Code. Não altera decisões de roadmap já aprovadas sem validação do fundador. A sequência preserva o foco em experiência de mesa e primeiro laboratório RESTOPUB, seguido da PULPO.

## Marco A — Fundação (bloqueante)

| ID | História de implementação | Critério mínimo de aceite | Dependência |
|---|---|---|---|
| A01 | Repositório único, stack aprovada por ADR, ambientes local/staging | Testes/lint/ci executáveis com uma instrução | Nenhuma |
| A02 | PostgreSQL + migrations + seeds de DEMO | Schema recriado sem intervenção manual; sem credenciais hardcoded | A01 |
| A03 | Multi-tenancy e autorização por papéis | Testes automáticos barram acesso cruzado | A02 |
| A04 | Autenticação gestor/staff/Master | Sessões seguras, revogação, logs; MFA definido | A03 |
| A05 | Provisionamento RESTOPUB + configuração por tenant | Uma base e uma implantação atendem dois tenants isolados | A03 |
| A06 | Bibliotecas UI e design tokens | Telas acessíveis; logo SEMRESERVAS oficial preservado | A01 |
| A07 | Integração storage/CDN com mídia demo | Upload privado e publicação sob permissões; poster/fallback | A03 |

## Marco B — Experiência funcional RESTOPUB (prioritário)

| ID | História | Aceite verificável | Dependência |
|---|---|---|---|
| B01 | URL curta por TAG NFC/QR | Token opaco resolve tenant ativo; desativação segura; log de origem | A03 |
| B02 | Home configurável e publicada | Campos/cores/hero/ordem alterados no Master chegam ao consumidor sem deploy | A05 |
| B03 | Feed vertical com 4+ itens por categoria em demo | Mídia/legenda/ingredientes/preço com carregamento progressivo e categoria | A07 |
| B04 | Navegação sem login | Cliente explora e monta pedido sem autenticar | B02 |
| B05 | Carrinho/seleção | Quantidades, subtotal, observações e persistência limitada por sessão | B03 |
| B06 | Modo mostrar ao garçom sem preços | Fonte grande, lista/código, sem valores, botão chamar garçom abaixo | B05 |
| B07 | Link Instagram/Google e Wi-Fi sem login | Clique registrado como saída; senha guest e instrução manual | B02 |
| B08 | Eventos internos mínimos | API deduplica eventos e os mostra ao proprietário por tenant | A03 |
| B09 | Toggle de funcionalidades no Master | Recurso off some do front e endpoint bloqueia execução | A05 |

## Marco C — Atendimento confiável, primeira versão

| ID | História | Aceite verificável | Dependência |
|---|---|---|---|
| C01 | API criar chamado anônimo | Limite + token de status + zona opcional; request persistente | A04, B02 |
| C02 | Painel de atendimento | Pendente em destaque e lista por tenant/estado; sem mesa inventada | C01 |
| C03 | SSE/Realtime e fallback | Dois navegadores em dispositivos distintos sincronizam sem reload; reconectam | C02 |
| C04 | Som opt-in | Botão Ativar som; som ao chegar chamado novo sob condições do browser | C03 |
| C05 | Assumir/concluir, auditoria e idempotência | Dois funcionários não assumem de forma conflitante; tempos registrados | C03 |
| C06 | Homologação operacional na PULPO | Área/código localizam cliente ou feature é desligada; monitor humano definido | C05 |

## Marco D — Relacionamento básico

| ID | História | Aceite verificável | Dependência |
|---|---|---|---|
| D01 | Login opcional para member | Cadastro não bloqueia visitantes; sessões seguras | A04 |
| D02 | Clube e carteiras por tenant | Cada member vê apenas sua carteira; ledger não fica negativo | D01 |
| D03 | Crédito por compra validada | Staff autorizado; idempotência; nenhum crédito por simples NFC | D02 |
| D04 | Recompensa garantida | Resgate transacional com regra e estoque/cota declarados | D03 |
| D05 | Pesquisa/sugestão interna | Anônima sem pontos; elegibilidade auditada quando identificado | B08 |
| D06 | Curtidas/favoritos e comentários moderados (experimento) | Limites, moderação e contagens honestas; não bloqueiam MVP se atrasarem | B08 |

## Marco E — Métricas, relatórios e IA

| ID | História | Aceite verificável | Dependência |
|---|---|---|---|
| E01 | Esquema e validação de eventos | Schema version, dedupe, tenant, controle de período | B08 |
| E02 | Painel de engajamento | Métricas simples com denominadores e notas de limitação | E01 |
| E03 | Agregações determinísticas mensais | Resultado SQL reprodutível com fixtures de teste | E01 |
| E04 | Skills de IA e validação | No máximo 3 recomendações; evidências; warnings; sem números inventados | E03 |
| E05 | Revisão Master e PDF/exportação | Draft, aprovação, entrega controlada, logs | E04 |
| E06 | Relatório entregue ao proprietário | Relatório em painel e envio conforme consentimento/canal validado | E05 |

## Marco F — Experimentos e extensões não bloqueantes

Fotos com moldura client-side; animações avançadas de pratos; vídeos de IA profissionais; maior socialização de produtos; IA concierge; campanhas programadas avançadas; canal delivery via ímã e WhatsApp; WhatsApp Marketing pago; integração opcional com PDV; rede de parceiros; pagamentos. Cada módulo terá sua própria ADR e testes. Não transformar em compromissos para o piloto sem aprovação.

## Testes funcionais críticos de ponta a ponta

1. Abrir NFC/QR sem login → Home da loja correta → Feed → adicionar produtos → resumo ao garçom sem valor.
2. Abrir Instagram/Google como visitante → conferir evento de saída → **não** criar pontos/avaliação confirmada.
3. Ativar som no painel staff → criar chamado sem login no celular → aviso visível e sonoro → assumir → concluir → cliente consulta status.
4. Abrir dois tenants → editar Home e produto do RESTOPUB → garantir que PULPO não muda.
5. Master desativa `waiter` para PULPO → botão some no cliente **e** API recusa chamados novos; histórico preservado.
6. Criar member e carteira → tentativas de crédito duplicado; crédito único → resgatar com concorrência → saldo correto.
7. Comentário contendo HTML/script não executa; moderação/denúncia disponíveis conforme etapa.
8. Foto local com moldura → baixar e compartilhar no navegador suportado → não existir upload secreto ao backend.
9. Gerar relatório com base insuficiente → IA retorna aviso e nenhuma alegação de receita.
10. Publicar alteração de identidade → preview versionado, cache invalidado, rollback possível.
11. Desligar Wi-Fi e retomar → interface apresenta fallback e não cria estado falso de atendimento.
12. Testar 320 px/390 px/430 px, Safari iOS e Chrome Android, teclado/VoiceOver/TalkBack quando disponível.

## Quality gates antes de habilitar a PULPO

- Checklist de produto completo; fotos e preços validados pelo proprietário.
- Segurança de banco/tenant, fluxos sem login e LGPD revisadas.
- Display de acrílico, NFC e QR testados; TAG gravada, lida e bloqueada com evidência.
- Funcionário consegue localizar cliente usando área/código; se não, atendimento digital desligado.
- Painel aberto em dispositivo de equipe e alertas testados durante rotina.
- Loja consegue consultar engajamento, sem prometer vendas.
- Pipeline de relatórios produz um exemplo correto e que pode ser revisado.
- Backup/restauração, suporte e rollback documentados.

## Não aceitar como pronto

Um protótipo local com `localStorage`, o anúncio de uma nova mensagem sem persistência, áudio não habilitado, navegação com páginas bonitas mas botões inertes, telas contendo métricas fictícias apresentadas como reais, um login obrigatório na Home ou chamada de garçom sem destinatário operacional.

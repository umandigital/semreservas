# ADR-0006: Clube, dados e segurança (e a base do portal Master)

Status: aceito em 23/11/2026 · Migração `0005_clube.sql` · Testes `apps/api/tests/clube.sql`

## Decisões
1. **Identidade da pessoa é global; o clube é por restaurante.** `person_profiles` (nome, data de nascimento) vale para o login inteiro e é a **única exceção declarada** à regra de `tenant_id` (é identidade, não dado de negócio). `club_members` liga a pessoa a **um** restaurante (`tenant_id`, termo aceito, consentimento de divulgação, código de indicação). Pontos pertencem à **pessoa logada naquele restaurante**, nunca à mesa nem ao aparelho.
2. **O restaurante nunca vem do navegador.** Toda função do cliente recebe o **token da placa** e deduz o `tenant_id` no servidor (`_club_tenant`). Funções do proprietário recebem `p_tenant`, mas **conferem o papel** (`owner`/`manager`) no servidor antes de qualquer coisa.
3. **Acesso só por RPC `SECURITY DEFINER`** com `search_path` fixo. `anon` e `authenticated` não têm `insert/update/delete` em nenhuma tabela do clube; leitura direta só para dono/gerente do **próprio** restaurante (RLS). Funções internas (`_club_*`, `_audit`) não são executáveis por ninguém de fora. As permissões são revogadas **função por função**, sem mexer nas funções antigas.
4. **Extrato imutável e idempotente.** `points_ledger` só recebe linhas; um gatilho bloqueia `update` e `delete`. Cada linha tem `idem_key` única por restaurante: repetir um toque, uma rede ruim ou um clique duplo **não duplicam pontos**. Saldo = soma do extrato; "total ganho" = soma dos créditos. Estornos e cancelamentos são **novas linhas** (nunca edição).
5. **Regras são dados.** `club_actions` (catálogo global de ações) + `club_action_rules` (por restaurante: pontos, interruptor, limite por dia/semana/mês/uma vez) + `club_settings` (fuso, teto mensal de interações, validade do comprovante, janela de cancelamento) + `club_rewards` (prêmios, custo, visitas mínimas, limite por pessoa e estoque mensal). Nada de `if (restaurante == ...)`.
6. **Só pontua o que o servidor sabe.** Ações do tipo "intenção" (`claimable`: abrir Instagram, abrir Google, instalar, avisos, RA, foto, compartilhar) o app pode pedir via `club_earn`, com limite por período e teto mensal. Cadastro, check-in, retorno, sequência, indicação, pedido, nota, curtida, comentário e pesquisa **só são creditados dentro das próprias funções do servidor** (cadastro já está na `club_join`; as demais entram nas próximas migrações).
7. **Troca com débito na hora, cancelável em 2 minutos.** `club_redeem` trava a linha do associado (`for update`) contra troca dupla em paralelo, confere saldo, visitas mínimas, 1 troca por dia, limite por pessoa e estoque, grava a troca e o débito juntos. `club_cancel_redemption` devolve os pontos se estiver dentro da janela. Estorno posterior só pelo gerente, com motivo, em `owner_club_reverse_redemption`.
8. **Auditoria.** `club_join`, `club_redeem`, cancelamentos, estornos, ajustes manuais e **toda mudança de regra ou prêmio** gravam em `audit_logs` (quem, quando, antes e depois).
9. **Privacidade (LGPD/ECA Digital).** Guardamos nome, data de nascimento, termo aceito (versão) e consentimento de divulgação. **Menores de 13 anos não entram**; a Roleta exige 18 anos (migração futura). A data de nascimento só se grava no cadastro (sem função de edição para o cliente). Exclusão de conta apaga o perfil; o extrato fica sem dado pessoal (a fazer na rotina de exclusão).

## Portal Master (SemReservas) já previsto
- `platform_admins` e `is_platform_admin()` existem, **sem política de leitura**: o Master nunca entra por brecha em `is_tenant_member`. Ele agirá por **funções próprias** (criar restaurante, módulos, placas, planos), cada uma conferindo `is_platform_admin()` e gravando em `audit_logs` com o `tenant_id` afetado.
- O catálogo `club_actions` e o gatilho de criação de restaurante (`_club_on_tenant_insert`) já preparam cada restaurante novo com regras padrão.

## O que fica para as próximas migrações (nesta ordem)
- **0006 Visita:** check-in na placa (+30), prova de presença, horário de funcionamento, retorno, frequência, sequência, mesa cheia, indicação (paga no 1º check-in do amigo).
- **0007 Interações:** pedido pelo app, curtir, nota, comentário (com filtro), pesquisa "Como foi a visita?", sugestão.
- **0008 Extras:** Roleta do Chef (giro por pedido, 5º giro ganha, janela de 60 dias, 18+) e aniversário, com prêmios e validade próprios, fora do Clube.
- **0009 Rotinas:** validade dos pontos (aviso 30 dias antes), alertas de abuso, retenção e exclusão de dados.

## Riscos conhecidos
- Sem presença verificada na troca ainda: hoje basta o token da placa. A prova de presença (0004) será ligada à troca na 0006.
- Código de troca de 6 caracteres únicos por restaurante; sem limitação de taxa própria (usa a do Supabase). Revisar com testes de carga antes de abrir ao público.

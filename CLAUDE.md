# SemReservas: regras permanentes para o Claude Code

Plataforma SaaS de marketing de relacionamento gastronômico. O cliente encosta o celular numa placa NFC na mesa e abre o app do restaurante. Três interfaces: **app do cliente**, **portal do proprietário** e **portal SemReservas (Master)**.

## Leia antes de qualquer tarefa
`README.md`, `docs/adr/` (decisões), `docs/06` a `docs/10` (ajustes, indefinições, portais e **definição do Toque Premiado**, que prevalece sobre os valores antigos de pontos e prêmios), `docs/design/TEMA-DO-RESTAURANTE.md`. Os docs `08` e `09` são **especificações**: o que está marcado como Fase 1/2/3 **ainda não existe**, salvo o que estiver marcado **[existe]**.

## Stack e comandos
- Front: Vite + React 19 + TypeScript em `apps/consumidor` (rotas por `#/`, telas carregadas sob demanda). `npm run typecheck`, `npm test` (vitest), `npm run build`.
- Banco: Supabase (PostgreSQL, Auth, Realtime). Migrações em `apps/api/migrations/NNNN_nome.sql`, testes SQL em `apps/api/tests/` e `apps/api/run-tests.sh` (Postgres descartável com stub do Supabase). Termina com `ISOLAMENTO: todos os testes passaram`.
- Publicação: **todo push na `main` publica em semreservas.com.br/semreservas** (GitHub Actions, `DEPLOY_REAL=true`). Por isso: trabalhe em **branch** e só faça merge na `main` com testes verdes e a migração já aplicada.
- Caminho base `/semreservas/` vem de `BASE_PATH`; nada de endereço fixo no código.

## Regras inegociáveis
1. **Multi-tenant**: toda tabela de negócio tem `tenant_id` e RLS. O `tenant_id` **nunca** vem do navegador: é deduzido no servidor (token da placa, link secreto da equipe ou sessão autenticada).
2. **Acesso só por funções (RPC)** `SECURITY DEFINER` com `search_path` fixo; `anon` não lê nem grava tabelas; `revoke execute ... from public, anon, authenticated` e `grant` só do que for público. Siga o padrão de `0002`, `0003` e `0004`.
3. **Todo acesso privado confere papel e restaurante no servidor** (owner, manager, staff). Nunca confiar em papel enviado pelo cliente.
4. **Teste de isolamento antes de entregar**: usuário do restaurante A não lê nem grava no B; sem login nada funciona; papel inferior não faz ação de papel superior.
5. **Migração**: o fundador aplica cada migração **colando no SQL Editor do Supabase**. Entregue o arquivo completo, idempotente quando possível, **sem** alterar migrações antigas, e diga na entrega qual migração precisa ser aplicada **antes** do merge.
6. **Segredos**: nunca no repositório. Só a chave pública (`anon`) vai ao front. `tools/verificar-pacote.mjs` roda no CI e barra segredos.
7. **Auditoria**: toda ação sensível grava em `audit_logs` (quem, quando, o quê, antes e depois).
8. **Honestidade das métricas**: o sistema mede aberturas, interações, atendimento, pontos e resgates. **Nunca** mostra faturamento do restaurante, seguidores ganhos nem avaliações publicadas (só cliques de saída). Pontos por valor da conta **não existem no MVP** (ver `docs/10-TOQUE-PREMIADO-DEFINICAO.md`, seção 3); só se o módulo `loyalty_spend` for ligado no futuro o consumo apareceria, rotulado como "valor lançado". Percentual sem amostra mínima mostra "dados insuficientes". Use mediana, não média.
9. **Tudo é dado**: tipos de restaurante, módulos, prêmios, ações, textos e cores são configuração. Nada de `if (restaurante == "x")`.
10. **Pontos**: pertencem à pessoa logada (nunca à mesa nem ao aparelho); extrato imutável e idempotente; **débito na troca** (cancelamento em 2 min).
11. **Nenhuma ação obrigatória da equipe do restaurante**: o painel do garçom é opcional e o clube, a visita e a troca funcionam sem ele. Sem integração com caixa/PDV. Só pontua o que o sistema verifica sozinho; o que for intenção (toque em link) é rotulado e tem teto.

## Interface do cliente: simples para qualquer pessoa
Pensar em leigos, idosos e pouca luz: texto principal de **18 pt ou mais** (nunca abaixo de 16 pt), contraste alto (texto creme sobre vinho, sem cinza apagado), **uma ação principal por tela** (botão de 56 pt ou mais), no máximo 4 blocos por tela, ícone sempre com rótulo, palavras simples ("pontos", "visita", "Trocar"). O programa de pontos chama-se **"Clube" + nome do restaurante** (não "Toque Premiado"). Nada de ícone de troféu na barra.

## Como trabalhar
- Comece **propondo um plano curto** (arquivos, migrações, testes) e espere confirmação se houver decisão de produto em aberto. Decisões de produto estão em `docs/07`; não invente.
- Pequenos commits, mensagens claras em português. Rode `typecheck`, `npm test`, `apps/api/run-tests.sh` e o build antes de dizer que terminou.
- **Relate com honestidade** o que testou e o que **não** pôde testar (câmera real, iPhone, Supabase em produção). Não afirme que algo funciona sem ter rodado.
- Mudanças em `apps/consumidor/src/lib/arWebxr.ts` (realidade aumentada) exigem teste no dispositivo WebXR emulado e aviso ao fundador: as constantes foram calibradas em campo.
- Não crie pull request nem faça merge sem pedido. Não altere o que não foi pedido.

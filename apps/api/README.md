# api

Banco e regras de negócio. Stack: Supabase (PostgreSQL, Auth, Realtime), ADR-0001.

```
migrations/   SQL versionado, aplicado em ordem (0001, 0002, ...)
tests/        stub do Supabase + testes de isolamento entre tenants
run-tests.sh  sobe um Postgres descartável, aplica migrações + seed e testa
```

## Rodar os testes (precisa de PostgreSQL 14+ instalado)
```bash
apps/api/run-tests.sh
```
Termina com `ISOLAMENTO: todos os testes passaram` ou com a regra que falhou.

## Aplicar no Supabase
1. Painel do projeto → **SQL Editor** → colar `migrations/0001_fundacao.sql` → Run.
2. Para dados de desenvolvimento, colar `seeds/gastropub/seed.sql`. Os tokens do seed são **de teste**; placas reais usam tokens gerados pelo Master (ADR-0004).

Regras: toda tabela de negócio tem `tenant_id` e RLS; o público só acessa por funções RPC (`resolve_access_token`, `public_tenant`); nunca colocar a chave `service_role` no repositório nem no front.

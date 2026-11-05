#!/usr/bin/env bash
# Recria um Postgres descartável, aplica migrações + seed e roda os testes de isolamento.
# Uso: apps/api/run-tests.sh      (precisa de postgres 14+ instalado)
set -euo pipefail
cd "$(dirname "$0")/../.."
PGDIR=$(mktemp -d); export PGDATA="$PGDIR/data" PGHOST="$PGDIR" PGPORT=54399 PGUSER=postgres
BIN=$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)
# O servidor do Postgres não roda como root (caso do container do Claude); nesse caso usa o usuário postgres.
AS=""; if [ "$(id -u)" = 0 ]; then chown postgres "$PGDIR"; AS="su postgres -c"; fi
run() { if [ -n "$AS" ]; then su postgres -c "$*"; else bash -c "$*"; fi; }
trap 'run "\"$BIN/pg_ctl\" -D \"$PGDATA\" -m immediate stop" >/dev/null 2>&1 || true; rm -rf "$PGDIR"' EXIT
run "\"$BIN/initdb\" -D \"$PGDATA\" -U postgres -A trust" >/dev/null
run "\"$BIN/pg_ctl\" -D \"$PGDATA\" -o \"-k $PGDIR -p $PGPORT -c listen_addresses=''\" -l \"$PGDIR/log\" -w start" >/dev/null
q() { psql -v ON_ERROR_STOP=1 -q -d postgres "$@"; }
q -f apps/api/tests/00_stub_supabase.sql
for f in apps/api/migrations/*.sql; do echo "migração: $f"; q -f "$f"; done
q -f seeds/gastropub/seed.sql
q -f apps/api/tests/isolamento.sql
q -f apps/api/tests/chamados.sql
q -f apps/api/tests/dono.sql
q -f apps/api/tests/presenca.sql

# O SQL do gerador de placas aplica e as placas novas resolvem a mesa certa.
GEN=$(mktemp -d)
node tools/placas/gerar.mjs --slug gastropub --mesas "4..5" --base https://exemplo.test/x --out "$GEN" >/dev/null
q -f "$GEN/placas.sql"
TOKEN=$(sed -n '2p' "$GEN/placas.csv" | cut -d, -f2 | sed 's#.*/r/##')
GOT=$(q -At -c "set role anon; select table_label from resolve_access_token('$TOKEN')")
[ "$GOT" = "4" ] || { echo "FALHA: placa gerada deveria resolver mesa 4, veio '$GOT'"; exit 1; }
rm -rf "$GEN"
echo "GERADOR DE PLACAS: SQL aplicado e placa resolve a mesa certa"

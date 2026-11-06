#!/usr/bin/env bash
# Lê deploy/retirados.txt e imprime os caminhos válidos. Recusa (exit 1) qualquer coisa fora de media/,
# com "..", espaços, aspas ou caracteres estranhos: nada além de arquivos de media/ pode ser removido.
set -euo pipefail
lista="${1:?uso: validar-retirados.sh lista.txt}"
while IFS= read -r linha || [ -n "$linha" ]; do
  linha="${linha%$'\r'}"
  case "$linha" in ''|\#*) continue;; esac
  if [[ "$linha" =~ ^media/[A-Za-z0-9._/-]+$ ]] && [[ "$linha" != *..* ]] && [[ "$linha" != */ ]]; then echo "$linha"
  else echo "::error::caminho recusado em retirados.txt: '$linha' (só arquivos dentro de media/, sem '..')" >&2; exit 1; fi
done < "$lista"

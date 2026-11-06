#!/usr/bin/env bash
set -u; cd "$(dirname "$0")"; falhas=0
t() { local nome="$1" esperado="$2" conteudo="$3"; local f; f=$(mktemp); printf '%b' "$conteudo" > "$f"; ./validar-retirados.sh "$f" >/dev/null 2>&1; local r=$?; rm -f "$f"
  if [ "$r" = "$esperado" ]; then echo "OK   $nome"; else echo "FALHA $nome (saiu $r, esperado $esperado)"; falhas=1; fi; }
t "caminho válido em media/"            0 "media/modelos/x.glb\n"
t "comentários e linhas vazias"         0 "# nada\n\nmedia/a.webp\n"
t "recusa fora de media/"               1 "index.html\n"
t "recusa .."                           1 "media/../index.html\n"
t "recusa caminho absoluto"             1 "/etc/passwd\n"
t "recusa raiz do app"                  1 "assets/index.js\n"
t "recusa espaço e aspas (injeção)"     1 "media/a b.glb\n"
t "recusa aspas"                        1 "media/a'; rm -rf x; '.glb\n"
t "recusa diretório (termina em /)"     1 "media/modelos/\n"
t "aceita fim de linha do Windows"      0 "media/a.webp\r\n"
exit $falhas

# Gerador de placas (ADR-0004)

Cria as placas de um estabelecimento em lote: SQL, CSV para gravar as tags e folha de QR para imprimir.

```bash
cd tools/placas && npm install
node gerar.mjs --slug gastropub --mesas "1..30" --base https://umandigital.com.br/semreservas --out ./saida-placas
# ou rótulos livres: --mesas "Balcão,Varanda 1,Varanda 2"
```

| Arquivo | Para quê |
|---|---|
| `placas.sql` | colar no SQL Editor do Supabase (cria mesas, placas, tokens e vínculos). **Contém tokens: não versionar** |
| `placas.csv` | número + URL NFC + URL QR, para o app de gravação de NFC |
| `placas-qr.html` | abrir no navegador e imprimir: número grande + QR de cada placa |
| `conferencia.csv` | checklist: gravada / testada / travada |

Cada placa tem **dois tokens** (NFC e QR), aleatórios e sem sequência. A tag guarda só a URL; a mesa fica no banco.
**Não travar tags de teste** (ADR-0004). Antes das placas físicas chegarem, o QR no `placas-qr.html` simula a placa.

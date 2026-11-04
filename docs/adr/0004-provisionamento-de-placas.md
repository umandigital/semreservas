# ADR-0004 — Provisionamento de placas em lote

**Status:** ACEITO (princípio; implementação no marco 1.2)

## Decisão
O SemReservas **gera as placas sozinho**, para qualquer restaurante e qualquer número de mesas. Na tag vai só uma URL com token opaco. O número da mesa vive no servidor (ADR-0003).

## Fluxo do Master
1. Escolher o estabelecimento e informar a quantidade de mesas (ou a lista de rótulos: `1..30`, `Balcão`, `Varanda 1`).
2. O sistema cria uma placa por mesa, com **dois tokens**: um para NFC e um para QR.
3. Exporta, por lote:
   - **CSV** (número, URL NFC, URL QR) para colar no app de gravação de NFC;
   - **PDF de QR codes** com o número grande, pronto para imprimir na placa;
   - folha de **conferência** (checklist: gravada, testada, travada).
4. Cada placa tem estado: `GERADA → GRAVADA → TESTADA → TRAVADA → ATIVA`; `REVOGADA` se perdida.
5. Revogar uma placa perdida invalida o token na hora. O token novo reaproveita o mesmo número.

## Regras
- Tokens aleatórios longos; nunca sequenciais (ninguém adivinha a placa da mesa ao lado).
- Gerar mais placas depois (aumentou as mesas) não altera as existentes.
- **Teste:** 3 placas do GastroPub (mesas 1 a 3) servem para provar três chamadas simultâneas.

## Sobre o endereço gravado na tag
A URL gravada é permanente depois que a tag é travada. Como o teste usa `umandigital.com.br/semreservas` e o domínio definitivo (`semreservas.com.br`) só vem depois da Pulpo:
- **Tags de teste (GastroPub e Pulpo): NÃO travar.** Se forem gravadas com o endereço provisório, ainda poderão ser regravadas com o definitivo.
- **Tags de produção: gravar e travar só com o domínio definitivo.**
- Se alguma tag com endereço provisório for travada, o endereço provisório precisa continuar redirecionando para sempre.

# ADR-0003 — Placa numerada, uma por mesa

**Status:** ACEITO (decisão do fundador, 04/11/2026). Substitui a premissa "sem número de mesa na TAG" do pacote v4.0.

## Contexto
O pacote assumia placas móveis e localização por zona + código. Na prática 99% dos clientes não sabem o número da própria mesa, então pedir isso a eles falha. O dono já organiza as placas em mesas numeradas.

## Decisão
1. **Cada placa tem um número impresso** (visível para quem monta e limpa o salão) e **sua própria tag NFC e QR**.
2. A URL gravada na tag carrega só um **token opaco da placa** (`/r/{token}`). A tag não guarda a mesa.
3. O vínculo **placa → mesa** fica no servidor (`access_point_assignments`). Por padrão, placa 10 = mesa 10.
4. Se uma placa for parar na mesa errada, o dono corrige o vínculo no painel (ou o garçom, se delegado), **sem regravar a tag**.
5. O cliente vê "Mesa 10" no topo ao chamar o garçom, com botão "não é esta mesa?" que abre a grade de mesas. Isso pega o erro de troca de placa sem pedir nada ao cliente no caso normal.
6. O painel do garçom mostra **Mesa N** em letras grandes. O garçom confirma ao chegar.
7. NFC e QR da mesma placa usam tokens diferentes (permite medir origem), ambos apontam para a mesma mesa.

## Consequências
- Rodízio (pedido à cozinha) passa a ser viável: a mesa é sempre conhecida.
- Compra de tags: **uma por mesa**, mais reserva para perdas. Lote de 50 NTAG213 cobre salões de até ~40 mesas.
- Delivery e links externos continuam sem mesa (contexto "casa").
- Atualizar o pacote: RB07 ("nunca inventar número de mesa") passa a valer assim: o número só vem do vínculo cadastrado ou da correção manual, nunca de suposição.

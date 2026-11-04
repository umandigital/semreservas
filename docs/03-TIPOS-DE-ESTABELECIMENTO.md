# Tipos de estabelecimento e módulos

O produto é **um só**. O que muda de um cliente para outro é uma lista de **módulos ligados** e os dados do cardápio. Nada de código por cliente.

## Modelo

`tenants.establishment_type` ∈ `a_la_carte` | `delivery` | `rodizio` | `buffet_com_carta`
`tenant_modules` (tenant, módulo, ligado, limites) — fonte da verdade para o que aparece e para o que a API aceita.

| Módulo | À la carte | Delivery | Rodízio | Buffet |
|---|:-:|:-:|:-:|:-:|
| `menu_feed` (feed + busca) | ✅ | ✅ | ✅ (vira "o que está circulando") | ✅ (carta) |
| `selection_for_waiter` | ✅ | — | ✅ | ✅ |
| `waiter_call` | ✅ | — | ✅ | ✅ |
| `kitchen_request` (pedir sabor X à cozinha) | — | — | ✅ | — |
| `order_whatsapp` (montar e enviar) | — | ✅ | — | — |
| `daily_board` (o que tem no buffet hoje) | — | — | — | opcional |
| `wifi`, `instagram`, `google_link` | ✅ | ✅ | ✅ | ✅ |
| `loyalty` | opcional | opcional | opcional | opcional |

## Como cada tipo funciona

### À la carte (SemReservas GastroPub, Pulpo)
Placa de acrílico com NFC na mesa → home → feed → seleção → "mostrar ao garçom" → "chamar garçom". É o fluxo do pacote v4.0.

### Delivery
- Ímã de geladeira (NTAG215 para metal) + QR com a mesma rota `/r/{token}`, contexto `casa`.
- O cliente monta o pedido e o sistema **gera a mensagem pronta e abre o WhatsApp do estabelecimento**. Sem pagamento online no início.
- Dados do cliente: pedir só nome, endereço e telefone **no momento do envio**, dentro da mensagem do WhatsApp, sem gravar no servidor na primeira versão. Isso evita ter base de dados pessoais (LGPD) logo de cara.
- Honestidade do produto: "aberto no WhatsApp" não é "pedido aceito". O dono confirma pelo próprio WhatsApp.
- Taxa de entrega, área atendida e horário de funcionamento são configuração do dono.

### Rodízio (pizzaria)
Dois recursos novos:
1. **Visualizar tudo que o rodízio oferece** (todos os sabores), com foto, ingredientes e marca de "em circulação agora / acabou".
2. **Pedir um sabor específico à cozinha**: o cliente toca no sabor, a cozinha vê numa fila com **mesa + sabor + quantidade de fatias**, e o garçom leva.

Isto cria uma **segunda fila em tempo real** (cozinha), com os mesmos estados do chamado de garçom (`PENDING → ACKNOWLEDGED → DELIVERED / CANCELLED`) e as mesmas regras de auditoria. Implementar `service_requests` com campo `kind` (`waiter`, `bill`, `kitchen_item`) em vez de duas tabelas.

Pontos de atenção:
- **Precisa saber a mesa** (ver análise 1.2). Sem isso a cozinha não entrega.
- **Limite de pedidos por mesa** (ex.: 1 pedido pendente por mesa por vez, configurável) para evitar fila de 30 itens vinda de um celular.
- Painel da cozinha: tela separada, só fila, letras grandes, som próprio.
- Custo de operação para o dono: alto na primeira semana (treinar cozinha). Vale piloto próprio antes de vender.

### Buffet
Entra na lista de clientes **só se tiver cardápio à la carte** (regra sua). O restante segue o fluxo à la carte.

Opcional, módulo `daily_board` ("o que tem hoje no buffet"): avaliar esforço do dono antes de construir.
- Esforço do dono por dia = tempo para digitar/fotografar o buffet. Se passar de ~2 minutos ele deixa de atualizar e a informação fica errada (pior que não ter).
- Caminho de menor esforço: **catálogo fixo de preparações** + o dono marca no celular quais estão no buffet hoje (um toque por item) + botão "repetir o de ontem". Sem digitar nada no dia a dia.
- Recomendação: **não construir antes do campo**. Perguntar a 2 buffets reais se atualizariam todo dia.

## Consequências para o roadmap
- Fase 1 (GastroPub): só `à la carte`.
- Fase 2 (Pulpo): depende de qual tipo a Pulpo é (ver pergunta 5).
- Rodízio e delivery só entram quando houver um cliente real que os use; o modelo de dados já os comporta.

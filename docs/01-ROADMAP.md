# Roadmap — três fases

Regra: **o modelo de dados e os contratos nascem prontos para o SaaS; a interface e as funções crescem por fase.** Cada fase termina com um critério de saída que você mesmo consegue conferir.

## Fase 0 — Preparação (agora)
- Estrutura do projeto, ADRs, decisões em aberto respondidas.
- Placa de acrílico + tags NTAG213 compradas; lote testado em 2–3 celulares (iOS e Android).
- Gravar a URL curta, testar a leitura, **só então travar** a escrita da tag.
- Painel/tablet da equipe definido (ver análise 3.2).

**Saída:** decisões 1–4 de `02-PERGUNTAS-EM-ABERTO.md` respondidas.

## Fase 1 — Teste interno: SemReservas GastroPub
Tenant real, um único estabelecimento, mas com `tenant_id` em tudo.

| Marco | Entrega | Como verificar |
|---|---|---|
| 1.1 Fundação | Repositório, ambiente local e de teste, banco com migrações, deploy automático para um subdomínio | `git push` publica; banco recriado por um comando |
| 1.2 Rota NFC/QR | `/r/{token}` → home do GastroPub; token desativável | Encostar o celular na placa abre a home; desativar no painel bloqueia |
| 1.3 Cardápio | Feed + busca + categorias; dados reais do GastroPub; esgotado em 1 toque | Cliente vê item sumir quando o dono marca "acabou" |
| 1.4 Seleção + modo garçom | Lista sem preços, código, aviso "ainda não enviado" | Garçom lê sem rolar; nenhum valor visível |
| 1.5 Chamar garçom | Mesa em 1 toque, fila, painel com alerta e som, assumir/concluir | Dois aparelhos diferentes; tela de status do cliente |
| 1.6 Links e Wi-Fi | Instagram, Google, Wi-Fi guest (campos vazios somem) | Cliques registrados como "cliques", nunca como curtida |
| 1.7 Eventos e painel do dono | Acessos, itens mais vistos, chamados e tempos | Números batem com contagem manual de um sábado |

**Saída:** um fim de semana de operação real sem intervenção minha; equipe usa o painel sem treino extra; lista de atritos coletada.

## Fase 2 — Teste em campo: Pulpo
- **Segundo tenant** no mesmo sistema (prova do isolamento: o que muda na Pulpo não toca o GastroPub).
- Onboarding feito pela **interface** (marca, cardápio, tags), medindo o tempo gasto — esse número define se o SaaS escala.
- Módulos extras só se a Pulpo precisar (delivery e/ou rodízio, conforme pergunta 5).
- Relatório mensal **manual** (consulta + análise minha), para aprender o que o dono quer ler antes de automatizar com IA.
- Consentimento, política de privacidade e termo de uso revisados.

**Saída:** Pulpo opera 30 dias; dono diz o que pagaria; tempo de onboarding medido; zero vazamento entre tenants nos testes.

## Fase 3 — SaaS comercial
- Painel Master completo: criar cliente, planos/entitlements, trial, publicação com rascunho e reversão.
- Cobrança e contrato (preço a definir por você; o sistema guarda planos como dado).
- Relatório mensal com IA + revisão humana.
- Importação de cardápio por planilha; editor completo do dono.
- Clube/pontos, delivery, rodízio conforme demanda real.
- Monitoramento, backup testado, LGPD formalizada.

**Saída:** primeiro cliente pagante que não seja você nem a Pulpo.

## O que não fazer antes da hora
Comentários e curtidas públicas, fotos com moldura, IA concierge, pagamentos, integração com PDV, buffet do dia.

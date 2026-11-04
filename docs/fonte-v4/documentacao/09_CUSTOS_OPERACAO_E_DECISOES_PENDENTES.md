# 09 — Operação replicável, custos de referência e pendências

## 1. Materiais informados pelo fundador

| Item | Lote | Custo total | Unitário calculado | Observação |
|---|---:|---:|---:|---|
| Display acrílico | 50 | R$ 122,00 | R$ 2,44 | Reutilizável, se preservado |
| TAG NTAG213 | 50 | R$ 42,00 | R$ 0,84 | Para display NFC, bloquear depois de gravar/testar |
| TAG NTAG215 preparada para metal | 20 | R$ 67,00 | R$ 3,35 | Para ímã em geladeira; confirmar leitura real |
| Ímãs impressos com arte | 1.000 | R$ 223,00 | R$ 0,223 | NFC não está incluído em todos os 1.000 |

**Custo mínimo do conjunto display + NTAG213:** R$ 3,28, sem montagem, impressão adicional, perdas, tempo, frete, infraestrutura ou suporte. **Custo mínimo de um ímã impresso + NTAG215:** R$ 3,573, sem montagem e demais custos. A TAG poderá continuar bloqueada e reutilizável ao reatribuir URL curta no servidor caso volte íntegra; perda do suporte em teste gratuito torna-o custo de aquisição. Não pressupor que é necessário perder toda TAG ao fim de 30 dias.

## 2. Modelo operacional a simplificar

**Nova loja padronizada:** criar tenant → escolher modelo de UI → carregar logo/cores/hero → importar cardápio → validar itens/imagens/preços → ativar recursos → vincular acesso NFC/QR → publicar → testar no telefone → acompanhar fila e relatórios.

Definir um checklist com tempo gasto por etapa e limites de escopo. Priorizar processo repetível sobre personalização artesã. Produção de animações gastronomia premium (vídeos, IA, edição e conferência) é separada e orçada caso a caso. Quando cliente já possui fotos/vídeos adequados, o sistema deverá aceitá-los conforme especificações de mídia e qualidade.

## 3. Modelo financeiro sem preços fechados

As assinaturas antigas (Iniciante, Presença, Relacionamento, Negócios, Delivery, produto Social avulso) são referências históricas do Documento Mestre. Houve proposta posterior de uma oferta principal mais simples e teste gratuito de 30 dias, sem aprovação final de preço. **Não travar R$ 149, 189 ou 229 no código, nem incluir todos os serviços manuais no valor da assinatura.** Criar tabelas `plans`, `plan_entitlements`, `subscriptions`, `trial_started_at`, `trial_ends_at`, `activation_fee_policy` com valores configuráveis e regras de grandfathering quando necessário.

### Custos reais a acompanhar

- Infraestrutura cloud, PostgreSQL, backups, domínio, CDN, storage, vídeo/egress.
- Fornecedores de login (e-mail/SMS/Google), mensagens e IA (tokens/uso).
- Deslocamento e instalação, montagem de displays/ímas, perdas e reposição.
- Cadastro/importação/validação de cardápios e conteúdos do cliente.
- Suporte, manutenção, treinamento de equipe, relatórios mensais com revisão humana.
- Trabalho de desenvolvimento próprio **não é desembolso terceirizado**, mas tem custo de oportunidade e capacidade limitada.

**Economia do trial:** 30 dias sem cobrança pode fazer sentido como experimento comercial controlado; limitar quantidade de lojas e trabalho manual para não virar consultoria gratuita. Termos de comodato e devolução dos suportes devem ser explicitados. O teste não está aprovado automaticamente como regra contratual.

## 4. Medidas de sustentabilidade operacional

- `Tempo de onboarding por loja` (em minutos/horas) e número de correções no cardápio.
- `Tempo de revisão por relatório` e custo de IA/storage por tenant.
- `Suporte por tenant/mês` e motivos das solicitações.
- `Aderência ao fluxo NFC` (acessos, sessões qualificadas), respeitando métricas reais.
- `Atendimentos pendentes` e tempo de primeira resposta.
- `Taxa de ativação do clube`/recompensas verificadas.
- `Uso por módulo` para priorizar feature flags e planos.

Definir metas somente depois dos dados piloto, não atribuir melhora de vendas como evidência.

## 5. Riscos priorizados

| Risco | Probabilidade/impacto a validar | Mitigação inicial |
|---|---|---|
| Chamado não localiza pessoa com TAG móvel | Alto impacto operacional | Área opcional + código + piloto com equipe; fallback/desligamento |
| Som bloqueado/aba fechada | Alto impacto em atendimento | Opt-in explícito; banner; reconexão; tela monitorada |
| Custo humano de vídeos personalizados | Alto para operação solo | Serviços avulsos; templates/mídia do cliente |
| Cadastro e atualização de cardápios caros em tempo | Médio/alto | Importação assistida + conferência do gestor |
| LGPD/consentimento para marketing | Alto | Identidade mínima, privacidade por padrão, revisão jurídica |
| Fidelidade fraudada sem PDV | Alto | Verificação staff/ledger/idempotência |
| Promessas indevidas de venda/Instagram/Google | Alto reputacional | Nomes corretos e advertências nos relatórios |
| Falha de isolamento multiestabelecimento | Crítico | Autorização server-side, testes, RLS opcional |
| Adoção do visitante após curiosidade NFC | Médio/alto | Benefícios reais, home fácil, piloto e métricas |
| Custos e latência de IA | Médio | Agregação determinística, limites, cache, revisão |
| Personalização cada vez mais custom code | Médio/alto | Builder de blocos, tokens, flags, sem forks |

## 6. Pendências que exigem validação/decisão

1. Identidade atual **APROVADA**: SEMRESERVAS / Marketing de relacionamento gastronômico / “Um toque. Infinitas possibilidades.”; arquivos legados devem ser atualizados sem redesenhar o logotipo.
2. PULPO: recolher logo original, cores, fotos, receitas, preços, redes, endereço, Wi-Fi guest, política de atendimento e dados comerciais **oficiais**.
3. Confirmar se todos os módulos estarão no primeiro MVP ou por etapas; especial atenção a comentários, fotos, IA concierge e delivery.
4. Escolher autenticação de consumidor e custos; autenticação de staff/Master; opt-in marketing.
5. Validar como staff vai localizar cliente sem mesa via TAG e quem monitora o painel.
6. Decidir estratégia técnica da fila e backup operacional quando internet cai.
7. Definir política de publicação do proprietário e revisão Master.
8. Aprovar o contrato de eventos, retenção, privacidade e critérios de visualização qualificada.
9. Aprovar custos de infraestrutura, fornecedor de IA, limite de relatórios e tempo de revisão.
10. Definir preços/planos/ativação/trial sem transformar simulações em preços oficiais.
11. Homologar TAGs em metal, gravação e bloqueio com inventário/controle de qualidade.
12. Definir consentimentos, termos, tratamento de dados e política de premiação com análise jurídica.
13. Determinar política de status e escalonamento de chamados (SLA operacional realista).
14. Definir canais oficiais SEMRESERVAS a aparecer no rodapé; não publicar contatos fictícios.

## 7. Ordem prática recomendada

**Primeiro:** placas, TAGs e protótipo RESTOPUB navegável + Master configurável, incluindo fluxo completo de chamado e análise de viabilidade de localização. **Depois:** MVP autenticado e persistente, integrações mínimas e relatórios. **Em seguida:** piloto real PULPO, medir uso e refinar. **Por último:** escalar porta a porta em Bagé e evoluir delivery/adicionais. O custo do material físico é baixo, mas a implantação só escala se o produto e a operação forem padronizados.

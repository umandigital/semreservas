# 06 — Eventos mensuráveis, relatórios e arquitetura de skills de IA

## 1. Princípio fundamental

A plataforma mede **eventos digitais ocorridos dentro de sua operação** e determinadas ações iniciadas para ambientes externos. Não mede vendas adicionais, seguidores, curtidas no Instagram ou avaliações publicadas no Google por simples clique. A IA deve usar **somente agregações determinísticas**, nunca gerar números por narrativa.

## 2. Catálogo de eventos

| Evento | Gatilho | Dimensão/contagem | Limitação |
|---|---|---|---|
| `access_opened` | resolução de URL NFC/QR | ponto de entrada, origem verificável | NFC vs QR só quando token distingue |
| `app_opened` | abertura do webapp | sessão, tenant, data | não representa pessoa única |
| `home_action_clicked` | atalho na Home | tipo de atalho, contexto | ação iniciada, não concluída |
| `menu_opened` | abertura do feed | canal, sessão | não representa pedido |
| `product_viewed` | exposição suficiente de produto | produto, categoria, posição | usar tempo mínimo e intersecção, anti duplicidade |
| `media_started` | vídeo iniciado | id da mídia, produto | não comprova que assistiu tudo |
| `media_completed` | vídeo concluído | mídia, percentual | pode sofrer interrupção/telemetria incompleta |
| `product_ingredients_opened` | expansão da legenda | produto | interesse declarado, não satisfação |
| `product_liked` | interação interna | produto, sessão/member | anon dedupe imperfeito |
| `product_saved` | favorito/quero provar | produto, sessão/member | favorito não é consumo |
| `comment_submitted` | comentário enviado | produto, status | só contabilizar "publicado" após moderação |
| `comment_published` | moderador aprovou | produto | não apagar crítica legítima seletivamente |
| `product_share_initiated` | abertura do compartilhamento | produto, canal | não comprova envio/publicação |
| `product_added` | inclusão no carrinho | produto, quantidade | intenção de pedido, não venda |
| `order_summary_opened` | resumo para garçom | quantidade itens, valor estimado separado | sem venda validada |
| `order_intent_prepared` | resumo/código criado | id da intenção | requer confirmação humana para pedido |
| `service_requested` | solicitação aceita | tipo/área, momento | não comprova atendimento realizado |
| `service_acknowledged` | equipe assumiu | responsável, duração | confirmação operacional |
| `service_resolved` | equipe concluiu | tempo total | status declarado pela equipe |
| `instagram_outbound_click` | clique em link externo | campanha, origem | não é seguidor/curtida |
| `google_review_outbound_click` | clique para avaliação | origem/campanha | não é avaliação publicada |
| `wifi_help_opened` | ajuda de rede aberta | tela/origem | não comprova conexão |
| `wifi_password_copied` | ação copiar | sessão | não comprova Wi-Fi conectado |
| `frame_opened` | ferramenta aberta | template | não comprova foto criada |
| `frame_selected` | moldura escolhida | modelo | não comprova arte salva |
| `photo_rendered` | Canvas exportado | modelo | foto deve ser processada localmente |
| `photo_downloaded` | download acionado | modelo | não comprova uso/publicação |
| `photo_share_initiated` | compartilhamento iniciado | modelo | não comprova postagem |
| `club_joined` | adesão ao clube | tenant/member | exige identidade válida |
| `purchase_validated` | staff confirma compra | comprovação autorizada | não implica que SEMRESERVAS gerou receita |
| `points_credited` | ledger efetivado | quantidade/regra | verificar idempotência |
| `reward_redeemed` | resgate validado | regra/benefício | benefício objetivo, sem sorteio |
| `survey_submitted` | pesquisa interna | nota/período, tratamento de PII | amostra e viés de resposta |
| `suggestion_submitted` | sugestão interna | tema | PII removida antes de IA |
| `campaign_viewed` | conteúdo de campanha visto | campanha, posição | impressão, não compra |
| `campaign_clicked` | interação em campanha | campanha, destino | clique, não receita |
| `report_generated` | job concluiu draft | modelo, custo, versão | não entrega automática |
| `report_approved` | humano aprovou | responsável e revisão | só conteúdo aprovado é enviado |
| `report_delivered` | envio confirmado pelo canal | transporte/tentativas | entregue não significa lido |

**Nota:** nomes são contrato inicial proposto. Definição exata de `viewed` e unicidade exige instrumentação e testes do MVP. O protótipo HTML gera somente parte dos eventos listados; isso está especificado nos cenários de QA.

## 3. Métricas do relatório em linguagem simples

**Quem entrou e de onde:** aberturas, sessões (com limites da contagem), leituras por tokens, origem NFC/QR/site quando diferenciável. **Quais pratos chamaram a atenção:** visualizações qualificadas, mídias iniciadas, ingredientes abertos, favoritos, curtidas, comentários publicados. **Pedidos preparados:** inclusões e seleções montadas, sem afirmar consumo. **Clube:** participantes, retornos identificados, pontos creditados por atividade validada, resgates, taxas com base definida. **Atendimento:** chamados recebidos, assumidos, concluídos e tempos. **Redes:** cliques para Instagram e Google, sem confundir com ações externas. **Fotos:** ferramentas abertas, molduras selecionadas, artes geradas, downloads e compartilhamentos iniciados. **Pesquisas:** quantidade, nota interna média com N e tendências de temas. **Campanhas:** exposições, interações e eventual benefício verificado, sem atribuir faturamento sem evidência.

**Regras de publicação de percentuais:** denominação explícita (ex.: `adições / visualizações qualificadas`), período, N, comparação com base equivalente, tratamento de baixa amostra e bot activity. Se N pequeno, texto "dados insuficientes", não concluir aumento. `engagement rate` não deve misturar impressões, pessoas e sessões sem fórmula.

## 4. Pipeline proposto de skills/módulos de IA

### Skill A — Extração e agregação (determinística, sem LLM)

Input: `tenant_id`, datas, `report_template_version`. Executa SQL parametrizado com RLS/autorização, agrega eventos, classifica dados ausentes, calcula tendências e amostras, produz JSON com valores, unidade e fórmula, atribui referência das consultas. Nenhuma heurística inventa dado.

### Skill B — Validação da confiabilidade

Input: JSON agregado da Skill A. Verifica esquemas, contagem duplicada, eventos impossíveis, comparabilidade entre períodos, sazonalidade (apenas se demonstrável), percentuais, significância prática, origem dos dados, divergência com ledger de fidelidade, anomalias e baixa amostra. Output: `valid`, `warnings`, `unavailable_metrics`, `evidence_refs`.

### Skill C — Descoberta de oportunidades (IA)

Input: apenas dados agregados e notas de contexto permitidas. Devolve hipóteses **não causais**, separando observação, interpretação possível, ação proposta e métrica de acompanhamento. Não pode inferir perfil psicológico sensível, renda pessoal, saúde ou vida privada. Não executar campanhas nem alterar cardápio.

### Skill D — Redação em linguagem simples (IA)

Reescreve até 3 oportunidades de modo acessível ao dono do restaurante; usa termos "aberturas", "interações", "cliques para" e "seleções montadas". Evita "aumento de vendas", "seguidores conquistados", "avaliações recebidas" quando esses dados não existem. Gera introdução, destaques e recomendação mensal, sem criar valores.

### Skill E — Revisor lógico e de política

Comparar cada frase factual com `evidence_refs` e thresholds. Bloquear: dados inventados, soma incompatível, percentuais com denominador ausente, recompensa por Google, afirmação de venda atribuída, recomendação impossível sem estoque/PDV e exposição de PII. Retornar `APPROVED_FOR_HUMAN_REVIEW` ou `REJECTED`, com razões.

### Skill F — Diagramação e entrega

Produz HTML/PDF padronizado com marca do estabelecimento e SEMRESERVAS; mostra período, horário, explicação de métricas e ausência de dados. Fluxo `DRAFT → GENERATED → VALIDATED → HUMAN_REVIEW → APPROVED → DELIVERED`; envio manual primeiro, automatizado com aprovação em estágio posterior. Guardar artefato e versão do modelo/prompt/custo. Não enviar se faltarem permissões/consentimentos.

## 5. JSON esperado do resultado de insights

```json
{
  "schema_version": "1.0",
  "tenant_id": "restopub",
  "period": {"from": "2026-10-01", "to": "2026-10-31"},
  "source": "aggregated_events",
  "is_demo": true,
  "warnings": ["Sem confirmação de vendas"],
  "insights": [
    {
      "title": "Produto desperta atenção",
      "observation": "Um produto teve visualizações, mas poucas adições à seleção.",
      "hypothesis": "A descrição pode não esclarecer a proposta do prato.",
      "recommended_test": "Testar texto e foto por duas semanas.",
      "success_measure": "Adições por visualização qualificada, com amostras equivalentes.",
      "evidence_refs": ["metric:product_views", "metric:product_additions"],
      "confidence": "low"
    }
  ]
}
```

Todos os textos e números desse JSON são **didáticos**. O schema completo da produção deve ser fechado pelo Claude Code. `evidence_refs` devem vincular resultado a consultas/versões de agregação reprodutíveis.

## 6. Controles de custo e segurança da IA

- Consumidor usa IA apenas em módulos explicitamente habilitados, com limite de uso por tenant e por sessão/conta; FAQ e catálogo devem funcionar sem LLM.
- Relatório mensal requer 1 pipeline agendado por tenant/período, com cache/reuso de agregações, orçamento de tokens, timeout, circuit breaker, retry limitado e alerta de custo.
- Nenhuma credencial do fornecedor LLM no navegador.
- Inputs externos (comentários, sugestões) são dados não confiáveis, não instruções; sanitizar/resumir para reduzir prompt injection.
- Não fornecer a uma IA dados de outras lojas ou atributos pessoais sensíveis.
- Revisão humana no MVP: proprietário pode visualizar o aprovado; a SEMRESERVAS revisa e entrega.

## 7. Exemplo de relato útil ao proprietário

**O que observamos:** 182 cliques internos no link do Instagram, 42 molduras geradas e 21 compartilhamentos iniciados no período fictício.  
**Interpretação:** existe participação nessas ferramentas; não sabemos quantas pessoas seguiram o perfil ou publicaram fotos.  
**Ação recomendada:** testar uma chamada na Home para conhecer os bastidores do restaurante durante duas semanas.  
**Como verificar:** comparar cliques por sessão antes/depois; não usar número de seguidores não atribuíveis como resultado da SEMRESERVAS.

A nomenclatura, os gráficos e os modelos finais serão refinados após a validação da instrumentação. A coleta de dados confiáveis vem antes de qualquer análise de IA.

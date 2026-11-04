# ORDEM DE TRABALHO — CLAUDE CODE (PLANEJAMENTO ANTES DE CODIFICAR)

Leia primeiramente `SEMRESERVAS_DOCUMENTO_MESTRE_CONSOLIDADO_v4_0.md`, depois `documentacao/00_IDENTIDADE_OFICIAL_APROVADA.md`, os capítulos 01 a 09, `contratos/openapi.yaml`, `contratos/events.schema.json`, `arquitetura/schema.sql`, `arquitetura/diagrams.md` e os três protótipos. Entenda a ordem de precedência: o documento consolidado prevalece sobre históricos.

**Marca obrigatória**: SEMRESERVAS — Marketing de relacionamento gastronômico — *Um toque. Infinitas possibilidades.*. O logo fornecido não será redesenhado.

Sua primeira entrega deve ser uma **ANÁLISE CRÍTICA**, não implementação automática. Produza:
1. Revisão de conflitos, omissões e escolhas técnicas; classifique aprovado / proposto / MVP / futuro / pendente.
2. Proposta de arquitetura com ADRs, alternativas, decisões de custo, hospedagem, IA, mídia, autenticação e SSE ou WebSockets.
3. Diagrama real de comunicação entre browser do consumidor, API, banco, fila, painel Master, owner/staff, eventos e jobs de IA.
4. Modelo de dados / privacidade / RBAC multi-tenant, contratos HTTP e eventos, isolamento e idempotência.
5. UX auditável: visitador sem login no cardápio, Instagram, Google, Wi-Fi e pedidos; login progressivo somente para carteira, pontos/resgates e comentários persistentes; gestão autenticada.
6. Projetar atendimento com **fila persistente, destaque visual dominante e aviso sonoro**, com ativação por gesto humano, reconexão/replay e reconhecimento/conclusão pelo funcionário.
7. Plano de implementação fatiado em pequenos marcos demonstráveis com testes e critérios de aceite.
8. Lista de bloqueadores reais para o piloto PULPO: fotos, preços, logo/paleta, autorização, teste de operação sem número de mesa, política de dados.
9. Plano de automação dos relatórios mensais com skills de IA, avaliação de riscos de alucinação e aprovação humana inicial.
10. Orçamento estimado com premissas explícitas; não reproduza os R$ 90–180 mil de contratação externa como desembolso do fundador.

**Não prometa mensuração de vendas**, nem resultados reais da PULPO. Não invente URLs de avaliação Google ou contatos institucionais.

Depois apresente perguntas/decisões que realmente bloqueiem o desenvolvimento e um roadmap de MVP. **Aguarde autorização para implementação**.

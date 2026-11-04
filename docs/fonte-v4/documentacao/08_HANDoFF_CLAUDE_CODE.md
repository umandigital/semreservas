> **IDENTIDADE VIGENTE — 04/11/2026:** SEMRESERVAS · Marketing de relacionamento gastronômico · *Um toque. Infinitas possibilidades.* Use a arte gráfica aprovada. A documentação e os protótipos são pré-aprovação técnica, não sistema de produção.

# 08 — Instruções de handoff para Claude Code / IA de desenvolvimento

## Missão

Ler integralmente o pacote e **avaliar tecnicamente antes de programar**. A SEMRESERVAS é uma plataforma SaaS multiestabelecimento de experiência gastronômica, fidelização e inteligência. Não transformar a TAG NFC em produto isolado, nem deslocar a experiência de mesa para uma fase tardia em favor do delivery.

## Mandato da primeira resposta da IA

**Não iniciar código de produção imediatamente.** Entregar uma revisão escrita com:

1. Resumo fiel do negócio, objetivos, atores, 3 interfaces e fontes de receita sem inventar preços definitivos.
2. Mapa **Aprovado / Proposto / MVP / Futuro / Pendente**; conflitos de documentação e riscos de interpretação.
3. Revisão de segurança, multi-tenancy, acesso anônimo, fidelização, requisitos legais e privacidade.
4. Comparação breve de arquiteturas viáveis para desenvolvedor solo com IA; recomendar **uma stack** e defender custos/operabilidade, sem overengineering.
5. Modelo lógico de banco e políticas de autorização por recurso/tenant.
6. Plano de comunicação: REST, SSE/polling, outbox, cache e fila de relatórios, com contratos revisados.
7. Plano de testes, observabilidade e deploy.
8. Backlog revisado em marcos de entrega, com dependências e ordem, primeiro RESTOPUB, depois PULPO.
9. Lista de questões de decisão que realmente bloqueiam a implementação. Para cada uma: alternativas, recomendação e impacto.
10. Estimativa relativa de esforço/risco **sem confundir horas de implementação com custo terceirizado**, custo de IA, infraestrutura e trabalho manual.

A IA deve então aguardar aprovação explícita da arquitetura/roadmap pelo fundador. Não deve transformar hipóteses em decisões tomadas.

## Instruções para o ciclo de implementação após aprovação

- Criar repositório versionado com documentação viva em `/docs`, ADRs e changelog.
- Implementar uma sequência vertical fechada por vez: ex. ponto NFC/QR → Home publicada → feed → seleção → resumo ao garçom; depois atendimento com backend; depois clube/insights.
- Preservar interfaces configuráveis para mais de um estabelecimento, sem duplicar código.
- Manter API schemas e migrations versionadas. Usar TypeScript strict e validação nos endpoints.
- Quando um recurso depender de validação externa, criar adaptador e mock, sem fingir integração concluída.
- Incluir login obrigatório só para identidade e privilégios de membro/gestor/equipe/Master.
- Não introduzir dependência obrigatória de IA na navegação, no atendimento ou nas regras de pontos.
- Implementar testes de cross-tenant, abuso e transações antes do piloto.
- Separar `demo/seed` de `production`; o RESTOPUB fictício não gera métricas reais nem contabiliza planos pagos.
- Fechar cada etapa com demonstração funcional, testes executados, bugs conhecidos, evidência e pedido de aprovação.

## Documentos e contratos que devem ser conferidos

- `01_ESCOPO_PRODUTO_E_DECISOES.md` — contexto de negócio e prioridades.
- `02_REQUISITOS_TECNICOS_E_REGRAS.md` — comportamentos e limites.
- `03_ARQUITETURA_COMUNICACAO_INTEGRACOES.md` — fluxos entre sistemas.
- `04_PERMISSOES_PRIVACIDADE_SEGURANCA.md` — login mínimo, segurança.
- `05_JORNADAS_E_UX.md` — telas e comportamento do feed.
- `06_METRICAS_RELATORIOS_SKILLS_IA.md` — eventos e pipeline de inteligência.
- `07_BACKLOG_CRITERIOS_ACEITE.md` — marcos e gates.
- `09_CUSTOS_OPERACAO_E_DECISOES_PENDENTES.md` — custo, instalação e pendências.
- `../contratos/openapi.yaml`, `../contratos/events.schema.json`, `../arquitetura/schema.sql` — **rascunhos de contrato**, não código pronto para deploy.
- `../prototipos/` — UX interativo; implementação local com localStorage, não backend.

## Não negociáveis

1. Não exigir login para Instagram, Google, Wi-Fi, cardápio, montar pedido ou pedir garçom.
2. A carteira de pontos e o resgate exigem identidade/validação.
3. Nenhuma recompensa por Google; Instagram e Google medidos por cliques de saída, não resultados externos.
4. Sem reservas de mesas, pagamento online inicial, substituição de caixa/PDV/estoque/cozinha.
5. NFC/QR públicos e bloqueio físico da TAG após teste; `tenant_id` não pode ser alterado por usuário anônimo.
6. Pedido apresentado ao garçom **sem preços** e **sem número de mesa**.
7. Chamados de garçom com fila real, alerta visual proeminente e áudio opt-in, ou recurso desabilitado até haver operação confiável.
8. Relatório com dados verificáveis e revisão; IA não pode inventar vendas nem publicações externas.
9. Home da loja configurável e segura pelo Master, com marca do estabelecimento predominante.
10. O logo SEMRESERVAS aprovado não deve ser redesenhado; marca PULPO depende de aprovação da empresa.

## Critérios para sugerir mudanças

Se identificar bloqueador real, apontar: requisito afetado, razão técnica, risco, alternativa proposta, custo de implementação/operacional, impacto em UX, status de aprovação. Não remover/alterar recursos por conveniência sem registrar decisão e obter aprovação.

## Questões obrigatórias para o parecer inicial

- **Localização do chamado sem mesa:** a área/código bastam? E se staff não localizar pessoa? Propor alternativa operacional sem fixar TAG.
- **Mensageria/áudio:** SSE ou WebSocket? Como indicar desconexão da fila e recuperar eventos sem duplicação? Como lidar com iPhone bloqueado?
- **Identidade do consumidor:** método com menor atrito e bom custo para piloto; login social Google e/ou e-mail código; consentimento separado.
- **Fidelidade:** evidência verificável de compra sem PDV integrado, idempotência e abuso; como operador autoriza.
- **Publicação:** permitir alterações por dono, e quais dependem de Master? Cache e versionamento da Home.
- **Mídias:** pipeline de upload, transcode, poster, limites, formatos, direitos e produção premium cobrada à parte.
- **Relatórios:** definir limiar de amostra, orçamento IA, validação de texto, revisão humana e entrega.
- **Custos:** implantação de novos tenants, hosting, armazenamento/mídia, SMS/e-mail, som/painel, relatórios e suporte.
- **PULPO:** dados reais de branding/cardápio e critérios de uso de imagem a obter do proprietário.
- **Marca:** assinatura do logo fornecido vs slogan textual anterior; não tomar decisão de branding por código.

## Modelo de resposta recomendado

```
# Diagnóstico técnico da SEMRESERVAS
## Entendimento do negócio
## Escopo preservado e escopo em discussão
## Riscos / gaps técnicos
## Arquitetura proposta e justificativa
## Dados, identidade e permissões
## Comunicação e notificações
## Plano de implementação por marcos
## Testes e critérios de aceite
## Orçamento e esforço (estimativas claras)
## Decisões necessárias do fundador
```

Este handoff não autoriza desenvolvimento automático de recursos não aprovados; é um contrato de trabalho técnico para revisão, planejamento e posterior execução controlada.

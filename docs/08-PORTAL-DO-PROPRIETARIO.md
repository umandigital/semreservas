# Portal do Proprietário: funcionalidades e métricas (especificação completa)

Versão 1, 20/11/2026. Layout simples; esta especificação define **o que existe, quem acessa e o que cada número significa**. Itens marcados **[existe]** já estão no sistema; **[Fase 1]**, **[Fase 2]**, **[Fase 3]** indicam quando entram. Tudo é isolado por restaurante (`tenant_id`) e auditado.

## 0. Princípios
1. **Mede o que o app vê**, não o que ele não vê: aberturas, interações, atendimento, pontos e resgates. **Nunca** exibe vendas, faturamento, seguidores ganhos nem avaliações publicadas (só cliques que saem do app).
2. **Todo número tem definição visível** (ícone "i": fórmula, período, limitação) e **amostra mínima**: com poucos dados mostra "dados insuficientes", não percentual.
3. **Período e comparação** em todas as telas: Hoje, 7 dias, 30 dias, Este mês, Mês passado, Personalizado; comparação com o período anterior equivalente; filtro por mesa/unidade.
4. **Exportar** CSV de qualquer tabela (agregados; dados pessoais só ao proprietário).
5. **Zero trabalho para a equipe do salão**: a equipe usa só o painel da fila (link secreto); o resto é do proprietário/gerente.

## 1. Papéis e permissões
| Função | Proprietário (`owner`) | Gerente (`manager`) | Equipe (`staff`, link secreto) |
|---|:-:|:-:|:-:|
| Resumo e métricas | ✅ | ✅ | — |
| Fila de atendimento (assumir/concluir/trote) | ✅ | ✅ | ✅ |
| Validar cupom (digitar código) | ✅ | ✅ | ✅ |
| "Acabou hoje" | ✅ | ✅ | — |
| Cardápio (editar, mídia, preços) | ✅ | ✅ | — |
| Toque Premiado: configurar ações, prêmios, campanhas | ✅ | — | — |
| Toque Premiado: ver membros, extrato, ajustar pontos | ✅ | ✅ (ajuste com justificativa) | — |
| Comentários e pesquisas (moderar, responder) | ✅ | ✅ | — |
| Aparência (tema, banners) | ✅ | ✅ | — |
| Mesas e placas | ✅ | ✅ | — |
| Usuários e acessos, trocar link da equipe | ✅ | — | — |
| Relatórios mensais | ✅ | ✅ | — |
| Dados pessoais de membros, exportar | ✅ | — | — |
| Configurações, LGPD, plano | ✅ | — | — |
Toda ação sensível grava **quem, quando, o quê, valor anterior e novo** (auditoria visível ao proprietário, filtrável).

## 2. Menu do portal
Resumo · Atendimento · Cardápio · Desempenho dos pratos · Toque Premiado · Comentários e pesquisas · Canais e links · Pedidos (listas) · Aparência · Mesas e placas · Equipe e acessos · Relatórios · Configurações · Ajuda

---
## 3. Funcionalidades por módulo

### 3.1 Resumo [Fase 1]
- **Cartões do período**: aberturas do app, sessões, chamados e tempo típico até concluir, listas de pedido montadas, cadastros no Toque Premiado, resgates validados.
- **Pendências do dia** (lista acionável): chamados em aberto, cupons gerados e ainda não validados, comentários aguardando moderação, pratos sem foto ou sem legenda, prêmios com estoque perto do fim, alertas de possível fraude.
- **Destaques da semana**: prato mais visto, prato mais adicionado, hora de pico de chamados, melhor dia.
- Último relatório mensal aprovado, com atalho.

### 3.2 Atendimento [existe + Fase 1]
- **Fila ao vivo** (mesma da equipe) com alertas sonoro e visual.
- **Histórico filtrável**: mesa, motivo, período, status, responsável; linha do tempo de cada chamado (criado, visto, concluído, cancelado).
- **Marcação de trote** e **aparelhos pausados** (liberar manualmente).
- **Metas**: o proprietário define o tempo-alvo de resposta (ex.: 3 min); o painel mostra % dentro da meta.
- **Rodízio** [Fase 2]: segunda fila (cozinha) com mesa, sabor, quantidade e estados próprios.
- **Link do painel da equipe** [existe]: ver, copiar, QR, **trocar** (o antigo morre na hora); aparelhos que instalaram o painel.

### 3.3 Cardápio [Fase 1; hoje é arquivo de dados]
- **Categorias**: criar, renomear, ordenar, ocultar.
- **Pratos**: nome, preço, **legenda** (texto estilo Instagram, "…mais"), **ingredientes e alérgenos** (lista), tags (vegetariano, vegano, sem glúten, picante), tempo de preparo opcional, ordem, destaque do dia, visibilidade.
- **Mídia**: foto, vídeo curto e **modelo 3D/RA** (upload validado: tamanho real, base no chão, peso, triângulos; capa gerada). O plano contratado limita a quantidade de pratos em 3D.
- **"Acabou hoje"** com um toque [existe], opção de **reabrir automaticamente à meia-noite**.
- **Disponibilidade programada**: dias e horários (almoço, happy hour, prato do dia).
- **Pré-visualização** no celular antes de publicar; **rascunho, publicar e voltar à versão anterior**.
- **Importação por planilha** [Fase 3] com revisão dos erros linha a linha.
- Aviso de qualidade: prato sem foto, sem legenda, sem alérgenos, preço zerado.

### 3.4 Desempenho dos pratos [Fase 1]
Funil por prato e por categoria: **visto → legenda aberta ("mais") → adicionado ao pedido → (RA aberta → RA fixada)**. Ranking, comparação com o período anterior, e listas prontas: "chamam atenção mas ninguém adiciona", "adicionados mas pouco vistos", "nunca vistos". Detalhes na seção 4.

### 3.5 Toque Premiado [Fase 1/2]
> A definição final (consumo, saldo e acumulado, catálogo com preço em pontos, resgate na fila da equipe) está em **`docs/10-TOQUE-PREMIADO-DEFINICAO.md`** e prevalece sobre esta seção.
A **dinâmica é fixa**; o proprietário define os parâmetros.
- **Ações que dão pontos**: ligar/desligar, valor, limite (por pessoa, por dia, por mês), janela de validade; hoje: cadastro, visita, bônus de frequência, Instagram, Google, pesquisa, compartilhar.
- **Campanhas com prazo**: pontos em dobro em dias ou horários, bônus por prato novo, mês de aniversário. É uma ação com início e fim, com prévia do custo estimado.
- **Prêmios**: nome, descrição, imagem, pontos, categoria elegível (comida, bebida, tudo), limite por mês (estoque), **validade do cupom** (padrão 24 h), dias e horários em que vale, ativo/inativo. Modelos prontos por tipo de restaurante.
- **Regras do programa**: validade dos pontos (padrão 12 meses sem atividade), resgate (pontos reservados ao gerar o cupom, devolvidos se vencer, descontados na validação), limite de resgates por visita, nome do programa.
- **Aniversário**: texto da promoção, desconto, mínimo de acompanhantes, o que exclui (ex.: bebida), janela (semana do aniversário).
- **Cliente do mês**: critério (dias com visita), prêmio, ranking, **divulgação só de quem autorizou**.
- **Membros**: busca, perfil (nome, e-mail, aniversário, data de cadastro, saldo, visitas), **extrato completo**, **ajuste manual** (conceder ou retirar pontos com justificativa obrigatória), bloqueio por fraude, exclusão a pedido (LGPD).
- **Resgates**: cupons emitidos, validados, vencidos e cancelados, com quem validou e quando.
- **Alertas antifraude**: muitos pontos em pouco tempo, mesma pessoa em muitas contas, resgates concentrados, ajustes manuais frequentes.
- **Regulamento e consentimentos**: texto versionado, quem aceitou qual versão, opt-in de divulgação.

### 3.6 Comentários e pesquisas [Fase 2]
- **Moderação** de comentários (aprovar, ocultar, responder); só aparecem depois de aprovados.
- **Pesquisa da visita**: nota e comentário; média, distribuição, tendência, textos recentes; **sugestões** em fila.
- Sem identificar a pessoa quando a pesquisa for anônima.

### 3.7 Canais e links [Fase 1]
Instagram, avaliação do Google, Wi-Fi (rede e senha), contato (WhatsApp ou telefone), site. Campo vazio não aparece. Métrica: **cliques de saída** (não são seguidores nem avaliações).

### 3.8 Pedidos, as listas para o garçom [Fase 1]
- Quantidade de listas, itens por lista, **itens mais adicionados**, **observações mais comuns** ("sem cebola" ...), horário de pico.
- Cada lista é uma **intenção**, não uma venda. O sistema deixa isso explícito.

### 3.9 Aparência [Fase 1/2]
Cores-base (com trava de contraste), logo (claro/escuro), banners da home (até 5, 1080×1350, datas de início e fim), destaque do dia, cartão de promoção, aviso de cadastro. Rascunho, prévia, publicar, reverter. Veja `docs/design/TEMA-DO-RESTAURANTE.md`.

### 3.10 Mesas e placas [Fase 1]
Mesas (rótulo, ativa/inativa), **vínculo placa → mesa corrigível** sem regravar a tag, tokens ativos e revogação, **último acesso** por placa (placa que ninguém lê há dias é alerta), geração do PDF de placas com QR, duração da sessão (padrão 90 min).

### 3.11 Equipe e acessos [Fase 1]
Usuários do portal (proprietário, gerente) com convite por e-mail; redefinir senha; encerrar sessões; **registro de auditoria**.

### 3.12 Relatórios [Fase 2]
Relatório mensal em linguagem simples (processo e revisão humana no portal Master): período, o que aconteceu, 3 oportunidades, o que não foi medido. Histórico, PDF e e-mail. Exportações CSV.

### 3.13 Configurações [Fase 1]
Dados do restaurante, horário de funcionamento, alertas (som, e-mail), política de privacidade e termo (versão vigente), plano e fatura (somente leitura), módulos ligados (somente leitura; mudar pede ao Master).

### 3.14 Ajuda [Fase 2]
Central de dúvidas e abertura de chamado ao suporte SemReservas, com o contexto da tela e do restaurante.

---
## 4. Catálogo de métricas

Convenções: **Fonte** é o evento ou tabela; **Período** vem do filtro; **Limitação** é o que o número não prova.

### 4.1 Acesso e uso
| Métrica | Definição / fórmula | Fonte | Limitação |
|---|---|---|---|
| Aberturas | Leituras de placa (NFC/QR) | `access_opened` | não é pessoa única |
| Sessões | Sessões de 90 min abertas | sessão | idem |
| Sessões qualificadas | Sessões com ao menos 1 prato visto ou 1 ação | derivada | corte arbitrário, mostrado |
| Origem | % NFC vs QR vs link | token | só quando o token distingue |
| Cadastros no Toque Premiado | Contas novas | `club_joined` | — |
| Taxa de cadastro | Cadastros ÷ sessões qualificadas | derivada | amostra mínima |
| Dispositivos | Aparelhos distintos (id aleatório) | aparelho | não é pessoa |
| Pico | Hora e dia da semana com mais aberturas | agregação | — |

### 4.2 Atendimento
| Métrica | Definição | Fonte |
|---|---|---|
| Chamados | Total por motivo (garçom, conta, dúvida, outro) | `service_requests` |
| Tempo até ver | Mediana de criado → assumido | `acknowledged_at` |
| Tempo até concluir | Mediana de criado → concluído | `resolved_at` |
| Dentro da meta | % de chamados vistos dentro do alvo | derivada |
| Pendentes agora | Em aberto neste instante | tabela |
| Cancelados pelo cliente | % | status |
| Trotes marcados | Marcações da equipe | flag |
| Mesas que mais chamam | Ranking por mesa | tabela |
| Mapa de calor | Chamados por hora × dia da semana | agregação |
Usa **mediana** (e percentil 90), não média, para não distorcer. Mede o **atendimento**, não a qualidade do serviço.

### 4.3 Cardápio e pratos
| Métrica | Definição | Fonte | Limitação |
|---|---|---|---|
| Visualizações qualificadas | Prato visível por tempo mínimo (ex.: 1 s) | `product_viewed` | corte e dedupe |
| Legenda aberta | Toques em "…mais" | `product_caption_opened` | interesse, não satisfação |
| Adicionado ao pedido | Adições | `product_added` | intenção, não venda |
| Taxa de adição | Adições ÷ visualizações qualificadas | derivada | amostra mínima |
| Vídeo iniciado / concluído | % da mídia vista | `media_*` | telemetria incompleta |
| Busca | Termos mais buscados e **buscas sem resultado** | `search_performed` | — |
| Esgotado | Vezes e duração de "acabou hoje" por prato | tabela | — |
| Qualidade do cardápio | % de pratos com foto, legenda e alérgenos | tabela | — |

### 4.4 Realidade aumentada [Fase 1]
| Métrica | Definição |
|---|---|
| RA aberta | Toques em "Projete na mesa" |
| RA com mesa medida | Sessões em que a mesa foi detectada |
| RA fixada | Prato fixado |
| Tempo até fixar | Mediana de abrir → fixar |
| Falha de RA | Aparelho sem suporte ou sessão recusada |
| Plano B usado | Scene Viewer ou Quick Look |
| Adição após RA | Adições de pratos vistos em RA ÷ RA fixada |
Compara o **efeito da RA** sem prometer aumento de vendas.

### 4.5 Pedido (lista para o garçom)
Listas montadas · itens por lista (mediana) · itens mais adicionados · observações mais comuns · "Fazer outro pedido" · subtotal estimado médio (**estimado, não é venda**).

### 4.6 Toque Premiado
| Métrica | Definição |
|---|---|
| Membros ativos | Com pelo menos uma visita nos últimos 30 dias |
| Visitas por membro | Dias com visita ÷ membros ativos |
| Retorno | % de membros com 2 ou mais visitas em 30 dias |
| Pontos emitidos | Soma creditada, por ação |
| Pontos resgatados | Soma descontada |
| **Passivo de pontos** | Pontos em carteira × custo médio por ponto dos prêmios (**exposição financeira**) |
| Cupons | Emitidos · validados · vencidos |
| Prêmios mais resgatados | Ranking |
| Custo estimado de prêmios | Resgates × custo informado por prêmio |
| Aniversário | Cupons emitidos e usados |
| Cliente do mês | Ranking de visitas |
| Alertas de fraude | Contagem e motivo |
| Cliques → pontos | Cliques em Instagram/Google × pontos concedidos (**não prova seguidor nem avaliação**) |

### 4.7 Canais e comunicação
Cliques por canal (Instagram, Google, Wi-Fi copiado, contato, compartilhar) · taxa por sessão. **Sempre rotulados como cliques de saída.**

### 4.8 Comentários e pesquisa
Comentários enviados e publicados · tempo até moderar · nota média da pesquisa (com N) · distribuição · respostas · sugestões por tema.

### 4.9 Cobertura e saúde da operação
Placas sem leitura há X dias · pratos sem mídia · mesas sem vínculo · aparelhos da equipe sem conexão · último acesso ao painel da equipe.

### 4.10 O que o portal **não** mostra
Faturamento do restaurante, seguidores ganhos, avaliações publicadas, "aumento de vendas por causa do app", nome de clientes de outros restaurantes. **Exceção:** o consumo dos membros do clube é mostrado como "valor lançado pela equipe" (ver `docs/10-TOQUE-PREMIADO-DEFINICAO.md`, seção 9), nunca como faturamento.

---
## 5. Alertas e notificações do proprietário
- Chamado sem atender há mais que a meta · painel da equipe sem conexão.
- Cupom gerado e não validado ao fim do dia · prêmio com estoque ≤ 20%.
- Comentário aguardando moderação · pesquisa com nota baixa.
- Alerta de fraude no clube · ajuste manual acima do limite.
- Prato sem foto ou sem legenda · placa sem leitura há 7 dias.
- Relatório mensal pronto.
Canais: painel, e-mail, e notificação do navegador. Cada alerta liga/desliga.

## 6. Dados necessários (acréscimos ao banco)
`menu_categories`, `menu_items`, `menu_media`, `item_availability`, `tenant_branding` (rascunho e publicado), `banners`, `loyalty_members`, `loyalty_actions`, `loyalty_campaigns`, `loyalty_ledger` (imutável, idempotente), `loyalty_rewards`, `loyalty_redemptions`, `loyalty_rules`, `birthday_benefits`, `comments`, `surveys`, `suggestions`, `events` (catálogo de eventos), `reports`, `tenant_users`, `device_sessions`, `consent_versions`, `consents`. Todas com `tenant_id`, RLS e testes de isolamento antes do segundo restaurante.

## 7. Ordem de construção proposta
1. **Base do portal**: login, papéis, auditoria, Resumo, Atendimento (já parcialmente pronto).
2. **Cardápio editável** + Canais e links + Mesas e placas.
3. **Eventos e Desempenho dos pratos** (instrumentar o app e agregar).
4. **Toque Premiado** (configuração, membros, extrato, cupons, antifraude).
5. **Aparência** (tema e banners).
6. **Comentários, pesquisas e relatórios**.

## 8. Dependências de decisão (ver `docs/07-INDEFINICOES-E-PONTOS.md`)
Login do cliente, pontos gastos ou acumulados, validade dos pontos, validação do cupom, regras do aniversário, comentários públicos ou só para o dono, meta de atendimento padrão.

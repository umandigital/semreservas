# Prompts para o Claude Code (construção dos portais)

Como usar: abra o Claude Code **na pasta do repositório** `umandigital/semreservas` (ele lê o `CLAUDE.md` sozinho) e envie **um prompt por vez**, na ordem. Só passe ao próximo quando o anterior estiver entregue, testado e com a migração aplicada.

## Decisões assumidas (confirme ou corrija antes de enviar o P5 e o P6)
Os prompts P1 a P4 e M1 **não dependem** destas. Elas valem para o Toque Premiado (P5) e para o que o toca.
1. Login do cliente: **e-mail com código** (Supabase Auth).
2. Pontos: **saldo que se gasta**; barra mostra o próximo prêmio.
3. Visita só conta **ao pedir a conta**.
4. Validade dos pontos: **12 meses sem atividade**; qualquer visita renova.
5. Resgate: pontos **reservados** ao gerar o cupom, **devolvidos** se vencer, **descontados** na validação do garçom; cupom de 24 h, uso único, 1 por visita.
6. Garçom valida o cupom no painel da equipe (campo "Validar cupom").
7. Aniversário: 50% na comida do pedido do aniversariante, mínimo de 5 acompanhantes, não vale bebida, semana do aniversário, data editável 1 vez e cadastrada 30 dias antes.
8. Sessão de 90 min por placa, renova a cada toque (máx. 3 por aparelho/dia); distância desligada.

---
## P0. Alinhamento (sempre o primeiro; sem código)
```
Leia o CLAUDE.md, o README.md, docs/adr/, docs/06-AJUSTES-MVP-1.md, docs/07-INDEFINICOES-E-PONTOS.md, docs/08-PORTAL-DO-PROPRIETARIO.md e docs/09-PORTAL-SEMRESERVAS-MASTER.md.
Não escreva código ainda. Responda em português, em no máximo 40 linhas:
1. O que já existe de verdade no código (telas, migrações 0001 a 0004, testes) e o que é só especificação.
2. Os riscos que você vê para construir os dois portais (segurança, isolamento entre restaurantes, publicação automática na main).
3. Dúvidas que bloqueiam o P1.
Não invente decisões de produto: o que estiver em aberto em docs/07 você pergunta.
```

---
## PORTAL DO PROPRIETÁRIO

### P1. Base do portal: papéis, login, auditoria e Resumo
```
Objetivo: base do portal do proprietário conforme docs/08, seções 1, 2, 3.1 e 3.2 (somente o que não existe).
Trabalhe em um branch novo (portal-p1). Não faça push na main.
Entregue:
1. Migração apps/api/migrations/0005_portal_base.sql com: tabela de usuários do portal por restaurante e papel (owner, manager; staff continua pelo link secreto), função que devolve papel do usuário logado em cada restaurante, e ampliação de audit_logs para gravar antes/depois e IP quando disponível. Todas as funções SECURITY DEFINER, com RLS e revoke/grant no padrão das migrações 0002 a 0004.
2. Funções de leitura para o Resumo: cartões do período (aberturas se já houver evento, chamados, tempo até ver e até concluir pela mediana, percentil 90), pendências (chamados abertos). Aceitam período e comparam com o período anterior equivalente.
3. Tela "Resumo" e "Atendimento" no portal (hoje o dono é a tela src/screens/Dono.tsx): menu lateral conforme docs/08, filtro de período (Hoje, 7 dias, 30 dias, Este mês, Mês passado, Personalizado), histórico filtrável de chamados (mesa, motivo, status, período), meta de tempo de resposta configurável, dados com "dados insuficientes" quando a amostra for pequena, e exportar CSV.
4. Testes SQL em apps/api/tests/ (novo arquivo portal.sql) provando: sem login nada funciona; gerente não faz ação de proprietário; restaurante A não lê B; auditoria grava antes/depois.
5. Testes de componente (vitest) e typecheck.
Fora de escopo: cardápio, Toque Premiado, aparência, relatórios.
Antes de codar, mostre o plano (arquivos e migração) e espere eu confirmar.
Ao terminar: diga qual migração devo aplicar antes do merge e o que NÃO testou.
```

### P2. Cardápio editável e canais
```
Objetivo: docs/08, seções 3.3 e 3.7. Hoje o cardápio vive no código (src/data/cardapio.ts). Passa para o banco, editável pelo proprietário e gerente.
Branch portal-p2. Não use a main.
Entregue:
1. Migração 0006_cardapio.sql: categorias, pratos (nome, preço, legenda, ingredientes, alérgenos, tags, ordem, destaque, visibilidade), mídia (foto, vídeo, modelo 3D com medidas reais e arquivo leve para RA), disponibilidade programada (dias e horários), "acabou hoje" (já existe, migre sem perder), rascunho e publicado com função de reverter. Funções públicas que devolvem só o publicado e o que está disponível agora.
2. Script de seed que carrega os pratos atuais de src/data/cardapio.ts (22 itens + Hot Roll + Prato Fotográfico) para o restaurante gastropub, sem perder nenhum dado.
3. O app do cliente passa a ler o cardápio das funções públicas, com cache local e fallback para o último cardápio baixado se a rede cair.
4. Telas do portal: categorias, pratos (formulário com validação), reordenar, "acabou hoje" com reabertura automática à meia-noite opcional, pré-visualização no celular, publicar e voltar à versão anterior, avisos de qualidade (sem foto, sem legenda, sem alérgenos).
5. Envio de modelo 3D (.glb) com validação automática no navegador e no servidor: unidade em metros, tamanho real ±3% do declarado, base em y=0, centrado, sem extensões obrigatórias, peso até 6 MB. O teste src/data/modelos.test.ts continua valendo para os modelos do repositório.
6. Canais e links (Instagram, avaliação do Google, Wi-Fi, contato): campo vazio não aparece no app.
7. Testes de isolamento e de papel (gerente edita, equipe não), vitest e typecheck.
Fora de escopo: importação por planilha, Toque Premiado, aparência.
Plano primeiro, aguarde minha confirmação. Ao terminar, diga qual migração aplicar antes do merge e o que não testou.
```

### P3. Mesas e placas
```
Objetivo: docs/08, seção 3.10, e a parte do proprietário de docs/09 seção 3.8.
Branch portal-p3.
Entregue: migração com duração de sessão por restaurante e último acesso por placa; telas do portal para mesas (rótulo, ativa/inativa), vínculo placa→mesa corrigível sem regravar a tag, tokens ativos e revogação, último acesso por placa com alerta "sem leitura há 7 dias", e geração do PDF de placas com QR (reaproveite tools/placas). Testes de isolamento e de papel.
Plano primeiro, aguarde confirmação.
```

### P4. Eventos e Desempenho dos pratos
```
Objetivo: docs/08, seções 3.4 e 4 (acesso, cardápio, RA, pedido, canais).
Branch portal-p4.
Entregue:
1. Migração com a tabela de eventos (tenant, sessão pseudônima, tipo, prato, momento, metadados mínimos, sem dados pessoais) e função pública que recebe eventos em lote com limite de taxa e deduplicação. Retenção de eventos brutos: 90 dias (função de limpeza).
2. Instrumentação do app do cliente com os eventos do catálogo de docs/06 do pacote (docs/fonte-v4/documentacao/06_METRICAS_RELATORIOS_SKILLS_IA.md, seção 2) que existem hoje, mais: product_caption_opened, search_performed, ar_opened, ar_surface_measured, ar_fixed (com tempo até fixar), ar_failed e ar_fallback_used. "Visto" = prato visível por pelo menos 1 segundo, uma vez por sessão.
3. Funções de agregação e telas "Desempenho dos pratos" (funil visto → legenda aberta → adicionado → RA aberta → RA fixada, ranking, listas "chamam atenção mas ninguém adiciona", "adicionados mas pouco vistos", "nunca vistos") e do Resumo (cartões de acesso).
4. Cada número com definição visível (fórmula, fonte, limitação) e "dados insuficientes" abaixo da amostra mínima. Nada de vendas ou receita.
5. Testes de deduplicação, de limite de taxa e de isolamento.
Plano primeiro, aguarde confirmação.
```

### P5. Toque Premiado (motor e portal) , só depois de confirmar as 8 decisões
```
Objetivo: docs/08 seção 3.5 e 4.6, e docs/07 partes 2 e 3. As decisões de produto estão no topo de docs/PROMPTS-CLAUDE-CODE.md (decisões assumidas 1 a 8); use-as e pergunte se algo faltar.
Branch portal-p5.
Entregue em duas etapas, com confirmação entre elas:
Etapa A (banco e regras):
1. Migração 0008_toque_premiado.sql: membros (por restaurante, login por e-mail com código), ações configuráveis (valor, limite por pessoa, dia, mês, janela), campanhas com prazo, extrato imutável e idempotente (chave por evento), prêmios (pontos, categoria elegível, estoque mensal, validade do cupom, dias e horários), resgates com reserva, devolução e débito, regras do programa (validade, limite por visita), aniversário e cliente do mês.
2. Funções: ganhar pontos por ação (valida limite, idempotência, sessão aberta, visita só ao pedir a conta), gerar cupom (reserva), validar cupom (garçom, pelo link da equipe), expirar cupons (devolve pontos), expirar pontos, ajuste manual com justificativa (gerente com teto), bloquear membro, exportar e apagar dados do membro (LGPD).
3. Testes SQL exaustivos: corrida entre dois resgates com o mesmo saldo (não pode passar), pontos duplicados pelo mesmo evento, limite diário, cupom vencido devolve pontos, equipe não ganha pontos, isolamento entre restaurantes, extrato não pode ser alterado nem apagado.
Etapa B (telas): app do cliente (Prêmios: saldo, barra, prêmios, extrato, cupom com contagem regressiva, aniversário, cliente do mês só com a própria contagem) e portal do proprietário (configurar ações, campanhas, prêmios, regras; membros; resgates; alertas de fraude; métricas de 4.6 incluindo passivo de pontos).
Não pontue Instagram, Google nem compartilhar além do toque no link, e rotule isso. Plano primeiro, aguarde confirmação.
```

### P6. Aparência (tema e home)
```
Objetivo: docs/design/TEMA-DO-RESTAURANTE.md e docs/08 seção 3.9.
Branch portal-p6.
Entregue: tabela de tema (cores-base, logo claro/escuro, banners, datas, rascunho/publicado/reverter), função pública que devolve só o publicado, bucket de imagens com envio permitido apenas ao proprietário/gerente do restaurante e redimensionamento no navegador (WebP, até 400 KB, 1080x1350 para banner), tela "Aparência" com seletor de 3 cores, derivação automática das demais, **trava de contraste AA** que recusa combinações ilegíveis, prévia no celular, publicar e reverter. O app do cliente aplica o tema por variáveis CSS na abertura (guardado no aparelho para não piscar). O tema do GastroPub (#380818, #E09060, #F8E8C8) entra como dados. Testes: isolamento, contraste, limite de imagem.
Plano primeiro, aguarde confirmação.
```

---
## PORTAL SEMRESERVAS (MASTER)

### M1. Base do Master: login com MFA, papéis, auditoria, estabelecimentos e módulos
```
Objetivo: docs/09, seções 1, 2, 3.2, 3.4, 3.14 e 3.15 (somente o que não existe).
Branch master-m1. Não use a main.
Entregue:
1. Migração 0010_master_base.sql: usuários e papéis do Master (administrador, operações, suporte, financeiro, somente leitura), ficha do restaurante (status, tipo de operação, unidades, slug, contato), histórico de mudança de status, módulos por restaurante com limites e dependências (use tenant_modules existente). Funções do Master separadas das do proprietário, com checagem de papel no servidor e auditoria completa. MFA obrigatório para administrador e operações (Supabase Auth).
2. Testes SQL: um proprietário nunca chama função do Master; suporte não altera plano nem exclui; ver como proprietário é somente leitura e registrado com motivo; desligar um módulo faz a API recusar novas chamadas e preserva o histórico.
3. Tela do Master (rota própria, carregada sob demanda): login, lista de estabelecimentos com filtros, ficha, criar restaurante (formulário mínimo; o assistente completo é o M2), pausar/reativar, módulos com limites, auditoria pesquisável.
4. Painel "Visão geral" com restaurantes por status e alerta de projeto do banco pausado.
Plano primeiro, aguarde confirmação. Diga qual migração aplicar antes do merge e o que não testou.
```

### M2. Onboarding com cronômetro e marca
```
Objetivo: docs/09, seções 3.3 e 3.5. Assistente de onboarding em 11 passos com tempo registrado por passo, checklist de aceite no final (chamado, painel da equipe, RA, cupom), e tempo total de onboarding como métrica. Reaproveite a tela Aparência do proprietário com poderes extras do Master (temas-modelo, travar campos, prévia em vários tamanhos).
Branch master-m2. Plano primeiro, aguarde confirmação.
```

### M3. Placas NFC/QR e catálogo/3D
```
Objetivo: docs/09, seções 3.6, 3.7 e 3.8. Inventário de tags (lote, tipo, custo, status), gravação com checklist (ler, confirmar, só então travar), vínculo placa→restaurante→mesa, histórico de leituras, gerador de PDF; importação de cardápio por planilha com validação linha a linha; biblioteca de mídia; envio de .glb com validação automática, geração da versão leve para RA e da capa transparente (reaproveite tools/modelos).
Branch master-m3. Plano primeiro, aguarde confirmação.
```

### M4. Relatórios e suporte
```
Objetivo: docs/09, seções 3.10 e 3.12. Pipeline Rascunho → Gerado → Validado → Revisão humana → Aprovado → Entregue; etapas A e B determinísticas (agregação e validação); IA apenas sobre dados agregados e com bloqueios automáticos (dado inventado, percentual sem denominador, promessa de venda); tela de revisão com evidências; entrega no portal e por e-mail com registro. Tickets de suporte com contexto e "ver como proprietário" somente leitura.
Branch master-m4. Plano primeiro, aguarde confirmação.
```

---
## Regras para você, ao conversar com o Claude Code
- **Um prompt por vez.** Se ele sugerir fazer mais, diga "só o que está no prompt".
- Peça sempre o **plano antes do código** (já está nos prompts).
- A **migração é aplicada por você** no SQL Editor do Supabase antes do merge; confirme que o projeto não está pausado.
- Diga "pode fazer merge na main" só depois de testar no celular; **todo push na main publica**.
- Se ele disser que algo "funciona", pergunte: "o que você rodou e o que não conseguiu testar?"

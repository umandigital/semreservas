# Análise crítica do pacote SemReservas v4.0

Base: `docs/fonte-v4/` (Documento Mestre v4.0, docs 01–09, OpenAPI, schema.sql, protótipos).
Protótipo inspecionado em Chromium, 390×844. Não há teste ponta a ponta do pacote original.

Legenda: **[BLOQUEIA]** precisa de decisão antes de codar · **[AJUSTAR]** corrigir no desenho · **[ADIAR]** fora das fases iniciais.

---

## 1. Lacunas e conflitos no material

### 1.1 Os tipos de estabelecimento não estão no material **[BLOQUEIA]**
O pacote inteiro assume um bar/restaurante de salão (mesa + garçom). Os tipos que você descreveu não existem nele, e dois deles contradizem decisões "aprovadas":

| Tipo | O que exige | Conflito com o pacote |
|---|---|---|
| **À la carte** (GastroPub, Pulpo) | Cardápio, seleção, chamar garçom | É o caso coberto |
| **Delivery** (ímã de geladeira) | Montar pedido, endereço/entrega, envio por WhatsApp | O Doc Mestre põe delivery como "complementar" e fora do MVP; guarda dados pessoais (endereço, telefone) que o resto do pacote evita |
| **Rodízio** (pizzaria) | Ver todos os sabores em circulação e **pedir um sabor específico à cozinha** | Exige **fila da cozinha** (segunda fila em tempo real) e **saber a mesa**. O pacote decidiu "sem número de mesa na TAG" |
| **Buffet** | Só entra se tiver à la carte; opcional: "o que tem hoje no buffet" | Nenhum modelo de dado para cardápio do dia |

Consequência técnica: `establishment_type` e **módulos habilitáveis** (`menu`, `waiter_call`, `kitchen_request`, `delivery_whatsapp`, `daily_board`) precisam estar no modelo de dados desde o início. Detalhes em `03-TIPOS-DE-ESTABELECIMENTO.md`.

### 1.2 "Sem número de mesa" quebra o rodízio e enfraquece o chamar-garçom — **RESOLVIDO**
O pacote propunha zona + código com placas móveis. O fundador decidiu: **placa numerada por mesa**, com vínculo corrigível no servidor. Ver `adr/0003-placa-numerada-por-mesa.md`.

### 1.3 A stack proposta não cabe no servidor atual **[BLOQUEIA]**
O pacote sugere Node + PostgreSQL + Redis + S3/CDN + worker + SSE. O servidor do umandigital.com.br é hospedagem Hostinger (acesso SSH na 65002, `domains/.../public_html`): PHP + MySQL, sem processo permanente, sem PostgreSQL, SSE e jobs agendados limitados. O próprio pacote diz que a stack "não é decisão aprovada". Proposta e alternativas no ADR-0001.

### 1.4 RESTOPUB (fictício) virou GastroPub (real) **[AJUSTAR]**
O pacote trata o primeiro laboratório como estabelecimento fictício. Agora é o **SemReservas GastroPub**, com cardápio, preços, fotos e equipe reais e uma placa de acrílico com NFC. Isso muda o teste: dá para validar operação de verdade (som, localização, equipe), e os "dados demonstrativos" viram dados reais. Manter um tenant `demo` separado para apresentações comerciais.

### 1.5 Documentos com versões misturadas **[AJUSTAR]**
Zip "v4.0" contém pasta "v2.0", um Word "Handoff v2.0", texto interno "Handoff v1.0" e README citando "v1_0.docx". Vale a regra do Doc Mestre ("v4.0 prevalece"). Neste repositório, `docs/fonte-v4/` é **somente leitura**; o que for decidido vai para `docs/` e ADRs.

### 1.6 O que o protótipo é e não é
`prototipos/` são ~190 linhas minificadas em `localStorage` + `BroadcastChannel`. Serve como **referência visual e de fluxo**, não como base de código. Não reaproveitar o JS.

---

## 2. Falhas de interface e usabilidade (protótipo do consumidor)

| # | Achado | Gravidade | Correção |
|---|---|---|---|
| U1 | **Ícones são caracteres Unicode genéricos** (`▣` serve a Pedido, carrinho e Fotos; `♧` serve a Clube e Garçom). Duas ações diferentes com o mesmo símbolo | Alta | Conjunto de ícones SVG próprio, um por ação; sempre com rótulo |
| U2 | **Alvos de toque abaixo de 44 px**: botões do clube/carrinho 38×38, "Entrar para meus pontos" 35 px de altura, links do rodapé 12–16 px | Alta | Mínimo 44×44 (meta do próprio pacote, RF mobile) |
| U3 | **"Meu pedido" não envia pedido nenhum.** O cliente monta uma lista que o garçom digita de novo. A palavra "pedido" promete mais do que entrega | Alta | Rótulo "Minha seleção" + aviso fixo "ainda não enviado à cozinha" até haver fluxo real (rodízio/delivery têm envio de verdade) |
| U4 | **Pedir a conta e Chamar garçom são botões separados** na Home; mais 10 atalhos no total | Média | Um único "Chamar garçom" com motivo em 1 toque (Conta / Dúvida / Fazer pedido / Outro) |
| U5 | **Cardápio só em feed vertical, sem lista.** Num gastropub com 40–80 itens, achar uma cerveja específica é rolar um vídeo por vez. O pacote proíbe a lista | Média | Manter o feed como padrão, mas com **busca** e alternância "ver em lista". Decisão sua (pergunta 6) |
| U6 | **Controles de demonstração dentro da tela do cliente** (seletor de estabelecimento, link para o painel, "Testar customização") | Média | Remover da build real; ficam num modo `?demo=1` |
| U7 | Texto secundário claro sobre roxo escuro: contraste **não medido** | A verificar | Medir (WCAG AA 4,5:1) antes de fixar a paleta |
| U8 | **"Avaliar no Google" e "Instagram" ao lado de ações de uso** com o mesmo peso visual | Baixa | Mover para "Conecte-se" com peso menor |
| U9 | Sem estado de **item esgotado**. Em operação real isso é a primeira reclamação do dono | Alta | Disponibilidade com 1 toque no painel do dono ("acabou"), refletida na hora |
| U10 | Sem **filtros dietéticos/alergênicos** (sem glúten, vegetariano...) — só texto livre | Média | Etiquetas estruturadas, informadas pelo estabelecimento |
| U11 | Sem tela de **estado do chamado para o cliente** com próximo passo ("o garçom já viu, está a caminho") | Média | Tela de status com os três estados e um botão "cancelar" |
| U12 | Aviso de privacidade/cookies não aparece em lugar nenhum, mas existe sessão pseudônima | Média | Faixa discreta de 1 linha na primeira visita |

## 3. Falhas de operação e segurança no desenho

1. **Chamar garçom pela URL pública pode ser disparado de casa.** Qualquer pessoa com o link envia chamados. Limite de taxa não basta: usar *nonce* de curta duração gerado ao abrir a página + exigir mesa + bloqueio por sessão. Cuidado é maior no rodízio (cozinha).
2. **Som no painel:** o pacote cobre o gesto humano para ativar o áudio, mas não cobre **tela apagando** nem **iOS**. Painel precisa de *Wake Lock*, vibração, título piscante e, na prática, **um tablet Android dedicado com Chrome**. Isso vira requisito de implantação, não de código.
3. **Fila sem internet no salão.** O pacote lista como pendência; para teste interno basta: se o painel perder conexão, faixa vermelha "SEM CONEXÃO — chamados podem não chegar" (nunca falhar em silêncio).
4. **Painel Master completo é excesso para a fase interna.** Com um tenant, publicar marca/flags por interface é trabalho que só paga na Fase 3. Mantenha **o modelo multi-tenant desde o dia 1** (barato) e a **interface** do Master mínima (ver roadmap).
5. **Moderação de comentários/curtidas** cria trabalho diário para o dono. Adiar para depois do campo.
6. **Cadastro de cardápio é o maior custo por cliente** (o Doc 09 admite). Falta no pacote um **editor simples do dono** (preço, foto, esgotado) e **importação em lote por planilha**. Isso decide se o SaaS escala.

## 4. O que o pacote acerta e será mantido
Experiência NFC como protagonista · visitante sem login · login só para carteira/pontos · mesa nunca inventada · sem prometer vendas · clique em Instagram/Google ≠ curtida/avaliação · nenhum prêmio por avaliação Google · fila persistente com estados e auditoria · tenant derivado do servidor, nunca do navegador · preços e planos como dados, não código · fluxo crítico funciona sem IA.

## 5. Classificação do escopo

| Item | Fase 1 Interno (GastroPub) | Fase 2 Campo (Pulpo) | Fase 3 SaaS |
|---|---|---|---|
| Rota NFC/QR, home, feed, seleção, modo garçom | ✅ | ✅ | ✅ |
| Chamar garçom + painel + som | ✅ | ✅ | ✅ |
| Esgotado / editor simples do dono | ✅ | ✅ | ✅ |
| Eventos mínimos + painel de engajamento | ✅ | ✅ | ✅ |
| Rodízio (ver sabores, pedir à cozinha) | — | se Pulpo for rodízio | ✅ |
| Delivery (ímã + WhatsApp) | — | ✅ (se fizer parte do piloto) | ✅ |
| Clube/pontos | — | opcional | ✅ |
| Instagram, Google, Wi-Fi | ✅ | ✅ | ✅ |
| Master completo, planos, trial, cobrança | — | — | ✅ |
| Relatório mensal com IA | — | manual primeiro | ✅ |
| Comentários, molduras de foto, IA concierge | — | — | depois |
| Buffet do dia | — | — | depois |

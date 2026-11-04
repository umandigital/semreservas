# 05 — Jornadas, telas, estados e UX/UI

## Premissa de experiência

O consumidor encontra a **marca e a oferta do estabelecimento**, não uma tela corporativa da SEMRESERVAS. A assinatura SEMRESERVAS oficial aparece em local discreto, com contato institucional configurável. O logo visual aprovado foi reutilizado no pacote a partir do arquivo do projeto, sem recriação da fonte. A Home deve ser configurada por campos/blocos, reaproveitando o mesmo código para todas as unidades.

## Mapa de telas

| Área | Tela | Estado e ação principal | Login |
|---|---|---|---|
| Consumidor | Home visitante | Banner, quatro ações primárias, blocos presenciais/digitais | Não |
| Consumidor | Home identificado | Mesma Home, com área de pontos opcional | Opcional |
| Consumidor | Feed do cardápio | Fotos/vídeos, filtro por categoria, nome/valor, descrição expandida | Não |
| Consumidor | Pedido | Itens, quantidades, observações, subtotal | Não |
| Consumidor | Mostrar ao garçom | Alto contraste; nome/quantidade/adicionais/código, sem preço | Não |
| Consumidor | Solicitar atendimento | Área aproximada e descrição, código, estado | Não |
| Consumidor | Clube e recompensas | Saldo, pontos, regulamento, resgates | Sim para carteira |
| Consumidor | Instagram / Google | Link externo, intenção rastreada | Não |
| Consumidor | Wi-Fi | SSID, senha guest, copiar e instrução | Não |
| Consumidor | Pesquisas/sugestões | Feedback interno; pontuação apenas se elegível | Não, exceto pontos |
| Consumidor | Fotos com moldura | Templates, foto local, preview, download/compartilhar | Não |
| Consumidor | Comentários no produto | Visualizar público, publicar após identificação/moderação | Publicar: proposto sim |
| Master | Visão geral | Operação, status e pendências | Sim |
| Master | Estabelecimentos | Provisionamento, suspensão, plano, status | Sim |
| Master | Home e marca | Texto, cores, logo, mídia, atalhos, ordem, preview/publicação | Sim |
| Master | Funcionalidades | Feature flags, limites, dependências | Sim |
| Master | Catálogo e mídia | Importação/cadastro, revisão, publicação | Sim |
| Master | TAGs NFC | Inventário, roteamento, lock status, revogação | Sim |
| Master | Relatórios | Job, revisão, aprovação, entrega | Sim |
| Proprietário | Resumo | Acessos, interações, pontos e relatórios | Sim |
| Proprietário/Staff | Central de atendimento | Fila, alerta sonoro/visual, assumir/concluir | Sim |
| Proprietário | Produtos/engajamento | Views, likes, comentários, favoritos, seleção | Sim |
| Proprietário | Redes/fotos | Cliques de saída, artes geradas e download/share iniciado | Sim |
| Proprietário | Clube | Cartão de indicadores, créditos e resgates verificados | Sim |
| Proprietário | Insights | Relatório aprovado, hipóteses e recomendações | Sim |

## Journey UX-01 — Entrada pública via NFC/QR

1. Usuário aproxima o telefone da TAG ou lê QR e abre URL curta HTTPS.
2. Redirecionador resolve estabelecimento/unidade sem exigir cadastro.
3. Home mostra banner curto, 4 ações principais, 2 ou 3 grupos de serviços e rodapé discreto SEMRESERVAS.
4. `Início`, `Cardápio`, `Pedido`, `Clube`, `Serviços` disponíveis no rodapé fixo.
5. Sem conexão com internet/erro de configuração: mensagem objetiva e opção de tentar novamente; nenhum formulário de cadastro obrigatório.

**Aceite:** até 2 ações desde Home para abrir um produto ou chamar atendimento; visitante consegue navegar sem criar conta.

## Journey UX-02 — Feed de produtos

1. Escolhe `Cardápio` e opcionalmente filtra por categoria em chips/destaques.
2. Visualiza um item com foto ou vídeo, nome/preço, legenda resumida sobre gradiente, ações sociais e botão `Adicionar ao pedido`.
3. Toque em `Ver ingredientes` expande a camada de texto e escurece parte da mídia; conteúdo continua legível e sem bloquear a navegação.
4. A rolagem vertical leva ao próximo produto; opção de pausar vídeo, reduzir movimento e mudar categoria.
5. Curtidas/favoritos anônimos são somente interações internas, sujeitos a dedupe e sem pontuação automática.

**Aceite:** mínimo 4 produtos por categoria nos dados demonstrativos, sem tela secundária obrigatória de lista de pratos.

## Journey UX-03 — Montagem e apresentação ao garçom

1. Adiciona produtos, altera quantidade e observa subtotal estimado.
2. Toca em `Clique aqui e mostre para o garçom seu pedido`.
3. Modo garçom mostra alto contraste e fonte grande; lista `quantidade × nome`, complementos e observações; **nenhum preço**.
4. Código temporário de apresentação aparece para facilitar conferência, sem substituir a comanda do PDV.
5. Botão **`Chamar garçom` abaixo do conteúdo** abre solicitação de atendimento.
6. Funcionário confere escolha, registra mesa no processo existente e lança pedido no PDV.

**Não afirmar:** pedido confirmado, pago, entregue ou vendido apenas porque foi preparado.

## Journey UX-04 — Chamar garçom sem mesa vinculada

1. Cliente pressiona `Chamar garçom` na Home, Serviços, cabeçalho ou após o resumo do pedido.
2. UI permite escolher área do local (`Salão`, `Balcão`, `Área externa`, etc.) e informar referência breve opcional. Sem área, risco de localização deve ser destacado.
3. Envia API pública, recebe código de conferência e estado `PENDING`, com capacidade de consultar apenas o próprio chamado.
4. Painel da equipe recebe SSE (ou polling fallback) e mantém banner destacado. Se som habilitado por clique, reproduz aviso.
5. Staff assume (`ACKNOWLEDGED`), localiza pessoa com auxílio da área/código, atende e conclui (`RESOLVED`).
6. Se fila não monitorada, o recurso deve estar desligado e a UI deve orientar atendimento tradicional.

**Risco:** TAG móvel impede inferir mesa. O procedimento de localização é **pendente de validação no piloto**.

## Journey UX-05 — Login mínimo para benefícios

1. Cliente navega livremente.
2. Ao escolher `Ver meus pontos`, `Participar`, `Resgatar`, `Salvar favoritos entre aparelhos` ou `Publicar comentário`, o produto explica por que a identidade é necessária.
3. Autenticação protegida por sessão/provedor escolhido.
4. Cliente escolhe participar do clube do estabelecimento. Seus pontos só surgem após eventos verificados, não por leitura NFC.
5. Opção separada para comunicação promocional; sem caixa marcada por padrão.

## Journey UX-06 — Instagram e Google

Acessos externos funcionam sem cadastro. Botão `Ver Instagram` deve abrir destino oficial validado pelo dono, registrar apenas clique de saída; `Avaliar no Google` abre formulário público de avaliação espontânea, **sem incentivo**. Não condicionar a avaliação a nota da pesquisa interna. Relatório informa `Cliques para Instagram` / `Cliques para avaliar no Google`, sem comprovar resultado externo.

## Journey UX-07 — Wi-Fi

1. Toca em `Conectar ao Wi-Fi`.
2. Aparecem nome da rede guest, senha exibida conforme política do estabelecimento e botão copiar.
3. UI orienta usar os Ajustes do telefone; não promete conexão automática no Safari/Chrome.

## Journey UX-08 — Fotos com moldura

1. Escolhe foto na galeria ou usa câmera conforme suporte/permissão.
2. Seleciona 3 a 5 molduras universais parametrizadas por cores/logotipo do restaurante.
3. Canvas monta arte no navegador; foto não é enviada ao servidor por padrão.
4. Baixa a arte ou usa compartilhamento nativo se disponível; queda de API oferece download.
5. Mensuração: entrada na ferramenta, moldura, arte gerada, download e share iniciado. Não comprova publicação em redes.

## Journey UX-09 — Master configura novo cliente

1. Admin cria estabelecimento `DRAFT` e define identidade, horário e canal.
2. Faz upload de logo/hero, cadastra categorias e produtos, URLs oficiais e rede guest.
3. Seleciona módulos/limites/relatórios, vincula TAGs e verifica URL.
4. Publica versão do estabelecimento após validar e visualizar preview; nenhuma recompilação por unidade.
5. Dispositivo do consumidor recebe mudança via próxima atualização de configuração; painel staff monitora fila caso esse recurso esteja ativo.

## Journey UX-10 — Proprietário acompanha resultado

1. Login autorizado no tenant.
2. Início mostra métricas simples e aviso do que elas significam.
3. Fila de chamados no topo quando houver pendências; operação não depende de ouvir som.
4. Relatório mensal aprovado com 3 recomendações, cada uma fundamentada em dados agregados.
5. Proprietário pode configurar conteúdo permitido por seu papel sem invadir outros tenants.

## UI/Design tokens e customização

**Marca SEMRESERVAS:** roxo e laranja da arte aprovada para telas de gestão e assinatura discreta; não redesenhar símbolo em ícone genérico. **Restopub:** roxo/laranja demonstrativos. **PULPO:** proposta ilustrativa em tons vinho/terracota, **não aprovada pelo restaurante**. Na produção, persistir `theme_tokens`, `logo_asset_id`, `hero_asset_id`, `typography_id` (conjunto controlado), `home_blocks`, `feature_overrides`, `published_version`, `updated_at`.

**Governança UI:** manter as áreas de ação identificadas por rótulos — não apenas ícones. Botões importantes a alcance do polegar. Não usar mais de cinco itens no rodapé móvel. Evitar carrosséis e efeitos que escondam atendimento ou pedido. Imagens de prato podem conter texto alternativo objetivo. Campos e números devem usar padrões de acessibilidade. Visualizar estados de carregamento, erro, vazio, confirmação e rede lenta.

**Nota de protótipo:** as fotos foram reutilizadas de ativos demonstrativos disponíveis no projeto; produtos, valores e métricas são dados fictícios para teste de experiência, não cardápio oficial.

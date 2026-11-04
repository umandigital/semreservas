# Plano de QA e validação — Protótipo integrado e MVP futuro

## Escopo desta entrega

Os protótipos HTML/JS são **simulações funcionais locais**, sem backend, autenticação real, servidor SSE, gravação NFC, crédito real de pontos ou integração com Instagram, Google e WhatsApp. Há sincronização local entre abas da mesma origem quando servidos via localhost. Nenhum botão pode ser interpretado como ação executada em um restaurante real.

## Testes exploratórios sugeridos no protótipo

1. **Gateway:** abrir `http://localhost:8765` e confirmar as três entradas.
2. **RESTOPUB visitante:** abrir consumidor, verificar Home, navegar por feed sem cadastro, filtrar por categoria e conferir 4 itens/categoria disponíveis nos dados.
3. **Vídeo/foto:** conferir reprodução silenciosa/manual do primeiro vídeo RESTOPUB, legenda expandida e fallback de imagem.
4. **Pedido:** adicionar Burger, aumentar/diminuir quantidade, entrar Pedido, conferir subtotal; clicar `Clique aqui e mostre para o garçom seu pedido`; **validar que o quadro branco não contém `R$`**, tem nomes e quantidades; botão `Chamar garçom` abaixo.
5. **Chamado em duas abas:** abrir Proprietário, clicar `Ativar som de chamados` e deixar aba aberta; no Consumidor, abrir `Chamar garçom`, escolher área (opcional), digitar referência e enviar. Validar banner grande e som se permitido. Assumir e concluir; observar fila.
6. **Sem mesa:** verificar que nenhuma tela de consumo exige número de mesa. O código de chamada é curto e requer localização humana.
7. **Controle antispam demo:** tentar abrir chamado duas vezes sem concluir; não permitir dois ativos do mesmo tipo/sessão/loja.
8. **Troca de estabelecimento:** mudar para PULPO, conferir paleta ilustrativa e produtos por categoria; pedido do RESTOPUB não deve aparecer como carrinho PULPO.
9. **Master: customização:** abrir Home, alterar título/cor/hero e salvar. Voltar à aba do consumidor, verificar conteúdo atualizado. Publicação real precisará de fluxo draft/publish.
10. **Master: módulos:** desativar `Chamar garçom` na PULPO; botão público deve sumir e tentativa de chamada deve ser recusada pela lógica simulada. Reativar.
11. **Master: catálogo:** editar nome/preço de produto, salvar e ver alteração na interface cliente.
12. **Master: TAGs:** alterar roteamento simulado; a operação não deve afirmar que gravou ou bloqueou TAG física.
13. **Proprietário: métricas:** clicar para Instagram/Google no cliente e ver contagem de **cliques de saída**, não de resultados externos.
14. **Fotos:** selecionar uma foto local, gerar moldura e baixar; nenhuma foto deve ser enviada a backend (não existe backend no protótipo).
15. **Clube:** navegar em visitante; entrar no clube só ao tentar ver pontos; senha e carteiras reais permanecem pendentes.
16. **Relatórios:** gerar rascunho no Master, aprovar, conferir que não se atribuem vendas.

## Testes que DEVEM existir na implementação de produção

- `tenant-isolation`: acesso de owner A não pode ler nem alterar tenant B; tentativa de IDOR em todos endpoints.
- `service-cross-device`: visitante em celular A cria chamado e staff no computador B recebe sem refresh; rede offline/reconnect não perde chamado nem duplica.
- `service-state`: transições válidas, versão concorrente, idempotência, rate limit, expiração, auditoria de staff.
- `service-sound`: áudio só toca depois de gesto/ativação, alerta visual sempre aparece; testado em Chrome desktop e Safari iOS/Chrome Android conforme suporte.
- `auth`: login opcional para consumidor, obrigatório para gestão e pontos, consentimento marketing separado.
- `ledger`: duas requisições de crédito com mesma chave creditam uma única vez, resgate concorrente não gera saldo negativo.
- `order-waiter`: impressão/tela garçom não contém preço no DOM acessível ao operador nem no texto extraído; não cria venda.
- `external-links`: validação de URLs, métricas de cliques, nenhuma recompensa condicionada a Google.
- `media`: fotos/vídeos corretos no 4G, lazy load, formatos/caching/fallback, dimensões e copyright.
- `photo`: Canvas local, compartilhamento degradável, nenhum upload implícito; consentimento se recurso futuro armazenar fotos.
- `insights`: dados com amostra insuficiente geram aviso, e LLM não inventa totais/ações externas.
- `accessibility`: contraste, navegação por teclado/leitor de tela, labels, foco, áreas de toque.
- `offline`: modo de falha honesto; não deixar chamado como enviado se API falha.
- `deployment`: migrations reproduzíveis, restore backup testado, ambiente de staging e rollback.

## Condições do teste de som

Browsers podem bloquear áudio. Ao iniciar turno, operador clica **Ativar som**; painel mantém indicação visual e contador caso áudio falhe. A equipe deve manter o painel operacional monitorado. `BroadcastChannel` do protótipo só comunica abas da mesma origem; o MVP exigirá SSE/polling com backend persistente.

## Limites de QA na geração do pacote

Foi executada verificação estática do JavaScript, integridade de paths/arquivos e leitura de JSON/YAML. **Não foi possível executar automação de UI em Chromium neste ambiente devido a bloqueio de navegação do browser pelo ambiente de execução**; testes interativos de navegador e som precisam ser executados pelo destinatário do pacote. Não declarar que testes end-to-end foram concluídos.


## Situação de execução no ambiente de entrega (04/11/2026)

Validação estática concluída com sucesso: JavaScript parseável; contratos OpenAPI/JSON, SQL e ativos presentes. O ambiente bloqueou navegação automatizada por política, por isso a validação E2E interativa **deve ser executada pelo destinatário**. Não assumir que toda a interface foi testada funcionalmente.

# SEMRESERVAS — Pacote de análise e handoff técnico para Claude Code

**Entrega:** 04/11/2026 · **Versão do pacote:** MVP Handoff v2.0 · **Situação:** PROPOSTA TÉCNICA PARA REVISÃO, NÃO AUTORIZAÇÃO AUTOMÁTICA DE PRODUÇÃO.

## O que contém

| Diretório | Arquivos | Uso |
|---|---|---|
| `documentacao/` | 01 a 09 | Escopo integral, decisões, perfis, arquitetura, eventos, jornadas, operação, backlog e instruções à IA |
| `contratos/` | `openapi.yaml`, `events.schema.json` | Contratos iniciais propostos, passíveis de revisão |
| `arquitetura/` | `schema.sql` e `diagrams.md` | Modelo relacional proposto e comunicação entre componentes |
| `prototipos/` | `index.html`, `cliente.html`, `master.html`, `proprietario.html`, CSS, JS, mídias | Protótipo interativo local integrado, SEM backend real |
| `qa/` | `TESTES_E_ACEITE.md`, `VALIDACAO_ESTATICO.md` | Cenários de validação, limites dos testes realizados |
| `SEMRESERVAS_Handoff_Executivo_v1_0.docx` | Word | Síntese técnica para leitura humana |

## Identidade oficial atualizada

**SEMRESERVAS**  
**Marketing de relacionamento gastronômico**  
*Um toque. Infinitas possibilidades.*

A imagem oficial fornecida é o símbolo NFC/S e o wordmark roxo/laranja. Exibir o descritor e o slogan como textos auxiliares, sem alterar o desenho da marca.

## Como executar o protótipo em um computador

**Windows:** execute `INICIAR_PROTOTIPO_WINDOWS.bat` a partir deste pacote (Python instalado). Depois acesse `http://localhost:8765`.

**macOS/Linux:** dentro da pasta `prototipos`, execute `python3 -m http.server 8765` e abra `http://localhost:8765`.

A página inicial oferece três áreas. Para testar o alerta sonoro do garçom, abra **Proprietário** em uma aba e clique em **Ativar som de chamados**. Abra **Consumidor** em outra aba, acesse **Chamar garçom** e envie uma solicitação. O painel do proprietário mostra o chamado em destaque e toca o sinal se o navegador permitir.

> O protótipo usa `localStorage` e `BroadcastChannel` para simular sincronização **entre abas da mesma origem no mesmo navegador**. Não é um backend nem opera em celulares diferentes. A segurança, autenticação, persistência real e rede devem ser construídas na implementação.

## Três princípios que não podem ser alterados automaticamente

1. **Experiência NFC em salão é o protagonista.** Delivery integra a visão do produto, mas não substitui a experiência principal.
2. **Login é opcional para a maior parte da experiência pública.** Identificação confiável é exigida para carteiras, pontos, resgates e benefícios pessoais; login do gestor/equipe/admin é obrigatório.
3. **Resultados de engajamento são mensuráveis; vendas adicionais não.** Clique no Instagram ou Google não confirma curtida, seguidor ou avaliação. Seleção montada não confirma venda. A IA não deve inventar esses resultados.

## Ordem de leitura recomendada à IA

1. `documentacao/01_ESCOPO_PRODUTO_E_DECISOES.md`
2. `documentacao/02_REQUISITOS_TECNICOS_E_REGRAS.md`
3. `documentacao/03_ARQUITETURA_COMUNICACAO_INTEGRACOES.md`
4. `documentacao/04_PERMISSOES_PRIVACIDADE_SEGURANCA.md`
5. `documentacao/05_JORNADAS_E_UX.md`
6. `documentacao/06_METRICAS_RELATORIOS_SKILLS_IA.md`
7. `documentacao/07_BACKLOG_CRITERIOS_ACEITE.md`
8. `documentacao/08_HANDoFF_CLAUDE_CODE.md`
9. `documentacao/09_CUSTOS_OPERACAO_E_DECISOES_PENDENTES.md`
10. Contratos, SQL, diagramas e protótipos.

## Rastreabilidade

Este material foi consolidado a partir do **Documento Mestre v2.0 (28/10/2026)** e das decisões posteriores fornecidas pelo proprietário do projeto nesta conversa. Ele não pretende reescrever decisões formalizadas nem declarar como aprovados preço, arquitetura, tecnologias, conteúdo real da PULPO, prazo de implantação ou serviços futuros.

**IDENTIDADE VIGENTE, APROVADA PELO FUNDADOR:** SEMRESERVAS / Marketing de relacionamento gastronômico / *Um toque. Infinitas possibilidades.*. Esta diretriz substitui o descritor e as assinaturas anteriores em toda a documentação e interfaces. A arte oficial do símbolo/wordmark não deve ser redesenhada.

## Documento Mestre consolidado v4.0

Leia `SEMRESERVAS_DOCUMENTO_MESTRE_CONSOLIDADO_v4_0.md` (versão de leitura em Word no mesmo nível) como a fonte principal atual. O arquivo `referencias_historicas/Documento_Mestre_v2_0_ORIGINAL_HISTORICO.docx` está preservado apenas para rastreabilidade e não prevalece nas decisões alteradas.

## Validação dos protótipos

JS e contratos foram verificados estaticamente. O teste de navegação automatizado em Chromium não pôde ser concluído neste ambiente devido a uma política de bloqueio de navegação; **o pacote não foi certificado por teste end-to-end**. O protótipo compartilha dados apenas entre abas da mesma origem no navegador, via localStorage/BroadcastChannel. Execute e valide os fluxos de atendimento em um navegador local após extrair o ZIP.

## Atualização da marca

O logo gráfico original está em `prototipos/assets/logo-oficial-horizontal.png`. O descritor e slogan oficiais novos foram incluídos textualmente nas interfaces e documentos. Não foi criado um novo arquivo de lockup gráfico com slogan; essa adaptação gráfica ainda exige produção/validação da identidade.

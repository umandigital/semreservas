# Prompt para implementar "Projete na mesa" (RA) em outro site

Copie tudo abaixo da linha e cole no Claude Code do projeto do cliente. Os arquivos citados estão em `umandigital/semreservas`, pasta `kit-ra/` (se o agente não tiver acesso ao repositório, cole os arquivos da pasta na conversa).

---

## Objetivo
Neste site (confeitaria "Clássico — Tortas Autorais"), a seção **"02 / Criações autorais"** tem um carrossel de pratos (Manga, etc.). Quero que o visitante **toque no prato** e, no celular, a câmera abra com o prato projetado **na mesa dele, em tamanho real**. É o mesmo sistema de realidade aumentada que já está validado em produção no projeto SemReservas. **Reaproveite o código do kit; não reescreva a lógica de RA.**

## Antes de codar
1. Descubra a stack do site (HTML estático, React, Next, WordPress…) e onde está o carrossel. Me diga em 5 linhas o que encontrou e o plano. Trabalhe em um branch; não mexa no que não for necessário.
2. Confirme que o site é servido por **HTTPS** (a RA exige).

## Comportamento obrigatório (já validado em campo, não altere)
- Funciona no **Android + Chrome** (WebXR, câmera própria). Em outros navegadores/aparelhos, use o plano B (`plano-b-scene-viewer.ts`): `<model-viewer ar ar-modes="scene-viewer quick-look">` abre o Scene Viewer (Android) ou o Quick Look (iPhone). No iPhone, o `.usdz` precisa existir (gere junto com o `.glb`) ou o model-viewer o converte em tempo de execução; teste em um iPhone real e me avise se não abrir.
- Ao tocar: o prato aparece **no primeiro quadro**, semitransparente, à frente. A pessoa aponta para o lugar na mesa e toca em **Fixar aqui** (ou toca na câmera). Se a mesa for detectada antes (profundidade do ARCore ou detecção de plano), o prato desliza até ela e fixa sozinho. Depois de fixado: tamanho real (escala 1), arrastar o dedo gira, **Mover o prato** reposiciona, **Tamanho** liga/desliga régua + garfo + faca de comparação.
- Opcional por prato: cartaz com ingredientes (`rotulo: { titulo, linhas }`) + botão **Ingredientes**.
- Enquanto a RA está aberta, **nenhum outro WebGL pode estar rodando** (feche/desmonte visualizadores 3D, animações pesadas do carrossel) — a lentidão do primeiro teste veio de duas cenas 3D ao mesmo tempo.
- Nunca redimensionar o modelo: o arquivo `.glb` já está em **metros**.

## Passos
1. Instale `three@0.183.2` (versão fixada) e `@types/three` equivalente, se houver TypeScript. Copie `kit-ra/arWebxr.ts` para o projeto (`lib/`) e o conteúdo de `kit-ra/ra.css` para o CSS do site (ajuste cores e fonte à marca; mantenha `pointer-events`, `z-index` e posições).
2. API do kit (importe só com `import()` dinâmico, para não pesar o carregamento da página):
   - `suportaWebxrAr(): Promise<boolean>`
   - `prepararAr(urlGlb)` — baixa e interpreta o modelo antes do toque. **Chame quando o prato ativo do carrossel ficar visível.**
   - `iniciarAr({ glb, nome, medidas, nota, rotulo?, aoAbrir?, aoFechar? })` — **chame dentro do evento de toque do usuário** (o navegador exige).
   - `aoAbrir`/`aoFechar`: use para pausar/retomar o carrossel e qualquer outro 3D da página.
3. **Modelos 3D**: um `.glb` por prato, origem no **centro da base** (y = 0), unidades em **metros**, tamanho real do prato com a torta (me pergunte as medidas reais; hoje o prato da foto parece ter ~22 cm), sem extensões obrigatórias, até 3 MB e até ~50 mil triângulos. Use `kit-ra/otimizar-ar.mjs` (reduz triângulos preservando o tamanho) e `kit-ra/texturas.mjs` (texturas ≤ 2048 px). Cadastre cada prato com `{ glb, poster, medidas: "Prato de 22 cm", nota }`. Se ainda não houver `.glb`, deixe o prato **sem** a ação de RA (não mostre botão quebrado) e liste quais faltam; os modelos podem ser gerados a partir das fotos (ferramentas de imagem-para-3D) e depois normalizados.
4. **Interface no carrossel**:
   - No prato ativo, o próprio prato e um botão **"Projete na mesa"** (ícone de cubo) disparam `iniciarAr`. Só mostre se `suportaWebxrAr()` for verdadeiro ou se o plano B estiver disponível.
   - Se a RA não estiver disponível (computador, navegador sem suporte), mostre a dica de abrir no celular (texto abaixo) e, se possível, um QR code da própria página.
5. **Textos da página** (use exatamente, ajustando só a pontuação ao padrão do site):
   - Dica fixa abaixo do carrossel, em destaque discreto, com ícone de toque:
     **"Toque no prato para projetá-lo na sua mesa, em tamanho real."**
   - Botão no prato ativo: **"Projete na mesa"**
   - Linha de apoio (menor): **"Disponível no celular. Aponte para a mesa, toque em Fixar aqui e compare com garfo e faca."**
   - No computador/sem suporte: **"Quer ver este prato na sua mesa? Abra esta página no celular."**
   - Nota na tela de RA (campo `nota`): **"Imagem ilustrativa em tamanho real, com o prato. A torta servida pode ter pequenas diferenças."**
   - Medidas (campo `medidas`): **"Prato de XX cm · YY cm de altura"** (preencher por prato).
   - Ingredientes (se usar cartaz): use a descrição de cada prato do site (ex.: Manga → manga madura, mousse aerada, crocante de coco).
6. Acessibilidade e qualidade: botão com `aria-label="Projetar [nome do prato] na mesa"`, foco por teclado, respeitar `prefers-reduced-motion`, nada de autoplay de som. Se `iniciarAr` falhar (rejeição), caia no plano B sem pedir novo toque.
7. Medição: dispare um evento de analytics ao tocar em "Projete na mesa" (nome do prato, aparelho suportado ou não).

## Critérios de aceite (teste e me mostre)
- Android/Chrome: toque no prato → câmera abre rápido; prato aparece transparente já no primeiro instante; **Fixar aqui** fixa **na hora**, sólido, em tamanho real; mexer o celular não move o prato; **Mover o prato** e **Tamanho** funcionam; fechar volta ao carrossel intacto.
- Em mesa lisa, com toalha e colorida: o resultado é o mesmo (a posição vem da profundidade/plano ou do Fixar aqui).
- Navegador sem WebXR (desktop, iPhone): nada quebra; aparece o plano B ou a dica de abrir no celular.
- Página não fica mais lenta: o código da RA (three.js) só é baixado ao ativar/pré-carregar, e o carrossel não roda WebGL durante a RA.
- Rode o build e os testes do projeto; me liste arquivos alterados e o que **não consegui testar** (câmera real e iPhone precisam do meu teste).

## Não faça
- Não altere as constantes e a lógica de posicionamento de `arWebxr.ts` sem me avisar (foram calibradas com testes reais).
- Não remova o plano B nem o `rotulo`/régua por achar desnecessário.
- Não suba nada para produção sem eu testar no celular.

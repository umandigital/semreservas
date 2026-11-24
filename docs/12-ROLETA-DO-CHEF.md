# Roleta do Chef (especificação, versão 4, 22/11/2026)

Jogo de coleção de **5 metas**. Em cada giro a roleta sorteia a **ordem** das etapas, mas o resultado final é **certo**: **no 5º giro o cliente ganha obrigatoriamente**. Tudo no **GastroPub é demonstração** (nenhum prêmio vale). O dono configura tudo.

## 1. A ideia
1. O cliente monta um **prato em 5 etapas** (itens de cozinha: Panela, Faca, Fogão, Forno, Prato; o dono pode trocar o tema, ver seção 3).
2. A cada **visita com pedido de pelo menos R$ 80** (valor ajustável pelo dono), o cliente ganha **1 giro** na **roleta**. O giro é liberado **quando ele envia o pedido ao garçom** (botão "Chamar garçom" da tela Meu pedido). Ela para em uma das etapas.
3. **Cada giro entrega uma etapa nova** (a roleta sorteia qual, só para dar emoção; nunca repete). Os 5 giros são as **5 metas**.
4. **No 5º giro o cliente ganha o prêmio obrigatoriamente**, desde que faça os 5 giros dentro da janela de **60 dias**. Se a janela passar, as etapas zeram e começa nova rodada.
5. **Sem sorte:** como o prêmio é certo, a regra é de **fidelidade** ("faça 5 pedidos de R$ 80 e ganhe"), não de sorteio. Isso simplifica o app e tende a simplificar a parte legal (ver seção 2).
6. Ao completar, o prêmio vem em comprovante, igual ao do Clube. Para o teste, o prêmio é uma **pizza**.

## 2. Parte legal (resumo)
**No GastroPub nada vale:** tudo roda como **demonstração**, com a etiqueta "Demonstração: sem prêmio real". **Prêmio real** (cliente de verdade): como o prêmio é certo e vem de compra, a lei de promoções comerciais (Lei 5.768/71) ainda pode tratar como **"vale-brinde"**; **confirmar com advogado antes de ligar**. O modo com certificado de autorização continua previsto no módulo.

**Texto abaixo (da versão com sorte, mantido como referência):**
Prêmio que depende de sorte precisa de **autorização do governo** (Lei 5.768/71), uma por promoção. Por isso o sistema tem **dois modos**:
- **Modo demonstração (para o teste no GastroPub):** a roleta funciona **inteira**, com giros, chances, animações e comemoração, mas **o prêmio não é real**: aparece a tela de "Você ganhou: Pizza à escolha" com a etiqueta **"Demonstração: sem prêmio real"**. Assim testamos tudo **sem risco** legal.
- **Modo com prêmio real:** só liga quando o restaurante cadastrar o **número do certificado de autorização**, a validade e o regulamento. Sem isso, o servidor recusa os giros.
Outras travas: **só maiores de 18 anos e logados**, **sem aposta** (nunca se paga nem se gastam pontos para girar; o giro é um direito de quem faz o pedido mínimo, ou seja, uma promoção do tipo "compre e participe", que é exatamente o que a lei regula), **chances divulgadas**, sorteio **no servidor** com **registro de cada giro**. Visual de **comemoração**, não de cassino. Revisão jurídica antes de qualquer prêmio real. Não sou advogado.
Existe também o **Modo Coleção (sem sorte)**: o próximo ingrediente é sempre o da receita, sem autorização. Fica disponível no mesmo módulo.

## 3. Tema da roleta: genérico ou personalizável?
**Complexidade baixa.** A roleta funciona com uma **lista de 5 etapas**, cada uma com **nome e ícone**. Isso é **dado**, não código. Então a personalização é fácil de suportar:
- O **motor** (sorteio, janela, garantia, prêmio) é o mesmo para todos.
- O **tema** é um **conjunto de etapas**, escolhido pelo dono em uma lista de **modelos**: *Cozinha (genérico)*, *Pizzaria* (Massa, Molho, Queijo, Forno, Borda), *Risoteria* (Arroz, Caldo, Panela, Queijo, Prato), *Pub* (Chope, Caneca, Petisco, Barril, Prato), *Hamburgueria* etc.
- O **custo real** está na **arte**: cada modelo precisa de uns **5 a 8 ícones ilustrados** no estilo do app (o ChatGPT gera, como fizemos com os pratos).
**Plano:** a **versão 1 sai com o tema genérico de cozinha**, mas o sistema já nasce com a estrutura de temas. Os modelos de Pizzaria, Risoteria e Pub entram **conforme houver arte**, sem mexer no motor. Depois, o dono poderá **enviar os próprios ícones**.

## 4. Como funciona para o cliente
- **Quando libera o giro (a regra do consumo):** o cliente **monta o pedido** e toca em **"Chamar garçom"** na tela Meu pedido. Se o **subtotal estimado** desse pedido (ou a **soma dos pedidos enviados na mesma visita**) chegar a **R$ 80** (parâmetro; "a definir"), o app mostra na hora: "**Seu pedido chegou a R$ 80! Você ganhou 1 giro da Roleta do Chef.**" com o botão "Girar agora". Também exige **login, sessão verificada por localização, dia e horário de funcionamento**, e vale **1 giro por visita**.
- **Como o valor é validado (decisão de 24/11/2026):** um **único toque em "Chamar garçom"** (na tela Meu pedido) cria o chamado **com os itens**. O **servidor calcula o subtotal** pelos preços do cardápio do restaurante (migração 0009): o cliente não informa valor. A **equipe vê os itens** no chamado e confere com o que o cliente mostra. O giro só é liberado se o chamado existe, é recente e não foi cancelado, a pessoa é do Clube, adulta e fez a visita do dia, e o subtotal calculado chega ao mínimo.
- **Limite honesto:** o sistema **não vê o caixa**, então não prova que a conta foi paga. Quem monta um pedido grande e depois não consome é percebido pela equipe (que vê os itens) e pelo portal (pedidos grandes cancelados). Um giro por visita.
- **O giro:** botão grande "Girar"; a roleta gira 2 segundos e para. "Você ganhou: **Forno**!" Cada giro dá uma etapa nova; nunca repete.
- **Prato:** as 5 etapas em linha, em cor as que tem e em silhueta as que faltam; "Você tem 3 de 5".
- **Janela de 60 dias:** a contagem mostra "Faltam 41 dias". Passou sem completar, **as etapas zeram** e começa uma nova rodada.
- **Prêmio:** aparece em "Meus prêmios" (Clube), com a **validade sempre à vista** na comemoração ("Troque até 22/12"). Quem não troca no dia recebe, no próximo login, a tela de aviso "Você tem um prêmio para trocar" (regra geral em `docs/10`, seção 13b). A troca gera o comprovante, igual ao do Clube.

## 5. Dificuldade e custo (60 dias, 1 giro por visita)
Não há chance envolvida: ganha quem **volta 5 vezes com pedido de R$ 80 em 60 dias**. Quem vem 1 vez por semana (8 a 9 visitas) ganha com folga; quem vem 1 vez a cada 2 semanas (4 visitas) não completa. **Parâmetros do dono:** número de metas (4 a 8; padrão 5), **valor mínimo do pedido** (R$ 80), **janela** (60 dias), **intervalo mínimo entre giros** (1 dia), **máximo de prêmios por pessoa por janela** (1). O portal mostra o **custo do prêmio sobre o consumo exigido**.

## 6. Reta final com som e animação
A partir da **4ª meta**, o app avisa com destaque ao abrir e após cada visita:
- **Animação** do cartão pulsando, faísca e confete leve, e o texto: "**Falta só 1!** Seu próximo giro garante a Pizza."
- **Som curto** e **vibração** (se o aparelho permitir). No **5º giro**, comemoração maior: som, confete e o prêmio aparecendo.
**Cuidados:** o navegador **só toca som depois de um toque**, então o som sai ao abrir a roleta ou tocar em "Girar"; **botão de som** sempre visível; **respeita "reduzir movimento"**; **nada de piscar rápido** (máx. 3 por segundo); a mensagem é sempre **escrita**, não só sonora. O aviso é **honesto**: o 5º giro de fato entrega o prêmio.

## 7. O prêmio e o custo
O **dono escolhe o prêmio** em seu catálogo (produto, brinde ou pontos). Orientação do sistema ao dono: "Escolha algo **bom**, porque poucos clientes vão ganhar". **Prêmio de teste: Pizza à escolha** (valor R$ 65, custo ~R$ 20).
**Custo:** como cada giro exige **um pedido de pelo menos R$ 80**, o prêmio sai de um cliente que **já gastou** pelo menos R$ 80 por visita. Uma pessoa que vem 9 vezes e completa gerou ao menos **R$ 720** em pedidos; a pizza (custo ~R$ 20) pesa **~2,8%** disso. 
**Custo por prêmio entregue:** R$ 20 (pizza) sobre pelo menos R$ 400 de consumo exigido (5 × R$ 80), ou seja, **~5%**. Não acumula com a troca de pontos no mesmo dia.

## 8. Telas (simples, para leigos e pouca visão)
| Tela | Conteúdo |
|---|---|
| **R0 Giro liberado** (aparece na tela Meu pedido, logo depois de "Chamar garçom") | Faixa verde "Seu pedido chegou a R$ 80!", "Você ganhou 1 giro da Roleta do Chef.", botão grande "Girar agora" e link "Girar depois" (vale até o fim da visita) |
| **R1 Roleta do Chef** | Título, as 5 etapas (coletadas e faltantes), "Você tem 3 de 5", "Faltam 41 dias", **um botão grande**: "Girar" (se há giro), ou "Faça um pedido de R$ 80 para ganhar um giro", o prêmio ("Pizza à escolha") e o botão de som |
| **R2 O giro** | Tela cheia com a roleta, ícones de cozinha, parada em um item |
| **R3 Resultado** | "Você ganhou: Forno!", "Você tem 2 de 5", "Faltam 3 giros" |
| **R4 Reta final** | "Falta só 1! Seu próximo giro garante a Pizza.", com animação e som |
| **R5 Prêmio** | Comemoração, prêmio, botão "Trocar agora" que abre o comprovante (e, em demonstração, a etiqueta "Demonstração: sem prêmio real") |
| **R6 Como funciona e regras** | 3 passos, as 5 metas, o 5º giro garantido, "Um giro por visita com pedido de R$ 80, só para maiores de 18 anos", certificado de autorização (ou "Modo demonstração") e regulamento |
| **R7 Indisponível** | "A Roleta do Chef não está disponível agora" |
Entrada pela Home: botão **"Roleta do Chef"** (ícone de chapéu de chef).

## 9. Antifraude e métricas
Mesmo caminho do check-in, mais a regra do pedido mínimo; giro **gravado no servidor**; uma participação por pessoa por janela; auditoria de todos os giros. Métricas do dono: participantes, giros por dia, **chance esperada × observada**, **prêmios entregues**, **custo esperado × real**, etapas mais sorteadas (para detectar viés), tempo até completar, quem parou na reta final e retorno de quem participa × quem não participa (com amostra mínima).

## 10. Quando construir
Depois do Clube e dos portais. Módulo `roleta_chef`, **desligado por padrão**. Começa com o **tema genérico de cozinha** e o **modo demonstração**.

## 11. Decisões
Fechadas pelo fundador em 22/11/2026: tudo é demonstração no GastroPub; 5 metas; o 5º giro ganha obrigatoriamente; pedido mínimo R$ 80 (a definir); prêmio de teste: pizza; janela 60 dias; nome ROLETA DO CHEF; 1 giro por visita.
**Ainda em aberto (padrões assumidos):** cancelar o chamado antes de girar perde o giro; tema genérico de cozinha na v1; revisão jurídica antes de prêmio real.

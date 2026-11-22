# Roleta do Chef (especificação, versão 2, 22/11/2026)

Jogo de coleção com **possibilidade de ganhar ou não**. Valores de teste; o dono configura tudo.

## 1. A ideia
1. O cliente monta um **prato em 5 etapas** (itens de cozinha: Panela, Faca, Fogão, Forno, Prato; o dono pode trocar o tema, ver seção 3).
2. A cada **visita**, **1 giro grátis** na **roleta**. Ela para em uma das etapas.
3. Etapa **nova** entra no prato. Etapa **repetida** não rende nada naquele giro.
4. **Só ganha o prêmio quem completar as 5 etapas** dentro da janela de **60 dias**. Pode não completar.
5. **Ajuda do sistema ("garantia"):** quando o cliente chega a **4 de 5**, o **próximo giro entrega obrigatoriamente a etapa que falta**. Configurável (seção 5).
6. Ao completar, o prêmio vem em comprovante, igual ao do Clube. Para o teste, o prêmio é uma **pizza**.

## 2. Parte legal (resumo; explicação do item 1 que você não entendeu)
Prêmio que depende de sorte precisa de **autorização do governo** (Lei 5.768/71), uma por promoção. Por isso o sistema tem **dois modos**:
- **Modo demonstração (para o teste no GastroPub):** a roleta funciona **inteira**, com giros, chances, animações e comemoração, mas **o prêmio não é real**: aparece a tela de "Você ganhou: Pizza à escolha" com a etiqueta **"Demonstração: sem prêmio real"**. Assim testamos tudo **sem risco** legal.
- **Modo com prêmio real:** só liga quando o restaurante cadastrar o **número do certificado de autorização**, a validade e o regulamento. Sem isso, o servidor recusa os giros.
Outras travas: **só maiores de 18 anos e logados**, **giro grátis** (nunca aposta nem gasto de pontos), **chances divulgadas**, sorteio **no servidor** com **registro de cada giro**. Visual de **comemoração**, não de cassino. Revisão jurídica antes de qualquer prêmio real. Não sou advogado.
Existe também o **Modo Coleção (sem sorte)**: o próximo ingrediente é sempre o da receita, sem autorização. Fica disponível no mesmo módulo.

## 3. Tema da roleta: genérico ou personalizável?
**Complexidade baixa.** A roleta funciona com uma **lista de 5 etapas**, cada uma com **nome e ícone**. Isso é **dado**, não código. Então a personalização é fácil de suportar:
- O **motor** (sorteio, janela, garantia, prêmio) é o mesmo para todos.
- O **tema** é um **conjunto de etapas**, escolhido pelo dono em uma lista de **modelos**: *Cozinha (genérico)*, *Pizzaria* (Massa, Molho, Queijo, Forno, Borda), *Risoteria* (Arroz, Caldo, Panela, Queijo, Prato), *Pub* (Chope, Caneca, Petisco, Barril, Prato), *Hamburgueria* etc.
- O **custo real** está na **arte**: cada modelo precisa de uns **5 a 8 ícones ilustrados** no estilo do app (o ChatGPT gera, como fizemos com os pratos).
**Plano:** a **versão 1 sai com o tema genérico de cozinha**, mas o sistema já nasce com a estrutura de temas. Os modelos de Pizzaria, Risoteria e Pub entram **conforme houver arte**, sem mexer no motor. Depois, o dono poderá **enviar os próprios ícones**.

## 4. Como funciona para o cliente
- **Quando libera o giro:** visita registrada (login, placa da mesa, **sessão verificada por localização**, dias e horário de funcionamento), respeitando o **intervalo mínimo** ("Próximo giro em 2 dias").
- **O giro:** botão grande "Girar"; a roleta gira 2 segundos e para. "Você ganhou: **Forno**!" ou "**Fogão** de novo. Esta você já tinha."
- **Prato:** as 5 etapas em linha, em cor as que tem e em silhueta as que faltam; "Você tem 3 de 5".
- **Janela de 60 dias:** a contagem mostra "Faltam 41 dias". Passou sem completar, **as etapas zeram** e começa uma nova rodada.
- **Prêmio:** comprovante imediato e final, igual ao do Clube.

## 5. Chances e dificuldade (60 dias, 1 giro por visita)
Cada giro sorteia uma das etapas com a **mesma chance**. Um cliente que vem **1 vez por semana** faz **8 a 9 giros em 60 dias**; um que vem **2 vezes por semana**, uns **17**. **Chance de completar** conforme a configuração:
| Configuração | 5 giros | 8 giros | 9 giros | 10 giros | 12 giros | 15 giros | 20 giros |
|---|---:|---:|---:|---:|---:|---:|---:|
| 5 etapas, **sem garantia** | 4% | 32% | 43% | 52% | 68% | 83% | 94% |
| **5 etapas, garantia no 4º (o que você pediu)** | 19% | **75%** | **85%** | 90% | 96% | 99% | 100% |
| 6 etapas, garantia no 5º | 0% | 41% | 56% | 69% | 85% | 95% | 99% |
| 7 etapas, garantia no 6º | 0% | 13% | 26% | 39% | 62% | 84% | 97% |
**O que isso mostra:** com **5 etapas e garantia no 4º**, quem vem 1 vez por semana já completa em **85% dos casos**, e quem passa de 12 visitas **quase sempre** ganha. Fica **parecido com um sistema de pontos** (justamente o que você não quer). Para manter a incerteza com garantia, **6 etapas com garantia no 5º** dão ~56% para quem vem toda semana; **7 etapas**, ~26%.
**Parâmetros do dono:** número de etapas (4 a 8), **garantia a partir de N etapas** (desligável), **janela em dias** (padrão **60**), **intervalo mínimo entre giros** (padrão 1 dia), **máximo de prêmios por pessoa por janela** (padrão 1). O portal mostra a **chance real** e o **custo esperado** de cada combinação antes de salvar.
**Padrão de teste sugerido:** **6 etapas, garantia a partir de 5, 60 dias**. Se preferir exatamente o seu pedido (5 etapas, garantia no 4º), é só ajustar; você vê que quase todo cliente frequente ganha.

## 6. Garantia: a reta final com som e animação
Quando o cliente chega à etapa da garantia (por exemplo, **4 de 5**), o app avisa com destaque, ao abrir e depois de cada visita:
- **Animação** do cartão da roleta pulsando, faísca e confete leve, e o texto grande: "**Falta só 1!** Seu próximo giro garante a Pizza."
- **Som curto de alerta** e **vibração** (se o aparelho permitir).
- No **giro final**, comemoração maior: som, confete, a roleta parando na etapa que falta e o prêmio aparecendo.
**Cuidados:** o navegador **só toca som depois de um toque do usuário**, então o som aparece ao abrir a roleta ou ao tocar em "Girar"; há **botão de som** sempre visível; **respeita "reduzir movimento"**; **nada de piscar rápido** (no máximo 3 por segundo, por segurança de saúde); a mensagem é sempre **visual e escrita**, não só sonora. O alerta de "falta só 1" é **honesto** (o próximo giro de fato garante o prêmio).

## 7. O prêmio e o custo
O **dono escolhe o prêmio** em seu catálogo (produto, brinde ou pontos). Orientação do sistema ao dono: "Escolha algo **bom**, porque poucos clientes vão ganhar". **Prêmio de teste: Pizza à escolha** (valor R$ 65, custo ~R$ 20).
**Custo esperado por cliente que participa** = chance de completar × custo do prêmio. Exemplos (pizza, custo R$ 20, cliente que vem 1 vez por semana, 9 giros): 5 etapas com garantia no 4º: 85% × R$ 20 = **R$ 17**; 6 etapas com garantia no 5º: 56% × R$ 20 = **R$ 11**; 7 etapas com garantia no 6º: 26% × R$ 20 = **R$ 5**. O portal calcula e **avisa** se passar do limite definido pelo dono. Não acumula com a troca de pontos no mesmo dia.

## 8. Telas (simples, para leigos e pouca visão)
| Tela | Conteúdo |
|---|---|
| **R1 Roleta do Chef** | Título, as 5 etapas (coletadas e faltantes), "Você tem 3 de 5", "Faltam 41 dias", **um botão grande** "Girar" ou "Próximo giro em 2 dias", o prêmio ("Pizza à escolha") e o botão de som |
| **R2 O giro** | Tela cheia com a roleta, ícones de cozinha, parada em um item |
| **R3 Resultado** | "Você ganhou: Forno!" (novo) ou "Fogão de novo. Tente na próxima visita." (repetido) |
| **R4 Reta final** | "Falta só 1! Seu próximo giro garante a Pizza.", com animação e som |
| **R5 Prêmio** | Comemoração, prêmio, botão "Trocar agora" que abre o comprovante (e, em demonstração, a etiqueta "Demonstração: sem prêmio real") |
| **R6 Como funciona e regras** | 3 passos, as chances, a garantia, "Giro grátis, um por visita, só para maiores de 18 anos", certificado de autorização (ou "Modo demonstração") e regulamento |
| **R7 Indisponível** | "A Roleta do Chef não está disponível agora" |
Entrada pela Home: botão **"Roleta do Chef"** (ícone de chapéu de chef).

## 9. Antifraude e métricas
Mesmo caminho do check-in; giro **gravado no servidor**; uma participação por pessoa por janela; auditoria de todos os giros. Métricas do dono: participantes, giros por dia, **chance esperada × observada**, **prêmios entregues**, **custo esperado × real**, etapas mais sorteadas (para detectar viés), tempo até completar, quem parou na reta final e retorno de quem participa × quem não participa (com amostra mínima).

## 10. Quando construir
Depois do Clube e dos portais. Módulo `roleta_chef`, **desligado por padrão**. Começa com o **tema genérico de cozinha** e o **modo demonstração**.

## 11. Decisões que preciso de você
1. Entendeu a **demonstração** agora (roleta inteira no teste, mas prêmio sem valor real)? Mantemos assim para o GastroPub?
2. **Configuração de teste:** o seu pedido (5 etapas, garantia no 4º, quase todo frequente ganha) ou a que mantém a incerteza (**6 etapas, garantia no 5º**, ~56% para quem vem toda semana)?
3. **Tema:** genérico de cozinha na versão 1, com Pizzaria, Risoteria e Pub depois?
4. A **garantia deve valer** em qualquer configuração por padrão, ou só se o dono ligar?

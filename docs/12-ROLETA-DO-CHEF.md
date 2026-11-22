# Roleta do Chef (especificação, 22/11/2026)

Jogo de coleção com **possibilidade de ganhar ou não**. Valores de teste; o dono configura tudo. **Leia a seção 2 antes: este jogo tem sorte, e sorte exige autorização.**

## 1. A ideia
1. O cliente monta um **prato em 5 etapas** (ingrediente, tempero, fogão, forno, empratamento; o dono escolhe as 5, por exemplo "Massa, Molho, Fogão, Forno, Prato").
2. A cada **visita** ele faz **1 giro grátis** na **roleta**. A roleta para em uma das etapas.
3. Se for uma etapa que **ainda não tem**, ela entra no prato. Se for **repetida**, não ganha nada naquele giro.
4. **Só ganha o prêmio quem completar as 5 etapas** dentro da janela (padrão: o mês). **Pode não completar**, e tudo bem: é o que a diferencia de um sistema de pontos.
5. Ao completar, recebe o prêmio em comprovante, igual ao do Clube.

## 2. A questão legal (importante)
Distribuir prêmios **por sorte** é uma **promoção regulada** no Brasil (Lei 5.768/71): exige **autorização prévia do governo** (Secretaria de Prêmios e Apostas, Ministério da Fazenda), por promoção, com regulamento e certificado. Sem a autorização há multa e outras sanções, para o restaurante e potencialmente para a plataforma. Um jogo grátis não escapa disso se o prêmio depende da sorte. Há ainda questões tributárias sobre prêmios e a proteção de menores. **Não sou advogado**; antes de qualquer restaurante usar com prêmio real, é preciso **revisão jurídica**.
**Como o sistema se protege (já no desenho):**
1. **Dois modos** no mesmo módulo `roleta_chef`:
   - **Modo Coleção (sem sorte):** cada giro dá o próximo ingrediente. É a Receita do Chef: **não precisa de autorização**.
   - **Modo Roleta (com sorte):** o resultado é aleatório, como você pediu. **Só pode ser ligado** se o restaurante cadastrar o **número do certificado de autorização, a validade e o regulamento**; sem isso o interruptor não liga e o servidor recusa giros.
2. **Modo demonstração:** para o teste no GastroPub (restaurante fictício) a roleta pode rodar **sem prêmio real** (o prêmio é só "pontos de demonstração" ou uma tela de comemoração). Assim testamos tudo sem risco.
3. **Só maiores de 18 anos, logados** (já pedimos a data de aniversário no cadastro; quem não tem, não gira).
4. **Giro grátis, sem aposta:** nunca se paga nem se gasta ponto para girar.
5. **Chances divulgadas** na tela "Como funciona", com o número do certificado, o prazo e o regulamento.
6. **Sorteio honesto:** gerado **no servidor**, com **registro de cada giro** (quem, quando, resultado) para auditoria. O app não decide nada.
7. Nada de **"tigrinho"**: sem luzes de cassino, sem som de moedas, sem "quase ganhou", sem incentivo a girar mais.

## 3. Como funciona (cliente)
- **Quando libera o giro:** visita registrada (login, placa da mesa, **sessão verificada por localização**, dias e horário de funcionamento). Respeita o **intervalo mínimo** desde o último giro ("Próximo giro em 2 dias").
- **O giro:** botão grande **"Girar"**; a roleta gira por 2 segundos e para; aparece "Você ganhou: **Forno**!" (novo, entra no prato) ou "**Fogão** de novo. Esta você já tinha. Tente na próxima visita." (repetido).
- **Prato do mês:** as 5 etapas em linha; as que o cliente tem em cor, as que faltam em silhueta, com "Você tem 3 de 5".
- **Completou:** tela de comemoração, prêmio e **comprovante** (troca imediata e final).
- **Fim da janela:** a roleta recomeça com novo prato; quem não completou **perde as etapas** (zera). Isso mantém a sorte e o custo.

## 4. As chances (e como o dono ajusta a dificuldade)
Cada giro sorteia **uma das 5 etapas com a mesma chance**. Probabilidade de **completar as 5** em *n* giros (n = visitas no mês):
| Giros no mês | 5 | 6 | 8 | 10 | 12 | 15 | 20 |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Chance de completar** | 3,8% | 11,5% | 32,3% | 52,3% | 67,8% | 82,9% | 94,3% |
**Leitura:** quem vem 1 vez por semana (4 giros) **praticamente não completa**; quem vem 8 vezes tem 1 chance em 3; quem vem 15 vezes completa em 83% dos casos. "Em 5 visitas" só acontece com **3,8% de chance** (1 em 26): é a "sorte" que você descreveu, e o prêmio ser bom é coerente com isso.
**Dificuldade ajustável (parâmetros do dono):**
| Parâmetro | Padrão de teste | Faixa | Efeito |
|---|---|---|---|
| Número de etapas | **5** | 4 a 8 | mais etapas, menos chance |
| Intervalo mínimo entre giros | **1 dia** | 1 a 7 | limita giros por mês |
| Janela | **30 dias** | 14 a 45 | mais janela, mais chance |
| Chance de uma etapa nova ser favorecida | desligado | 0 a 30% | "ajuda" a quem está quase lá (ajuste de dificuldade, divulgado no regulamento) |
| Máximo de prêmios por pessoa por mês | **1** | 1 a 2 | trava de custo |
O portal mostra a **chance real de completar** para cada configuração e o **custo esperado**.

## 5. O prêmio e o custo
**Custo esperado por cliente que participa** = chance de completar × custo do prêmio. Exemplo com pizza (custo ~R$ 20, valor R$ 65), 5 etapas e o cliente indo 8 vezes no mês: 32,3% × R$ 20 = **R$ 6,50 por cliente**; indo 4 vezes, 0,3% × R$ 20 ≈ R$ 0,07. O custo é **baixo e previsível** e o prêmio pode ser **generoso**.
| Prêmio | Valor ao cliente | Custo real (ex.) |
|---|---|---|
| Pizza à escolha | R$ 65 | ~R$ 20 |
| Jantar para dois (teto) | R$ 150 | ~R$ 45 |
| Combo da casa | R$ 80 | ~R$ 26 |
O prêmio vem do **catálogo do restaurante** (produto, brinde ou pontos). Prêmios de produto custam ~30% do preço. Avisar o cliente de que o prêmio **não se acumula** com a troca de pontos no mesmo dia.

## 6. Telas (simples, para leigos e pouca visão)
| Tela | Conteúdo |
|---|---|
| **R1 Roleta do Chef** | Título, prato do mês com as 5 etapas (coletadas e faltantes), "Você tem 3 de 5", **um botão grande** "Girar" ou "Próximo giro em 2 dias", e o prêmio ("Prêmio: Pizza à escolha"). Botão "Como funciona" |
| **R2 O giro** | Tela cheia com a roleta (ícones de comida), parada em um item |
| **R3 Resultado** | "Você ganhou: Forno!" (novo) ou "Fogão de novo. Tente na próxima visita." (repetido), com "Ver meu prato" |
| **R4 Prato completo** | Comemoração, prêmio e botão "Trocar agora", que abre o comprovante |
| **R5 Como funciona e regras** | 3 passos, as chances, "Giro grátis, um por visita, só para maiores de 18 anos", certificado de autorização (ou "Modo demonstração: sem prêmio real") e regulamento |
| **R6 Indisponível** | "A Roleta do Chef não está disponível agora" (sem autorização cadastrada ou fora da janela) |
Entrada pela Home: botão **"Roleta do Chef"** (ícone de chapéu de chef).

## 7. Antifraude
Mesmo caminho do check-in: login, placa, sessão verificada, horário e dias, 1 giro por visita. Giro **gravado no servidor**; **uma participação por pessoa por mês**; contas duplicadas barradas; **trilha de auditoria** de todos os giros; equipe não participa.

## 8. Métricas do dono
Participantes, giros por dia, **chance real de completar** (esperada e observada), prêmios entregues, **custo esperado × custo real**, etapas mais sorteadas (para detectar viés), tempo até completar, e retorno em 7 e 30 dias de quem participa × quem não participa (com amostra mínima).

## 9. Quando construir
Depois do Clube e dos portais. Módulo `roleta_chef`, **desligado por padrão**: o **Modo Coleção** pode ligar quando quiser; o **Modo Roleta** só com certificado cadastrado (ou em **demonstração**). Reaproveita a visita verificada, o comprovante e o catálogo.

## 10. Decisões que preciso de você
1. **Modo demonstração** para o teste no GastroPub (sem prêmio real) e **Modo Roleta com prêmio real** só quando houver autorização: serve?
2. **As 5 etapas:** quer o tema "cozinha" (Ingrediente, Tempero, Fogão, Forno, Prato) ou ingredientes de um prato específico (por exemplo, pizza: Massa, Molho, Queijo, Forno, Borda)?
3. **Intervalo entre giros:** 1 por visita (1 dia) como definiu. Mantenho?
4. **Quem não completar no mês perde as etapas** (zera). Concorda?
5. **Prêmio de teste:** pizza à escolha?
6. **Ajuda ao jogador:** ligar, por padrão, uma pequena chance extra de etapa nova para quem está com 4 de 5 (evita frustração)? Fica descrito no regulamento.

# Receita do Chef: coleção de ingredientes que vira prêmio (proposta, 22/11/2026)

Substitui a ideia do "Slot do Chef". **Sem sorteio**: o resultado de cada giro é conhecido e anunciado. Valores de teste; o dono configura tudo.

## 1. A ideia em 5 linhas
1. Todo mês existe um **prato do mês** (a "receita"), com **5 ingredientes** (ajustável de 5 a 8).
2. A cada **visita** ao restaurante, o cliente logado pode fazer **1 giro** na máquina (animação de caça-níquel com ícones de comida).
3. O giro revela **o próximo ingrediente da receita**; o cliente vê a receita completa desde o começo e sabe qual vem depois.
4. Quando junta **todos os ingredientes dentro do mês**, ganha o **prêmio da receita** (comprovante para mostrar ao garçom, igual ao do Clube).
5. Não vale o prêmio quem não completar no mês; a receita recomeça no mês seguinte.

## 2. O que NÃO entrou, e por quê
Você sugeriu que o giro pudesse **cair em ingrediente repetido** (e não ganhar nada), de modo que "com sorte" se completa em 5 visitas. **Isso é sorte de verdade**: o prêmio passaria a depender de um sorteio. No Brasil, distribuir prêmios por sorte exige **autorização prévia do governo** (Lei 5.768/71), uma por promoção; sem ela, multa e risco para o restaurante e para nós. Também contraria a regra do pacote original ("benefício objetivo, sem sorteio").
**O que mantive:** o visual e a emoção do giro, a **coleção** como figurinhas, **um giro por visita** e a **dificuldade ajustável**. A "dificuldade" vem de **regras claras**, não de sorte (seção 4).
Se você ainda quiser a versão com sorte, o caminho é **consultar um advogado e pedir autorização** antes; eu não incluiria no MVP.

## 3. Como funciona (cliente)
- **Quando libera o giro:** quando a visita é registrada (mesmas regras do check-in: logado, na placa, **sessão verificada por localização**, dentro do horário e dos dias de funcionamento). Se ainda não passou o intervalo mínimo desde o último giro, o app mostra "Próximo giro em 2 dias".
- **O giro:** botão grande **"Girar"**. Três rolos giram por 2 segundos com ícones de comida e **param no ingrediente da vez**, com som opcional (desligado por padrão). Aparece "Você ganhou: **Tomate**!" e o ingrediente entra na receita.
- **Resultado conhecido:** na tela da receita, os ingredientes aparecem **na ordem**, com os já coletados coloridos e os que faltam em silhueta, com o nome ("Próximo: Queijo"). A regra escrita: "Cada giro entrega o próximo ingrediente da receita. Sem sorteio."
- **Completou:** tela de comemoração com a receita pronta, o prêmio e o comprovante (código, mesa, horário). A troca é **imediata e final**, como no Clube.
- **Fim do mês sem completar:** a receita encerra; o app mostra "Esta receita acabou. A próxima começa dia 1º" e a nova receita já aparece.
- **Um giro por visita** (e por dia). Quem vem todos os dias completa mais rápido; é intencional, o prêmio é limitado por regra.

## 4. Dificuldade ajustável (parâmetros do dono, sem sorte)
| Parâmetro | Padrão de teste | Faixa | Efeito |
|---|---|---|---|
| Ingredientes da receita | **5** | 5 a 8 | quantas visitas para completar |
| Intervalo mínimo entre giros | **3 dias** | 1 a 7 dias | quem vem todo dia não completa em 5 dias |
| Janela da receita | **30 dias** (mês) | 14 a 45 | exige constância |
| Ingredientes só em dias ou horários definidos | desligado | opcional | ex.: terça e quarta (dias fracos) |
| Prêmio | ver seção 5 | catálogo | o "quanto vale" |
| Máximo de prêmios por pessoa por mês | **1** | 1 a 2 | trava de custo |
O dono também escolhe **os ingredientes e o prato do mês** (nome, foto, ingredientes com ícone). Há modelos prontos.

## 5. Prêmio e custo (o prêmio precisa ser bom, mas controlado)
Cada prêmio é um item do catálogo do restaurante (produto, brinde ou **pontos do Clube**). Com **5 ingredientes e intervalo de 3 dias**, o cliente leva **no mínimo 12 dias e 5 visitas**.
| Prêmio da receita | Valor ao cliente | Custo real (exemplo) | Peso sobre ~5 visitas de R$ 60 |
|---|---|---|---|
| Sobremesa + bebida | R$ 25 | ~R$ 8 | ~2,7% |
| **Pizza à escolha** | R$ 65 | ~R$ 20 | **~6,7%** |
| Pizza + bebida | R$ 80 | ~R$ 26 | ~8,7% |
| Desconto de 30% (teto R$ 40, conta mínima R$ 100) | até R$ 40 | até R$ 40 | ~13% |
**Atenção à comparação com o Clube:** a pizza no Clube exige uns 15 visitas (custo ~R$ 1,40 por visita). Na Receita com 5 ingredientes sai em 5 visitas (~R$ 4 por visita). **A Receita é bem mais generosa**, então:
- recomendo **prêmios de produto** (custo ~30% do preço), não desconto;
- para um prêmio grande como a pizza, usar **6 a 8 ingredientes**; com **5**, preferir **sobremesa + bebida**;
- **não acumular no mesmo dia** com troca de pontos (1 prêmio por visita, somando Clube e Receita).
O portal mostra **custo médio por receita completada** e avisa quando passa de um limite que o dono define.

## 6. Telas (todas simples, pensando em leigos e pouca visão)
Mesma regra de acessibilidade do app: texto grande, uma ação principal, poucos blocos.
| Tela | Conteúdo |
|---|---|
| **R1 Receita do Chef** | Título "Receita do Chef", nome do prato do mês, foto, os 5 ingredientes em linha (coletados coloridos, os demais em silhueta), frase "Você tem 3 de 5 ingredientes" e **um botão grande**: "Girar" (se liberado) ou "Próximo giro em 2 dias". Botão em contorno "Como funciona". Mostra o prêmio ("Prêmio: Pizza à escolha") |
| **R2 O giro** | Tela cheia, três rolos com ícones de comida, animação, e depois "Você ganhou: Queijo!" com botão "Ver minha receita" |
| **R3 Receita completa** | Comemoração com confete, prato pronto, "Você completou a Receita do Chef!", prêmio e botão "Trocar agora"; abre o comprovante (igual ao do Clube) |
| **R4 Como funciona** | 3 passos: "1. Venha ao restaurante", "2. Gire e ganhe um ingrediente", "3. Complete a receita e ganhe o prêmio". Regras: "Um giro por visita. Cada giro dá o próximo ingrediente. Sem sorteio." |
| **Home** | Botão **"Receita do Chef"** (ícone de chapéu de chef) na grade |
Não usa a barra inferior para isso (a aba continua "Clube"); a receita é aberta pela Home e por um cartão no topo da tela do Clube.

## 7. Antifraude e regras
- Mesmo caminho do check-in: **login, placa da mesa, sessão verificada por localização, horário de funcionamento, 1 por dia**.
- **Resultado no servidor:** o ingrediente é gravado no servidor; o app não decide nada.
- **Uma receita ativa por restaurante por mês; um prêmio por pessoa por mês** (parâmetro).
- Equipe não participa. Contas duplicadas barradas como no Clube.
- **Extrato de giros** auditável pelo dono.
- Regulamento próprio: **"sem sorteio, resultado conhecido, um giro por visita"**. Pendente da mesma revisão jurídica do clube.

## 8. Métricas do dono
Receitas ativas e **taxa de conclusão**, giros por dia, clientes que giraram, **tempo médio para completar**, prêmios entregues, **custo por receita completa**, retorno em 7 e 30 dias de quem participa × quem não participa (com amostra mínima), abandono (quem parou no ingrediente 3 ou 4).

## 9. Quando construir
Depois do Clube e dos portais (P5 em diante). É um módulo `recipe_game`, **desligado por padrão**, com interruptor por restaurante. Reaproveita a visita verificada, o comprovante da troca e o catálogo de prêmios.

## 10. Decisões que preciso de você
1. **Confirma a versão sem sorteio** (o próximo ingrediente é sempre o da receita)?
2. **Ingredientes:** 5 com prêmio menor (sobremesa + bebida) ou 6 a 8 com prêmio grande (pizza)?
3. **Intervalo mínimo entre giros:** 3 dias (recomendo) ou 1 por semana?
4. **O prato do mês** muda todo mês, ou o restaurante pode ter uma receita permanente?
5. **Giro dá pontos do Clube** (ex.: +5) além do ingrediente, ou os dois ficam separados?

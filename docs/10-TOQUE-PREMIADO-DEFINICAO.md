# Toque Premiado: definição final (versão 6, 20/11/2026)

Reúne o que você definiu com o que já estava decidido. **Substitui** o que for conflitante em `docs/06`, `07` e `08` (seção 12). Valores são **de teste para o GastroPub**; a dinâmica é fixa e todo parâmetro é do proprietário.

> **Decisões de 22/11/2026 (prevalecem sobre o resto do documento):**
> - **Nome para o cliente: "Clube" + nome do restaurante** (ex.: "Clube SemReservas GastroPub"). "Toque Premiado" deixa de aparecer na tela; fica só como nome técnico interno.
> - **Telas do clube, todas simples:** (1) **Clube**: "Você tem X pontos", frase do próximo prêmio e **lista bem visível de prêmios com os pontos de cada um**; o prêmio que o cliente já alcançou fica **destacado**, com a mensagem "Você já pode trocar!" e o botão **Trocar** no próprio cartão; (2) **Como funciona**: tela própria com os passos e as ações que dão pontos; (3) **Extrato**; (4) **aviso animado de meta atingida**, que aparece ao abrir o app quando o cliente alcança os pontos de um prêmio.
> - **Aviso animado de meta atingida:** aparece **uma única vez por prêmio alcançado** (ao abrir o app depois de o cliente alcançar os pontos). Depois disso, o prêmio continua **destacado** na tela do Clube com "Você já pode trocar!" e o botão Trocar, sem repetir o aviso.
> - **Visitas no mês** é só mais uma ação que dá pontos (bônus de 3 visitas), não um bloco da tela. O **Cliente do mês** aparece apenas em "Como funciona".
> - **Meu aniversário** tem **tela própria e ícone na Home**; não fica dentro do clube.
> - **Barra inferior:** Início, Cardápio, Pedido, **Clube** (ícone de cartão de membro, **nunca troféu, taça ou presente**) e Sobre.
> - Na tela do cliente: "pontos" (não "pts"), "visita" (não "check-in"), "Seus pontos" (não "saldo/acumulado").

## 0. Princípios
1. **Quem não está logado não participa do clube.** O cadastro **já dá pontos** (+30).
2. **O estabelecimento sempre tem o portal do proprietário**: é onde ele vê, em números, tudo o que o clube faz, e onde se **confere** cada troca. O **painel de chamadas nos aparelhos dos garçons continua opcional**.
3. **Sem integração com caixa/PDV** e sem depender de equipamento do garçom.
4. **Só pontua o que o sistema verifica sozinho.** O que for apenas intenção (toque num link) é rotulado e tem teto.
5. **O custo do restaurante é sempre limitado por regra** (limites por dia, mês e prêmio), nunca por confiança.
6. **Pontos por valor da conta ficam FORA do MVP** (seção 3).
7. **Tudo é configurável pelo proprietário**: prêmios, metas, pontos de cada ação e preço de cada prêmio. Os valores deste documento são **só de teste**.

## 1. A dinâmica em 6 linhas
1. O cliente **acumula pontos** por **check-in** (a cada retorno ao restaurante) e por **toda interação que beneficia o restaurante** (retorno, indicação, divulgação, uso do app).
2. Os pontos formam um **saldo**.
3. Existe um **catálogo de prêmios com preço em pontos** (sorvete, bebida, petisco, sobremesa, desconto na conta, pizza…).
4. Ao alcançar o preço de um prêmio, ele fica **liberado**; o cliente **troca agora ou continua somando** para prêmios maiores.
5. **Trocar desconta** os pontos do saldo; o contador de **pontos acumulados na vida** nunca diminui.
6. A **troca é imediata**: o cliente pede no app, os pontos saem na hora, recebe o prêmio na hora e **mostra a tela ao garçom**, que **confere no sistema do proprietário** se está tudo certo.

## 2. O que você trouxe, batido com o que já havia
| Sua ideia | Estava definido? | Resultado |
|---|---|---|
| Pontos por **valor consumido** | Não | **Fora do MVP** (seção 3). Fica como módulo futuro |
| Ações que dão pontos (venda ou divulgação) | Sim: 7 ações | **Mantido**, só com ações **verificáveis**; entram **indicação de amigo** e **campanhas** |
| Prêmios no caminho e prêmio máximo | Sim: 100/300/600/1000 | **Substituído** pelo seu exemplo (200 sorvete, 500 desconto, 1000 pizza) |
| Não zerar o contador | Parcial | **Dois contadores:** saldo (desce ao trocar) e acumulado na vida (nunca desce) |
| Cada produto com valor em pontos; trocar ou somar | Parcial | **Catálogo com preço em pontos**; troca por escolha do cliente |
| Dificuldade considerável nos prêmios grandes | Parcial | Detalhado na seção 7 (preço, visitas mínimas, tetos) |
| Bebidas, sobremesas, petiscos no catálogo | Parcial | Mantido |
| Pontos descontados ao trocar; proprietário vê o pedido | Sim | Mantido; **o garçom não precisa confirmar** (seção 6) |
| Dashboard do proprietário | Sim | Ampliado (seção 9), **sem valores de venda** |
| Aniversário e cliente do mês | Sim | Mantidos à parte |
| Equipe: nada de trabalho extra, painel opcional | Parcial | **Regra de projeto** (seção 0) |

## 3. Por que não "pontos por valor da conta" agora
Olhei todos os caminhos possíveis. Nenhum é, ao mesmo tempo, **confiável** e **autônomo**:

| Caminho | Autônomo? | Confiável? | Problema |
|---|:-:|:-:|---|
| Garçom digita o valor | Não | Sim | É o atrito que você quer evitar |
| Cliente informa o valor | Sim | Não | Qualquer um digita um valor alto |
| Pontos pelo **pedido montado no app** | Sim | Não | O pedido é intenção, não venda, e exige validação |
| Integração com caixa/PDV | Sim | Sim | Complexa, cada sistema é diferente (Fase 3, contrato à parte) |
| **QR da nota fiscal (NFC-e)** lido pelo cliente | Quase | Boa | Só existe se o cliente recebe a nota; ler o valor exige consultar a página da Sefaz de cada estado, que muda e pode bloquear. A chave da nota já prova o CNPJ do restaurante, a data e evita nota repetida |
| Foto da conta com leitura de texto | Sim | Média | Fácil de fraudar e de errar |
**Decisão proposta:** **eliminar** esse tipo de pontuação no MVP. Fica previsto o módulo **`loyalty_spend` (desligado)**, a ser ligado quando houver PDV integrado ou a leitura da nota fiscal (ver seção 12).

## 4. Como se ganha pontos (tudo verificável pelo sistema)
### 4.1 Check-in: cada retorno ao restaurante gera pontos
**Check-in: +30 pontos, 1 por dia.** Acontece quando o cliente **logado encosta o celular na placa da mesa** (ou lê o QR). É simples de propósito: **não exige tempo mínimo nem prato visto** e não depende de ninguém da equipe.
**Para que serve:** (1) premia **cada volta** ao restaurante; (2) é o **marcador de "visita"** do sistema: base do bônus de frequência, do "voltar em 7 dias", do cliente do mês, das visitas mínimas dos prêmios grandes e das métricas do dono; (3) é a **única prova automática de presença** (a placa só abre na mesa).
**Condição do check-in (parâmetro do dono, com 2 modos):**
- **Modo A, simples:** os pontos saem **assim que o cliente logado encosta na placa**.
- **Modo B, com sinal de consumo** (padrão de teste): os pontos saem quando o app **vê um sinal de que a pessoa consumiu**: (1) **enviou o pedido ao garçom**, ou (2) **pediu a conta**, ou (3) ficou **45 minutos na sessão com 3 ou mais interações**. Se o cliente ainda não pontuou, aos 45 minutos o app lembra: "Já terminou? Peça a conta pelo app e receba seus pontos."
- **Atenção:** o modo B é um **sinal**, não uma **prova** (o app não enxerga o caixa; quem quiser fraudar pode apertar "Pedir a conta"). Ele serve para tornar o abuso **mais trabalhoso** e para o painel medir "check-ins com consumo provável".
**Risco aceito (modo A):** alguém pode encostar na placa e ir embora. O custo é de **30 pontos por dia por pessoa**; o portal mostra **"check-ins sem nenhuma interação"** para o dono perceber abuso. (Versão anterior exigia 30 minutos e 3 pratos; foi retirada por ser complexa. Se o dono quiser, ela volta como parâmetro opcional "tempo mínimo na mesa".)

### 4.1.1 Prova de presença: "Estou no restaurante" (resolve o QR fotografado)
**O problema:** a placa é um link fixo; se alguém fotografa o QR ou manda o link, dá para abrir a sessão de casa e pontuar sem ir ao restaurante.
**A solução, que não dá trabalho ao proprietário:** **confirmar a localização uma vez por sessão**, **só para pontuar** (nunca para usar o app).
- O app **continua funcionando normalmente** sem localização: cardápio, RA, pedido, chamar garçom. Ninguém é bloqueado.
- Para **ganhar pontos que dependem de estar lá**, o cliente toca em **"Confirmar que estou no restaurante"**. O navegador pergunta a localização **uma vez**, o servidor calcula a distância até o restaurante e **guarda só o veredito** (perto ou longe) e a distância, **nunca as coordenadas**. A confirmação vale **a sessão inteira (90 min)**.
- **Dentro do raio** (padrão de teste **80 m**, ajustável de 30 a 250 m; o servidor desconta a **precisão** que o aparelho informa): sessão **verificada**, os pontos saem. **Fora do raio ou sem permissão:** o app explica ("Para ganhar pontos precisamos confirmar que você está no restaurante") e **oferece tentar de novo**; o restante do app segue.
- **Quais ações exigem sessão verificada:** check-in e tudo que depende dele (retorno, bônus, sequência, mesa cheia, campanha), **trocar pontos por prêmio**, pedido pelo app, RA, nota do prato, curtir pós-conta. **Não exigem** (podem ser feitas de qualquer lugar, uma vez só): cadastro, perfil, Instagram, Google, instalar o app, avisos, outros canais, indicação, comentário e sugestão.
- **Esforço do proprietário:** informar **uma vez** onde fica o restaurante, com um botão **"Usar minha localização agora"** (ele clica estando lá) ou buscando o endereço. O GastroPub **já tem as coordenadas** (do teste de presença). O raio e o interruptor ficam nas configurações.
- **Infraestrutura já existe:** o cálculo de distância e as políticas de presença estão na migração `0004`; o P5 só reaproveita.
- **Quem quiser burlar** teria de **falsificar o GPS** do celular (aplicativos específicos, com várias etapas) para ganhar 30 pontos por dia: **o custo supera o ganho** e o portal alerta repetições.
- **Privacidade (LGPD):** finalidade única (provar presença para pontuar), pedido claro na tela, **sem guardar coordenadas**, e o regulamento do clube explica o uso.
- **Por que não 20 m ao redor da placa:** o GPS erra **de 5 a 10 m ao ar livre e de 15 a 40 m dentro do salão**; um raio de 20 m **barraria clientes de verdade**. Além disso, um raio **por mesa** exigiria cadastrar a posição de cada placa (trabalho para o dono) e o GPS **não distingue mesas**: quem diz a mesa é a **placa**. O raio vale para o **restaurante inteiro**.
- **Ir ao banheiro não desloga ninguém:** a localização é conferida **só nos momentos de pontuar**, **nunca acompanhada em segundo plano** (sem rastrear movimento, sem gastar bateria, e o navegador nem permite com a tela apagada). A sessão de 90 minutos continua; vencida, basta **encostar de novo na placa**.
- **Troca de pontos:** exige uma confirmação **recente** (feita nos últimos 2 minutos), por ser a ação de maior valor.
- **Calibração com dados reais:** o servidor guarda também a **precisão informada** (não as coordenadas). O portal mostra "precisão média e % de confirmações que falharam por distância", e o dono (ou o Master) **aperta o raio** quando os números mostrarem que o GPS do local é bom.

### 4.2 Retorno e frequência
| Ação | Pontos (teste) | Limite | Verificação |
|---|---|---|---|
| Voltar em até 7 dias (novo check-in) | +20 | 1 por semana | automática |
| Bônus de frequência: 3 check-ins no mesmo mês | +40 | 1 por mês | automática |
| Check-in em dia de baixo movimento (campanha do dono) | +20 | por campanha | automática |
| Mesa cheia: 3 ou mais membros logados na mesma mesa | +15 para cada | 1 por visita | automática |

### 4.3 Interações no app (todas pontuam; o sistema vê o evento)
Princípio alinhado: **toda interação do cliente no app que ajuda o restaurante gera pontos**, cada uma com um valor e um limite. O que o sistema **vê** é pontuado automaticamente; o que só **sai do app** (toque em link) é pontuado como **intenção**, rotulado e com teto.
| Interação | Pontos (teste) | Limite | Como o sistema verifica |
|---|---|---|---|
| **Foto com moldura**: gerar e baixar | +15 | 1 por dia | evento do app (`photo_downloaded`); **não prova** que foi publicada |
| Compartilhar a foto com moldura | +10 | 1 por semana | início do compartilhamento (**intenção**) |
| **Comentário em prato** | +20 | 1 por prato, 3 por visita | texto com 20 ou mais caracteres, sem links, passa no filtro automático; **vai só ao dono** (não precisa moderação para pontuar) |
| **Curtir pratos** (na tela pós-conta) | +5 | 3 por visita | evento do app |
| Responder à pesquisa da visita | +10 | 1 por visita | pesquisa enviada |
| **Seguir no Instagram** | +20 | 1 vez | toque no link (**intenção**) |
| **Avaliar no Google** | **0 (desligada por padrão)** | — | **A política do Google proíbe incentivar avaliações** (pontos, descontos ou brindes em troca de avaliar). O botão existe e é livre; o dono só liga pontos se aceitar o risco de o Google remover avaliações ou penalizar o perfil |
| Compartilhar prato ou app | +10 | 1 por semana | toque (**intenção**) |
| **Indicar um amigo** | +100 | por amigo | **automática**: o amigo se cadastra pelo link e faz o **primeiro check-in** |
| **Fazer o pedido pelo app** e chamar o garçom | +10 | 1 por visita | evento `order_intent_prepared` |
| **Usar a realidade aumentada** e fixar o prato | +5 | 3 por visita | evento `ar_fixed` |
| **Dar nota ao prato** (depois da conta) | +5 | 3 por visita | evento do app |
| **Deixar uma sugestão** | +10 | 1 por visita | texto válido |
| **Instalar o app** na tela inicial | +20 | 1 vez | evento `appinstalled` |
| **Ativar avisos** do restaurante | +10 | 1 vez | permissão concedida |
| **Seguir outros canais** (TikTok, Facebook, canal do WhatsApp) | +10 cada | 1 vez por canal | toque no link (intenção) |
| **Sequência**: check-in em 4 semanas seguidas | +50 | a cada sequência | automática |
| **Participar de evento** do restaurante | definido na campanha | por evento | check-in no dia do evento |

> **Saídas contam ao clicar.** Quem toca em "Seguir no Instagram" (e nos outros canais) **ganha os pontos na hora**, mesmo que a ação não se conclua do outro lado (é raro, e o custo é pequeno e limitado). O portal rotula esses números como **cliques**. **Exceção, o Google:** a avaliação pública deve ser **espontânea** (política do Google e premissa do pacote original), então o botão "Avaliar no Google" **não dá pontos por padrão**.

### 4.4 Relacionamento
Cadastro +30 (1 vez) · Completar o perfil (aniversário) +20 (1 vez).

### 4.5 Tetos e travas
- **Interações recorrentes e saídas** (comentar, curtir, moldura, nota, sugestão, pedido pelo app, RA, compartilhar, pesquisa) somam **no máximo 200 pontos por mês**. Ações **de uma vez só** (cadastro, perfil, Instagram, Google, instalar, avisos, outros canais) e **check-in, retorno, sequência e indicação** ficam fora do teto, porque já são limitadas por natureza.
- **Check-in:** 1 por dia, **só no horário de funcionamento** e **só nos dias em que o restaurante abre** (GastroPub: **terça a domingo, das 19h00 às 23h30**, com 30 minutos de tolerância no fim para quem pede a conta na saída; segunda fechado). Exige **sessão verificada** (4.1.1).
- **Limite por pessoa nos prêmios** (parâmetro por prêmio): ex.: pizza **1 por mês por pessoa**; sorvete 4 por mês. Impede que um cliente muito frequente esvazie o estoque.
- Cada ação tem seu limite e pode ser **desligada** pelo dono (inclusive só na prática, depois de testar).

### 4.6 Quais ações ficam ligadas no teste
Entram **todas** as ações das tabelas acima, **cada uma com interruptor**: se na prática alguma não render, o dono **desliga** sem apagar o histórico. **Ficam desligadas até revisão jurídica:** pontos por **aceitar ofertas por WhatsApp** (o consentimento precisa ser livre). **Só na Fase 3:** foto com moldura publicada com a # (depende da API do Instagram).

## 5. O fluxo do check-in (sem a equipe)
1. O cliente encosta na placa: abre a sessão de **90 minutos** (renova a cada toque), **se o restaurante estiver aberto**.
2. Se estiver **logado**, o app registra a presença. No **modo A** credita **+30** na hora. No **modo B**, credita ao primeiro sinal de consumo (pedido, conta ou 45 minutos com interações) e avisa: "**Check-in confirmado! +30 pontos**" (uma vez por dia, junto com retorno, sequência ou campanha, se houver).
3. Se **não estiver logado**, a sessão funciona (cardápio, pedido, chamar garçom), mas **não há clube**: o app mostra o convite ao cadastro e **não há pontos retroativos**.
4. Cada linha vai ao **extrato** (imutável) e ao portal do dono.

## 6. O fluxo de troca de pontos (imediata)
1. Na aba **Prêmios**: saldo, acumulado, **barra com marcos**, **Você pode trocar** (liberados) e o catálogo com o que falta.
2. O cliente escolhe o prêmio e toca **Trocar**. O app mostra as regras (conta mínima, teto) e pergunta "**Trocar agora? Os pontos saem na hora.**"
3. Ao confirmar, os pontos são **debitados na hora** e a troca fica **registrada**. A tela vira o **comprovante** (a "arte gerada"): prêmio, **código**, mesa, horário e uma animação ao vivo (para não valer print), válido por **30 minutos**.
4. O cliente **chama o garçom** (pelo próprio app ou como de costume), **mostra o comprovante** e recebe o prêmio.
5. **Não há verificação pela equipe** nem tela do garçom. A troca vai para o **histórico em tempo real da área do proprietário** (mesa, prêmio, código, horário, quem trocou), onde ele acompanha tudo.
6. A troca é **final**. Se houve erro (prêmio acabou), o **gerente estorna** os pontos no portal, com justificativa registrada.

**Fraude entre cliente e garçom:** como o sistema não depende do garçom, o controle é **depois do fato e em números**: o portal mostra trocas por mesa, hora, prêmio e membro, e alerta padrões estranhos (mesmo membro trocando muito, trocas concentradas numa mesa ou horário, comprovante mostrado sem troca registrada). O dono pode cruzar com a entrega do prêmio quando quiser.
**Regras:** troca só com **sessão de mesa ativa**; **1 troca por visita**; **desconto na conta** é aplicado pelo garçom no caixa conforme o comprovante (com teto e conta mínima impressos nele); a promoção de aniversário **não acumula** com troca de pontos.

## 6.1 Meu aniversário (promoção desvinculada do clube)
Funciona **sem cadastro e sem pontos**. É divulgado **antes de tudo**, para ninguém ser pego de surpresa com a regra dos convidados.
- **Onde aparece:** cartão de destaque no **topo da Home**, item exclusivo **"Meu aniversário"** no app, e uma **página pública** (`/#/aniversario`) para o restaurante **divulgar nas redes sociais** antes da visita, com o link e a regra. O onboarding orienta o estabelecimento a divulgar.
- **Mimo para quem faz aniversário** (configurável; teste: **sobremesa da casa**), mediante **documento** conferido pelo garçom.
- **Condição para os convidados** (configurável; teste: **50% de desconto na comida do pedido do aniversariante** com **no mínimo 5 acompanhantes**, **não vale bebida**). Pode ser desligada.
- **Janela:** **somente no dia do aniversário**. Se o restaurante **estiver fechado nesse dia** (pelos dias de funcionamento configurados), vale no **próximo dia aberto** (em geral, o dia seguinte).
- **Como usa:** na mesa, o cliente toca **Mostrar ao garçom** na tela "Meu aniversário" (animada, com a regra) e o garçom confere o **documento**. O uso aparece em **Resgates** do portal como "Aniversário · Mesa 3 · hora", para entrar nos números.
- **Não acumula** com troca de pontos e **não dá pontos**.
- A tela mostra as regras completas antes de qualquer botão, e a página pública deixa claro "**válido mediante documento e condições do restaurante**".

## 6.2 Cliente do mês
Escolhido por **dias com check-in** no mês (empate: quem fez o primeiro check-in antes). Recebe **brinde** (configurável, ex.: camiseta ou caneca), **+200 pontos** (teste) e **divulgação nas redes sociais, só se autorizou** no cadastro. O cliente vê **apenas a própria contagem** de visitas no mês; o ranking com nomes é só do proprietário.

## 7. A economia: como o prêmio grande fica difícil
Sem valor de conta, o custo do restaurante é **por visita**. O **ritmo** passa a ser a alavanca.

### 7.1 O seu exemplo com os pontos de teste
| Prêmio | Pontos | Valor do prêmio | Custo real para o restaurante |
|---|---:|---|---|
| Sorvete com 2 bolas | 200 | R$ 12 (preço) | ~R$ 4 (custo do produto) |
| 30% de desconto na conta (teto R$ 30, conta mínima R$ 80) | 500 | até R$ 30 | **até R$ 30**: desconto é custo cheio |
| Pizza à escolha | 1000 | R$ 65 (preço) | ~R$ 20 (custo do produto) |
O **desconto na conta é o mais caro**: o dono deve ter **teto e conta mínima**.

### 7.2 Quanto o programa custa por visita
Um cliente ativo ganha em média **uns 70 pontos por visita** (30 de check-in mais retorno e interações). Pelo custo real dos prêmios acima, 1000 pontos custam ao restaurante em torno de R$ 20 em produto: **cerca de R$ 1,40 por visita** em prêmios de produto (mais se o cliente preferir o desconto). O portal mostra o **custo médio por visita** e avisa quando passa de um limite que o dono define.

### 7.3 Alavancas de dificuldade (todas parâmetros do dono)
1. **Preço em pontos** crescente e não linear.
2. **Visitas mínimas** nos prêmios grandes (a pizza exige 8 check-ins em dias diferentes): não dá para ganhar só com cliques e comentários.
3. **Teto de 150 pontos por mês** para interações e saídas.
4. **1 troca por visita** e **estoque mensal** por prêmio.
5. **Validade dos pontos**: 12 meses sem atividade.
6. **Conta mínima e teto** nos descontos.

### 7.4 Ritmo com os pontos de teste
Cadastro, perfil, Instagram e Google somam **100 pontos** logo no começo.
- **1 visita por semana** (≈ 60 + bônus mensal): sorvete (200) na **3ª visita**; desconto (500) com cerca de **8 visitas** (~2 meses); pizza (1000) com cerca de **15 visitas** (~3,5 meses).
- **2 visitas por semana**: pizza em cerca de **2 meses**.
- **Cliente que vem todos os dias** (≈ 26 por mês, terça a domingo): ~780 de check-in + retorno e sequência + até 200 de interações → **~1.100 pontos por mês**: a pizza **sai em cerca de um mês**. É **intencional**: quem vem tanto está gastando muito (por exemplo R$ 60 por dia ≈ R$ 1.500 por mês) e **o custo do programa é de uns R$ 20 a R$ 30 de produto**, algo como 2% do que ele gastou. O que impede abuso é o **limite por pessoa por prêmio** (pizza 1 por mês), o estoque mensal e a **visita mínima**.
- Trocar o sorvete aos 200 afasta a pizza em ~3 visitas. A escolha é do cliente: **trocar já ou continuar somando**.

## 8. Antifraude (sem a equipe e com o mínimo de trabalho para o dono)
**Qual a chance de alguém ir ao restaurante só para juntar pontos e sair?** **Muito baixa**: o check-in vale **30 pontos por dia** e **1.000 pontos custam ao restaurante cerca de R$ 20 em produto**; quem fizesse só isso precisaria de **34 dias seguidos** de deslocamento, mesa e login para uma pizza que custa R$ 20. Na prática, quem faz isso está consumindo.

**O risco de verdade é pontuar sem estar lá** (QR fotografado ou link enviado). Camadas, da mais forte à mais leve:
1. **Sessão verificada por localização** (4.1.1): é a trava principal e **não exige nada do proprietário** depois da configuração inicial.
2. **Horário e dias de funcionamento:** check-in fora de terça a domingo, 19h00 às 23h30 (+30 min) não vale e vira alerta.
3. **Uma conta por e-mail confirmado**; no máximo **2 contas por aparelho**; limite de check-ins por aparelho e por rede.
4. **Troca de pontos só com sessão verificada** e **1 por visita**; **limite por pessoa por prêmio**.
5. **Link da placa trocável**: se um QR vazar, o dono (ou o Master) gera um novo e o antigo deixa de valer, sem regravar tag (o vínculo é no servidor).
6. **Modo B** (sinal de consumo): pedir a conta, enviar o pedido ou 45 minutos com interações.
7. **Reforço futuro, só se houver caso real:** tags **NTAG 424 DNA** (link novo e assinado a cada toque) e placas com **QR que muda**, por custo maior.

Outras travas:
- **Equipe do restaurante não pontua.**
- **Extrato imutável e idempotente**: o mesmo evento nunca pontua duas vezes.
- **Comprovante de troca** com código e tela animada, válido 30 min.
- **Alertas no portal** (sem o dono precisar vigiar): muitos check-ins por pouco tempo, mesma pessoa em muitas contas, indicações em ciclo, trocas concentradas por membro, mesa ou horário, check-ins sem interação, **check-ins sem localização confirmada** e fora do horário.
- **Ajuste manual** de pontos: gerente com teto e justificativa obrigatória.
- **Limite de dano:** cada risco é limitado por regra; o pior caso é um prêmio isolado, nunca um prejuízo aberto.

## 9. Dashboard do proprietário (clube)
Sem valores de venda. Mede o clube pelo que o sistema vê.
| Bloco | Métricas |
|---|---|
| **Adesão** | cadastros, membros ativos (visita nos últimos 30 dias), taxa de cadastro, indicações confirmadas |
| **Presença** | check-ins, check-ins por membro, **check-ins sem nenhuma interação**, retorno em 7 e 30 dias, novos × recorrentes, **mapa de horário e dia** |
| **Pontos** | emitidos por tipo (presença, retorno, indicação, divulgação, relacionamento), trocados, **saldo em carteira**, vencendo em 30 dias |
| **Resgates** | por prêmio, taxa de troca, tempo até a troca, estornos, trocas por mesa e horário |
| **Economia** | **custo médio por visita**, **passivo de pontos** (saldo × custo médio por ponto), custo dos prêmios trocados, prêmios acima do limite de retorno |
| **Qualidade** | alertas de fraude, trocas concentradas, contas suspeitas |
| **Aniversário** | acessos à página "Meu aniversário", benefícios mostrados na mesa, mesas com 5 ou mais acompanhantes |
| **Redes e alcance** | fotos com moldura geradas, baixadas e compartilhadas; cliques em Instagram e Google; **publicações com a #** (só Fase 3, veja 9.1) |
| **Ranking** | cliente do mês (dias com visita); divulgação só com autorização |
Cada número com definição visível e "dados insuficientes" abaixo da amostra mínima.

### 9.1 Alcance nas redes: o que dá e o que não dá para medir
**Dá para medir hoje (dentro do app):** fotos com moldura **geradas**, **baixadas** e **compartilhamentos iniciados**; cliques em Instagram e Google.
**Varrer a # publicada nas fotos com moldura** é possível **em parte, só na Fase 3**:
- Pela **API oficial do Instagram** (busca por hashtag e menções), com **conta Instagram Business** do restaurante ligada pelo próprio dono e **revisão do aplicativo pela Meta**. Dá o **número de publicações públicas** com a # e **curtidas e comentários dessas publicações**.
- **Não dá** o **alcance real** nem as visualizações das postagens dos outros, nem Stories de contas privadas, e a busca tem limites (poucas hashtags por semana, só publicações públicas recentes).
- **Raspar o Instagram** contraria os termos da plataforma e quebra com frequência: **não será feito**.
- Por isso o portal chamará o número de **"publicações encontradas com a #"**, nunca de "alcance".
- A moldura levará a **# e o @ do restaurante** gravados e uma legenda sugerida já copiada, para aumentar o que a busca encontra.

## 10. Regras de borda
- **Troca com problema** (prêmio acabou): o gerente **estorna** com justificativa; a troca fica marcada como estornada.
- **Comprovante vencido** (30 min): deixa de ser mostrável; a troca continua registrada.
- **Prêmio sem estoque no mês:** "esgotado neste mês"; os pontos ficam.
- **Troca sem mesa ou sessão:** bloqueada ("aproxime o celular da placa da sua mesa").
- **Pontos expirando:** aviso 30 dias antes.
- **Cliente excluído (LGPD):** dados pessoais apagados; extrato fica anonimizado.
- **Mudança de regras pelo dono:** vale daí em diante; não altera pontos ganhos nem cupons em andamento.
- **Mudança de preço de um prêmio:** cupons já gerados mantêm o preço.
- **Painel de chamadas dos garçons desligado:** nada deixa de funcionar; a conferência se faz no portal do proprietário.

## 11. O que o proprietário configura (e o que é fixo)
**Fixo:** saldo e acumulado; catálogo com preço em pontos; troca por escolha; débito na troca; extrato imutável; auditoria; verificação automática da visita.
**Parâmetro do dono:** pontos de cada ação e limites; campanhas com prazo; tempo mínimo na mesa para o check-in (opcional, padrão nenhum); catálogo de prêmios (preço em pontos, teto, conta mínima, visitas mínimas, estoque, validade do comprovante, horários); marcos da barra; validade dos pontos; teto das ações de intenção; limite de custo por visita; aniversário; cliente do mês; nome do programa; regulamento.

## 12. Configuração de teste para o GastroPub
| Item | Valor |
|---|---|
| Check-in (encostar na placa, logado) | +30 (1 por dia), **modo B** (com sinal de consumo) |
| Dias e horário de funcionamento | **terça a domingo, 19h00 às 23h30** (+30 min de tolerância); segunda fechado |
| Prova de presença | **localização**, uma vez por sessão (troca: confirmação dos últimos 2 min), raio **80 m**, só para pontuar |
| Voltar em 7 dias / bônus de 3 check-ins no mês | +20 / +40 |
| Mesa cheia (3+ membros logados) | +15 cada |
| Indicar amigo (após a 1ª visita dele) | +100 |
| Cadastro (já dá pontos) / perfil completo | +30 / +20 |
| Foto com moldura baixada / comentário em prato / curtir prato | +15 / +20 / +5 |
| Instagram / Google / compartilhar / pesquisa | +20 / **0** (política do Google) / +10 / +10 |
| Teto mensal das interações recorrentes e saídas | 200 pontos |
| Pedido pelo app / RA / nota do prato / sugestão | +10 / +5 / +5 / +10 |
| Instalar app / ativar avisos / outros canais | +20 / +10 / +10 cada |
| Sequência de 4 semanas | +50 |
| Limite por pessoa | pizza 1 por mês; desconto 2 por mês; sorvete 4 por mês |
| Prêmios | **200** Sorvete 2 bolas · **350** Refrigerante ou entrada · **500** 30% de desconto na conta (teto R$ 30, conta mínima R$ 80) · **1000** Pizza à escolha (8 visitas mínimas) |
| Marcos na barra | 200, 500, 1000 |
| Validade dos pontos | 12 meses sem atividade |
| Cliente do mês | brinde + **+200 pontos** + divulgação nas redes (só se autorizar) |
| Troca | imediata e final; comprovante de 30 min; 1 troca por visita; conferência no portal |
Os preços dos produtos são **suposições** a trocar pelos reais.

## 13. O que muda nos outros documentos
| Onde | Mudança |
|---|---|
| `docs/06`, `docs/07` | Tabelas de pontos e prêmios antigas substituídas por esta definição |
| Portal do proprietário (`docs/08`) | Nova tela **Resgates** (histórico ao vivo, busca por código, estorno); bloco **Aniversário**; bloco **Redes e alcance** |
| Link da equipe (garçons) | **Opcional, só a fila de chamados.** **Não ganha nada do clube** (nem aba de resgates nem valor da conta) |
| App do cliente | Home com cartão **Meu aniversário**; página pública `#/aniversario`; aba Prêmios com troca imediata |
| `CLAUDE.md` e `docs/09` | Regras já alinhadas; módulo `loyalty_spend` desligado |
| Banco (P5) | Saldo e acumulado, catálogo, **troca imediata com débito**, estorno, check-in, indicação, tetos, benefícios de aniversário (eventos), conferência |

## 14. Pendências e premissas
1. **Horário:** definido, terça a domingo, 19h00 às 23h30.
2. **Prova de presença por localização** (4.1.1): adotada no teste. Se o teste de campo mostrar GPS ruim no local, ajusta-se o raio.
3. **Modo do check-in:** modo B no teste, trocável por interruptor.
4. **Ações:** todas ligadas, cada uma com interruptor; só **WhatsApp** desligada.
5. **Valores, troca, aniversário e hashtags:** aceitos.
6. **Espaço Kids:** depois (`docs/11-ESPACO-KIDS.md`).

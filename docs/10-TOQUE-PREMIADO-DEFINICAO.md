# Toque Premiado: definição final (versão 3, 20/11/2026)

Reúne o que você definiu com o que já estava decidido. **Substitui** o que for conflitante em `docs/06`, `07` e `08` (seção 12). Valores são **de teste para o GastroPub**; a dinâmica é fixa e todo parâmetro é do proprietário.

## 0. Princípios
1. **Quem não está logado não participa do clube.** O cadastro **já dá pontos** (+30).
2. **O estabelecimento sempre tem o portal do proprietário**: é onde ele vê, em números, tudo o que o clube faz, e onde se **confere** cada troca. O **painel de chamadas nos aparelhos dos garçons continua opcional**.
3. **Sem integração com caixa/PDV** e sem depender de equipamento do garçom.
4. **Só pontua o que o sistema verifica sozinho.** O que for apenas intenção (toque num link) é rotulado e tem teto.
5. **O custo do restaurante é sempre limitado por regra** (limites por dia, mês e prêmio), nunca por confiança.
6. **Pontos por valor da conta ficam FORA do MVP** (seção 3).
7. **Tudo é configurável pelo proprietário**: prêmios, metas, pontos de cada ação e preço de cada prêmio. Os valores deste documento são **só de teste**.

## 1. A dinâmica em 6 linhas
1. O cliente **acumula pontos** por **presença (visita completa)** e por **ações que beneficiam o restaurante** (retorno, indicação, divulgação).
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
### 4.1 Presença: a fonte principal
**Visita completa: +60 pontos, 1 por dia.** Conta quando, com o cliente **logado** e numa **mesa com placa**:
- a sessão tem **pelo menos 30 minutos** entre o primeiro toque na placa e a última interação (cardápio, pedido, RA, conta); e
- há **interação real** no cardápio (ao menos 3 pratos vistos).
Os pontos são creditados **ao fim da sessão** (ou ao pedir a conta, se pedir). **Não dependem do garçom.** Se o restaurante desligar o módulo de chamada de garçom, a visita continua valendo.

### 4.2 Retorno e frequência
| Ação | Pontos (teste) | Limite | Verificação |
|---|---|---|---|
| Voltar em até 7 dias (visita completa) | +40 | 1 por semana | automática |
| Bônus de frequência: 3 visitas completas no mês | +60 | 1 por mês | automática |
| Visita completa em dia de baixo movimento (campanha do dono) | +30 | por campanha | automática |
| Mesa cheia: 3 ou mais membros logados na mesma mesa | +20 para cada | 1 por visita | automática |

### 4.3 Divulgação e indicação
| Ação | Pontos (teste) | Limite | Verificação |
|---|---|---|---|
| **Indicar um amigo** | +100 | por amigo | **automática**: o amigo se cadastra pelo link e completa a **primeira visita** |
| Seguir no Instagram | +20 | 1 vez | toque no link (**intenção**) |
| Avaliar no Google | +50 | 1 vez | toque no link (**intenção**) |
| Compartilhar com a marca | +10 | 1 por semana | toque (**intenção**) |

### 4.4 Relacionamento
Cadastro +30 (1 vez) · Completar o perfil (aniversário) +20 (1 vez) · Responder à pesquisa da visita +10 (1 por visita).

### 4.5 Tetos
- Ações de **intenção** (Instagram, Google, compartilhar, pesquisa): **no máximo 150 pontos por mês**.
- Presença e frequência não têm teto diário além de "1 visita completa por dia".

## 5. O fluxo da visita (sem a equipe)
1. O cliente encosta na placa: abre a sessão de **90 minutos** (renova a cada toque).
2. Navega, vê pratos, monta o pedido, usa a RA. O app registra a **atividade da sessão**.
3. Ao fim da sessão, ou ao pedir a conta, se a sessão teve **30 minutos e 3 pratos vistos**, o sistema credita a **visita completa** e avisa no app: "**Visita registrada: +60 pontos**".
4. Se o cliente **não estava logado**, o app mostra "Cadastre-se para pontuar" ao fim; **não há pontos retroativos**.
5. Tudo gera uma **linha no extrato** (imutável) e aparece no portal do dono.

## 6. O fluxo de troca de pontos (imediata)
1. Na aba **Prêmios**: saldo, acumulado, **barra com marcos**, **Você pode trocar** (liberados) e o catálogo com o que falta.
2. O cliente escolhe o prêmio e toca **Trocar**. O app mostra as regras (conta mínima, teto) e pergunta "**Trocar agora? Os pontos saem na hora.**"
3. Ao confirmar, os pontos são **debitados na hora** e a troca fica **registrada**. A tela mostra o **comprovante**: prêmio, **código**, mesa, horário e uma animação ao vivo (para não valer print), com o botão **Mostrar ao garçom**. O comprovante vale por **30 minutos** (configurável) para ser mostrado.
4. **O garçom confere no sistema do proprietário**: a troca aparece **ao vivo** na tela **Resgates** do portal ("Mesa 3 · Sorvete 2 bolas · K7QM · 20:41"). Ele compara com o comprovante e entrega.
5. A troca é **final** (não há "Já recebi" nem devolução automática). Se houve erro (prêmio acabou), o **gerente estorna** os pontos no portal, com justificativa registrada.
6. O proprietário vê **cada troca em números** no dashboard (seção 9).

**Onde o garçom confere:** no **portal do proprietário/gerente** (por exemplo um tablet ou computador no caixa) e, **se o restaurante usar o link da equipe**, numa aba **Resgates** só de leitura, com busca pelo código. **Não exige nenhuma ação**: o botão **Conferido** é opcional; quando usado, a troca fica marcada "conferida pela equipe".
**Regras:** troca só com **sessão de mesa ativa**; **1 troca por visita**; **desconto na conta** é aplicado pelo garçom no caixa e fica listado em Resgates com o teto e a conta mínima; a promoção de aniversário **não acumula** com troca de pontos.

## 6.1 Meu aniversário (promoção desvinculada do clube)
Funciona **sem cadastro e sem pontos**. É divulgado **antes de tudo**, para ninguém ser pego de surpresa com a regra dos convidados.
- **Onde aparece:** cartão de destaque no **topo da Home**, item exclusivo **"Meu aniversário"** no app, e uma **página pública** (`/#/aniversario`) para o restaurante **divulgar nas redes sociais** antes da visita, com o link e a regra. O onboarding orienta o estabelecimento a divulgar.
- **Mimo para quem faz aniversário** (configurável; teste: **sobremesa da casa**), mediante **documento** conferido pelo garçom.
- **Condição para os convidados** (configurável; teste: **50% de desconto na comida do pedido do aniversariante** com **no mínimo 5 acompanhantes**, **não vale bebida**). Pode ser desligada.
- **Janela:** no dia do aniversário (teste: na semana do aniversário). Configurável.
- **Como usa:** na mesa, o cliente toca **Mostrar ao garçom** na tela "Meu aniversário" (animada, com a regra) e o garçom confere o **documento**. O uso aparece em **Resgates** do portal como "Aniversário · Mesa 3 · hora", para entrar nos números.
- **Não acumula** com troca de pontos e **não dá pontos**.
- A tela mostra as regras completas antes de qualquer botão, e a página pública deixa claro "**válido mediante documento e condições do restaurante**".

## 6.2 Cliente do mês
Escolhido por **dias com visita completa** no mês (empate: quem completou a primeira visita antes). Recebe **brinde** (configurável, ex.: camiseta ou caneca), **+200 pontos** (teste) e **divulgação nas redes sociais, só se autorizou** no cadastro. O cliente vê **apenas a própria contagem** de visitas no mês; o ranking com nomes é só do proprietário.

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
Cada visita completa vale 60 pontos. Pelo custo real dos prêmios acima, 1000 pontos custam ao restaurante em torno de R$ 20 em produto: **cerca de R$ 1,20 por visita** em prêmios de produto (mais se o cliente preferir o desconto). O portal mostra o **custo médio por visita** e avisa quando passa de um limite que o dono define.

### 7.3 Alavancas de dificuldade (todas parâmetros do dono)
1. **Preço em pontos** crescente e não linear.
2. **Visitas mínimas** nos prêmios grandes (a pizza exige 8 visitas completas diferentes): não dá para ganhar com ações de intenção.
3. **Teto de 150 pontos por mês** para ações de intenção.
4. **1 troca por visita** e **estoque mensal** por prêmio.
5. **Validade dos pontos**: 12 meses sem atividade.
6. **Conta mínima e teto** nos descontos.

### 7.4 Ritmo com os pontos de teste
Cadastro, perfil, Instagram e Google somam **100 pontos** logo no começo.
- **1 visita por semana** (≈ 60 + bônus mensal): sorvete (200) na **3ª visita**; desconto (500) com cerca de **8 visitas** (~2 meses); pizza (1000) com cerca de **15 visitas** (~3,5 meses).
- **2 visitas por semana**: pizza em cerca de **2 meses**.
- Trocar o sorvete aos 200 afasta a pizza em ~3 visitas. A escolha é do cliente: **trocar já ou continuar somando**.

## 8. Antifraude (sem a equipe)
- **Presença física:** só pontua com **sessão de placa** (NFC/QR da mesa) e **login**.
- **Tempo e interação mínimos** para a visita completa; **1 por dia**.
- **Uma conta por e-mail confirmado**; no máximo 2 contas por aparelho.
- **Equipe do restaurante não pontua.**
- **Extrato imutável e idempotente**: o mesmo evento nunca pontua duas vezes.
- **Comprovante** com código e tela animada, válido 30 min; o garçom **confere no sistema**; troca limitada a **1 por visita**.
- **Alertas no portal:** muitas visitas por pouco tempo, mesma pessoa em muitas contas, indicações em ciclo (A indica B e B indica A), resgates concentrados, trocas **não conferidas**, comprovantes mostrados sem aparecer em Resgates.
- **Ajuste manual** de pontos: gerente com teto e justificativa obrigatória.
- **Limite de dano:** como cada risco é limitado por regra, o pior caso de uma fraude é um prêmio isolado, nunca um prejuízo aberto.

## 9. Dashboard do proprietário (clube)
Sem valores de venda. Mede o clube pelo que o sistema vê.
| Bloco | Métricas |
|---|---|
| **Adesão** | cadastros, membros ativos (visita nos últimos 30 dias), taxa de cadastro, indicações confirmadas |
| **Presença** | visitas completas, visitas por membro, retorno em 7 e 30 dias, novos × recorrentes, **mapa de horário e dia** |
| **Pontos** | emitidos por tipo (presença, retorno, indicação, divulgação, relacionamento), trocados, **saldo em carteira**, vencendo em 30 dias |
| **Resgates** | por prêmio, taxa de troca, tempo até a troca, **conferidos pela equipe × não conferidos**, estornos |
| **Economia** | **custo médio por visita**, **passivo de pontos** (saldo × custo médio por ponto), custo dos prêmios trocados, prêmios acima do limite de retorno |
| **Qualidade** | alertas de fraude, trocas **não conferidas**, contas suspeitas |
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
**Parâmetro do dono:** pontos de cada ação e limites; campanhas com prazo; critérios da visita completa (tempo e pratos vistos); catálogo de prêmios (preço em pontos, teto, conta mínima, visitas mínimas, estoque, validade do comprovante, horários); marcos da barra; validade dos pontos; teto das ações de intenção; limite de custo por visita; aniversário; cliente do mês; nome do programa; regulamento.

## 12. Configuração de teste para o GastroPub
| Item | Valor |
|---|---|
| Visita completa | +60 (1 por dia; sessão ≥ 30 min e ≥ 3 pratos vistos) |
| Voltar em 7 dias / bônus de 3 visitas no mês | +40 / +60 |
| Mesa cheia (3+ membros logados) | +20 cada |
| Indicar amigo (após a 1ª visita dele) | +100 |
| Cadastro (já dá pontos) / perfil completo | +30 / +20 |
| Instagram / Google / compartilhar / pesquisa | +20 / +50 / +10 / +10 (teto 150 por mês) |
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
| Portal do proprietário (`docs/08`) | Nova tela **Resgates** (ao vivo, com busca por código, estorno, marcar "conferido"); bloco **Aniversário**; bloco **Redes e alcance** |
| Link da equipe (garçons) | **Opcional.** Ganha uma aba **Resgates** só de leitura, além da fila de chamados. Não entra campo de valor da conta |
| App do cliente | Home com cartão **Meu aniversário**; página pública `#/aniversario`; aba Prêmios com troca imediata |
| `CLAUDE.md` e `docs/09` | Regras já alinhadas; módulo `loyalty_spend` desligado |
| Banco (P5) | Saldo e acumulado, catálogo, **troca imediata com débito**, estorno, visita completa, indicação, tetos, benefícios de aniversário (eventos), conferência |

## 14. Pendências e premissas que adotei (confirme)
1. **Visita completa:** 30 minutos de sessão e 3 pratos vistos, 1 por dia (você não respondeu; mantive).
2. **Indicar amigo +100** (idem, mantido).
3. **Comprovante de troca válido 30 min** e **sem cancelamento** (troca final; estorno pelo gerente).
4. **Conferência dos resgates:** no portal do proprietário/gerente e na aba **Resgates** do link da equipe (leitura). Alguém precisa olhar uma tela no momento da entrega; é isso que impede comprovante falso.
5. **Meu aniversário:** mimo (sobremesa) mais promoção para convidados, ambos configuráveis; **dia** ou **semana** do aniversário.
6. **Varredura de hashtags:** Fase 3, só com conta Instagram Business e aprovação da Meta, medindo "publicações encontradas", não alcance.

# Toque Premiado: definição final proposta (mecânica, dinâmica e fluxo)

Versão 20/11/2026. Reúne o que você definiu agora com o que já estava decidido. **Substitui** o que for conflitante em `docs/06`, `07` e `08` (a lista está na seção 13). Valores abaixo são **de teste para o GastroPub**; a dinâmica é fixa e todo parâmetro é do proprietário.

## 1. A dinâmica em 6 linhas
1. O cliente **acumula pontos** por **consumo** (R$ da conta) e por **ações que beneficiam o restaurante** (venda ou divulgação).
2. Os pontos formam um **saldo** que **só sobe até o cliente decidir trocar**.
3. Existe um **catálogo de prêmios com preço em pontos** (sorvete, bebida, petisco, sobremesa, desconto na conta, pizza…). Cada produto tem seu valor em pontos.
4. Ao alcançar o preço de um prêmio, ele fica **liberado**; o cliente **troca agora ou continua somando** para prêmios maiores.
5. **Trocar desconta** os pontos do saldo; o contador de **pontos acumulados na vida** nunca diminui.
6. Para trocar, o cliente mostra o pedido ao garçom; ele **confirma no sistema** e o proprietário vê tudo no painel dele.

## 2. O que você trouxe, batido com o que já havia
| Sua ideia | Já estava definido? | Resultado |
|---|---|---|
| Pontos por consumo, conforme o valor | **Não.** Só havia visita e ações | **Novo.** Entra como principal fonte de pontos (seção 4) |
| Ações que dão pontos (venda ou divulgação) | Sim: 7 ações | **Mantido e ampliado** com indicação de amigo e campanhas; valores recalibrados |
| Prêmios intermediários e prêmio máximo | Sim: 100/300/600/1000 | **Substituído** pelo seu exemplo (200 sorvete, 500 desconto, 1000 pizza) como configuração de teste |
| Não zerar o contador | Parcial ("saldo que se gasta") | **Refinado:** dois contadores, saldo (gasta) e acumulado na vida (nunca diminui) |
| Cada produto com valor em pontos; cliente escolhe trocar ou somar | Parcial (prêmios por nível) | **Novo:** catálogo com preço em pontos; troca por escolha |
| Dificuldade considerável nos prêmios grandes | Parcial | **Detalhado** (seção 7): preço, teto, visitas mínimas e limite de pontos sem consumo |
| Bebidas, sobremesas, petiscos no catálogo | Parcial | **Mantido** |
| Pontos descontados ao trocar | Sim | **Mantido** |
| Proprietário vê o pedido na plataforma; cliente mostra ao garçom, que confirma | Parcial (campo "Validar cupom") | **Melhorado:** o resgate **aparece na fila do painel da equipe** como um chamado, o garçom só toca **Concluir** |
| Dashboard do proprietário | Sim | **Ampliado** com consumo dos membros e retorno do clube (seção 9) |
| Aniversário e cliente do mês | Sim | **Mantidos à parte**, não dependem de pontos |

## 3. Os conceitos
- **Saldo**: pontos disponíveis para trocar. Sobe com ganhos; **desce ao trocar**.
- **Acumulado na vida**: soma de tudo que o cliente já ganhou. **Nunca desce.** Base para níveis futuros e para métricas.
- **Catálogo de prêmios**: lista do proprietário. Cada prêmio tem **nome, descrição, imagem, preço em pontos, tipo** (produto, desconto na conta, brinde), **teto** (se for desconto), **conta mínima**, **visitas mínimas** (opcional), **limite por mês** (estoque), **validade do cupom**, **dias e horários em que vale**, ativo/inativo.
- **Marcos**: os 3 ou 4 prêmios que o proprietário destaca na barra de progresso (ex.: 200, 500, 1000). São só vitrine do catálogo, **não são regras separadas**.
- **Prêmio liberado**: o saldo já cobre o preço. Aparece em "Você pode trocar".
- **Resgate**: o pedido de troca, com estados (seção 6).

## 4. Como se ganha pontos
Regra de ouro: **venda vale muito mais que divulgação**. O consumo é a fonte principal; as ações sem consumo têm **teto mensal**.

### 4.1 Consumo (vendas) , principal
| Regra de teste | Valor |
|---|---|
| Pontos por consumo | **1 ponto por R$ 1,00** da conta (parâmetro do dono) |
| Base de cálculo | valor **pago**, **sem a taxa de serviço** e **sem a parte paga com prêmio** |
| Multiplicador por categoria (opcional) | ex.: sobremesa ×2 para estimular; bebida ×1 |
| Quem recebe | o **cliente que pediu a conta** (ver 5.2) |
| Verificação | **o garçom informa o valor** ao concluir a conta |

### 4.2 Ações de venda
| Ação | Pontos (teste) | Limite | Verificação |
|---|---|---|---|
| Provar um prato marcado como "novidade" | +30 | 1 por prato novo | garçom confirma |
| Mesa grande: 5 ou mais pessoas na conta | +50 | 1 por visita | garçom informa o nº de pessoas |
| Voltar em até 7 dias | +50 | 1 por semana | automática |
| Visita em dia de baixo movimento (campanha) | +30 | por campanha | automática |
| Bônus de frequência: 3 visitas no mês | +50 | 1 por mês | automática |

### 4.3 Divulgação
| Ação | Pontos (teste) | Limite | Verificação |
|---|---|---|---|
| Seguir no Instagram | +20 | 1 vez | toque no link (intenção) |
| Avaliar no Google | +50 | 1 vez | toque no link (intenção) |
| Compartilhar com a marca | +10 | 1 por semana | toque (intenção) |
| **Indicar um amigo** | +100 | por amigo | **automática**: o amigo se cadastra pelo link **e** tem a primeira conta lançada |

### 4.4 Relacionamento
Cadastro +30 (1 vez) · Responder à pesquisa da visita +10 (1 por visita) · Completar o perfil (aniversário) +20 (1 vez).

### 4.5 Teto das ações sem consumo
**No máximo 150 pontos por mês** vêm de ações que não sejam consumo (exceto indicação confirmada). Impede subir de nível sem comprar.

## 5. O fluxo da conta (como o consumo vira pontos)
1. O cliente (logado) toca **Pedir a conta**. Vira um chamado na fila da equipe.
2. O garçom leva a conta e, no painel, toca **Concluir**.
3. O painel abre um campo opcional **"Valor da conta (R$)"** com teclado numérico, e **"Pessoas na mesa"** (opcional, para o bônus de mesa grande).
4. Ao confirmar, o sistema credita os pontos ao cliente que pediu a conta e avisa no app: "**Conta de R$ 240,00: você ganhou 240 pontos**". Se deixar em branco, **não há pontos de consumo** (só ações automáticas).
5. Se o cliente que pediu a conta **não** estiver logado, o app mostra o convite ao cadastro; **não há pontos retroativos** por conta não vinculada.

### 5.1 Se o valor lançado estiver errado
O gerente corrige no portal (**estorno** da linha antiga e **nova linha** de crédito, ambas registradas). Nada é apagado.
### 5.2 Mesa com várias pessoas
No começo, **os pontos vão para quem pediu a conta**. Dividir a conta entre os presentes fica como evolução (cada pessoa confirma sua parte), para não permitir que todos reclamem a conta inteira.
### 5.3 Esforço da equipe
O passo extra do garçom é **um campo numérico** em uma tela que ele já usa. Se ele não preencher, o sistema funciona, apenas sem os pontos. Integração com o caixa/PDV tira esse passo (Fase 3).

## 6. O fluxo de troca de pontos
1. Na aba **Prêmios**, o cliente vê **Seu saldo**, a **barra com os marcos**, a lista **Você pode trocar** (prêmios liberados) e o catálogo completo com o que falta para cada um.
2. Ele escolhe um prêmio e toca **Trocar**. O app mostra as regras (conta mínima, teto, validade) e pede confirmação.
3. O sistema **reserva** os pontos e cria o **resgate**, que **aparece na fila do painel da equipe** como: "**Mesa 3 · Resgate: Sorvete 2 bolas · K7QM**".
4. O cliente mostra o cupom ao garçom (código grande, contagem regressiva de 24 h).
5. O garçom toca **Assumir** e, ao entregar (ou aplicar o desconto na conta), **Concluir**. Os pontos são **descontados de vez** e o resgate fica registrado.
6. **Cancelar** ou **vencer** sem uso: os pontos **voltam** ao saldo, automaticamente.
7. O proprietário vê o resgate no portal em tempo real, com quem confirmou e quando.

**Estados do resgate:** `RESERVADO → ASSUMIDO → CONCLUÍDO`, ou `CANCELADO`, ou `VENCIDO` (devolve).
**Regras:** só com **sessão de mesa ativa** (o cliente precisa estar no restaurante); **1 resgate por visita**; não acumula com a promoção de aniversário; prêmio de **desconto na conta** é aplicado pelo garçom no caixa, e a base dos pontos dessa conta **desconta** o valor do próprio desconto.

## 7. A economia: como fazer o prêmio grande ser difícil
### 7.1 O seu exemplo com números de teste (1 ponto = R$ 1)
| Prêmio | Pontos | Valor do prêmio | **Retorno nominal** (valor ÷ gasto necessário) | **Custo real** para o restaurante |
|---|---:|---|---:|---|
| Sorvete com 2 bolas | 200 | R$ 12 (preço) | 6,0% | ~R$ 4 (≈ 2%): custo do produto |
| 30% de desconto na conta | 500 | R$ 45 numa conta de R$ 150 | 9,0% | **R$ 45 (9%)**: desconto é custo cheio |
| Pizza à escolha | 1000 | R$ 65 (preço) | 6,5% | ~R$ 20 (≈ 2%): custo do produto |

**Leitura:** os prêmios em **produto** custam ~2% da venda gerada; o **desconto na conta** é o mais caro. Por isso recomendo:
- **Teto no desconto**: "30% até R$ 30" e **conta mínima de R$ 80** (retorno efetivo ~6%).
- Manter o **retorno nominal entre 5% e 8%** (faixa comum em programas de fidelidade). O portal **calcula e avisa** quando um prêmio passa de um limite que o proprietário define (padrão 10%).

### 7.2 Alavancas de dificuldade (todas parâmetros do dono)
1. **Preço em pontos** crescente e não linear (o prêmio grande custa mais por real do que o pequeno).
2. **Visitas mínimas** em prêmios altos (ex.: pizza exige 6 visitas diferentes): uma única conta gigante não compra o prêmio máximo.
3. **Teto mensal de pontos sem consumo** (150).
4. **Limite de resgates** por visita (1) e por mês (estoque por prêmio).
5. **Validade dos pontos**: 12 meses sem atividade; qualquer visita renova.
6. **Conta mínima e teto** nos descontos.

### 7.3 Ritmo com os valores de teste
Cliente que gasta R$ 80 por visita e vem 1 vez por semana ganha cerca de 320 pontos/mês.
- Sorvete (200): ~3 semanas · 30% de desconto (500): ~6 semanas · Pizza (1000): **~3 meses**, com 6+ visitas.
- Se trocar o sorvete aos 200, a pizza se afasta em ~2,5 semanas. É a escolha do cliente: **trocar já ou ir somando**.

## 8. Antifraude e conciliação
- **Garçom lança o valor**: cada lançamento guarda **aparelho (rótulo), horário, mesa e valor**; o portal mostra por aparelho: contas lançadas, valor médio e **desvios** (valores muito acima da média, muitos pontos para a mesma pessoa).
- **Conciliação diária**: "total lançado no clube hoje" para o dono comparar com o caixa; divergência grande vira alerta.
- **Pontos só com sessão de mesa e login**; equipe do restaurante **não pontua**.
- **Uma conta por e-mail confirmado**, no máximo 2 contas por aparelho.
- **Extrato imutável e idempotente**: o mesmo evento nunca pontua duas vezes; estorno é nova linha.
- **Alertas**: muitos pontos em pouco tempo, indicação em ciclo (A indica B, B indica A), ajuste manual frequente, resgates concentrados.
- Ajuste manual de pontos: gerente com **teto** e **justificativa obrigatória**; acima do teto, só o proprietário.

## 9. Dashboard do proprietário (clube)
**Importante:** como a equipe lança o valor das contas dos membros, o portal **passa a mostrar o consumo dos membros** rotulado como **"valor lançado pela equipe"**. É uma exceção consciente à regra de não mostrar vendas, e **não é o faturamento do restaurante**.

| Bloco | Métricas |
|---|---|
| **Adesão** | cadastros no mês, membros ativos (visita nos últimos 30 dias), taxa de cadastro sobre sessões, indicações confirmadas |
| **Consumo dos membros** | valor lançado, contas lançadas, **ticket médio dos membros**, frequência (visitas por membro), retorno em 7 e 30 dias |
| **Pontos** | emitidos (por consumo, por venda, divulgação, relacionamento), trocados, **saldo em carteira**, vencendo nos próximos 30 dias |
| **Resgates** | por prêmio, taxa de troca, tempo até a troca, devolvidos e vencidos, quem confirmou |
| **Economia** | **retorno efetivo** (custo dos prêmios ÷ consumo lançado), **passivo de pontos** (saldo × custo médio), custo por prêmio, prêmios fora da faixa de retorno |
| **Qualidade** | contas sem valor lançado (pontos perdidos), por aparelho; divergência com o caixa; alertas de fraude |
| **Ranking** | cliente do mês (dias com visita) e top consumo (só para o proprietário, com autorização de divulgação para o público) |
Cada número com definição visível e "dados insuficientes" abaixo da amostra mínima.

## 10. Regras de borda
- **Conta corrigida:** estorno + novo crédito, ambos no extrato.
- **Cupom vencido:** pontos voltam; o resgate fica como `VENCIDO`.
- **Prêmio sem estoque no mês:** o cliente vê "esgotado neste mês" e os pontos ficam.
- **Troca sem mesa/sessão:** bloqueada com a mensagem "aproxime o celular da placa da sua mesa".
- **Pontos expirando:** aviso no app 30 dias antes.
- **Cliente excluído (LGPD):** apaga dados pessoais; o extrato permanece anonimizado.
- **Mudança de regras pelo dono:** vale daí em diante; **não altera** pontos já ganhos nem resgates em andamento.
- **Mudança de preço de um prêmio:** resgates já reservados mantêm o preço da reserva.

## 11. O que o proprietário configura (e o que é fixo)
**Fixo (a dinâmica):** saldo e acumulado; catálogo com preço em pontos; troca por escolha; reserva e devolução; resgate na fila da equipe; extrato imutável; auditoria.
**Parâmetro do dono:** pontos por R$ e multiplicadores, valor e limite de cada ação, campanhas com prazo, catálogo de prêmios (preço, teto, conta mínima, visitas mínimas, estoque, validade, horários), marcos da barra, validade dos pontos, teto sem consumo, retorno efetivo máximo, aniversário, cliente do mês, nome do programa, texto do regulamento.

## 12. Configuração de teste para o GastroPub
| Item | Valor |
|---|---|
| Pontos por consumo | 1 por R$ 1,00 (sem taxa de serviço) |
| Cadastro / perfil completo | +30 / +20 |
| Instagram / Google / compartilhar | +20 / +50 / +10 |
| Indicar amigo (após 1ª conta) | +100 |
| Bônus 3 visitas no mês / voltar em 7 dias | +50 / +50 |
| Teto sem consumo | 150 por mês |
| Prêmios | **200** Sorvete 2 bolas · **350** Refrigerante ou entrada · **500** 30% de desconto na conta (teto R$ 30, conta mínima R$ 80) · **1000** Pizza à escolha (6 visitas mínimas) |
| Marcos na barra | 200, 500, 1000 |
| Validade dos pontos | 12 meses sem atividade |
| Cupom | 24 h, uso único, 1 por visita |
Os preços dos produtos (sorvete, entrada, pizza) são **suposições** a trocar pelos reais.

## 13. O que muda nos outros documentos e no sistema
| Onde | Mudança |
|---|---|
| `docs/06` e `docs/07` | Tabelas de pontos e prêmios (100/300/600/1000) substituídas por esta definição |
| Painel da equipe | **Concluir** conta passa a abrir "Valor da conta" (opcional); **resgates entram na fila** como chamados; sai o campo "Validar cupom" (fica só como alternativa pelo código) |
| Regra 8 do `CLAUDE.md` e `docs/08` §4.10 | Passam a permitir **"valor lançado pela equipe"** dos membros, rotulado, sem afirmar faturamento |
| `docs/08` §3.5 e §4.6 | Ampliados com consumo, catálogo com preço, saldo e acumulado, indicação |
| Banco | Novas tabelas e funções do P5 (extrato, saldo, acumulado, catálogo, resgate como tipo de chamado, indicação, teto sem consumo) |

## 14. Decisões que ainda preciso de você
1. **Como o valor da conta chega ao sistema** (garçom digita no painel é a recomendação).
2. **Quem recebe os pontos da mesa** (quem pediu a conta, sem divisão no começo).
3. **Base dos pontos**: sem taxa de serviço e sem a parte paga com prêmio. Bebida alcoólica pontua igual?
4. **Teto no desconto de 30%** (R$ 30 e conta mínima R$ 80) e faixa de retorno de 5% a 8%.
5. **Visitas mínimas** nos prêmios grandes (ex.: pizza exige 6 visitas).
6. **Teto de 150 pontos por mês** para ações sem consumo.

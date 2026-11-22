# Revisão das telas aprovadas (pacote de 22/11/2026)

35 imagens (`SEMRESERVAS_Telas_Aprovadas.zip`, no Drive; cópias em WebP em `docs/design/telas-v1/`, 4,5 MB). Conferi cada uma contra as definições atuais (`docs/06` a `docs/10`).

**Resumo:** a **linha visual está aprovada e muito boa** (vinho, terracota e creme, logo do GastroPub, ícone de mão para chamar garçom, cartões consistentes). O pacote foi feito com a **especificação antiga do pacote v4**. Por isso: 14 telas do restaurante, em sua maioria, **servem com pequenos ajustes**; a **tela do clube precisa ser refeita**; **faltam 14 telas** das definições novas; e as **19 telas de delivery** são de outro módulo.

Legenda: ✅ mantida · 🔧 ajustar · 🔁 refazer · ➕ falta · 📦 outro módulo

## 1. Telas do restaurante (pasta 01)
| # | Tela | Status | Observação |
|---|---|:-:|---|
| 01 | Início | 🔧 | Falta o botão **Entrar** no cabeçalho (visitante), o cartão **"Meu aniversário"** e o aviso de cadastro **fechável**. O cartão "Clube SemReservas GastroPub" vira **"Toque Premiado"**. Rodapé institucional discreto no fim. Barra inferior: ver decisão 1 |
| 02 | Cardápio (explorar) | 🔧 | Chips de categoria: acrescentar **Massas, Testes, Petiscos**. Legenda com "…mais", Adicionar e "Projete na mesa" estão certos |
| 03 | Cardápio em lista | ✅ | Só acrescentar as novas categorias nos chips |
| 04 | Detalhe do prato | 🔧 | **Remover o coração e o balão de comentário** da lateral (curtir e comentar só depois da conta) |
| 05 | Meu pedido | 🔧 | **Um único botão: "Chamar garçom"** (hoje tem dois: "Chamar o garçom" e "Mostrar pedido"). Retirar a frase "sem os 10% do garçom", que não foi definida |
| 06 | Garçom a caminho | 🔧 | Acrescentar o botão **"Fazer outro pedido"**. O resto (Mesa 3, código K7QM, "Mostre esta tela ao garçom", lista sem preço) está certo |
| 07 | Atendimento | ✅ | Chamar garçom e Pedir a conta. Opcional: "Tirar uma dúvida" |
| 08 | **Meu Clube (pontos)** | 🔁 | **Refazer inteira** com o Toque Premiado: Saldo e Acumulado, marcos 200/500/1000, "Você pode trocar", catálogo, como ganhar pontos, extrato. Hoje mostra "Compra confirmada +40 pontos" (pontos por compra não existem) e diz que **não há pontos por Instagram**, o que contraria a definição |
| 09 | Fotos com moldura | 🔧 | Ótima. Acrescentar a etiqueta **"+15 pontos"** ao baixar |
| 10 | Três molduras | ✅ | Material de arte |
| 11 | Pesquisa rápida | 🔧 | Acrescentar "+10 pontos". Já diz que a participação pode gerar pontos |
| 12 | Siga-nos no Instagram | 🔧 | Acrescentar **"+20 pontos"** (a frase "ação pontuável no Clube" já está lá) |
| 13 | Avalie-nos no Google | ✅ | **Sem pontos**: ver decisão 2. O texto "Sua avaliação é livre" está certo |
| 14 | Projete na mesa 3D | 🔧 | É uma maquete. A tela real já existe e é diferente: cartão com nome e medida, régua, botões **Fixar aqui / Mover o prato / Tamanho / Ingredientes**. Pedir uma versão no mesmo estilo (T13) |

## 2. Conta e institucional (pasta 04)
| Tela | Status | Observação |
|---|:-:|---|
| Minha conta | 🔧 | Boa. Acrescentar **data de aniversário**, "Toque Premiado" no lugar de "Meu Clube", **indicar um amigo** e **sair** |
| Sobre SEMRESERVAS e Uman | 🔧 | Boa. **Trocar o slogan "Muito além da mesa"** (antigo, retirado pela identidade aprovada) por **"Um toque. Infinitas possibilidades."** Texto "Falar com a SEMRESERVAS" ok nesta tela |

## 3. Delivery (pastas 02 e 03): 19 telas
| Pasta | Status | Observação |
|---|:-:|---|
| 02 Pedir de casa (13 telas) | 📦 | Jornada completa de **delivery** (identificação, conta, entrega ou retirada, endereço, histórico, carrinho, repetir pedido, WhatsApp, confirmação). Pertence ao módulo `order_whatsapp` (Fase 2 ou 3). **Fora do escopo do teste do GastroPub**; ficam como referência |
| 03 Clube delivery (6 telas) | 📦 | Clube **por número de pedidos** ("8 de 10 pedidos", recompensa no pedido seguinte, expira em 30 dias). É **outra mecânica**, diferente do Toque Premiado por pontos. Ver decisão 3 |
**Conflito de login:** as telas de delivery mostram **Continuar com Google** e **e-mail com senha**; a definição do clube prevê **e-mail com código**. Ver decisão 4.

## 4. O que falta (14 telas das definições novas)
| Código | Tela | Prioridade |
|---|---|:-:|
| T1 | **Entrada** (Entrar no Toque Premiado ou continuar sem cadastro) | alta |
| T-LOGIN | **Entrar ou cadastrar** (nome, e-mail, aniversário, regulamento, autorização de divulgação) | alta |
| T8 | **Prêmios / Toque Premiado** (logado e visitante) | **alta (a que você pediu)** |
| T9 | **Comprovante da troca** (a "arte" para mostrar ao garçom) | alta |
| T-EXTRATO | **Extrato de pontos** | média |
| T-INDICAR | **Indicar um amigo** (+100) | média |
| T7 | **Pós-conta** (curtir pratos, nota, comentário, Instagram) | média |
| T-COMENTARIO | **Comentar um prato** (+20) e **Dar nota** | média |
| T16 | **Meu aniversário** (app e página pública) | alta |
| T17 | **Confirmar presença** (localização) | alta |
| T12 | **Sessão vencida** | média |
| T13 | **RA real** no estilo do app | baixa |
| T14 | **Painel do dono** (computador) | média (depende de decisão do portal) |
| T15 | **Link da equipe** (fila de chamados, só isso) | média |

## 5. Decisões que preciso de você
1. **Barra inferior:** as telas usam **Início, Cardápio, Pedido, Clube e Sobre**, com os serviços (Wi-Fi, Pedir a conta, Fotos com moldura, Pesquisa, Instagram, Google) **na Home**. Minha especificação tinha **"Serviços"** no lugar de "Sobre". A versão das telas é melhor: os serviços já aparecem na Home e "Sobre" guarda conta e institucional. **Recomendo adotar a das telas**, trocando só "Clube" por **"Prêmios"**.
2. **Google sem pontos (recomendo).** O pacote original já dizia que a avaliação no Google é espontânea, e a **política do Google proíbe oferecer algo em troca de avaliações**: o perfil do restaurante pode ter avaliações removidas ou ser penalizado. Eu havia colocado +50 pontos. **Mudei para 0 por padrão** (o dono pode ligar, assumindo o risco). Instagram continua com pontos.
3. **Delivery e o clube:** quando o módulo delivery entrar, o clube dele será **por pedidos (10 pedidos)** ou **o mesmo Toque Premiado por pontos**? Recomendo **um clube só (pontos)**, para o cliente não ter dois programas. Se for por pedidos, é uma segunda mecânica a construir.
4. **Login do cliente:** **e-mail com código** (recomendado, sem senha para esquecer) ou também **Google** como atalho, como nas telas de delivery?
5. **O que fazer com o delivery agora:** deixar de lado até o módulo entrar (recomendado).

## 6. Como seguir
1. Você decide 1 a 5.
2. Cole o **prompt de ajustes** (`PROMPT-AJUSTES-TELAS-CHATGPT.md`) na conversa do ChatGPT: ele corrige as 🔧, refaz a 🔁 e cria as ➕.
3. Com as telas finais, eu implemento o layout (Bloco A) seguindo este mapa.

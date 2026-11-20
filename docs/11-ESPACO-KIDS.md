# Espaço Kids: análise de viabilidade (20/11/2026)

**Conclusão em uma linha:** vale a pena como **módulo opcional, pequeno e sem coleta de dados**, mas **não agora**. Entra depois do clube e dos portais, e **só depois de validar com um restaurante familiar** (a Pulpo, pizzaria) antes de construir para um gastropub, onde criança é exceção.

## 1. A ideia
Uma área do app, ligada só nos restaurantes que quiserem (módulo `kids`), com **jogos e quizzes simples e educativos** para a criança se entreter na mesa. **Sem cadastro, sem pontos, sem login.**

## 2. Vale a pena?
**A favor**
- Diferencial real para restaurantes **familiares** (pizzaria, rodízio, buffet, almoço de domingo).
- Pais ficam à vontade, **a mesa fica mais tempo** (mais sobremesa e bebida) e a criança deixa de pedir o celular do pai para outra coisa.
- **Baixo custo recorrente:** jogos rodam no próprio celular, sem servidor.
- Combina com a marca do restaurante (jogos com os pratos do cardápio) e ensina a **"comer bem"** de forma leve.

**Contra / riscos**
- **Legal e privacidade (o ponto mais sério).** Criança é público protegido: a LGPD (art. 14) e a legislação recente de proteção de crianças no ambiente digital (ECA Digital) exigem cuidados com dados e design. **A regra segura é não coletar nada**: sem login, sem identificadores, sem anúncios, sem links externos, sem estatística que identifique a pessoa. **Precisa de revisão jurídica** antes de ligar (já está na lista de pendências do projeto).
- **Distração dos pais e do restaurante:** alguns restaurantes não querem criança com celular na mesa. Por isso é **opcional por restaurante**.
- **Conteúdo é o custo escondido:** um jogo bom se faz em dias; **variedade** (para a criança não enjoar) exige conteúdo novo e arte.
- **Uso indevido:** a criança pode tocar em "Chamar garçom" ou em pedidos sem querer. O Espaço Kids precisa ser uma **tela isolada** (seção 4).
- **Bateria e desempenho** do celular dos pais.
- **Faixa etária ampla:** o que serve aos 4 anos não serve aos 10. Começar com **4 a 9 anos**.
- O **ganho é difícil de provar** (não dá para atribuir mais consumo ao jogo com honestidade). Mediremos **uso**, não venda.

**Veredito:** só se compensa onde há **crianças com frequência**. Para o GastroPub, **baixa prioridade**; para a Pulpo, **vale testar**.

## 3. Como funcionaria (versão 0 proposta)
1. **Entrada:** cartão **"Espaço Kids"** na Home (só se o módulo estiver ligado). Toque abre uma tela cheia colorida, com 3 jogos.
2. **Modo isolado:** nessa tela **não existem** Chamar garçom, Pedido, Prêmios, Entrar nem links para fora. O único botão para sair é **"Voltar para o cardápio"**, protegido por **portão para adultos** (segurar 3 segundos ou resolver uma conta simples).
3. **Sem dados:** nenhum cadastro, nenhum pontos, nenhum id; **nada sai do aparelho**. Funciona **offline** depois da primeira abertura.
4. **Sem pontos:** crianças **não** pontuam no Toque Premiado, nem os pais "por" elas. Isso evita coletar dado de menor e evita incentivo a deixar a criança jogando.
5. **Pausa saudável:** a cada ~10 minutos aparece "Que tal um suco? Chame um adulto!" (sugestão, sem bloquear).
6. **Visual:** usa a **paleta e o logo do restaurante**, ilustrações simpáticas, botões grandes, letras grandes, **sem texto longo** (a criança pode não ler bem), áudio **desligado por padrão** com um botão de som visível.

## 4. Os jogos da versão 0 (3 jogos, 100% locais)
| Jogo | O que é | Educativo | Esforço |
|---|---|---|---|
| **Memória dos pratos** | Pares de cartas com fotos de comida (do cardápio ou ilustradas) | memória, atenção, nomes de alimentos | ~2 dias |
| **Quiz da comida** | 10 perguntas de múltipla escolha com figuras ("Qual destes vem da vaca?", "De onde vem o queijo?") | ciências, alimentação, cores | ~3 dias + conteúdo |
| **Monte a sua pizza (ou hambúrguer)** | Arrastar ingredientes para montar o prato e **ver o resultado**; sem score | criatividade, sequência | ~3 dias + arte |
Depois, se houver uso: **ligue os pontos / labirinto**, **diferenças entre duas imagens**, **colorir** (toque para pintar) e **ache o item escondido**. Cada novo jogo: ~2 a 4 dias.

## 5. Como seria construído
- **Telas leves**, carregadas só quando a criança entra (lazy), em **React + Canvas/DOM**, sem biblioteca de jogos pesada; meta de **menos de 300 KB** de código por jogo e imagens em WebP.
- **Conteúdo como dado:** as perguntas e os pares ficam em arquivos que o Master pode atualizar; **modelos de quiz por faixa etária**.
- **Módulo `kids`** ligado e desligado pelo Master e pelo proprietário (por restaurante).
- **Arte:** gerada com o ChatGPT/ferramentas de imagem, a partir do estilo do restaurante (prompts a preparar).
- **Métricas só agregadas e anônimas**, no portal do proprietário: quantas vezes o Espaço Kids foi aberto, qual jogo, **tempo médio de uso**. Sem identificar nada.

## 6. Esforço e custo
- **Versão 0 (3 jogos + isolamento + portão + módulo):** ~**2 a 3 semanas** de trabalho, mais a produção de arte e conteúdo (mesmo ritmo dos pratos 3D).
- **Manutenção:** quase zero depois de pronto; custo vem de **novos jogos e conteúdo**.
- **Custo de infraestrutura:** praticamente nenhum (tudo local no aparelho).

## 7. Recomendação por fases
1. **Agora:** nada. Só **reservar o módulo `kids`** (desligado) no desenho dos módulos.
2. **Fase 2 (Pulpo):** perguntar à Pulpo se **crianças são relevantes** e se o restaurante **quer** o recurso. **Alternativa barata para validar**: uma **folha de atividades para imprimir** (colorir e ligar os pontos) com **QR** que leva ao cardápio, sem nenhuma programação.
3. **Depois do clube e dos portais:** se houver interesse real, construir a **versão 0** com os 3 jogos.
4. **Antes de ligar em qualquer restaurante:** **revisão jurídica** (LGPD e proteção de crianças) e texto claro na tela de Pais.

## 8. Decisões que preciso de você
1. **Quer reservar o módulo `kids` desligado agora**, sem construir nada?
2. **Valida primeiro com a Pulpo** (perguntar e testar a folha de atividades impressa) ou prefere já planejar a versão 0?
3. **Faixa etária inicial:** 4 a 9 anos serve?
4. **Sem pontos para crianças:** confirma, para evitar coleta de dados de menores?
5. Os jogos podem **usar as fotos dos pratos do restaurante** ou prefere só ilustrações?

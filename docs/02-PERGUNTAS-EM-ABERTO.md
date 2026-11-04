# Perguntas em aberto

Marcadas **[BLOQUEIA]** impedem o início do código. As demais podem ser respondidas durante a Fase 1.

## Bloqueiam o início

1. **[BLOQUEIA] Stack e onde ficam os dados.** Opções A/B/C em `adr/0001-stack-e-hospedagem.md`. Recomendação: B (telas estáticas no Hostinger + Supabase). Qual é o plano de hospedagem atual do umandigital.com.br (Premium/Business/Cloud)?
2. **[BLOQUEIA] Onde mora o código.** O repositório atual (`umandigital/umandigital`) publica o site da Uman. O SemReservas é outro produto e deve ter **repositório próprio**. Esta pasta `semreservas/` é um ponto de partida e já está excluída do deploy do site (`.deployignore`). Criar o repositório novo `umandigital/semreservas` e migrar?
3. **[BLOQUEIA] Endereço de teste.** Subdomínio (ex.: `teste.semreservas.com.br` ou `semreservas.umandigital.com.br`) é mais limpo que subpasta. O domínio `semreservas.com.br` já é seu? A URL gravada na tag é **permanente**: precisa ser um domínio que você manterá. Recomendo gravar na tag um **domínio curto e estável** que redireciona, nunca o endereço de teste.
4. **[BLOQUEIA] Como o sistema sabe a mesa.** (a) cliente toca o número da mesa numa grade; (b) uma placa fixa por mesa com a mesa gravada na tag; (c) híbrido: placa móvel + grade lembrada na sessão. Recomendação: (c). Quantas mesas tem o GastroPub e elas são numeradas?

## Para responder na Fase 1

5. **Pulpo:** é à la carte, rodízio, delivery ou mais de um? Define módulos da Fase 2.
6. **Cardápio:** aceita busca + opção "ver em lista" além do feed? O pacote proibia a lista (análise U5).
7. **Equipe do GastroPub:** quem vai monitorar o painel? Há tablet Android dedicado que fique ligado e na tomada?
8. **Cardápio real:** itens, preços, fotos e alergênicos do GastroPub, em planilha ou como estiverem.
9. **Marca:** logotipo em vetor (SVG) do SemReservas; o PNG do pacote serve para o protótipo, não para impressão nem para tema escuro.
10. **Canais oficiais:** Instagram, link de avaliação do Google, Wi-Fi guest do GastroPub (campos vazios não aparecem na tela).
11. **Login do cliente (clube):** só na Fase 2/3; por e-mail com código, por WhatsApp ou Google?
12. **Rodízio — limite de pedidos:** quantos pedidos pendentes por mesa ao mesmo tempo?
13. **Buffet do dia:** vale perguntar a dois buffets se atualizariam diariamente antes de construir.
14. **Aspectos legais:** quem revisa política de privacidade, termo de uso e regulamento do clube? Há prazo (Fase 2)?
15. **Preços e trial:** só na Fase 3; o sistema não trava valores.

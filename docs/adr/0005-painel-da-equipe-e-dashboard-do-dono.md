# ADR-0005 — Painel da equipe por link; dashboard do dono com login

**Status:** ACEITO (decisão do fundador, 04/11/2026)

## Painel da equipe (fila de atendimento)
Objetivo: **zero trabalho para o restaurante**. A equipe abre o navegador no link e sai funcionando.
- **Sem login.** O acesso é um link com token longo e aleatório (`#/equipe/{token}`), guardado como favorito no tablet.
- O painel serve **só para a fila**: mostra a mesa, o motivo e, no rodízio, o que a mesa pediu ("Mesa 7 · Pizza Calabresa"). Botões Assumir e Concluir.
- O link é restrito ao estabelecimento dele e pode ser revogado na hora (`staff_links.revoked_at`) e trocado por outro.
- O painel não expõe dados pessoais (só mesa, motivo e código).
- Alerta: som (liberado por 1 toque inicial, exigência dos navegadores), título e ícone piscando, notificação do sistema, tela acesa. Limite honesto: com o navegador **fechado** não toca.
- Risco aceito: quem tiver o link opera a fila daquele estabelecimento. Mitigado por token longo, revogação e ausência de dados pessoais.

## Dashboard do dono
**Com login e senha** (Supabase Auth + papéis em `tenant_user_roles` + RLS, já no banco desde a migração 0001). Conterá o que tem valor comercial e dados do negócio: engajamento, relatórios, cardápio, "acabou hoje", clube. Entra na Fase 1 (parte final) e Fase 2.

## Consequência
`sold_out_items` é escrita pelo dashboard do dono; o painel da equipe não mexe nele.

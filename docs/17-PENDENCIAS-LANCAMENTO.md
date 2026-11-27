# Pendências para o lançamento (atualizado em 24/11/2026)

Lista viva do que falta antes de abrir o SemReservas GastroPub a clientes reais e antes de vender a outros restaurantes. Marque ao concluir.

## A. Antes da primeira apresentação a cliente
- [ ] **Plano Pro do Supabase.** O plano gratuito pausa o projeto após uma semana sem uso e não tem backups diários.
- [ ] **Placas com códigos aleatórios.** As placas de desenvolvimento (mesas 1 a 3) têm códigos fixos e públicos no repositório. Rodar `seeds/gastropub/retirar-placas-dev.sql` e um novo `placas.sql` (gerado por `tools/placas/gerar.mjs`) e gravar as placas NFC reais (3 para o teste).
- [ ] **Revisão jurídica** do regulamento, da política de privacidade e dos termos (hoje são rascunho). Definir se a Roleta e os prêmios reais exigem autorização (Lei 5.768/71).
- [ ] **Teste em 2 celulares reais** (Android e iPhone), em 4G, e no notebook; plano B (vídeo do fluxo) para falha de rede.
- [ ] **Reinício da demonstração** entre apresentações (contas descartáveis e função do Master que arquiva o ciclo).

## B. Antes de divulgar o link ao público
- [ ] **Domínio do login no Supabase** (ex.: `auth.semreservas.com.br`), plano Pro e complemento de domínio personalizado. Fazer **antes de ter muitos usuários**: a troca derruba as sessões. Passos: ativar o complemento, criar CNAME e TXT na zona DNS da Hostinger, ativar, adicionar o novo endereço de retorno no Google Cloud, trocar `SUPABASE_URL` no GitHub, conferir Site URL e redirecionamentos.
- [ ] **Verificação de marca no Google** (nome "SemReservas" e logotipo na tela de login).
- [ ] **Segundo método de entrada** para quem não tem conta Google (e-mail com código exige envio de e-mail próprio: Resend ou Brevo, em Authentication, SMTP Settings).
- [ ] **Páginas estáticas** de privacidade e termos (hoje são rotas do app com `#`), se o Google ou outros pedirem.
- [ ] **noindex:** descobrir de onde vem a marcação que impede a busca (servidor ou hospedagem) e decidir se deve permanecer.
- [ ] **Backups e plano de recuperação** do banco; monitoramento de erros.
- [ ] **Teste de carga** das funções públicas (chamados, check-in, pedido) e limites de taxa.

## C. Funcionalidades ainda não construídas
- [ ] Pontos por: instalar o app, ativar avisos, pedido pelo app, realidade aumentada, nota por prato, sugestão, compartilhar o app, campanhas e eventos, outros canais (TikTok, Facebook, WhatsApp).
- [ ] Moderação de comentários no painel; sugestões; indicações; clientes do Clube; ajuste manual de pontos.
- [ ] Campanhas, desempenho, insights; equipe e permissões; canais de entrada.
- [ ] Edição de aparência (cores, logo, textos), mídia 3D e vídeos do cardápio pelo painel.
- [ ] Portal Master (restaurantes, módulos, planos, placas).
- [ ] Delivery e clube por pedidos (módulo futuro).
- [ ] Notificação push para o proprietário (aviso mesmo com o computador em repouso).
- [ ] Validade dos pontos e aviso 30 dias antes; alertas de abuso; rotina de retenção.

## Celular e mensagens (27/11/2026)
- Cadastro coleta o **celular (obrigatório)** e o **aceite opcional** de avisos e promoções do restaurante (migração 0018; Conta permite mudar, tirar o aceite ou apagar). Política de privacidade atualizada (rascunho, falta revisão jurídica).
- **Para enviar mensagens direcionadas falta:** função do dono/Master que liste só quem **aceitou**, provedor de WhatsApp Business/SMS (custos, modelos aprovados), opção de sair em toda mensagem, limite de envios e registro de cada envio.

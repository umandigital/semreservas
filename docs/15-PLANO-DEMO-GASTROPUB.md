# Plano: SemReservas GastroPub 100% pronto para demonstração real (24/11/2026)

Meta: o fundador leva **uma placa NFC** (enquanto não chega, **um link**) e **um notebook** com o painel do proprietário e faz **todas as ações** na frente do cliente. O restaurante é fictício; **o sistema é de verdade**.

## Princípios
Extremamente fácil e acessível (texto grande, uma ação por tela, palavras simples); tudo como dado (tema, textos, regras, prêmios); segurança desde o início (tenant na placa, RPC, RLS, auditoria); só se mostra o que o sistema mede.

## Fase 0: preparação (fundador, em ordem)
1. **Placas reais.** Rodar `seeds/gastropub/retirar-placas-dev.sql` e depois o `placas.sql` gerado (tokens aleatórios, não versionado). Os tokens de desenvolvimento são públicos no repositório e hoje **funcionam no banco real**.
2. **Dono do painel.** Criar o usuário (Authentication, Users, Add user) e dar o papel `owner` do GastroPub.
3. **E-mail com código.** Modelo "Magic Link" com `{{ .Token }}` e Site URL.
4. **Google** (opcional para a demonstração): credenciais no Google Cloud e provedor ligado.
5. **Materiais do restaurante:** fotos do ambiente e dos pratos, logo, textos, Wi-Fi real, links de Instagram e Google, horário de funcionamento e (se for medir presença) a posição e o raio do local da apresentação.
6. **Plano do Supabase:** pago, ou rotina de acesso, para não pausar.

## Fase 1: o cliente na mesa (eu)
Cardápio sem coração e balão; **visita** (check-in +30, retorno, sequência, mesa cheia, indicação, horário, presença; migração 0006); "Como foi a visita?" em um fluxo só; fotos com moldura (+15); introdução animada do Clube; Indicar amigo.

## Fase 2: extras (eu)
Roleta do Chef (5 metas, 5º giro ganha, pedido de R$ 80) e Meu aniversário, com prêmios e validade próprios (migrações 0007 e 0008).

## Fase 3: painel do proprietário (eu, em computador)
Os 7 itens do `docs/design/ANALISE-UX-TELAS-v2.md`: Resumo, Atendimento, Clube (regras, prêmios, trocas), Cardápio, Aparência, Roleta e aniversário, Configurações. Só métricas que o sistema mede; auditoria em toda ação sensível.

## Fase 4: ensaio (nós dois)
Roteiro de apresentação em 10 minutos; contas de demonstração; reinício entre apresentações; teste em 2 celulares (Android e iPhone) e no notebook; plano B (vídeo do fluxo) se a rede falhar.

## Critério de pronto
Todas as ações do roteiro funcionam no banco real, no celular e no notebook, sem aviso de protótipo, e os testes de isolamento passam.

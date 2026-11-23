# SemReservas GastroPub como vitrine para clientes (decisão de 23/11/2026)

O GastroPub é o restaurante que o fundador usa para **apresentar o produto a clientes, como simulação real**. Isso muda o que "versão de testes" significa: precisa se comportar como o produto, não como protótipo.

## O que isso exige
1. **Banco de verdade desde já.** O modo sem banco (simulação no aparelho) serve só para desenvolver. Para apresentar: Supabase ativo, login real (código por e-mail e Google), pontos e trocas gravados no servidor. Chave `VITE_CLUBE_REAL=1` liga o caminho real do app.
2. **Supabase sempre no ar.** O plano gratuito **pausa o projeto após uma semana sem uso** e uma apresentação não pode cair nisso. Opções: plano pago ou um aviso/rotina semanal de acesso. Decisão do fundador antes da primeira apresentação.
3. **Sem rótulos de protótipo.** O aviso "Versão de testes" só aparece com `VITE_MODO_TESTE=1` (uso interno). Nada de "Exemplo", "Simulação" ou "Protótipo" na tela do cliente; o único selo permitido é "Demonstração: sem prêmio real", dentro da Roleta e dos prêmios, uma vez por tela.
4. **Prêmios de mentira, regras de verdade.** Os pontos, limites, troca e comprovante usam o motor real. O que é fictício é só o restaurante e a entrega do prêmio.
5. **Reiniciar a demonstração.** Depois de cada apresentação, voltar ao zero **sem apagar o extrato de verdade**: o extrato é imutável por regra. O reinício será por **contas de demonstração descartáveis** (e-mails de teste) e uma função exclusiva do Master (`is_platform_admin()`, auditada) que arquiva o restaurante de demonstração e cria um novo ciclo. A fazer na próxima migração.
6. **Roteiro e dados prontos.** Cardápio completo com fotos, vídeos e 3D, placas com NFC e QR impressas, contas de demonstração, e o painel do proprietário com números que o sistema realmente mede (sem inventar métricas).
7. **Confiabilidade no dia.** Teste em 2 celulares reais (Android e iPhone) com rede 4G, conferência do domínio, backup do banco e plano B (vídeo gravado do fluxo) caso a rede do local falhe.
8. **Privacidade.** Ninguém de cliente em potencial entra com dados reais sem o regulamento e a política de privacidade do restaurante de demonstração publicados.

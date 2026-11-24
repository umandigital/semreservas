# Publicar o login com Google para qualquer pessoa (versão final)

Decisão de 24/11/2026: **o cliente entra só com a conta Google**, sem código por e-mail. O e-mail com senha continua existindo só para o painel do proprietário.

## 1. Verificar o domínio no Google (uma vez)
O Google só aceita `semreservas.com.br` como domínio do app depois de confirmar que você é dono dele.
1. Acesse **search.google.com/search-console**, entrando com a conta que é dona do projeto no Google Cloud (a mesma da tela de permissão OAuth).
2. **Adicionar propriedade**, tipo **Domínio**, digite `semreservas.com.br`.
3. O Google mostra um registro **TXT** (começa com `google-site-verification=`). Copie.
4. No lugar onde o DNS do domínio é gerenciado (Hostinger, em **Domínios, DNS / Zona DNS**, ou no Registro.br se o DNS estiver lá), crie um registro **TXT**, nome `@`, valor igual ao que o Google mostrou. Salve.
5. Volte ao Search Console e clique em **Verificar**. Pode levar de alguns minutos a algumas horas.

## 2. Branding no Google Cloud (Google Auth Platform, Branding)
- **Página inicial do aplicativo:** `https://semreservas.com.br/semreservas/`
- **Política de privacidade:** `https://semreservas.com.br/semreservas/#/privacidade`
- **Termos de serviço:** `https://semreservas.com.br/semreservas/#/termos`
- **Domínios autorizados:** deixe o do Supabase (já está) e **adicione `semreservas.com.br`**.
- **E-mail de contato do desenvolvedor:** o seu.
- **Não envie logotipo** (enviar logotipo faz o Google exigir verificação do app).
- Clique em **Salvar**.

## 3. Escopos (Acesso a dados)
Em **Acesso a dados**, só os básicos: `openid`, `.../auth/userinfo.email` e `.../auth/userinfo.profile`. São os que o Supabase pede por padrão. Com só eles o Google **não exige verificação**.

## 4. Publicar
**Público-alvo, Status de publicação, Publicar app, Confirmar.** O status vira **Em produção** e qualquer conta Google pode entrar.

## 5. Supabase (conferir)
- **Authentication, Sign In / Providers:** Google ligado e **"Allow new users to sign up"** ligado.
- **URL Configuration:** Site URL `https://semreservas.com.br/semreservas/` e a lista de redirecionamentos com `https://semreservas.com.br/semreservas/**`.
- Mantenha o provedor **Email** ligado: é ele que permite o login do proprietário com senha.

## 6. Teste final
Entre com uma conta Google que **não** está na lista de testadores. Deve abrir "Falta só um passo".

## Observações
- A tela do Google mostra o endereço do Supabase em vez de "SemReservas". Isso só muda com domínio próprio no Supabase (recurso pago).
- Os links de política e termos usam a rota `#/…` do app. Se o Google reclamar de não conseguir ler a página, geramos páginas estáticas equivalentes.
- Quem não tem conta Google não consegue se cadastrar. Se isso virar um problema, o caminho é um segundo método (e-mail com código, que exige envio de e-mail próprio).

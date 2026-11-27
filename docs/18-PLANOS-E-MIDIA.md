# Planos e mídia do cardápio (decisão do fundador, 27/11/2026)

## Decisão
O cardápio do restaurante tem **três tipos de mídia**, e cada um é contratado à parte, com **valor de ativação próprio** (cobrado uma vez):

| Mídia | Quem administra | Mensalidade | Observação |
|---|---|---|---|
| **Foto** | **o próprio dono, com autonomia**, pelo painel | a mais baixa | é a base: todo cliente tem |
| **Vídeo com IA** | **o SemReservas** (produção nossa) | mais alta | quem contrata já tem foto |
| **RA (realidade aumentada / 3D)** | **o SemReservas** (produção nossa) | mais alta | quem contrata já tem foto |

- O plano com vídeo IA e RA inclui **uma cota de pratos novos por mês** ("x pratos novos"), produzidos por nós.
- **O dono nunca envia vídeo, 3D nem RA.** Só foto. Vídeo e RA são "serviço feito por nós" e fazem parte do argumento comercial.
- Quem contrata vídeo IA ou RA **já tem o de foto**; não paga a ativação de foto de novo.

Alinhado a `docs/09`, seção 3.11 (planos como dado: ativação por tipo de mídia, mensalidade, pacotes, limites) e à regra 9 do projeto (tudo é dado, nada de `if (restaurante == "x")`).

## O que isso muda no produto
1. **Painel do dono (já existe a base):** o dono cria e edita pratos; falta **enviar a foto do prato** (hoje o item novo nasce sem foto). É o próximo passo, e é autônomo.
2. **Vídeo e RA** não aparecem no painel do dono como envio; aparecem como **informação** ("Vídeo: ativo para 6 pratos · cota do mês: 2 de 4") e um botão **"Pedir um prato novo em vídeo/RA"** (cria um pedido para nós).
3. **Quem sobe vídeo e RA:** só o **portal Master**, que ainda não existe (por ora seguimos como hoje: arquivos colocados por nós).
4. **O app do cliente** mostra no Cardápio o que o prato tem: foto sempre; vídeo se houver; "Projete na mesa" se houver RA. Isso já funciona assim, pelos dados do prato.

## Como guardar (proposta técnica, sem migração ainda)
- **Módulos como dado** em `tenant_modules` (já existe, com limites): `media_photo`, `media_video_ia`, `media_ar`. Ligar `media_video_ia` ou `media_ar` exige `media_photo` ligado (regra no servidor).
- **Cota** de pratos novos por mês: limite do módulo (campo `limits`), com contagem por mês de quantos pratos receberam vídeo/RA, **gravada em `audit_logs`**.
- **Fotos do dono:** Supabase Storage, pasta por restaurante, **só o papel owner/manager do próprio restaurante grava**, imagem convertida para **WebP no navegador** (largura máxima e peso máximo), um arquivo por prato.
- **Valores (ativação e mensalidade) ficam no portal Master**, tabela `plans`, nunca no código do app. Esta decisão não altera cobrança hoje: ainda não há cobrança automática.

## Perguntas em aberto (precisam de resposta antes de construir cobrança e cota)
1. **Vídeo IA e RA são um plano só ou dois?** Você escreveu "vídeo IA e RA (plano mais caro)" e depois "ativação diferente para os 3". Fica: (a) três módulos independentes (foto, vídeo IA, RA) ou (b) foto e um plano "vídeo IA + RA" juntos?
2. **A cota "x pratos novos por mês" conta o quê?** (a) cada prato que **ganha** vídeo e/ou RA no mês, ou (b) cada vídeo e cada RA separadamente?
3. **Cota que sobra acumula** para o mês seguinte ou zera?
4. **O que o dono vê** quando a cota acaba: botão "pedir prato extra" com valor avulso, ou só um aviso?
5. **Foto:** o dono pode ter quantas fotos por prato (uma ou várias), e há limite de pratos no plano básico?

# ADR-0002 — Multi-tenant desde o primeiro dia, interface mínima até a Fase 3

**Status:** ACEITO (princípio; independe da stack)

## Decisão
1. **Todo dado de negócio carrega `tenant_id`**, mesmo havendo um só cliente (GastroPub). Custa quase nada agora e custa semanas depois.
2. O `tenant_id` **nunca vem do navegador**: é resolvido no servidor a partir do token da placa (`/r/{token}`) ou da sessão autenticada do staff/dono.
3. Tipos de estabelecimento e funções são **dados** (`establishment_type`, `tenant_modules`), nunca `if (cliente == "pulpo")`.
4. Planos, preços e trial são tabelas configuráveis; nada de valor fixo no front.
5. Cada fase entrega **interface** na medida do uso real:
   - Fase 1: criar o GastroPub por script de seed; edição de cardápio por um editor simples do dono.
   - Fase 2: criar a Pulpo pela interface (mede o tempo de onboarding).
   - Fase 3: Master completo.
6. Teste automático de isolamento (usuário do tenant A tentando ler/gravar no tenant B) entra no CI antes do segundo tenant existir.

## Por quê
É a parte mais cara de retrofitar e a de maior risco para um SaaS (vazamento entre clientes). Construir o painel Master inteiro para um único cliente é o oposto: esforço sem retorno até a Fase 3.

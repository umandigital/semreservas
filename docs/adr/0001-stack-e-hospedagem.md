# ADR-0001 — Stack e hospedagem

**Status:** PROPOSTO — aguarda resposta da pergunta 1 em `../02-PERGUNTAS-EM-ABERTO.md`

## Contexto
- Teste interno e de campo rodam no servidor Hostinger do umandigital.com.br (hospedagem compartilhada: PHP + MySQL, SSH, sem processo permanente nem PostgreSQL).
- O pacote v4.0 propõe Node + PostgreSQL + Redis + SSE + worker. Isso não roda nesse servidor.
- Requisitos que pesam na escolha: **tempo real confiável para a fila de chamados**, **isolamento entre clientes (multi-tenant)**, **login por link/código para o clube**, **jobs mensais de relatório**, **um desenvolvedor só**.

## Opções

| | A. PHP + MySQL no Hostinger | B. Frontend estático no Hostinger + Supabase | C. Node no Hostinger Cloud/VPS |
|---|---|---|---|
| Cabe no servidor atual | Sim | Sim (só arquivos estáticos) | Só em plano Cloud/VPS (upgrade) |
| Banco | MySQL | PostgreSQL gerenciado, com isolamento por linha (RLS) | MySQL ou Postgres instalado por você |
| Tempo real da fila | Polling a cada 3 s (SSE instável em compartilhada) | Realtime nativo | SSE |
| Login do clube | Construir | Pronto (link mágico/código) | Construir |
| Jobs mensais (relatório) | Cron do hPanel | Cron do banco / função agendada | Worker |
| Isolamento entre clientes | Só código (risco de erro humano) | Código **e** regra no banco | Só código |
| Onde ficam os dados | Seu servidor | Serviço de terceiro (com plano gratuito para teste) | Seu servidor |
| Custo extra no teste | R$ 0 | R$ 0 (plano gratuito) | Upgrade de plano |
| Esforço para crescer | Reescrever o backend na Fase 3 | Continua o mesmo | Médio |

## Recomendação
**B.** É a que mais respeita "tudo pensado para crescer na ordem certa": o banco já nasce em PostgreSQL com isolamento por linha (o pacote recomenda isso como defesa em profundidade), o tempo real da fila é recurso nativo e o login do clube não precisa ser construído. O Hostinger continua hospedando as telas (arquivos estáticos), o domínio e o deploy que você já tem.

**A** é a escolha se for importante manter **todos os dados no seu servidor** desde o primeiro dia. Funciona para a Fase 1, mas o backend teria de ser reescrito para a Fase 3.

## Em qualquer opção (inegociável)
- Contrato da API em `packages/contratos/` (OpenAPI) antes do código; o backend pode mudar sem quebrar as telas.
- `tenant_id` em toda tabela de negócio desde a primeira migração.
- Segredos fora do repositório.
- Mudanças de banco só por migração versionada em `apps/api/migrations/`.

## Consequências
Escolhida a opção, este ADR passa a ACEITO e `apps/api/README.md` ganha as instruções reais de execução.

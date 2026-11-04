# SemReservas

Marketing de relacionamento gastronômico. *Um toque. Infinitas possibilidades.*

SaaS com três interfaces conectadas:

| Interface | Quem usa | Pasta |
|---|---|---|
| Consumidor (webapp aberto por NFC/QR) | cliente do estabelecimento | `apps/consumidor/` |
| Painel do dono e da equipe | dono, gerente, garçom, cozinha | `apps/painel-dono/` |
| Master SemReservas | equipe SemReservas | `apps/master/` |
| API e banco | todas as anteriores | `apps/api/` |

## Estado
Fase 0 (preparação). Repositório criado e estrutura pronta. Nenhum código de produto ainda: decididos: stack (ADR-0001), placa numerada por mesa (ADR-0003), endereço de teste `umandigital.com.br/semreservas`. Próximo passo: projeto Supabase criado e marco 1.1 (fundação).

## Fases
1. **Interno**: SemReservas GastroPub
2. **Campo**: Pulpo
3. **SaaS comercial**

Detalhes em `docs/01-ROADMAP.md`.

## Leia nesta ordem
1. `docs/00-ANALISE-CRITICA.md`: lacunas, falhas de interface e de operação
2. `docs/02-PERGUNTAS-EM-ABERTO.md`: o que bloqueia o início
3. `docs/03-TIPOS-DE-ESTABELECIMENTO.md`: à la carte, delivery, rodízio, buffet
4. `docs/01-ROADMAP.md`
5. `docs/adr/`: decisões de arquitetura

## Estrutura
```
semreservas/
├── apps/
│   ├── consumidor/      webapp público (mobile first)
│   ├── painel-dono/     dono, gerente, garçom, cozinha
│   ├── master/          administração SemReservas
│   └── api/             regras de negócio, migrações, testes
├── packages/
│   └── contratos/       openapi.yaml, events.schema.json (fonte única)
├── seeds/               dados dos estabelecimentos (GastroPub, demo)
├── infra/               deploy, domínios, backups
└── docs/
    ├── adr/             decisões de arquitetura
    └── fonte-v4/        pacote original v4.0, SOMENTE LEITURA
```

## Regras do projeto
- `docs/fonte-v4/` não se edita. Decisões novas vão para `docs/` e `docs/adr/`.
- Toda tabela de negócio tem `tenant_id`; o servidor o decide, nunca o navegador (ADR-0002).
- Planos, preços, tipos de estabelecimento e módulos são dados, não código.
- Não prometer vendas medidas. Clique em Instagram/Google não é curtida nem avaliação.
- A marca (símbolo S/NFC e wordmark) não se redesenha.

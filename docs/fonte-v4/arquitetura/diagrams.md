# Diagramas de arquitetura e fluxos (proposta)

## Diagrama geral

```mermaid
flowchart LR
  A[NFC / QR / Site] --> B[Webapp público]
  B --> API[API HTTPS: Auth, Tenant, Catálogo, Pedidos, Engajamento, Atendimento]
  M[SEMRESERVAS Master] --> API
  P[Proprietário / Staff] --> API
  API --> DB[(PostgreSQL)]
  API --> STORE[Storage + CDN]
  API --> OUTBOX[Outbox]
  OUTBOX --> SSE[Canal SSE com replay]
  SSE --> P
  OUTBOX --> WORKER[Jobs: agregação + IA]
  WORKER --> REVIEW[Validação, revisão, aprovação]
  REVIEW --> P
```

## Visitante abre a TAG

```mermaid
sequenceDiagram
  participant NFC as NFC ou QR
  participant R as Roteador /r/token
  participant DB as Banco
  participant W as Webapp público
  NFC->>R: GET /r/token
  R->>DB: procurar access_point e tenant ativo
  DB-->>R: slug + contexto publicado
  R-->>W: redirect /e/slug + origem
  W->>R: GET home + catálogo
  R-->>W: dados publicados, sem login
```

## Chamado de garçom sem número de mesa

```mermaid
sequenceDiagram
  participant C as Visitante (anônimo)
  participant API as API
  participant DB as PostgreSQL
  participant EV as SSE/Outbox
  participant S as Staff autenticado
  C->>API: POST /service-requests {tipo,zona?,nota?}
  API->>DB: transação: request PENDING + outbox
  DB-->>API: id, código curto, token de status
  API-->>C: 201 criado (não atendido)
  EV-->>S: service.requested
  S->>API: GET fila -> estado real
  S->>S: banner em destaque + som se permitido
  S->>API: PATCH ACKNOWLEDGED + expected_version
  API->>DB: update condicional e auditoria
  API-->>C: status ACKNOWLEDGED (consulta segura)
  S->>API: PATCH RESOLVED
  API->>DB: auditoria e timestamp
```

## Relatório mensal

```mermaid
flowchart TD
  A[Cron/Job tenant-mês] --> B[SQL agregado determinístico]
  B --> C[Validar amostra, taxas e cobertura]
  C --> D{Dados suficientes?}
  D -->|Não| X[Relatório básico com lacunas]
  D -->|Sim| E[Skills de IA com JSON agregado]
  E --> F[Checagem de números, evidências, política]
  F --> G[Draft]
  X --> G
  G --> H[Revisão humana Master]
  H --> I[Aprovação]
  I --> J[PDF/painel do proprietário]
```

## Estados

```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> ACKNOWLEDGED: staff assume
  PENDING --> CANCELLED: usuário/equipe quando permitido
  PENDING --> EXPIRED: política configurada
  ACKNOWLEDGED --> RESOLVED: staff conclui
  ACKNOWLEDGED --> CANCELLED: justificativa
  RESOLVED --> [*]
  CANCELLED --> [*]
  EXPIRED --> [*]
```

O protótipo HTML usa armazenamento local do navegador e não é a implementação desses diagramas. SSE, banco, autenticação, permissões e fila são parte do MVP real a implementar.

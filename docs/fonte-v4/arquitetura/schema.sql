-- SEMRESERVAS — MODELO RELACIONAL CONCEITUAL PARA REVISÃO, NÃO MIGRAÇÃO PRONTA PARA PRODUÇÃO
-- PostgreSQL recomendado. Execute migrations versionadas após validação de tenant policies e LGPD.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE,
 legal_name text,
 display_name text NOT NULL,
 lifecycle_status text NOT NULL DEFAULT 'DRAFT' CHECK(lifecycle_status IN ('DRAFT','TRIAL','ACTIVE','PAUSED','CANCELLED')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE locations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 label text NOT NULL, city text, state text, country text DEFAULT 'BR', timezone text DEFAULT 'America/Sao_Paulo',
 is_active boolean NOT NULL DEFAULT true, UNIQUE(id, tenant_id)
);
CREATE TABLE tenant_branding (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 version integer NOT NULL, state text NOT NULL CHECK(state IN ('DRAFT','PUBLISHED','ARCHIVED')),
 heading text, subtitle text, primary_hex char(7), accent_hex char(7),
 logo_media_id uuid, hero_media_id uuid, layout_json jsonb NOT NULL DEFAULT '{}',
 published_at timestamptz, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id, version)
);
CREATE TABLE feature_flags (
 tenant_id uuid NOT NULL REFERENCES tenants(id), feature_key text NOT NULL,
 enabled boolean NOT NULL, config_json jsonb NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(tenant_id, feature_key)
);
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE, phone_e164 text UNIQUE,
 display_name text, created_at timestamptz NOT NULL DEFAULT now(), disabled_at timestamptz
);
CREATE TABLE auth_identities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 provider text NOT NULL, provider_subject text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider, provider_subject)
);
CREATE TABLE tenant_user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES tenants(id),
 user_id uuid NOT NULL REFERENCES users(id), role text NOT NULL CHECK(role IN ('MEMBER','STAFF','MANAGER','OWNER','MASTER_OPERATOR','MASTER_ADMIN')),
 location_id uuid REFERENCES locations(id), granted_by uuid REFERENCES users(id), revoked_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_roles_by_user ON tenant_user_roles(user_id,tenant_id,role) WHERE revoked_at IS NULL;
CREATE TABLE consent_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), tenant_id uuid REFERENCES tenants(id),
 purpose text NOT NULL, policy_version text NOT NULL, legal_basis text NOT NULL, opted_in boolean,
 recorded_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz, source text
);
CREATE TABLE categories (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 label text NOT NULL, sort_order integer NOT NULL DEFAULT 0, is_published boolean NOT NULL DEFAULT false,
 UNIQUE(id, tenant_id)
);
CREATE TABLE products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 category_id uuid NOT NULL REFERENCES categories(id), name text NOT NULL, description text,
 ingredients text, price numeric(12,2) NOT NULL DEFAULT 0 CHECK(price>=0),
 currency char(3) NOT NULL DEFAULT 'BRL', sort_order integer DEFAULT 0,
 is_published boolean NOT NULL DEFAULT false, is_available boolean NOT NULL DEFAULT true,
 version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,tenant_id)
);
CREATE INDEX idx_products_public ON products(tenant_id,is_published,category_id,sort_order);
CREATE TABLE product_options (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 product_id uuid NOT NULL REFERENCES products(id), label text NOT NULL, price_delta numeric(12,2) NOT NULL DEFAULT 0,
 is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE media_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 product_id uuid REFERENCES products(id), type text NOT NULL CHECK(type IN ('IMAGE','VIDEO','POSTER','LOGO','HERO')),
 storage_key text NOT NULL, poster_key text, content_type text, bytes bigint,
 duration_seconds numeric(8,2), copyright_confirmed boolean DEFAULT false,
 approved_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE access_points (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 location_id uuid REFERENCES locations(id), public_token text NOT NULL UNIQUE,
 medium text NOT NULL CHECK(medium IN ('NFC','QR','MAGNET','SITE')),
 hardware_type text, tag_uid_fingerprint text, writing_locked_verified boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','SUSPENDED','RETIRED')),
 created_at timestamptz NOT NULL DEFAULT now(), retired_at timestamptz
);
CREATE INDEX idx_access_points_tenant ON access_points(tenant_id,status);
CREATE TABLE access_point_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), access_point_id uuid NOT NULL REFERENCES access_points(id),
 tenant_id uuid NOT NULL REFERENCES tenants(id), location_id uuid REFERENCES locations(id),
 assigned_at timestamptz NOT NULL DEFAULT now(), unassigned_at timestamptz, assigned_by uuid REFERENCES users(id)
);
CREATE TABLE visitor_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 source text, access_point_id uuid REFERENCES access_points(id), pseudonym text NOT NULL
);
CREATE TABLE events (
 id uuid PRIMARY KEY, tenant_id uuid NOT NULL REFERENCES tenants(id), location_id uuid REFERENCES locations(id),
 event_name text NOT NULL, schema_version text NOT NULL, occurred_at timestamptz NOT NULL,
 ingested_at timestamptz NOT NULL DEFAULT now(), session_id uuid REFERENCES visitor_sessions(id),
 member_id uuid REFERENCES users(id), access_point_id uuid REFERENCES access_points(id),
 product_id uuid REFERENCES products(id), campaign_id uuid, source text NOT NULL DEFAULT 'unknown',
 properties_json jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX idx_events_tenant_time ON events(tenant_id,occurred_at);
CREATE INDEX idx_events_product_time ON events(tenant_id,product_id,occurred_at);
CREATE TABLE order_intents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 location_id uuid REFERENCES locations(id), visitor_session_id uuid REFERENCES visitor_sessions(id),
 member_id uuid REFERENCES users(id), presentation_code text NOT NULL, status text NOT NULL DEFAULT 'PREPARED_NOT_ACCEPTED',
 subtotal_snapshot numeric(12,2), currency char(3) DEFAULT 'BRL',
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz,
 CHECK(status IN ('PREPARED_NOT_ACCEPTED','PRESENTED','STAFF_ACKNOWLEDGED','EXPIRED','CANCELLED'))
);
CREATE TABLE order_intent_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 order_intent_id uuid NOT NULL REFERENCES order_intents(id), product_id uuid NOT NULL REFERENCES products(id),
 product_name_snapshot text NOT NULL, quantity integer NOT NULL CHECK(quantity>0),
 unit_price_snapshot numeric(12,2) NOT NULL CHECK(unit_price_snapshot>=0), options_json jsonb DEFAULT '[]', notes text
);
CREATE TABLE service_zones (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 location_id uuid REFERENCES locations(id), label text NOT NULL, is_active boolean NOT NULL DEFAULT true
);
CREATE TABLE service_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 location_id uuid REFERENCES locations(id), visitor_session_id uuid REFERENCES visitor_sessions(id),
 public_code text NOT NULL, status_token_hash bytea NOT NULL, type text NOT NULL CHECK(type IN ('WAITER','BILL','HELP')),
 status text NOT NULL CHECK(status IN ('PENDING','ACKNOWLEDGED','RESOLVED','CANCELLED','EXPIRED')) DEFAULT 'PENDING',
 zone_id uuid REFERENCES service_zones(id), locator_note text, version integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), acknowledged_at timestamptz, resolved_at timestamptz,
 acknowledged_by uuid REFERENCES users(id), resolved_by uuid REFERENCES users(id)
);
CREATE INDEX idx_service_active ON service_requests(tenant_id,status,created_at);
CREATE TABLE service_request_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 request_id uuid NOT NULL REFERENCES service_requests(id), from_status text, to_status text NOT NULL,
 actor_id uuid REFERENCES users(id), occurred_at timestamptz NOT NULL DEFAULT now(), reason text
);
CREATE TABLE member_wallets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 user_id uuid NOT NULL REFERENCES users(id), available_points bigint NOT NULL DEFAULT 0 CHECK(available_points>=0),
 version integer NOT NULL DEFAULT 0, UNIQUE(tenant_id,user_id)
);
CREATE TABLE loyalty_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 action_key text NOT NULL, rule_version integer NOT NULL, points integer NOT NULL,
 eligibility_json jsonb NOT NULL DEFAULT '{}', active_from timestamptz, active_until timestamptz,
 is_active boolean NOT NULL DEFAULT false, UNIQUE(tenant_id,action_key,rule_version)
);
CREATE TABLE point_ledger (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 wallet_id uuid NOT NULL REFERENCES member_wallets(id), entry_type text NOT NULL CHECK(entry_type IN ('CREDIT','DEBIT','REVERSAL','EXPIRATION')),
 delta_points integer NOT NULL, balance_after bigint NOT NULL CHECK(balance_after>=0),
 rule_id uuid REFERENCES loyalty_rules(id), source_ref text,
 idempotency_key text NOT NULL, authorized_by uuid REFERENCES users(id), occurred_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE rewards (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 title text NOT NULL, points_cost integer NOT NULL CHECK(points_cost>0),
 rules_json jsonb NOT NULL DEFAULT '{}', available_from timestamptz, available_until timestamptz,
 is_active boolean NOT NULL DEFAULT false
);
CREATE TABLE reward_redemptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 user_id uuid NOT NULL REFERENCES users(id), reward_id uuid NOT NULL REFERENCES rewards(id),
 ledger_entry_id uuid REFERENCES point_ledger(id), status text NOT NULL CHECK(status IN ('REQUESTED','APPROVED','FULFILLED','CANCELLED')),
 idempotency_key text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), fulfilled_at timestamptz,
 UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE purchase_validations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 user_id uuid NOT NULL REFERENCES users(id), external_receipt_ref text, status text NOT NULL,
 authorized_by uuid NOT NULL REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 idempotency_key text NOT NULL, UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE surveys (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 title text NOT NULL, schema_json jsonb NOT NULL DEFAULT '{}', active boolean NOT NULL DEFAULT false
);
CREATE TABLE survey_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 survey_id uuid NOT NULL REFERENCES surveys(id), user_id uuid REFERENCES users(id),
 session_id uuid REFERENCES visitor_sessions(id), rating smallint CHECK(rating BETWEEN 1 AND 5),
 comment text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE product_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 product_id uuid NOT NULL REFERENCES products(id), user_id uuid NOT NULL REFERENCES users(id),
 body text NOT NULL, moderation_status text NOT NULL CHECK(moderation_status IN ('PENDING','PUBLISHED','REJECTED','REMOVED')),
 verified_purchase boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE moderation_actions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 comment_id uuid NOT NULL REFERENCES product_comments(id), moderator_id uuid NOT NULL REFERENCES users(id),
 action text NOT NULL, reason text, occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE campaigns (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 title text NOT NULL, status text NOT NULL DEFAULT 'DRAFT', starts_at timestamptz, ends_at timestamptz,
 config_json jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE photo_template_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 template_key text NOT NULL, event_name text NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(),
 session_id uuid REFERENCES visitor_sessions(id)
);
-- Apenas metadados de foto são armazenados, NÃO a imagem enviada pelo cliente por padrão.
CREATE TABLE report_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 period_start date NOT NULL, period_end date NOT NULL, status text NOT NULL DEFAULT 'DRAFT',
 report_version text NOT NULL, aggregated_json jsonb, source_hash text, draft_text_json jsonb,
 warnings_json jsonb, model_identifier text, model_cost numeric(12,6), reviewed_by uuid REFERENCES users(id),
 approved_at timestamptz, delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,period_start,period_end,report_version)
);
CREATE TABLE report_insights (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES tenants(id),
 report_run_id uuid NOT NULL REFERENCES report_runs(id), title text NOT NULL, observation text NOT NULL,
 hypothesis text, recommendation text, success_measure text, evidence_refs jsonb NOT NULL DEFAULT '[]',
 confidence text CHECK(confidence IN ('low','medium','high'))
);
CREATE TABLE outbox_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES tenants(id),
 event_type text NOT NULL, aggregate_id uuid, payload_json jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz,
 attempts integer NOT NULL DEFAULT 0
);
CREATE INDEX idx_outbox_pending ON outbox_events(created_at) WHERE published_at IS NULL;
CREATE TABLE audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES tenants(id),
 actor_id uuid REFERENCES users(id), action text NOT NULL, resource_type text, resource_id text,
 before_json jsonb, after_json jsonb, reason text, correlation_id text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_tenant_time ON audit_logs(tenant_id,created_at);
CREATE TABLE idempotency_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid REFERENCES tenants(id),
 scope text NOT NULL, idempotency_key text NOT NULL, request_hash text NOT NULL,
 response_json jsonb, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(scope,idempotency_key)
);

-- Exemplo de defesa RLS (não suficiente sozinho; completar política por papel e contexto):
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY product_tenant_isolation ON products USING (
--   tenant_id = nullif(current_setting('app.tenant_id',true),'')::uuid
-- );
-- A aplicação DEVE definir app.tenant_id por transação com contexto derivado de autorização validada;
-- NUNCA aceitar tenant_id do cliente como prova de permissão. Consultas públicas devem ser views/RPC de publicação.
-- Auditoria, FKs compostas, exclusão/retention, partitioning e índices devem ser revisados antes de migração real.

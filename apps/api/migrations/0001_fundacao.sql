-- 0001 Fundação: tenants, módulos, placas, vínculo placa→mesa, papéis, auditoria.
-- Regras: todo dado de negócio tem tenant_id; RLS ligada em tudo; o navegador
-- nunca informa tenant_id (ADR-0002). Acesso público só por funções RPC.

create extension if not exists pgcrypto;

-- ───────── tenants e módulos ─────────
create table tenants (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name               text not null check (length(name) between 2 and 120),
  establishment_type text not null check (establishment_type in
                       ('a_la_carte','delivery','rodizio','buffet_com_carta')),
  status             text not null default 'draft' check (status in ('draft','trial','active','paused')),
  created_at         timestamptz not null default now()
);

create table tenant_modules (
  tenant_id uuid not null references tenants(id) on delete cascade,
  module    text not null check (module in
              ('menu_feed','selection_for_waiter','waiter_call','kitchen_request',
               'order_whatsapp','daily_board','wifi','instagram','google_link','loyalty')),
  enabled   boolean not null default true,
  primary key (tenant_id, module)
);

-- ───────── papéis ─────────
create table tenant_user_roles (
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null check (role in ('owner','manager','staff','kitchen')),
  primary key (tenant_id, user_id)
);

-- ───────── mesas, placas e tokens (ADR-0003 / ADR-0004) ─────────
create table venue_tables (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  label     text not null check (length(label) between 1 and 30),
  unique (tenant_id, label),
  unique (id, tenant_id)
);

create table access_points (          -- a placa física
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  number    text not null check (length(number) between 1 and 30),  -- impresso na placa
  state     text not null default 'generated' check (state in
              ('generated','written','tested','locked','active','revoked')),
  created_at timestamptz not null default now(),
  unique (tenant_id, number),
  unique (id, tenant_id)
);

create table access_point_tokens (    -- um token por origem (nfc / qr)
  token           text primary key check (length(token) >= 22),
  tenant_id       uuid not null,
  access_point_id uuid not null,
  origin          text not null check (origin in ('nfc','qr')),
  revoked_at      timestamptz,
  foreign key (access_point_id, tenant_id) references access_points(id, tenant_id) on delete cascade,
  unique (access_point_id, origin) deferrable initially immediate
);

create table access_point_assignments ( -- vínculo placa → mesa, corrigível sem regravar a tag
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  access_point_id uuid not null,
  table_id        uuid not null,
  valid_from      timestamptz not null default now(),
  valid_to        timestamptz,
  foreign key (access_point_id, tenant_id) references access_points(id, tenant_id) on delete cascade,
  foreign key (table_id, tenant_id)        references venue_tables(id, tenant_id)  on delete cascade
);
create unique index one_current_assignment on access_point_assignments(access_point_id) where valid_to is null;

-- ───────── auditoria ─────────
create table audit_logs (
  id         bigint generated always as identity primary key,
  tenant_id  uuid references tenants(id) on delete set null,
  actor_id   uuid,
  action     text not null,
  detail     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ───────── funções de apoio ─────────
create function is_tenant_member(t uuid, roles text[] default array['owner','manager','staff','kitchen'])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from tenant_user_roles r
                 where r.tenant_id = t and r.user_id = auth.uid() and r.role = any(roles));
$$;

-- ───────── RLS ─────────
alter table tenants                  enable row level security;
alter table tenant_modules           enable row level security;
alter table tenant_user_roles        enable row level security;
alter table venue_tables             enable row level security;
alter table access_points            enable row level security;
alter table access_point_tokens      enable row level security;
alter table access_point_assignments enable row level security;
alter table audit_logs               enable row level security;

create policy tenants_read   on tenants for select to authenticated using (is_tenant_member(id));
create policy tenants_update on tenants for update to authenticated
  using (is_tenant_member(id, array['owner'])) with check (is_tenant_member(id, array['owner']));

create policy modules_read  on tenant_modules for select to authenticated using (is_tenant_member(tenant_id));
create policy roles_read    on tenant_user_roles for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy tables_read   on venue_tables for select to authenticated using (is_tenant_member(tenant_id));
create policy tables_write  on venue_tables for all to authenticated
  using (is_tenant_member(tenant_id, array['owner','manager']))
  with check (is_tenant_member(tenant_id, array['owner','manager']));
create policy ap_read       on access_points for select to authenticated using (is_tenant_member(tenant_id));
create policy ap_write      on access_points for all to authenticated
  using (is_tenant_member(tenant_id, array['owner','manager']))
  with check (is_tenant_member(tenant_id, array['owner','manager']));
create policy tokens_read   on access_point_tokens for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy assign_read   on access_point_assignments for select to authenticated using (is_tenant_member(tenant_id));
create policy assign_write  on access_point_assignments for all to authenticated
  using (is_tenant_member(tenant_id, array['owner','manager']))
  with check (is_tenant_member(tenant_id, array['owner','manager']));
create policy audit_read    on audit_logs for select to authenticated using (is_tenant_member(tenant_id, array['owner']));

-- Sem acesso direto do público: tudo por RPC abaixo.
revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ───────── RPC pública (visitante sem login) ─────────
-- Resolve o token da placa. O tenant é decidido aqui, no servidor.
create function resolve_access_token(p_token text)
returns table (tenant_slug text, tenant_name text, table_label text, origin text)
language sql stable security definer set search_path = public as $$
  select t.slug, t.name, vt.label, k.origin
  from access_point_tokens k
  join access_points ap on ap.id = k.access_point_id and ap.tenant_id = k.tenant_id
  join tenants t on t.id = k.tenant_id
  left join access_point_assignments a on a.access_point_id = ap.id and a.valid_to is null
  left join venue_tables vt on vt.id = a.table_id
  where k.token = p_token
    and k.revoked_at is null
    and ap.state <> 'revoked'
    and t.status in ('trial','active');
$$;

create function public_tenant(p_slug text)
returns table (slug text, name text, establishment_type text)
language sql stable security definer set search_path = public as $$
  select slug, name, establishment_type from tenants
  where slug = p_slug and status in ('trial','active');
$$;

revoke execute on all functions in schema public from public;
grant execute on function resolve_access_token(text), public_tenant(text) to anon, authenticated;
grant execute on function is_tenant_member(uuid, text[]) to authenticated;

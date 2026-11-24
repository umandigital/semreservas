-- 0007 Extras do restaurante: prêmios próprios (fora do Clube) e Roleta do Chef.
-- Roleta (docs/12 v4): 5 etapas; cada giro entrega uma etapa nova (sorteada NO SERVIDOR); o 5º giro ganha o prêmio.
-- O giro é liberado quando a pessoa chama o garçom com um pedido de valor mínimo (subtotal DECLARADO pelo app: o sistema não vê o caixa).
-- Travas: associado ativo, 18+, visita do dia, chamado de pedido real e recente (1 liberação por chamado e por dia), janela de 60 dias.
-- Mesmos princípios da 0005: tenant pela placa, RPC com search_path fixo, sem acesso direto, auditoria.

create table if not exists extra_prizes (                 -- prêmios dos extras (roleta, aniversário): têm validade e troca próprias
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null,
  user_id     uuid not null,
  source      text not null check (source in ('roulette','birthday')),
  name        text not null,
  code        text not null,
  demo        boolean not null default true,
  created_at  timestamptz not null default now(),
  valid_until timestamptz not null,
  status      text not null default 'available' check (status in ('available','used')),
  used_at     timestamptz,
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade,
  unique (tenant_id, code)
);
create index if not exists extra_prizes_user on extra_prizes (tenant_id, user_id, created_at desc);

create table if not exists roulette_settings (
  tenant_id          uuid primary key references tenants(id) on delete cascade,
  enabled            boolean not null default false,
  steps              text[] not null default '{Panela,Faca,Fogão,Forno,Prato}' check (cardinality(steps) between 3 and 8),
  min_subtotal_cents int not null default 8000 check (min_subtotal_cents >= 0),
  window_days        int not null default 60 check (window_days between 7 and 365),
  prize_name         text not null default 'Pizza à escolha' check (length(prize_name) between 2 and 80),
  prize_valid_days   int not null default 30 check (prize_valid_days between 1 and 365),
  adults_only        boolean not null default true,
  demo               boolean not null default true               -- "Demonstração: sem prêmio real"
);
create table if not exists roulette_rounds (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null,
  user_id    uuid not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  got        text[] not null default '{}',
  status     text not null default 'open' check (status in ('open','won','expired')),
  prize_id   uuid references extra_prizes(id),
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade
);
create unique index if not exists one_open_round on roulette_rounds (tenant_id, user_id) where status = 'open';
create table if not exists roulette_grants (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null,
  user_id        uuid not null,
  day            date not null,
  request_id     uuid not null,
  subtotal_cents int not null,
  status         text not null default 'available' check (status in ('available','used')),
  created_at     timestamptz not null default now(),
  used_at        timestamptz,
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade,
  unique (tenant_id, request_id),
  unique (tenant_id, user_id, day)
);
alter table extra_prizes enable row level security; alter table roulette_settings enable row level security;
alter table roulette_rounds enable row level security; alter table roulette_grants enable row level security;
create policy ep_read  on extra_prizes      for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy rs_read  on roulette_settings for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy rr_read  on roulette_rounds   for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy rg_read  on roulette_grants   for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
revoke all on extra_prizes, roulette_settings, roulette_rounds, roulette_grants from anon, authenticated;
grant select on extra_prizes, roulette_settings, roulette_rounds, roulette_grants to authenticated;

create or replace function _roulette_seed() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into roulette_settings (tenant_id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists roulette_tenant_seed on tenants;
create trigger roulette_tenant_seed after insert on tenants for each row execute function _roulette_seed();
insert into roulette_settings (tenant_id) select id from tenants on conflict do nothing;

create or replace function _extra_code(p_tenant uuid) returns text language plpgsql security definer set search_path = public, extensions as $$
declare c text;
begin loop
  c := substr(translate(upper(encode(gen_random_bytes(8), 'base64')), '+/=IL1O0', 'XYZKMNPQ'), 1, 6);
  exit when not exists (select 1 from extra_prizes where tenant_id = p_tenant and code = c);
end loop; return c; end $$;
create or replace function _is_adult(p_user uuid) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select birth_date <= (current_date - interval '18 years')::date from person_profiles where user_id = p_user), false);
$$;

-- Prêmios dos extras da pessoa.
create or replace function club_extras(p_token text)
returns table (id uuid, source text, name text, code text, demo boolean, created_at timestamptz, valid_until timestamptz, status text, used_at timestamptz)
language sql stable security definer set search_path = public as $$
  select e.id, e.source, e.name, e.code, e.demo, e.created_at, e.valid_until,
         case when e.status = 'available' and e.valid_until < now() then 'expired' else e.status end, e.used_at
    from extra_prizes e where e.tenant_id = _club_tenant(p_token) and e.user_id = auth.uid() order by e.created_at desc limit 50;
$$;
-- Usar o prêmio na mesa: vira comprovante (uso único).
create or replace function club_extra_use(p_token text, p_id uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); e extra_prizes;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  select * into e from extra_prizes where id = p_id and tenant_id = t and user_id = u for update;
  if not found then raise exception 'not_found'; end if;
  if e.status <> 'available' then raise exception 'not_active'; end if;
  if e.valid_until < now() then raise exception 'expired'; end if;
  update extra_prizes set status = 'used', used_at = now() where id = e.id;
  perform _audit(t, 'extra_prize_used', jsonb_build_object('user', u, 'prize', e.id, 'source', e.source, 'name', e.name));
  return jsonb_build_object('id', e.id, 'code', e.code, 'name', e.name, 'demo', e.demo);
end $$;

create or replace function roulette_state(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s roulette_settings; r roulette_rounds;
begin
  if u is null or t is null then return null; end if;
  select * into s from roulette_settings where tenant_id = t;
  select * into r from roulette_rounds where tenant_id = t and user_id = u and status = 'open' and expires_at > now();
  return jsonb_build_object('enabled', s.enabled, 'steps', to_jsonb(s.steps), 'got', to_jsonb(coalesce(r.got, '{}'::text[])), 'expires_at', r.expires_at,
    'grants', (select count(*) from roulette_grants where tenant_id = t and user_id = u and status = 'available'),
    'min_subtotal_cents', s.min_subtotal_cents, 'prize_name', s.prize_name, 'prize_valid_days', s.prize_valid_days, 'window_days', s.window_days,
    'demo', s.demo, 'adult', _is_adult(u) or not s.adults_only);
end $$;

-- Libera 1 giro por visita: exige chamado de pedido real, recente e não cancelado; valor mínimo declarado pelo app.
create or replace function roulette_grant(p_token text, p_request uuid, p_subtotal_cents int) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s roulette_settings; cs club_settings; hoje date; n int;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u and status = 'active') then raise exception 'not_member'; end if;
  select * into s from roulette_settings where tenant_id = t; select * into cs from club_settings where tenant_id = t;
  if not s.enabled then raise exception 'disabled'; end if;
  if s.adults_only and not _is_adult(u) then raise exception 'adults_only'; end if;
  hoje := (now() at time zone cs.tz)::date;
  if not exists (select 1 from club_visits where tenant_id = t and user_id = u and day = hoje) then raise exception 'no_visit'; end if;
  if p_subtotal_cents is null or p_subtotal_cents < s.min_subtotal_cents then return jsonb_build_object('granted', false, 'reason', 'below_min'); end if;
  if not exists (select 1 from service_requests where id = p_request and tenant_id = t and kind = 'order' and status <> 'CANCELLED' and created_at > now() - interval '3 hours') then raise exception 'invalid_request'; end if;
  insert into roulette_grants (tenant_id, user_id, day, request_id, subtotal_cents) values (t, u, hoje, p_request, p_subtotal_cents) on conflict do nothing;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('granted', false, 'reason', 'already'); end if;
  perform _audit(t, 'roulette_grant', jsonb_build_object('user', u, 'request', p_request, 'subtotal_cents', p_subtotal_cents));
  return jsonb_build_object('granted', true);
end $$;

-- Gira: o servidor sorteia uma etapa que ainda falta. No 5º giro ganha o prêmio.
create or replace function roulette_spin(p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s roulette_settings; r roulette_rounds; g roulette_grants; falta text[]; passo text; pid uuid; ganhou boolean := false; m club_members;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  select * into m from club_members where tenant_id = t and user_id = u for update;          -- trava: um giro de cada vez
  if not found or m.status <> 'active' then raise exception 'not_member'; end if;
  select * into s from roulette_settings where tenant_id = t;
  if not s.enabled then raise exception 'disabled'; end if;
  if s.adults_only and not _is_adult(u) then raise exception 'adults_only'; end if;
  select * into g from roulette_grants where tenant_id = t and user_id = u and status = 'available' order by created_at limit 1 for update;
  if not found then raise exception 'no_grant'; end if;
  update roulette_rounds set status = 'expired' where tenant_id = t and user_id = u and status = 'open' and expires_at <= now();
  select * into r from roulette_rounds where tenant_id = t and user_id = u and status = 'open';
  if not found then
    insert into roulette_rounds (tenant_id, user_id, expires_at) values (t, u, now() + make_interval(days => s.window_days)) returning * into r;
  end if;
  falta := array(select x from unnest(s.steps) x where not x = any (r.got));
  passo := falta[1 + floor(random() * cardinality(falta))::int];
  update roulette_rounds set got = got || passo where id = r.id returning * into r;
  update roulette_grants set status = 'used', used_at = now() where id = g.id;
  if cardinality(r.got) >= cardinality(s.steps) then
    insert into extra_prizes (tenant_id, user_id, source, name, code, demo, valid_until)
      values (t, u, 'roulette', s.prize_name, _extra_code(t), s.demo, now() + make_interval(days => s.prize_valid_days)) returning id into pid;
    update roulette_rounds set status = 'won', prize_id = pid where id = r.id; ganhou := true;
  end if;
  perform _audit(t, 'roulette_spin', jsonb_build_object('user', u, 'step', passo, 'count', cardinality(r.got), 'won', ganhou));
  return jsonb_build_object('step', passo, 'count', cardinality(r.got), 'total', cardinality(s.steps), 'won', ganhou, 'prize_id', pid);
end $$;

create or replace function owner_roulette_set(p_tenant uuid, p_enabled boolean, p_min_cents int, p_window_days int, p_prize text, p_prize_days int, p_demo boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes roulette_settings;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  select * into antes from roulette_settings where tenant_id = p_tenant; if not found then return false; end if;
  update roulette_settings set enabled = p_enabled, min_subtotal_cents = p_min_cents, window_days = p_window_days, prize_name = p_prize, prize_valid_days = p_prize_days, demo = p_demo where tenant_id = p_tenant;
  perform _audit(p_tenant, 'roulette_set', jsonb_build_object('before', to_jsonb(antes), 'after', jsonb_build_object('enabled', p_enabled, 'min_cents', p_min_cents, 'window_days', p_window_days, 'prize', p_prize, 'prize_days', p_prize_days, 'demo', p_demo)));
  return true;
end $$;

revoke execute on function _roulette_seed(), _extra_code(uuid), _is_adult(uuid), club_extras(text), club_extra_use(text,uuid), roulette_state(text),
  roulette_grant(text,uuid,int), roulette_spin(text), owner_roulette_set(uuid,boolean,int,int,text,int,boolean) from public, anon, authenticated;
grant execute on function club_extras(text), club_extra_use(text,uuid), roulette_state(text), roulette_grant(text,uuid,int), roulette_spin(text) to authenticated;
grant execute on function owner_roulette_set(uuid,boolean,int,int,text,int,boolean) to authenticated;

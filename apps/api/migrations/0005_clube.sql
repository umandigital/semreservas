-- 0005 Clube: pessoas, associados por restaurante, regras de pontos, prêmios, extrato imutável e trocas.
-- Desenho (ADR-0006, docs/10): o tenant NUNCA vem do navegador (sai da placa ou do papel do usuário); acesso só por RPC
-- SECURITY DEFINER com search_path fixo; extrato imutável e idempotente; débito na troca, cancelável em 2 minutos;
-- toda ação sensível grava em audit_logs. Também deixa pronta a base do portal Master (platform_admins), sem dar
-- acesso global a ninguém: o Master age só por funções próprias, a serem criadas e auditadas depois.
-- Aplicar: colar este arquivo inteiro no SQL Editor do Supabase. É idempotente apenas nos objetos criados com "if not exists"; não altera migrações antigas.

-- ───────── Master (base) ─────────
create table if not exists platform_admins (          -- identidade da plataforma, não é dado de restaurante
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table platform_admins enable row level security;     -- sem política: ninguém lê direto
create or replace function is_platform_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from platform_admins where user_id = auth.uid());
$$;

-- ───────── pessoa (identidade global, uma por login) ─────────
create table if not exists person_profiles (          -- identidade da pessoa: exceção declarada à regra de tenant_id
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 2 and 80),
  birth_date   date not null check (birth_date >= date '1900-01-01'),
  created_at   timestamptz not null default now()
);
alter table person_profiles enable row level security;
create policy person_self_read on person_profiles for select to authenticated using (user_id = auth.uid());

-- ───────── catálogo global de ações (o que existe) e regras por restaurante (valores, limites, interruptor) ─────────
create table if not exists club_actions (
  action        text primary key,
  claimable     boolean not null,                       -- o app pode pedir os pontos (evento de intenção ou do app)
  capped        boolean not null,                       -- conta no teto mensal de interações
  def_points    int not null check (def_points >= 0),
  def_limit     text not null check (def_limit in ('once','per_day','per_week','per_month','unlimited')),
  def_limit_n   int not null default 1 check (def_limit_n >= 1)
);
alter table club_actions enable row level security;
insert into club_actions (action, claimable, capped, def_points, def_limit, def_limit_n) values
  ('signup',false,false,30,'once',1), ('profile_complete',false,false,20,'once',1),
  ('install_app',true,false,20,'once',1), ('enable_notifications',true,false,10,'once',1),
  ('checkin',false,false,30,'per_day',1), ('return_7d',false,false,20,'per_week',1), ('visits_3_month',false,false,40,'per_month',1),
  ('streak_4w',false,false,50,'unlimited',1), ('full_table',false,false,15,'per_day',1), ('campaign_checkin',false,false,20,'per_day',1),
  ('referral',false,false,100,'unlimited',1),
  ('order_via_app',false,true,10,'per_day',1), ('ar_used',true,true,5,'per_day',3),
  ('like_dish',false,true,5,'per_day',3), ('rate_dish',false,true,5,'per_day',3), ('comment_dish',false,true,20,'per_day',3),
  ('survey',false,true,10,'per_day',1), ('suggestion',false,true,10,'per_day',1),
  ('photo_frame',true,true,15,'per_day',1), ('share_photo',true,true,10,'per_week',1), ('share_app',true,true,10,'per_week',1),
  ('instagram_follow',true,false,20,'once',1), ('google_open',true,false,20,'once',1),
  ('channel_tiktok',true,false,10,'once',1), ('channel_facebook',true,false,10,'once',1), ('channel_whatsapp',true,false,10,'once',1)
on conflict (action) do nothing;

create table if not exists club_settings (
  tenant_id                uuid primary key references tenants(id) on delete cascade,
  tz                       text not null default 'America/Sao_Paulo',
  monthly_cap              int not null default 200 check (monthly_cap >= 0),
  points_expiry_days       int check (points_expiry_days is null or points_expiry_days >= 30),
  redemption_valid_minutes int not null default 30 check (redemption_valid_minutes between 5 and 240),
  cancel_window_seconds    int not null default 120 check (cancel_window_seconds between 0 and 600),
  one_redemption_per_day   boolean not null default true
);
create table if not exists club_action_rules (
  tenant_id uuid not null references tenants(id) on delete cascade,
  action    text not null references club_actions(action),
  points    int not null check (points between 0 and 1000),
  enabled   boolean not null default true,
  limit_kind text not null check (limit_kind in ('once','per_day','per_week','per_month','unlimited')),
  limit_n   int not null default 1 check (limit_n between 1 and 100),
  primary key (tenant_id, action)
);
create table if not exists club_rewards (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  name             text not null check (length(name) between 2 and 80),
  cost_points      int not null check (cost_points between 1 and 100000),
  min_visits       int not null default 0 check (min_visits >= 0),
  per_person_month int check (per_person_month is null or per_person_month >= 1),
  stock_month      int check (stock_month is null or stock_month >= 1),
  active           boolean not null default true,
  sort_order       int not null default 0,
  unique (id, tenant_id)
);
alter table club_settings enable row level security; alter table club_action_rules enable row level security; alter table club_rewards enable row level security;

-- Cada restaurante nasce com as regras padrão (o dono ajusta depois).
create or replace function _club_seed(p_tenant uuid) returns void language sql security definer set search_path = public as $$
  insert into club_settings (tenant_id) values (p_tenant) on conflict do nothing;
  insert into club_action_rules (tenant_id, action, points, limit_kind, limit_n)
    select p_tenant, action, def_points, def_limit, def_limit_n from club_actions on conflict do nothing;
$$;
create or replace function _club_on_tenant_insert() returns trigger language plpgsql security definer set search_path = public as $$
begin perform _club_seed(new.id); return new; end $$;
drop trigger if exists club_tenant_seed on tenants;
create trigger club_tenant_seed after insert on tenants for each row execute function _club_on_tenant_insert();
select _club_seed(id) from tenants;

-- ───────── associados, extrato (imutável e idempotente) e trocas ─────────
create table if not exists club_members (
  tenant_id          uuid not null references tenants(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  joined_at          timestamptz not null default now(),
  regulation_version text not null,
  publicity_consent  boolean not null default false,
  referral_code      text not null,
  referred_by        uuid,
  status             text not null default 'active' check (status in ('active','blocked')),
  primary key (tenant_id, user_id),
  unique (tenant_id, referral_code)
);
create table if not exists points_ledger (
  id         bigint generated always as identity primary key,
  tenant_id  uuid not null,
  user_id    uuid not null,
  delta      int not null check (delta <> 0),
  kind       text not null check (kind in ('earn','redeem','reversal','adjust')),
  action     text,
  idem_key   text not null,
  ref_id     uuid,
  note       text,
  created_by uuid,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade,
  unique (tenant_id, idem_key)
);
create index if not exists points_ledger_user on points_ledger (tenant_id, user_id, created_at desc);
create or replace function _ledger_imutavel() returns trigger language plpgsql as $$
begin raise exception 'ledger_immutable'; end $$;
drop trigger if exists points_ledger_no_change on points_ledger;
create trigger points_ledger_no_change before update or delete on points_ledger for each row execute function _ledger_imutavel();

create table if not exists redemptions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null,
  user_id     uuid not null,
  reward_id   uuid not null,
  reward_name text not null,
  cost_points int not null,
  code        text not null,
  table_label text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  status      text not null default 'active' check (status in ('active','cancelled','reversed')),
  closed_at   timestamptz,
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade,
  foreign key (reward_id, tenant_id) references club_rewards(id, tenant_id),
  unique (tenant_id, code)
);
create index if not exists redemptions_user on redemptions (tenant_id, user_id, created_at desc);
alter table club_members enable row level security; alter table points_ledger enable row level security; alter table redemptions enable row level security;

-- Leitura direta só para dono e gerente do PRÓPRIO restaurante; escrita só por RPC.
create policy cs_read  on club_settings     for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy car_read on club_action_rules for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy cr_read  on club_rewards      for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy cm_read  on club_members      for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy pl_read  on points_ledger     for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy rd_read  on redemptions       for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
revoke all on platform_admins, person_profiles, club_actions, club_settings, club_action_rules, club_rewards, club_members, points_ledger, redemptions from anon, authenticated;
grant select on person_profiles, club_settings, club_action_rules, club_rewards, club_members, points_ledger, redemptions to authenticated;

-- ───────── funções internas (ninguém chama de fora) ─────────
create or replace function _club_tenant(p_token text) returns uuid language sql stable security definer set search_path = public as $$
  select k.tenant_id from access_point_tokens k
    join access_points ap on ap.id = k.access_point_id and ap.tenant_id = k.tenant_id
    join tenants t on t.id = k.tenant_id
   where k.token = p_token and k.revoked_at is null and ap.state <> 'revoked' and t.status in ('trial','active');
$$;
create or replace function _club_table(p_token text) returns text language sql stable security definer set search_path = public as $$
  select vt.label from access_point_tokens k
    join access_point_assignments a on a.access_point_id = k.access_point_id and a.valid_to is null
    join venue_tables vt on vt.id = a.table_id where k.token = p_token;
$$;
create or replace function _club_start(p_kind text, p_tz text) returns timestamptz language sql stable as $$
  select case p_kind
    when 'once'      then '-infinity'::timestamptz
    when 'per_day'   then date_trunc('day',   now() at time zone p_tz) at time zone p_tz
    when 'per_week'  then date_trunc('week',  now() at time zone p_tz) at time zone p_tz
    when 'per_month' then date_trunc('month', now() at time zone p_tz) at time zone p_tz
    else '-infinity'::timestamptz end;
$$;
create or replace function _club_balance(p_tenant uuid, p_user uuid) returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(delta), 0)::int from points_ledger where tenant_id = p_tenant and user_id = p_user;
$$;
create or replace function _club_lifetime(p_tenant uuid, p_user uuid) returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(delta) filter (where delta > 0 and kind in ('earn','adjust')), 0)::int from points_ledger where tenant_id = p_tenant and user_id = p_user;
$$;
-- Credita pontos respeitando regra ligada, limite por período e teto mensal. Devolve os pontos creditados (0 se nada).
create or replace function _club_credit(p_tenant uuid, p_user uuid, p_action text, p_idem text, p_ref uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare r club_action_rules; s club_settings; a club_actions; usado int; no_mes int; n int;
begin
  select * into r from club_action_rules where tenant_id = p_tenant and action = p_action and enabled and points > 0;
  if not found then return 0; end if;
  select * into s from club_settings where tenant_id = p_tenant;
  select * into a from club_actions where action = p_action;
  if r.limit_kind <> 'unlimited' then
    select count(*) into usado from points_ledger where tenant_id = p_tenant and user_id = p_user and kind = 'earn' and action = p_action
       and created_at >= _club_start(r.limit_kind, s.tz);
    if usado >= r.limit_n then return 0; end if;
  end if;
  if a.capped then
    select coalesce(sum(l.delta), 0) into no_mes from points_ledger l join club_actions ca on ca.action = l.action
     where l.tenant_id = p_tenant and l.user_id = p_user and l.kind = 'earn' and ca.capped and l.created_at >= _club_start('per_month', s.tz);
    if no_mes + r.points > s.monthly_cap then return 0; end if;
  end if;
  insert into points_ledger (tenant_id, user_id, delta, kind, action, idem_key, ref_id)
    values (p_tenant, p_user, r.points, 'earn', p_action, p_idem, p_ref) on conflict (tenant_id, idem_key) do nothing;
  get diagnostics n = row_count;
  return case when n = 1 then r.points else 0 end;
end $$;
create or replace function _audit(p_tenant uuid, p_action text, p_detail jsonb) returns void language sql security definer set search_path = public as $$
  insert into audit_logs (tenant_id, actor_id, action, detail) values (p_tenant, auth.uid(), p_action, p_detail);
$$;

-- ───────── RPC do cliente (sempre logado; o restaurante vem da placa) ─────────
create or replace function club_join(p_token text, p_name text, p_birth date, p_regulation text, p_publicity boolean default false, p_ref text default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); v_code text; ref uuid; ganhos int := 0;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if p_birth is null or p_birth > (current_date - interval '13 years')::date or p_birth < date '1900-01-01' then raise exception 'invalid_birth'; end if;
  if coalesce(length(trim(p_regulation)), 0) = 0 then raise exception 'regulation_required'; end if;
  insert into person_profiles (user_id, display_name, birth_date) values (u, trim(p_name), p_birth) on conflict (user_id) do nothing;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u) then
    loop
      v_code := substr(translate(upper(encode(gen_random_bytes(8), 'base64')), '+/=IL1O0', 'XYZKMNPQ'), 1, 6);
      exit when not exists (select 1 from club_members where tenant_id = t and referral_code = v_code);
    end loop;
    if p_ref is not null then select user_id into ref from club_members where tenant_id = t and referral_code = upper(p_ref) and user_id <> u; end if;
    insert into club_members (tenant_id, user_id, regulation_version, publicity_consent, referral_code, referred_by)
      values (t, u, p_regulation, p_publicity, v_code, ref);
    ganhos := _club_credit(t, u, 'signup', 'signup:' || u) + _club_credit(t, u, 'profile_complete', 'profile:' || u);
    perform _audit(t, 'club_join', jsonb_build_object('user', u, 'referred_by', ref));
  end if;
  return jsonb_build_object('credited', ganhos, 'balance', _club_balance(t, u));
end $$;

create or replace function club_me(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); m club_members; p person_profiles;
begin
  if u is null or t is null then return null; end if;
  select * into m from club_members where tenant_id = t and user_id = u;
  if not found then return jsonb_build_object('member', false); end if;
  select * into p from person_profiles where user_id = u;
  return jsonb_build_object('member', true, 'name', p.display_name, 'birth_day', extract(day from p.birth_date), 'birth_month', extract(month from p.birth_date),
    'balance', _club_balance(t, u), 'lifetime', _club_lifetime(t, u), 'referral_code', m.referral_code, 'blocked', m.status = 'blocked');
end $$;

-- Regras e prêmios são públicos para quem está na mesa (mostram "como ganhar" e o catálogo até para visitante).
create or replace function club_rules(p_token text) returns table (action text, points int, limit_kind text, limit_n int)
language sql stable security definer set search_path = public as $$
  select r.action, r.points, r.limit_kind, r.limit_n from club_action_rules r where r.tenant_id = _club_tenant(p_token) and r.enabled and r.points > 0 order by r.points desc, r.action;
$$;
create or replace function club_catalog(p_token text) returns table (id uuid, name text, cost_points int, min_visits int)
language sql stable security definer set search_path = public as $$
  select id, name, cost_points, min_visits from club_rewards where tenant_id = _club_tenant(p_token) and active order by cost_points, sort_order;
$$;

-- Pontos por ação de intenção/app (só as marcadas "claimable"). Toques repetidos não duplicam (idempotente por período).
create or replace function club_earn(p_token text, p_action text) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); r club_action_rules; s club_settings; chave text; ganho int;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from club_actions where action = p_action and claimable) then raise exception 'action_not_claimable'; end if;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u and status = 'active') then raise exception 'not_member'; end if;
  select * into r from club_action_rules where tenant_id = t and action = p_action;
  select * into s from club_settings where tenant_id = t;
  chave := 'earn:' || p_action || ':' || u || ':' || case when r.limit_kind in ('once','unlimited') then 'x' else to_char(_club_start(r.limit_kind, s.tz) at time zone s.tz, 'YYYYMMDDHH24MI') end || ':' ||
           (select count(*) from points_ledger where tenant_id = t and user_id = u and action = p_action and kind = 'earn' and created_at >= _club_start(r.limit_kind, s.tz));
  ganho := _club_credit(t, u, p_action, chave);
  return jsonb_build_object('credited', ganho, 'balance', _club_balance(t, u));
end $$;

create or replace function club_redeem(p_token text, p_reward uuid) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); m club_members; rw club_rewards; s club_settings; saldo int; rid uuid := gen_random_uuid(); v_code text; n int; visitas int; tabela text := _club_table(p_token); exp timestamptz;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  select * into m from club_members where tenant_id = t and user_id = u for update;          -- trava: evita troca dupla em paralelo
  if not found or m.status <> 'active' then raise exception 'not_member'; end if;
  select * into rw from club_rewards where id = p_reward and tenant_id = t and active;
  if not found then raise exception 'reward_unavailable'; end if;
  select * into s from club_settings where tenant_id = t;
  saldo := _club_balance(t, u);
  if saldo < rw.cost_points then raise exception 'insufficient_points'; end if;
  select count(*) into visitas from points_ledger where tenant_id = t and user_id = u and action = 'checkin' and kind = 'earn';
  if visitas < rw.min_visits then raise exception 'min_visits'; end if;
  if s.one_redemption_per_day and exists (select 1 from redemptions where tenant_id = t and user_id = u and status = 'active' and created_at >= _club_start('per_day', s.tz)) then raise exception 'one_per_day'; end if;
  if rw.per_person_month is not null then
    select count(*) into n from redemptions where tenant_id = t and user_id = u and reward_id = rw.id and status = 'active' and created_at >= _club_start('per_month', s.tz);
    if n >= rw.per_person_month then raise exception 'person_limit'; end if;
  end if;
  if rw.stock_month is not null then
    select count(*) into n from redemptions where tenant_id = t and reward_id = rw.id and status = 'active' and created_at >= _club_start('per_month', s.tz);
    if n >= rw.stock_month then raise exception 'sold_out'; end if;
  end if;
  loop
    v_code := substr(translate(upper(encode(gen_random_bytes(8), 'base64')), '+/=IL1O0', 'XYZKMNPQ'), 1, 6);
    exit when not exists (select 1 from redemptions where tenant_id = t and code = v_code);
  end loop;
  exp := now() + make_interval(mins => s.redemption_valid_minutes);
  insert into redemptions (id, tenant_id, user_id, reward_id, reward_name, cost_points, code, table_label, expires_at)
    values (rid, t, u, rw.id, rw.name, rw.cost_points, v_code, tabela, exp);
  insert into points_ledger (tenant_id, user_id, delta, kind, action, idem_key, ref_id) values (t, u, -rw.cost_points, 'redeem', 'redeem', 'redeem:' || rid, rid);
  perform _audit(t, 'club_redeem', jsonb_build_object('user', u, 'reward', rw.name, 'cost', rw.cost_points, 'redemption', rid));
  return jsonb_build_object('id', rid, 'code', v_code, 'reward', rw.name, 'expires_at', exp, 'balance', saldo - rw.cost_points);
end $$;

create or replace function club_cancel_redemption(p_token text, p_id uuid) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); rd redemptions; s club_settings;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  select * into rd from redemptions where id = p_id and tenant_id = t and user_id = u for update;
  if not found then raise exception 'not_found'; end if;
  select * into s from club_settings where tenant_id = t;
  if rd.status <> 'active' then raise exception 'not_active'; end if;
  if now() > rd.created_at + make_interval(secs => s.cancel_window_seconds) then raise exception 'cancel_window_over'; end if;
  update redemptions set status = 'cancelled', closed_at = now() where id = rd.id;
  insert into points_ledger (tenant_id, user_id, delta, kind, action, idem_key, ref_id) values (t, u, rd.cost_points, 'reversal', 'redeem_cancel', 'reversal:' || rd.id, rd.id);
  perform _audit(t, 'club_redeem_cancelled', jsonb_build_object('user', u, 'redemption', rd.id));
  return jsonb_build_object('balance', _club_balance(t, u));
end $$;

create or replace function club_my_ledger(p_token text, p_limit int default 50)
returns table (created_at timestamptz, delta int, kind text, action text, note text) language sql stable security definer set search_path = public as $$
  select l.created_at, l.delta, l.kind, l.action, l.note from points_ledger l
   where l.tenant_id = _club_tenant(p_token) and l.user_id = auth.uid() order by l.id desc limit least(greatest(p_limit, 1), 200);
$$;
create or replace function club_my_redemptions(p_token text)
returns table (id uuid, reward_name text, code text, created_at timestamptz, expires_at timestamp with time zone, status text) language sql stable security definer set search_path = public as $$
  select r.id, r.reward_name, r.code, r.created_at, r.expires_at, r.status from redemptions r
   where r.tenant_id = _club_tenant(p_token) and r.user_id = auth.uid() order by r.created_at desc limit 50;
$$;

-- ───────── RPC do proprietário (papel conferido no servidor) ─────────
create or replace function owner_club_rule_set(p_tenant uuid, p_action text, p_points int, p_enabled boolean, p_limit_kind text, p_limit_n int)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes club_action_rules;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  select * into antes from club_action_rules where tenant_id = p_tenant and action = p_action;
  if not found then return false; end if;
  update club_action_rules set points = p_points, enabled = p_enabled, limit_kind = p_limit_kind, limit_n = p_limit_n where tenant_id = p_tenant and action = p_action;
  perform _audit(p_tenant, 'club_rule_set', jsonb_build_object('action', p_action, 'before', to_jsonb(antes), 'after', jsonb_build_object('points', p_points, 'enabled', p_enabled, 'limit_kind', p_limit_kind, 'limit_n', p_limit_n)));
  return true;
end $$;
create or replace function owner_club_reward_set(p_tenant uuid, p_id uuid, p_name text, p_cost int, p_min_visits int, p_per_person int, p_stock int, p_active boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare rid uuid := coalesce(p_id, gen_random_uuid()); antes jsonb;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return null; end if;
  select to_jsonb(r) into antes from club_rewards r where id = rid and tenant_id = p_tenant;
  if p_id is not null and antes is null then return null; end if;                    -- id de outro restaurante não vale
  insert into club_rewards (id, tenant_id, name, cost_points, min_visits, per_person_month, stock_month, active)
    values (rid, p_tenant, p_name, p_cost, p_min_visits, p_per_person, p_stock, p_active)
    on conflict (id) do update set name = excluded.name, cost_points = excluded.cost_points, min_visits = excluded.min_visits,
      per_person_month = excluded.per_person_month, stock_month = excluded.stock_month, active = excluded.active
      where club_rewards.tenant_id = p_tenant;
  perform _audit(p_tenant, 'club_reward_set', jsonb_build_object('reward', rid, 'before', antes, 'after', jsonb_build_object('name', p_name, 'cost', p_cost, 'active', p_active)));
  return rid;
end $$;
create or replace function owner_club_reverse_redemption(p_tenant uuid, p_id uuid, p_reason text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rd redemptions;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or coalesce(length(trim(p_reason)), 0) < 5 then return false; end if;
  select * into rd from redemptions where id = p_id and tenant_id = p_tenant for update;
  if not found or rd.status <> 'active' then return false; end if;
  update redemptions set status = 'reversed', closed_at = now() where id = rd.id;
  insert into points_ledger (tenant_id, user_id, delta, kind, action, idem_key, ref_id, note, created_by)
    values (p_tenant, rd.user_id, rd.cost_points, 'reversal', 'redeem_reversed', 'reversal:' || rd.id, rd.id, p_reason, auth.uid());
  perform _audit(p_tenant, 'club_redemption_reversed', jsonb_build_object('redemption', rd.id, 'user', rd.user_id, 'reason', p_reason));
  return true;
end $$;
create or replace function owner_club_adjust(p_tenant uuid, p_user uuid, p_delta int, p_reason text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or p_delta = 0 or abs(p_delta) > 1000 or coalesce(length(trim(p_reason)), 0) < 5 then return false; end if;
  if not exists (select 1 from club_members where tenant_id = p_tenant and user_id = p_user) then return false; end if;
  if p_delta < 0 and _club_balance(p_tenant, p_user) + p_delta < 0 then return false; end if;
  insert into points_ledger (tenant_id, user_id, delta, kind, action, idem_key, note, created_by)
    values (p_tenant, p_user, p_delta, 'adjust', 'manual_adjust', 'adjust:' || gen_random_uuid(), p_reason, auth.uid());
  perform _audit(p_tenant, 'club_points_adjusted', jsonb_build_object('user', p_user, 'delta', p_delta, 'reason', p_reason));
  return true;
end $$;

-- ───────── permissões das funções (só as novas; as antigas não são tocadas) ─────────
-- No Supabase real, funções novas nascem executáveis por anon/authenticated: revogamos uma a uma e liberamos só o necessário.
revoke execute on function _club_seed(uuid), _club_on_tenant_insert(), _club_tenant(text), _club_table(text), _club_start(text,text),
  _club_balance(uuid,uuid), _club_lifetime(uuid,uuid), _club_credit(uuid,uuid,text,text,uuid), _audit(uuid,text,jsonb), _ledger_imutavel(),
  is_platform_admin(),
  club_rules(text), club_catalog(text), club_join(text,text,date,text,boolean,text), club_me(text), club_earn(text,text), club_redeem(text,uuid),
  club_cancel_redemption(text,uuid), club_my_ledger(text,int), club_my_redemptions(text),
  owner_club_rule_set(uuid,text,int,boolean,text,int), owner_club_reward_set(uuid,uuid,text,int,int,int,int,boolean),
  owner_club_reverse_redemption(uuid,uuid,text), owner_club_adjust(uuid,uuid,int,text)
  from public, anon, authenticated;
grant execute on function club_rules(text), club_catalog(text) to anon, authenticated;
grant execute on function club_join(text,text,date,text,boolean,text), club_me(text), club_earn(text,text), club_redeem(text,uuid),
  club_cancel_redemption(text,uuid), club_my_ledger(text,int), club_my_redemptions(text) to authenticated;
grant execute on function owner_club_rule_set(uuid,text,int,boolean,text,int), owner_club_reward_set(uuid,uuid,text,int,int,int,int,boolean),
  owner_club_reverse_redemption(uuid,uuid,text), owner_club_adjust(uuid,uuid,int,text), is_platform_admin() to authenticated;

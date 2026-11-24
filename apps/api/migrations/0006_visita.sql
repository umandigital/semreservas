-- 0006 Visita e opinião: check-in na placa (+30, 1 por dia), retorno, frequência, sequência, mesa cheia, indicação,
-- horário de funcionamento, presença (reaproveita a política da 0004) e "Como foi a visita?" (nota, curtidas, comentário).
-- Mesmos princípios da 0005: tenant pela placa, RPC com search_path fixo, extrato idempotente, auditoria, sem acesso direto.
-- Aplicar colando no SQL Editor (depois da 0005). Não altera migrações antigas.

alter table club_settings
  add column if not exists checkin_mode   text not null default 'A' check (checkin_mode in ('A','B')),  -- A: pontos na hora; B: com sinal de consumo (futuro)
  add column if not exists hours_enforced boolean not null default false,
  add column if not exists open_days      int[] not null default '{2,3,4,5,6,7}',                       -- ISO: 1=segunda … 7=domingo
  add column if not exists open_from      time not null default '19:00',
  add column if not exists open_to        time not null default '23:30',
  add column if not exists grace_min      int not null default 30 check (grace_min between 0 and 180);

create table if not exists club_visits (
  tenant_id   uuid not null,
  user_id     uuid not null,
  day         date not null,
  table_label text,
  presence    text not null default 'unknown' check (presence in ('near','far','unknown')),
  distance_m  int,
  created_at  timestamptz not null default now(),
  primary key (tenant_id, user_id, day),
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade
);
create index if not exists club_visits_dia on club_visits (tenant_id, day);
create table if not exists club_feedback (
  tenant_id  uuid not null,
  user_id    uuid not null,
  day        date not null,
  rating     int not null check (rating between 1 and 5),
  comment    text check (comment is null or length(comment) <= 600),
  liked      text[] not null default '{}',
  status     text not null default 'pending' check (status in ('pending','published','rejected')),   -- moderação do dono
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id, day),
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade
);
alter table club_visits enable row level security; alter table club_feedback enable row level security;
create policy cv_read on club_visits   for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy cf_read on club_feedback for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
revoke all on club_visits, club_feedback from anon, authenticated;
grant select on club_visits, club_feedback to authenticated;

create or replace function _club_monday(d date) returns date language sql immutable as $$ select d - (extract(isodow from d)::int - 1) $$;

-- Check-in: 1 por dia por pessoa. Devolve o que foi creditado (visita e bônus).
create or replace function club_checkin(p_token text, p_lat double precision default null, p_lon double precision default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); m club_members; s club_settings; ten tenants; hoje date; loc timestamp; min_dia numeric;
        tab text := _club_table(p_token); dist int; pres text := 'unknown'; n int; total int := 0; g int; bonus text[] := '{}'; segunda date; ok boolean := true; i int; r record;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  select * into m from club_members where tenant_id = t and user_id = u;
  if not found or m.status <> 'active' then raise exception 'not_member'; end if;
  select * into s from club_settings where tenant_id = t;
  select * into ten from tenants where id = t;
  loc := now() at time zone s.tz; hoje := loc::date; min_dia := extract(hour from loc) * 60 + extract(minute from loc);
  if s.hours_enforced and not (extract(isodow from loc)::int = any (s.open_days)
       and min_dia >= extract(hour from s.open_from) * 60 + extract(minute from s.open_from)
       and min_dia <= extract(hour from s.open_to) * 60 + extract(minute from s.open_to) + s.grace_min) then raise exception 'closed'; end if;
  if ten.lat is not null and ten.lon is not null then
    if p_lat is not null and p_lon is not null then
      dist := _distance_m(ten.lat, ten.lon, p_lat, p_lon); pres := case when dist <= ten.radius_m then 'near' else 'far' end;
      if pres = 'far' and ten.presence_policy in ('block_far','require') then raise exception 'too_far'; end if;
    elsif ten.presence_policy = 'require' then raise exception 'location_required'; end if;
  end if;
  insert into club_visits (tenant_id, user_id, day, table_label, presence, distance_m) values (t, u, hoje, tab, pres, dist) on conflict do nothing;
  get diagnostics n = row_count;
  if n = 0 then return jsonb_build_object('credited', 0, 'already', true, 'balance', _club_balance(t, u), 'bonuses', bonus); end if;

  g := _club_credit(t, u, 'checkin', 'checkin:' || u || ':' || hoje); total := total + g; if g > 0 then bonus := array_append(bonus, 'checkin'); end if;
  -- indicação: o amigo fez o 1º check-in, quem indicou ganha
  if m.referred_by is not null and (select count(*) from club_visits where tenant_id = t and user_id = u) = 1 then
    perform _club_credit(t, m.referred_by, 'referral', 'referral:' || u);
  end if;
  -- voltar em até 7 dias
  if exists (select 1 from club_visits where tenant_id = t and user_id = u and day between hoje - 7 and hoje - 1) then
    g := _club_credit(t, u, 'return_7d', 'return7:' || u || ':' || hoje); total := total + g; if g > 0 then bonus := array_append(bonus, 'return_7d'); end if;
  end if;
  -- 3 visitas no mês
  if (select count(*) from club_visits where tenant_id = t and user_id = u and day >= date_trunc('month', hoje)::date) = 3 then
    g := _club_credit(t, u, 'visits_3_month', 'v3:' || u || ':' || to_char(hoje, 'YYYYMM')); total := total + g; if g > 0 then bonus := array_append(bonus, 'visits_3_month'); end if;
  end if;
  -- 4 semanas seguidas (uma vez a cada 4 semanas)
  segunda := _club_monday(hoje);
  for i in 0..3 loop
    if not exists (select 1 from club_visits where tenant_id = t and user_id = u and day between segunda - 7 * i and segunda - 7 * i + 6) then ok := false; end if;
  end loop;
  if ok and not exists (select 1 from points_ledger where tenant_id = t and user_id = u and action = 'streak_4w' and kind = 'earn' and created_at > now() - interval '27 days') then
    g := _club_credit(t, u, 'streak_4w', 'streak:' || u || ':' || segunda); total := total + g; if g > 0 then bonus := array_append(bonus, 'streak_4w'); end if;
  end if;
  -- mesa cheia: 3 ou mais associados na mesma mesa hoje; todos ganham uma vez
  if tab is not null and (select count(*) from club_visits where tenant_id = t and day = hoje and table_label = tab) >= 3 then
    for r in select user_id from club_visits where tenant_id = t and day = hoje and table_label = tab loop
      g := _club_credit(t, r.user_id, 'full_table', 'fulltable:' || r.user_id || ':' || hoje);
      if r.user_id = u then total := total + g; if g > 0 then bonus := array_append(bonus, 'full_table'); end if; end if;
    end loop;
  end if;
  perform _audit(t, 'club_checkin', jsonb_build_object('user', u, 'table', tab, 'presence', pres, 'credited', total));
  return jsonb_build_object('credited', total, 'already', false, 'balance', _club_balance(t, u), 'bonuses', bonus);
end $$;

-- Como foi a visita: nota geral, pratos que gostou e comentário (vai para moderação do dono). Exige check-in no dia.
create or replace function club_feedback(p_token text, p_rating int, p_comment text default null, p_liked text[] default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s club_settings; hoje date; c text := nullif(trim(coalesce(p_comment, '')), ''); total int := 0; g int; i int; liked text[] := '{}'; l text;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'invalid_rating'; end if;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u and status = 'active') then raise exception 'not_member'; end if;
  select * into s from club_settings where tenant_id = t; hoje := (now() at time zone s.tz)::date;
  if not exists (select 1 from club_visits where tenant_id = t and user_id = u and day = hoje) then raise exception 'no_visit'; end if;
  if c is not null and (length(c) > 600 or c ~* '(https?://|www\.|\.com|@)') then c := null; end if;      -- sem links nem contatos
  foreach l in array coalesce(p_liked, '{}') loop if length(trim(l)) between 1 and 60 and cardinality(liked) < 10 then liked := liked || trim(l); end if; end loop;
  insert into club_feedback (tenant_id, user_id, day, rating, comment, liked) values (t, u, hoje, p_rating, c, liked) on conflict do nothing;
  get diagnostics i = row_count;
  if i = 0 then raise exception 'already_sent'; end if;
  g := _club_credit(t, u, 'survey', 'survey:' || u || ':' || hoje); total := total + g;
  for i in 1..least(cardinality(liked), 3) loop g := _club_credit(t, u, 'like_dish', 'like:' || u || ':' || hoje || ':' || i); total := total + g; end loop;
  if c is not null and length(c) >= 20 then g := _club_credit(t, u, 'comment_dish', 'comment:' || u || ':' || hoje); total := total + g; end if;
  perform _audit(t, 'club_feedback', jsonb_build_object('user', u, 'rating', p_rating, 'credited', total));
  return jsonb_build_object('credited', total, 'balance', _club_balance(t, u));
end $$;

-- Dono: moderar comentário (publicar ou recusar).
create or replace function owner_club_feedback_moderate(p_tenant uuid, p_user uuid, p_day date, p_status text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or p_status not in ('published','rejected') then return false; end if;
  update club_feedback set status = p_status where tenant_id = p_tenant and user_id = p_user and day = p_day;
  if not found then return false; end if;
  perform _audit(p_tenant, 'club_feedback_moderated', jsonb_build_object('user', p_user, 'day', p_day, 'status', p_status));
  return true;
end $$;

-- Pessoa: ver se já fez a visita de hoje (o app só pede o check-in uma vez por dia).
create or replace function club_today(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s club_settings; hoje date;
begin
  if u is null or t is null then return null; end if;
  select * into s from club_settings where tenant_id = t; hoje := (now() at time zone s.tz)::date;
  return jsonb_build_object('visited', exists (select 1 from club_visits where tenant_id = t and user_id = u and day = hoje),
    'feedback', exists (select 1 from club_feedback where tenant_id = t and user_id = u and day = hoje),
    'visits', (select count(*) from club_visits where tenant_id = t and user_id = u));
end $$;

revoke execute on function _club_monday(date), club_checkin(text,double precision,double precision), club_feedback(text,int,text,text[]),
  owner_club_feedback_moderate(uuid,uuid,date,text), club_today(text) from public, anon, authenticated;
grant execute on function club_checkin(text,double precision,double precision), club_feedback(text,int,text,text[]), club_today(text) to authenticated;
grant execute on function owner_club_feedback_moderate(uuid,uuid,date,text) to authenticated;

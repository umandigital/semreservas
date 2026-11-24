-- 0008 Meu aniversário (fora do Clube): presente no dia do aniversário (ou no dia seguinte), 1 vez por ano, com validade própria.
-- A data vem do cadastro (person_profiles). O presente vira um prêmio dos extras (extra_prizes, da 0007).
create table if not exists birthday_settings (
  tenant_id     uuid primary key references tenants(id) on delete cascade,
  enabled       boolean not null default false,
  benefit       text not null default 'Sobremesa da casa' check (length(benefit) between 2 and 80),
  guests_pct    int not null default 50 check (guests_pct between 0 and 100),
  min_guests    int not null default 5 check (min_guests between 0 and 50),
  valid_days    int not null default 2 check (valid_days between 1 and 30),   -- contados a partir do dia do aniversário
  demo          boolean not null default true
);
create table if not exists birthday_claims (
  tenant_id uuid not null, user_id uuid not null, year int not null, prize_id uuid references extra_prizes(id), created_at timestamptz not null default now(),
  primary key (tenant_id, user_id, year),
  foreign key (tenant_id, user_id) references club_members(tenant_id, user_id) on delete cascade
);
alter table birthday_settings enable row level security; alter table birthday_claims enable row level security;
create policy bs_read on birthday_settings for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
create policy bc_read on birthday_claims   for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager']));
revoke all on birthday_settings, birthday_claims from anon, authenticated;
grant select on birthday_settings, birthday_claims to authenticated;
create or replace function _birthday_seed() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into birthday_settings (tenant_id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists birthday_tenant_seed on tenants;
create trigger birthday_tenant_seed after insert on tenants for each row execute function _birthday_seed();
insert into birthday_settings (tenant_id) select id from tenants on conflict do nothing;

-- Dia do aniversário neste ano (29/02 vira o último dia de fevereiro nos anos comuns).
create or replace function _birthday_this_year(p_birth date, p_year int) returns date language sql immutable as $$
  select least(make_date(p_year, extract(month from p_birth)::int, 1) + (extract(day from p_birth)::int - 1),
               (make_date(p_year, extract(month from p_birth)::int, 1) + interval '1 month - 1 day')::date);
$$;
create or replace function club_birthday_state(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); s birthday_settings; cs club_settings; p person_profiles; hoje date; b date; dias int; ja boolean;
begin
  if u is null or t is null then return null; end if;
  select * into s from birthday_settings where tenant_id = t; select * into cs from club_settings where tenant_id = t;
  select * into p from person_profiles where user_id = u; if not found then return jsonb_build_object('enabled', s.enabled); end if;
  hoje := (now() at time zone cs.tz)::date; b := _birthday_this_year(p.birth_date, extract(year from hoje)::int);
  if b < hoje - 1 then b := _birthday_this_year(p.birth_date, extract(year from hoje)::int + 1); end if;
  dias := b - hoje;
  ja := exists (select 1 from birthday_claims where tenant_id = t and user_id = u and year = extract(year from b)::int);
  return jsonb_build_object('enabled', s.enabled, 'benefit', s.benefit, 'guests_pct', s.guests_pct, 'min_guests', s.min_guests, 'valid_days', s.valid_days, 'demo', s.demo,
    'day', extract(day from p.birth_date), 'month', extract(month from p.birth_date), 'days_until', dias,
    'can_claim', s.enabled and dias between -1 and 0 and not ja, 'claimed', ja);
end $$;
create or replace function club_birthday_claim(p_token text) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); st jsonb; s birthday_settings; cs club_settings; p person_profiles; hoje date; b date; pid uuid; ate timestamptz;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u and status = 'active') then raise exception 'not_member'; end if;
  st := club_birthday_state(p_token);
  if not coalesce((st->>'enabled')::boolean, false) then raise exception 'disabled'; end if;
  if (st->>'claimed')::boolean then raise exception 'already_claimed'; end if;
  if not (st->>'can_claim')::boolean then raise exception 'not_birthday'; end if;
  select * into s from birthday_settings where tenant_id = t; select * into cs from club_settings where tenant_id = t;
  select * into p from person_profiles where user_id = u;
  hoje := (now() at time zone cs.tz)::date; b := hoje + (st->>'days_until')::int;
  ate := ((b + s.valid_days)::timestamp) at time zone cs.tz;
  insert into extra_prizes (tenant_id, user_id, source, name, code, demo, valid_until) values (t, u, 'birthday', s.benefit, _extra_code(t), s.demo, ate) returning id into pid;
  insert into birthday_claims (tenant_id, user_id, year, prize_id) values (t, u, extract(year from b)::int, pid);
  perform _audit(t, 'birthday_claim', jsonb_build_object('user', u, 'prize', pid));
  return jsonb_build_object('prize_id', pid, 'valid_until', ate);
end $$;
create or replace function owner_birthday_set(p_tenant uuid, p_enabled boolean, p_benefit text, p_pct int, p_min_guests int, p_valid_days int, p_demo boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes birthday_settings;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  select * into antes from birthday_settings where tenant_id = p_tenant; if not found then return false; end if;
  update birthday_settings set enabled = p_enabled, benefit = p_benefit, guests_pct = p_pct, min_guests = p_min_guests, valid_days = p_valid_days, demo = p_demo where tenant_id = p_tenant;
  perform _audit(p_tenant, 'birthday_set', jsonb_build_object('before', to_jsonb(antes), 'after', jsonb_build_object('enabled', p_enabled, 'benefit', p_benefit, 'pct', p_pct, 'min_guests', p_min_guests, 'valid_days', p_valid_days)));
  return true;
end $$;
revoke execute on function _birthday_seed(), _birthday_this_year(date,int), club_birthday_state(text), club_birthday_claim(text), owner_birthday_set(uuid,boolean,text,int,int,int,boolean) from public, anon, authenticated;
grant execute on function club_birthday_state(text), club_birthday_claim(text) to authenticated;
grant execute on function owner_birthday_set(uuid,boolean,text,int,int,int,boolean) to authenticated;

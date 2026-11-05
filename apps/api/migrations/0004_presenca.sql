-- 0004 Presença: reduzir chamados feitos de longe (de casa, por brincadeira ou engano).
-- Camadas (nenhuma é perfeita sozinha; juntas tornam o abuso difícil, visível e barato de ignorar):
--  1. localização do aparelho no momento do chamado, comparada ao raio do restaurante;
--  2. limite de chamados por aparelho e bloqueio de 24 h depois de 2 trotes marcados pela equipe;
--  3. a equipe vê se o chamado está "no local", "longe" ou "não verificado" e marca "sem ninguém".
-- Privacidade: a posição NÃO é gravada. Só o veredito (perto/longe/não verificado) e a distância em metros.

alter table tenants
  add column lat double precision check (lat between -90 and 90),
  add column lon double precision check (lon between -180 and 180),
  add column radius_m int not null default 150 check (radius_m between 30 and 2000),
  add column presence_policy text not null default 'block_far'
    check (presence_policy in ('off','flag','block_far','require'));
comment on column tenants.presence_policy is
  'off=ignora · flag=aceita e sinaliza · block_far=recusa quem está longe (aceita sem localização, sinalizado) · require=recusa longe e sem localização. Sem lat/lon cadastrados nada é verificado.';

alter table service_requests
  add column device_id   text,
  add column presence    text not null default 'unknown' check (presence in ('near','far','unknown')),
  add column distance_m  int,
  add column false_alarm boolean not null default false;

create table device_flags (
  tenant_id     uuid not null references tenants(id) on delete cascade,
  device_id     text not null,
  false_alarms  int  not null default 0,
  window_start  timestamptz not null default now(),
  blocked_until timestamptz,
  primary key (tenant_id, device_id)
);
alter table device_flags enable row level security;
revoke all on device_flags from anon, authenticated;

-- Distância entre dois pontos da Terra (haversine), em metros.
create function _distance_m(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
returns int language sql immutable as $$
  select round(2 * 6371000 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
  )))::int;
$$;

-- Nova assinatura (aparelho e posição). A antiga é removida; chamadas só com os 4 primeiros campos continuam valendo.
drop function create_service_request(text, text, text, text);
create function create_service_request(
  p_token text, p_kind text, p_table_label text default null, p_detail text default null,
  p_device text default null, p_lat double precision default null, p_lon double precision default null)
returns table (id uuid, status text, public_code text, table_label text, cancel_token text, already_open boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_tenant uuid; v_ap uuid; v_table uuid; v_label text; v_token text; v_code text; v_id uuid; v_ex service_requests;
  v_tlat double precision; v_tlon double precision; v_rad int; v_pol text; v_presence text := 'unknown'; v_dist int;
begin
  if p_kind not in ('waiter','bill','question','order','other','kitchen_item') then raise exception 'invalid_kind'; end if;
  p_detail := nullif(left(trim(coalesce(p_detail, '')), 80), '');
  if p_device is not null and length(p_device) not between 8 and 64 then p_device := null; end if;
  select k.tenant_id, ap.id into v_tenant, v_ap
    from access_point_tokens k
    join access_points ap on ap.id = k.access_point_id and ap.tenant_id = k.tenant_id
    join tenants t on t.id = k.tenant_id
   where k.token = p_token and k.revoked_at is null and ap.state <> 'revoked' and t.status in ('trial','active');
  if v_tenant is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from tenant_modules m where m.tenant_id = v_tenant and m.module = 'waiter_call' and m.enabled) then
    raise exception 'module_disabled'; end if;

  if p_table_label is null then
    select vt.id, vt.label into v_table, v_label
      from access_point_assignments a join venue_tables vt on vt.id = a.table_id
     where a.access_point_id = v_ap and a.valid_to is null;
  else
    select vt.id, vt.label into v_table, v_label from venue_tables vt where vt.tenant_id = v_tenant and vt.label = p_table_label;
  end if;
  if v_table is null then raise exception 'invalid_table'; end if;

  -- aparelho bloqueado por trotes, ou chamando demais
  if p_device is not null then
    if exists (select 1 from device_flags f where f.tenant_id = v_tenant and f.device_id = p_device and f.blocked_until > now()) then
      raise exception 'device_blocked'; end if;
    if (select count(*) from service_requests r where r.tenant_id = v_tenant and r.device_id = p_device and r.created_at > now() - interval '10 minutes') >= 6 then
      raise exception 'rate_limited'; end if;
  end if;

  -- presença: a posição é usada só para este cálculo e não é gravada
  select t.lat, t.lon, t.radius_m, t.presence_policy into v_tlat, v_tlon, v_rad, v_pol from tenants t where t.id = v_tenant;
  if v_pol <> 'off' and v_tlat is not null and v_tlon is not null
     and p_lat between -90 and 90 and p_lon between -180 and 180 then
    v_dist := _distance_m(p_lat, p_lon, v_tlat, v_tlon);
    v_presence := case when v_dist <= v_rad then 'near' else 'far' end;
  end if;
  if v_pol in ('block_far','require') and v_presence = 'far' then raise exception 'too_far'; end if;
  if v_pol = 'require' and v_tlat is not null and v_presence = 'unknown' then raise exception 'location_required'; end if;

  if (select count(*) from service_requests r where r.tenant_id = v_tenant and r.created_at > now() - interval '1 minute') >= 30 then
    raise exception 'rate_limited'; end if;

  select * into v_ex from service_requests r where r.tenant_id = v_tenant and r.table_id = v_table and r.kind = p_kind and coalesce(r.detail,'') = coalesce(p_detail,'') and r.status in ('PENDING','ACKNOWLEDGED');
  if found then return query select v_ex.id, v_ex.status, v_ex.public_code, v_ex.table_label, null::text, true; return; end if;

  v_token := encode(gen_random_bytes(18), 'hex');
  v_code  := (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, 4));
  begin
    insert into service_requests (tenant_id, table_id, table_label, kind, detail, public_code, cancel_token_hash, device_id, presence, distance_m)
    values (v_tenant, v_table, v_label, p_kind, p_detail, v_code, encode(digest(v_token, 'sha256'), 'hex'), p_device, v_presence, v_dist) returning service_requests.id into v_id;
  exception when unique_violation then
    select * into v_ex from service_requests r where r.tenant_id = v_tenant and r.table_id = v_table and r.kind = p_kind and coalesce(r.detail,'') = coalesce(p_detail,'') and r.status in ('PENDING','ACKNOWLEDGED');
    return query select v_ex.id, v_ex.status, v_ex.public_code, v_ex.table_label, null::text, true; return;
  end;
  insert into service_request_history (request_id, tenant_id, from_status, to_status) values (v_id, v_tenant, null, 'PENDING');
  return query select v_id, 'PENDING'::text, v_code, v_label, v_token, false;
end $$;

-- O painel passa a mostrar a presença de cada chamado.
drop function panel_requests(text);
create function panel_requests(p_token text)
returns table (id uuid, table_label text, kind text, detail text, status text, public_code text, presence text, created_at timestamptz, acknowledged_at timestamptz, server_now timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token);
begin
  return query select r.id, r.table_label, r.kind, r.detail, r.status, r.public_code, r.presence, r.created_at, r.acknowledged_at, now()
    from service_requests r where r.tenant_id = v and r.status in ('PENDING','ACKNOWLEDGED') order by r.created_at;
end $$;

-- "Sem ninguém": a equipe marca o chamado como trote. Dois trotes do mesmo aparelho em 24 h bloqueiam o aparelho por 24 h.
create function panel_false_alarm(p_token text, p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token); v_dev text; f device_flags;
begin
  update service_requests set status = 'RESOLVED', resolved_at = now(), false_alarm = true
   where id = p_id and tenant_id = v and status in ('PENDING','ACKNOWLEDGED')
  returning device_id into v_dev;
  if not found then return false; end if;
  insert into service_request_history (request_id, tenant_id, from_status, to_status) values (p_id, v, null, 'RESOLVED');
  if v_dev is not null then
    insert into device_flags (tenant_id, device_id, false_alarms) values (v, v_dev, 1)
      on conflict (tenant_id, device_id) do update set
        false_alarms = case when device_flags.window_start < now() - interval '24 hours' then 1 else device_flags.false_alarms + 1 end,
        window_start = case when device_flags.window_start < now() - interval '24 hours' then now() else device_flags.window_start end
    returning * into f;
    if f.false_alarms >= 2 then update device_flags set blocked_until = now() + interval '24 hours' where tenant_id = v and device_id = v_dev; end if;
  end if;
  return true;
end $$;

revoke execute on function _distance_m(double precision,double precision,double precision,double precision),
  create_service_request(text,text,text,text,text,double precision,double precision), panel_requests(text), panel_false_alarm(text,uuid)
  from public, anon, authenticated;
grant execute on function create_service_request(text,text,text,text,text,double precision,double precision), panel_requests(text), panel_false_alarm(text,uuid)
  to anon, authenticated;

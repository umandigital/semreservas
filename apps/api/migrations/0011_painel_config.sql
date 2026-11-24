-- 0011 Painel do proprietário: configurações do restaurante por função (horário, teto do Clube, presença), com papel conferido e auditoria.
create or replace function owner_club_settings_set(p_tenant uuid, p_hours_enforced boolean, p_open_days int[], p_open_from time, p_open_to time, p_grace_min int, p_monthly_cap int, p_cancel_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes club_settings;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  if p_open_days is null or cardinality(p_open_days) not between 1 and 7 or exists (select 1 from unnest(p_open_days) d where d not between 1 and 7) then return false; end if;
  select * into antes from club_settings where tenant_id = p_tenant; if not found then return false; end if;
  update club_settings set hours_enforced = p_hours_enforced, open_days = p_open_days, open_from = p_open_from, open_to = p_open_to, grace_min = p_grace_min,
         monthly_cap = p_monthly_cap, cancel_window_seconds = p_cancel_seconds where tenant_id = p_tenant;
  perform _audit(p_tenant, 'club_settings_set', jsonb_build_object('before', to_jsonb(antes), 'after', jsonb_build_object('hours_enforced', p_hours_enforced, 'open_days', p_open_days, 'open_from', p_open_from, 'open_to', p_open_to, 'grace_min', p_grace_min, 'monthly_cap', p_monthly_cap, 'cancel_seconds', p_cancel_seconds)));
  return true;
end $$;
create or replace function owner_presence_set(p_tenant uuid, p_lat double precision, p_lon double precision, p_radius int, p_policy text)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes jsonb;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or p_policy not in ('off','flag','block_far','require') or p_radius not between 30 and 2000 then return false; end if;
  if (p_lat is null) <> (p_lon is null) or p_lat not between -90 and 90 or p_lon not between -180 and 180 then return false; end if;
  select jsonb_build_object('lat', lat, 'lon', lon, 'radius_m', radius_m, 'policy', presence_policy) into antes from tenants where id = p_tenant;
  update tenants set lat = p_lat, lon = p_lon, radius_m = p_radius, presence_policy = p_policy where id = p_tenant;
  perform _audit(p_tenant, 'presence_set', jsonb_build_object('before', antes, 'after', jsonb_build_object('lat', p_lat, 'lon', p_lon, 'radius_m', p_radius, 'policy', p_policy)));
  return true;
end $$;
revoke execute on function owner_club_settings_set(uuid,boolean,int[],time,time,int,int,int), owner_presence_set(uuid,double precision,double precision,int,text) from public, anon, authenticated;
grant execute on function owner_club_settings_set(uuid,boolean,int[],time,time,int,int,int), owner_presence_set(uuid,double precision,double precision,int,text) to authenticated;

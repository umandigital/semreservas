-- 0013 Alertas de chamado configuráveis: som alto e intermitente no painel do dono e, se os garçons tiverem equipamento, também no painel da equipe.
-- Se os garçons NÃO têm equipamento, o som toca só no painel do proprietário (o dono direciona e assume).
create table if not exists alert_settings (
  tenant_id        uuid primary key references tenants(id) on delete cascade,
  owner_sound      boolean not null default true,                       -- som no painel do proprietário
  staff_sound      boolean not null default true,                       -- os garçons têm equipamento: som no painel da equipe
  volume           int not null default 10 check (volume between 1 and 10),
  interval_s       int not null default 4 check (interval_s between 2 and 30),     -- intermitência: pausa entre os toques
  escalate_s       int not null default 60 check (escalate_s between 15 and 600)   -- sem atendimento há mais que isto: alerta urgente
);
alter table alert_settings enable row level security;
create policy alert_read on alert_settings for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager','staff']));
revoke all on alert_settings from anon, authenticated;
grant select on alert_settings to authenticated;
insert into alert_settings (tenant_id) select id from tenants on conflict do nothing;
create or replace function _alert_seed() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into alert_settings (tenant_id) values (new.id) on conflict do nothing; return new; end $$;
drop trigger if exists alert_tenant_seed on tenants;
create trigger alert_tenant_seed after insert on tenants for each row execute function _alert_seed();

create or replace function owner_alert_set(p_tenant uuid, p_owner_sound boolean, p_staff_sound boolean, p_volume int, p_interval_s int, p_escalate_s int) returns boolean language plpgsql security definer set search_path = public as $$
declare antes alert_settings;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  if p_volume not between 1 and 10 or p_interval_s not between 2 and 30 or p_escalate_s not between 15 and 600 then return false; end if;
  select * into antes from alert_settings where tenant_id = p_tenant; if not found then return false; end if;
  update alert_settings set owner_sound = p_owner_sound, staff_sound = p_staff_sound, volume = p_volume, interval_s = p_interval_s, escalate_s = p_escalate_s where tenant_id = p_tenant;
  perform _audit(p_tenant, 'alert_set', jsonb_build_object('before', to_jsonb(antes), 'after', jsonb_build_object('owner_sound', p_owner_sound, 'staff_sound', p_staff_sound, 'volume', p_volume, 'interval_s', p_interval_s, 'escalate_s', p_escalate_s)));
  return true;
end $$;
-- A equipe (link secreto) lê só a configuração do próprio restaurante.
create or replace function panel_alert_config(p_token text) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token); r jsonb;
begin
  select jsonb_build_object('staff_sound', staff_sound, 'volume', volume, 'interval_s', interval_s, 'escalate_s', escalate_s) into r from alert_settings where tenant_id = v;
  return r;
end $$;
revoke execute on function _alert_seed(), owner_alert_set(uuid,boolean,boolean,int,int,int), panel_alert_config(text) from public, anon, authenticated;
grant execute on function owner_alert_set(uuid,boolean,boolean,int,int,int) to authenticated;
grant execute on function panel_alert_config(text) to anon, authenticated;     -- o token do link da equipe é o segredo (como as outras funções do painel)

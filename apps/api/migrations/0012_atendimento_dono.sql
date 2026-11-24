-- 0012 Atendimento pelo painel do proprietário: quem assumiu o chamado, lista de garçons e ações do dono (assumir/direcionar e concluir).
-- O chamado de garçom fica em alerta (som e visual no painel) até alguém assumir; se ninguém assumir, o dono direciona a um garçom ou assume ele mesmo.
-- Mesmos princípios: papel conferido no servidor, transição condicional (dois aparelhos não assumem o mesmo chamado), histórico e auditoria.

alter table service_requests
  add column if not exists handled_by_label text check (handled_by_label is null or length(handled_by_label) between 1 and 40),
  add column if not exists handled_at timestamptz;

create table if not exists staff_roster (                -- nomes dos garçons para o dono direcionar (não são contas de acesso)
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name      text not null check (length(name) between 1 and 40),
  active    boolean not null default true,
  unique (tenant_id, name)
);
alter table staff_roster enable row level security;
create policy roster_read on staff_roster for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager','staff']));
revoke all on staff_roster from anon, authenticated;
grant select on staff_roster to authenticated;

create or replace function owner_roster_set(p_tenant uuid, p_name text, p_active boolean) returns boolean language plpgsql security definer set search_path = public as $$
declare n text := nullif(trim(coalesce(p_name, '')), '');
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or n is null or length(n) > 40 then return false; end if;
  insert into staff_roster (tenant_id, name, active) values (p_tenant, n, p_active) on conflict (tenant_id, name) do update set active = excluded.active;
  perform _audit(p_tenant, 'roster_set', jsonb_build_object('name', n, 'active', p_active));
  return true;
end $$;

-- Assumir ou direcionar: marca o chamado como "em atendimento" por alguém (o dono ou o garçom escolhido).
create or replace function owner_request_take(p_tenant uuid, p_id uuid, p_label text default null) returns boolean language plpgsql security definer set search_path = public as $$
declare lab text := coalesce(nullif(left(trim(coalesce(p_label, '')), 40), ''), 'Proprietário'); v_from text;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  select status into v_from from service_requests where id = p_id and tenant_id = p_tenant and status in ('PENDING','ACKNOWLEDGED') for update;
  if not found then return false; end if;
  update service_requests set status = 'ACKNOWLEDGED', acknowledged_at = coalesce(acknowledged_at, now()), acknowledged_by = coalesce(acknowledged_by, auth.uid()), handled_by_label = lab, handled_at = now()
   where id = p_id and tenant_id = p_tenant;
  if v_from = 'PENDING' then insert into service_request_history (request_id, tenant_id, from_status, to_status, actor_id) values (p_id, p_tenant, 'PENDING', 'ACKNOWLEDGED', auth.uid()); end if;
  perform _audit(p_tenant, 'request_taken', jsonb_build_object('request', p_id, 'by', lab, 'from', v_from));
  return true;
end $$;
create or replace function owner_request_resolve(p_tenant uuid, p_id uuid) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  update service_requests set status = 'RESOLVED', resolved_at = now(), resolved_by = auth.uid() where id = p_id and tenant_id = p_tenant and status = 'ACKNOWLEDGED';
  if not found then return false; end if;
  insert into service_request_history (request_id, tenant_id, from_status, to_status, actor_id) values (p_id, p_tenant, 'ACKNOWLEDGED', 'RESOLVED', auth.uid());
  perform _audit(p_tenant, 'request_resolved', jsonb_build_object('request', p_id));
  return true;
end $$;
revoke execute on function owner_roster_set(uuid,text,boolean), owner_request_take(uuid,uuid,text), owner_request_resolve(uuid,uuid) from public, anon, authenticated;
grant execute on function owner_roster_set(uuid,text,boolean), owner_request_take(uuid,uuid,text), owner_request_resolve(uuid,uuid) to authenticated;

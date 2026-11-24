-- 0017: equipe e permissões do painel + canais de entrada (NFC x QR). Idempotente.

-- ───────── Equipe: quem tem acesso ao painel e com qual papel ─────────
-- Só o DONO gerencia a equipe. O papel 'owner' nunca é criado nem tirado por aqui (isso é feito pelo SemReservas).
-- A pessoa precisa já ter entrado no app uma vez (login) para existir no cadastro.
create or replace function owner_team_list(p_tenant uuid)
returns table (user_id uuid, email text, role text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner']) then return; end if;
  return query select r.user_id, u.email::text, r.role from tenant_user_roles r join auth.users u on u.id = r.user_id
    where r.tenant_id = p_tenant order by (r.role = 'owner') desc, u.email;
end $$;

create or replace function owner_team_set(p_tenant uuid, p_email text, p_role text)
returns text language plpgsql security definer set search_path = public as $$
declare v_user uuid; v_atual text;
begin
  if not is_tenant_member(p_tenant, array['owner']) or p_role not in ('manager','staff','kitchen') then return 'denied'; end if;
  select id into v_user from auth.users where lower(email) = lower(trim(coalesce(p_email, ''))) limit 1;
  if v_user is null then return 'not_found'; end if;
  select role into v_atual from tenant_user_roles where tenant_id = p_tenant and user_id = v_user;
  if v_atual = 'owner' then return 'denied'; end if;
  insert into tenant_user_roles (tenant_id, user_id, role) values (p_tenant, v_user, p_role)
    on conflict (tenant_id, user_id) do update set role = excluded.role;
  perform _audit(p_tenant, 'team_role_set', jsonb_build_object('user', v_user, 'before', v_atual, 'after', p_role));
  return 'ok';
end $$;

create or replace function owner_team_remove(p_tenant uuid, p_user uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_atual text;
begin
  if not is_tenant_member(p_tenant, array['owner']) then return false; end if;
  select role into v_atual from tenant_user_roles where tenant_id = p_tenant and user_id = p_user;
  if v_atual is null or v_atual = 'owner' then return false; end if;
  delete from tenant_user_roles where tenant_id = p_tenant and user_id = p_user;
  perform _audit(p_tenant, 'team_role_removed', jsonb_build_object('user', p_user, 'before', v_atual));
  return true;
end $$;

-- ───────── Canais de entrada: quantas aberturas por placa NFC e por QR ─────────
create table if not exists access_opens (
  id         bigint generated always as identity primary key,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  origin     text not null check (origin in ('nfc','qr')),
  table_label text,
  created_at timestamptz not null default now()
);
create index if not exists access_opens_tenant on access_opens (tenant_id, created_at desc);
alter table access_opens enable row level security;
revoke all on access_opens from anon, authenticated;

-- O app chama uma vez por abertura da placa. O token vale como segredo; token inválido não grava nada.
-- Limite: no máximo 120 aberturas por minuto por restaurante (contra abuso).
create or replace function plate_open(p_token text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_origin text; v_label text;
begin
  select k.tenant_id, k.origin, vt.label into v_tenant, v_origin, v_label
    from access_point_tokens k
    join access_points ap on ap.id = k.access_point_id and ap.tenant_id = k.tenant_id
    join tenants t on t.id = k.tenant_id
    left join access_point_assignments a on a.access_point_id = ap.id and a.valid_to is null
    left join venue_tables vt on vt.id = a.table_id
   where k.token = p_token and k.revoked_at is null and ap.state <> 'revoked' and t.status in ('trial','active');
  if v_tenant is null then return false; end if;
  if (select count(*) from access_opens where tenant_id = v_tenant and created_at > now() - interval '1 minute') >= 120 then return false; end if;
  insert into access_opens (tenant_id, origin, table_label) values (v_tenant, v_origin, v_label);
  return true;
end $$;

create or replace function owner_channels(p_tenant uuid, p_since timestamptz)
returns table (origin text, opens bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return; end if;
  return query select o.origin, count(*) from access_opens o where o.tenant_id = p_tenant and o.created_at >= p_since group by o.origin;
end $$;

revoke execute on function owner_team_list(uuid), owner_team_set(uuid,text,text), owner_team_remove(uuid,uuid), plate_open(text), owner_channels(uuid,timestamptz) from public, anon, authenticated;
grant execute on function plate_open(text) to anon, authenticated;
grant execute on function owner_team_list(uuid), owner_team_set(uuid,text,text), owner_team_remove(uuid,uuid), owner_channels(uuid,timestamptz) to authenticated;

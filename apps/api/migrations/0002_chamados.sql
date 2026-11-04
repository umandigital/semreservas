-- 0002 Fila de atendimento real: chamados anônimos (por token da placa), estados auditados,
-- operação só por funções, e "acabou hoje" compartilhado. Segurança:
--  * o visitante nunca informa tenant_id: o servidor o deduz do token da placa;
--  * nenhuma tabela é gravável diretamente (tudo por RPC); anon não lê nada;
--  * o painel da equipe usa um link secreto (staff_links), sem login;
--  * 1 chamado aberto por mesa+motivo é garantido por índice único (vale sob concorrência).

create table service_requests (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  table_id          uuid not null,
  table_label       text not null,
  kind              text not null check (kind in ('waiter','bill','question','order','other','kitchen_item')),
  detail            text check (detail is null or length(detail) between 1 and 80),   -- ex.: sabor pedido no rodízio
  status            text not null default 'PENDING' check (status in ('PENDING','ACKNOWLEDGED','RESOLVED','CANCELLED')),
  public_code       text not null,
  cancel_token_hash text not null,
  created_at        timestamptz not null default now(),
  acknowledged_at   timestamptz, acknowledged_by uuid,
  resolved_at       timestamptz, resolved_by uuid,
  foreign key (table_id, tenant_id) references venue_tables(id, tenant_id)
);
create index service_requests_fila on service_requests (tenant_id, status, created_at);
-- 1 chamado aberto por mesa+motivo (+ detalhe: duas pizzas diferentes podem estar pedidas ao mesmo tempo)
create unique index one_open_per_table_kind on service_requests (tenant_id, table_id, kind, coalesce(detail, ''))
  where status in ('PENDING','ACKNOWLEDGED');

create table service_request_history (
  id          bigint generated always as identity primary key,
  request_id  uuid not null references service_requests(id) on delete cascade,
  tenant_id   uuid not null,
  from_status text, to_status text not null,
  actor_id    uuid,
  at          timestamptz not null default now()
);

create table sold_out_items (
  tenant_id uuid not null references tenants(id) on delete cascade,
  item_id   text not null check (length(item_id) between 1 and 60),
  since     timestamptz not null default now(),
  by_user   uuid,
  primary key (tenant_id, item_id)
);

alter table service_requests        enable row level security;
alter table service_request_history enable row level security;
alter table sold_out_items          enable row level security;

create policy sr_staff_read  on service_requests        for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager','staff']));
create policy srh_staff_read on service_request_history for select to authenticated using (is_tenant_member(tenant_id, array['owner','manager','staff']));
create policy so_staff_read  on sold_out_items          for select to authenticated using (is_tenant_member(tenant_id));

-- Supabase concede privilégios a anon/authenticated em tabelas novas: retirar tudo e dar só leitura à equipe.
revoke all on service_requests, service_request_history, sold_out_items from anon, authenticated;
grant select on service_requests, service_request_history, sold_out_items to authenticated;

-- ───────── público (visitante, sem login) ─────────
create function create_service_request(p_token text, p_kind text, p_table_label text default null, p_detail text default null)
returns table (id uuid, status text, public_code text, table_label text, cancel_token text, already_open boolean)
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_tenant uuid; v_ap uuid; v_table uuid; v_label text; v_token text; v_code text; v_id uuid; v_ex service_requests;
begin
  if p_kind not in ('waiter','bill','question','order','other','kitchen_item') then raise exception 'invalid_kind'; end if;
  p_detail := nullif(left(trim(coalesce(p_detail, '')), 80), '');
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

  if (select count(*) from service_requests r where r.tenant_id = v_tenant and r.created_at > now() - interval '1 minute') >= 30 then
    raise exception 'rate_limited'; end if;

  select * into v_ex from service_requests r where r.tenant_id = v_tenant and r.table_id = v_table and r.kind = p_kind and coalesce(r.detail,'') = coalesce(p_detail,'') and r.status in ('PENDING','ACKNOWLEDGED');
  if found then return query select v_ex.id, v_ex.status, v_ex.public_code, v_ex.table_label, null::text, true; return; end if;

  v_token := encode(gen_random_bytes(18), 'hex');
  v_code  := (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '') from generate_series(1, 4));
  begin
    insert into service_requests (tenant_id, table_id, table_label, kind, detail, public_code, cancel_token_hash)
    values (v_tenant, v_table, v_label, p_kind, p_detail, v_code, encode(digest(v_token, 'sha256'), 'hex')) returning service_requests.id into v_id;
  exception when unique_violation then   -- concorrência: outro aparelho criou no mesmo instante
    select * into v_ex from service_requests r where r.tenant_id = v_tenant and r.table_id = v_table and r.kind = p_kind and coalesce(r.detail,'') = coalesce(p_detail,'') and r.status in ('PENDING','ACKNOWLEDGED');
    return query select v_ex.id, v_ex.status, v_ex.public_code, v_ex.table_label, null::text, true; return;
  end;
  insert into service_request_history (request_id, tenant_id, from_status, to_status) values (v_id, v_tenant, null, 'PENDING');
  return query select v_id, 'PENDING'::text, v_code, v_label, v_token, false;
end $$;

create function public_request_status(p_id uuid)
returns table (status text, table_label text, kind text, detail text, public_code text, acknowledged_at timestamptz, resolved_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.status, r.table_label, r.kind, r.detail, r.public_code, r.acknowledged_at, r.resolved_at from service_requests r where r.id = p_id;
$$;

create function cancel_service_request(p_id uuid, p_cancel_token text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v service_requests;
begin
  update service_requests r set status = 'CANCELLED', resolved_at = now()
   where r.id = p_id and r.status in ('PENDING','ACKNOWLEDGED')
     and r.cancel_token_hash = encode(digest(coalesce(p_cancel_token, ''), 'sha256'), 'hex')
  returning * into v;
  if not found then return false; end if;
  insert into service_request_history (request_id, tenant_id, from_status, to_status) values (v.id, v.tenant_id, null, 'CANCELLED');
  return true;
end $$;

create function public_tables(p_token text)
returns table (label text) language sql stable security definer set search_path = public as $$
  select vt.label from access_point_tokens k
    join access_points ap on ap.id = k.access_point_id and ap.tenant_id = k.tenant_id
    join tenants t on t.id = k.tenant_id
    join venue_tables vt on vt.tenant_id = k.tenant_id
   where k.token = p_token and k.revoked_at is null and ap.state <> 'revoked' and t.status in ('trial','active')
   order by length(vt.label), vt.label;
$$;

create function public_sold_out(p_slug text)
returns table (item_id text) language sql stable security definer set search_path = public as $$
  select s.item_id from sold_out_items s join tenants t on t.id = s.tenant_id where t.slug = p_slug and t.status in ('trial','active');
$$;

-- ───────── painel da equipe: SEM login, por link secreto (decisão do fundador: zero trabalho para o restaurante) ─────────
-- O link carrega um token longo e aleatório. Quem tem o link opera a fila daquele estabelecimento, nada mais.
-- Revogar/trocar o link = marcar revoked_at e gerar outro. O painel só mostra mesa e motivo (sem dados pessoais).
create table staff_links (
  token      text primary key check (length(token) >= 32),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  label      text not null default 'Painel',
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
alter table staff_links enable row level security;
revoke all on staff_links from anon, authenticated;   -- sem acesso direto; só pelas funções abaixo

create function _panel_tenant(p_token text) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid;
begin
  select l.tenant_id into v from staff_links l join tenants t on t.id = l.tenant_id
   where l.token = p_token and l.revoked_at is null and t.status in ('trial','active');
  if v is null then raise exception 'invalid_token'; end if;
  return v;
end $$;

create function panel_info(p_token text)
returns table (tenant_name text, tenant_slug text)
language plpgsql stable security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token);
begin return query select t.name, t.slug from tenants t where t.id = v; end $$;

create function panel_requests(p_token text)
returns table (id uuid, table_label text, kind text, detail text, status text, public_code text, created_at timestamptz, acknowledged_at timestamptz, server_now timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token);
begin
  return query select r.id, r.table_label, r.kind, r.detail, r.status, r.public_code, r.created_at, r.acknowledged_at, now()
    from service_requests r where r.tenant_id = v and r.status in ('PENDING','ACKNOWLEDGED') order by r.created_at;
end $$;

create function panel_change_request(p_token text, p_id uuid, p_to text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token); v_from text;
begin
  v_from := case p_to when 'ACKNOWLEDGED' then 'PENDING' when 'RESOLVED' then 'ACKNOWLEDGED' else null end;
  if v_from is null then return false; end if;
  -- transição condicional e restrita ao tenant do link: dois aparelhos não assumem o mesmo chamado
  update service_requests set status = p_to,
         acknowledged_at = case when p_to = 'ACKNOWLEDGED' then now() else acknowledged_at end,
         resolved_at     = case when p_to = 'RESOLVED' then now() else resolved_at end
   where id = p_id and tenant_id = v and status = v_from;
  if not found then return false; end if;
  insert into service_request_history (request_id, tenant_id, from_status, to_status) values (p_id, v, v_from, p_to);
  return true;
end $$;

-- Funções: só o que está listado abaixo é chamável (Supabase dá EXECUTE a anon por padrão).
revoke execute on function create_service_request(text,text,text,text), public_request_status(uuid), cancel_service_request(uuid,text),
  public_tables(text), public_sold_out(text), _panel_tenant(text), panel_info(text), panel_requests(text),
  panel_change_request(text,uuid,text)
  from public, anon, authenticated;
grant execute on function create_service_request(text,text,text,text), public_request_status(uuid), cancel_service_request(uuid,text),
  public_tables(text), public_sold_out(text), panel_info(text), panel_requests(text),
  panel_change_request(text,uuid,text) to anon, authenticated;

-- O painel atualiza por consulta a cada poucos segundos (funciona em qualquer rede, sem login).

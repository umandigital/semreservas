-- 0009 Pedido validado pelo servidor: um único toque em "Chamar garçom" cria o chamado de pedido COM os itens;
-- o servidor calcula o subtotal pelos preços do restaurante (o cliente não informa valor), a equipe vê os itens no chamado
-- e a Roleta do Chef é liberada a partir desse subtotal calculado. Substitui a conferência por valor declarado da 0007.
-- Aplicar depois da 0007 e da 0008. Não altera migrações antigas (só substitui a função roulette_grant, de mesma assinatura).

create table if not exists menu_items (                    -- preços e nomes do cardápio por restaurante (a fonte de verdade do valor)
  tenant_id   uuid not null references tenants(id) on delete cascade,
  item_id     text not null check (length(item_id) between 1 and 40),
  name        text not null check (length(name) between 1 and 120),
  price_cents int not null check (price_cents >= 0),
  active      boolean not null default true,
  primary key (tenant_id, item_id)
);
create table if not exists order_snapshots (               -- o que o cliente mostrou ao chamar o garçom
  request_id     uuid primary key references service_requests(id) on delete cascade,
  tenant_id      uuid not null references tenants(id) on delete cascade,
  user_id        uuid,                                    -- quem é do Clube (opcional)
  items          jsonb not null,
  subtotal_cents int not null check (subtotal_cents >= 0),
  created_at     timestamptz not null default now()
);
alter table menu_items enable row level security; alter table order_snapshots enable row level security;
create policy mi_read on menu_items      for select to authenticated using (is_tenant_member(tenant_id));
create policy os_read on order_snapshots for select to authenticated using (is_tenant_member(tenant_id));
revoke all on menu_items, order_snapshots from anon, authenticated;
grant select on menu_items, order_snapshots to authenticated;

-- Libera o giro com o subtotal que o SERVIDOR calculou (o 3º parâmetro fica por compatibilidade e é ignorado).
create or replace function _roulette_try_grant(p_tenant uuid, p_user uuid, p_request uuid) returns text language plpgsql security definer set search_path = public as $$
declare s roulette_settings; cs club_settings; hoje date; sub int; n int;
begin
  select * into s from roulette_settings where tenant_id = p_tenant; select * into cs from club_settings where tenant_id = p_tenant;
  if not found or not s.enabled then return 'disabled'; end if;
  if not exists (select 1 from club_members where tenant_id = p_tenant and user_id = p_user and status = 'active') then return 'not_member'; end if;
  if s.adults_only and not _is_adult(p_user) then return 'adults_only'; end if;
  hoje := (now() at time zone cs.tz)::date;
  if not exists (select 1 from club_visits where tenant_id = p_tenant and user_id = p_user and day = hoje) then return 'no_visit'; end if;
  select o.subtotal_cents into sub from order_snapshots o join service_requests r on r.id = o.request_id
   where o.request_id = p_request and o.tenant_id = p_tenant and r.kind = 'order' and r.status <> 'CANCELLED' and r.created_at > now() - interval '3 hours';
  if not found then return 'invalid_request'; end if;
  if sub < s.min_subtotal_cents then return 'below_min'; end if;
  insert into roulette_grants (tenant_id, user_id, day, request_id, subtotal_cents) values (p_tenant, p_user, hoje, p_request, sub) on conflict do nothing;
  get diagnostics n = row_count;
  if n = 0 then return 'already'; end if;
  perform _audit(p_tenant, 'roulette_grant', jsonb_build_object('user', p_user, 'request', p_request, 'subtotal_cents', sub));
  return 'granted';
end $$;
create or replace function roulette_grant(p_token text, p_request uuid, p_subtotal_cents int default null) returns jsonb language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); r text;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  r := _roulette_try_grant(t, u, p_request);
  if r in ('not_member','disabled','adults_only','no_visit','invalid_request') then raise exception '%', r; end if;
  return jsonb_build_object('granted', r = 'granted', 'reason', case when r = 'granted' then null else r end);
end $$;

-- Um toque: cria o chamado de pedido com os itens, calcula o subtotal e, se for do Clube, tenta liberar o giro.
create or replace function order_call(p_token text, p_items jsonb, p_table_label text default null, p_device text default null,
                                      p_lat double precision default null, p_lon double precision default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); c record; it jsonb; mi menu_items; q int; linhas jsonb := '[]'::jsonb; sub int := 0; n int := 0; g text := null;
begin
  if t is null then raise exception 'invalid_token'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 40 then raise exception 'invalid_items'; end if;
  for it in select * from jsonb_array_elements(p_items) loop
    q := (it->>'qty')::int;
    if q is null or q not between 1 and 20 then raise exception 'invalid_items'; end if;
    select * into mi from menu_items where tenant_id = t and item_id = it->>'id' and active;
    if not found then raise exception 'invalid_items'; end if;
    sub := sub + mi.price_cents * q; n := n + 1;
    linhas := linhas || jsonb_build_object('id', mi.item_id, 'name', mi.name, 'qty', q, 'price_cents', mi.price_cents, 'obs', nullif(left(trim(coalesce(it->>'obs', '')), 120), ''));
  end loop;
  select * into c from create_service_request(p_token, 'order', p_table_label, null, p_device, p_lat, p_lon);
  insert into order_snapshots (request_id, tenant_id, user_id, items, subtotal_cents) values (c.id, t, u, linhas, sub)
    on conflict (request_id) do update set items = excluded.items, subtotal_cents = excluded.subtotal_cents, user_id = coalesce(excluded.user_id, order_snapshots.user_id);
  if u is not null then g := _roulette_try_grant(t, u, c.id); end if;
  return jsonb_build_object('id', c.id, 'status', c.status, 'public_code', c.public_code, 'table_label', c.table_label, 'cancel_token', c.cancel_token,
                            'already_open', c.already_open, 'subtotal_cents', sub, 'granted', g = 'granted', 'grant_reason', g);
end $$;

-- Equipe (link secreto): ver os itens de um chamado de pedido.
create or replace function panel_order_items(p_token text, p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v uuid := _panel_tenant(p_token); r jsonb;
begin
  select jsonb_build_object('items', o.items, 'subtotal_cents', o.subtotal_cents) into r from order_snapshots o where o.request_id = p_id and o.tenant_id = v;
  return r;
end $$;

-- Dono: preço e disponibilidade de um item do cardápio.
create or replace function owner_menu_set(p_tenant uuid, p_item text, p_name text, p_price_cents int, p_active boolean) returns boolean language plpgsql security definer set search_path = public as $$
declare antes jsonb;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or p_price_cents < 0 or length(coalesce(p_item, '')) not between 1 and 40 or length(coalesce(p_name, '')) not between 1 and 120 then return false; end if;
  select to_jsonb(m) into antes from menu_items m where tenant_id = p_tenant and item_id = p_item;
  insert into menu_items (tenant_id, item_id, name, price_cents, active) values (p_tenant, p_item, p_name, p_price_cents, p_active)
    on conflict (tenant_id, item_id) do update set name = excluded.name, price_cents = excluded.price_cents, active = excluded.active;
  perform _audit(p_tenant, 'menu_item_set', jsonb_build_object('item', p_item, 'before', antes, 'after', jsonb_build_object('name', p_name, 'price_cents', p_price_cents, 'active', p_active)));
  return true;
end $$;

revoke execute on function _roulette_try_grant(uuid,uuid,uuid), roulette_grant(text,uuid,int), order_call(text,jsonb,text,text,double precision,double precision),
  panel_order_items(text,uuid), owner_menu_set(uuid,text,text,int,boolean) from public, anon, authenticated;
grant execute on function order_call(text,jsonb,text,text,double precision,double precision) to anon, authenticated;
grant execute on function roulette_grant(text,uuid,int) to authenticated;
grant execute on function panel_order_items(text,uuid) to anon, authenticated;       -- o token do link da equipe é o segredo (como as outras funções do painel)
grant execute on function owner_menu_set(uuid,text,text,int,boolean) to authenticated;

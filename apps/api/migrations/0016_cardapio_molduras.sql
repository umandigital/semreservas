-- 0016: cardápio do cliente passa a ler o servidor (preço, nome, "no cardápio", itens novos) e molduras de foto configuráveis. Idempotente.

alter table menu_items add column if not exists category    text check (category is null or length(category) <= 40);
alter table menu_items add column if not exists description text check (description is null or length(description) <= 300);

-- Novo item: o id é gerado no servidor (nunca vem do navegador).
create or replace function owner_menu_add(p_tenant uuid, p_name text, p_price_cents int, p_category text, p_description text)
returns text language plpgsql security definer set search_path = public as $$
declare v_id text := 'n-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or p_price_cents is null or p_price_cents < 0 or p_price_cents > 1000000
     or length(coalesce(trim(p_name), '')) not between 2 and 120 or length(coalesce(trim(p_category), '')) not between 1 and 40 then return null; end if;
  insert into menu_items (tenant_id, item_id, name, price_cents, active, category, description)
    values (p_tenant, v_id, trim(p_name), p_price_cents, true, trim(p_category), nullif(trim(coalesce(p_description, '')), ''));
  perform _audit(p_tenant, 'menu_item_added', jsonb_build_object('item', v_id, 'name', trim(p_name), 'price_cents', p_price_cents, 'category', trim(p_category)));
  return v_id;
end $$;

-- Leitura pública do cardápio de um restaurante (preços não são segredo; o cliente já os vê).
create or replace function menu_public(p_slug text)
returns table (item_id text, name text, price_cents int, active boolean, category text, description text)
language sql stable security definer set search_path = public as $$
  select m.item_id, m.name, m.price_cents, m.active, m.category, m.description
  from menu_items m join tenants t on t.id = m.tenant_id where t.slug = p_slug and t.status in ('trial','active');
$$;

-- Molduras de foto: o restaurante liga/desliga cada uma e edita os textos. O desenho (estilo) vem do app.
create table if not exists club_frames (
  tenant_id uuid not null references tenants(id) on delete cascade,
  frame_id  text not null check (length(frame_id) between 1 and 40),
  enabled   boolean not null default true,
  title     text[] not null check (array_length(title, 1) between 1 and 3),
  footer    text not null check (length(footer) between 1 and 80),
  primary key (tenant_id, frame_id)
);
alter table club_frames enable row level security;
revoke all on club_frames from anon, authenticated;

create or replace function owner_frame_set(p_tenant uuid, p_frame text, p_enabled boolean, p_title text[], p_footer text)
returns boolean language plpgsql security definer set search_path = public as $$
declare antes jsonb;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) or length(coalesce(p_frame, '')) not between 1 and 40
     or coalesce(array_length(p_title, 1), 0) not between 1 and 3 or length(coalesce(trim(p_footer), '')) not between 1 and 80
     or exists (select 1 from unnest(p_title) x where length(trim(x)) not between 1 and 40) then return false; end if;
  select to_jsonb(f) into antes from club_frames f where tenant_id = p_tenant and frame_id = p_frame;
  insert into club_frames (tenant_id, frame_id, enabled, title, footer) values (p_tenant, p_frame, coalesce(p_enabled, true), p_title, trim(p_footer))
    on conflict (tenant_id, frame_id) do update set enabled = excluded.enabled, title = excluded.title, footer = excluded.footer;
  perform _audit(p_tenant, 'frame_set', jsonb_build_object('frame', p_frame, 'before', antes, 'after', jsonb_build_object('enabled', p_enabled, 'title', p_title, 'footer', p_footer)));
  return true;
end $$;

create or replace function frames_public(p_slug text)
returns table (frame_id text, enabled boolean, title text[], footer text)
language sql stable security definer set search_path = public as $$
  select f.frame_id, f.enabled, f.title, f.footer from club_frames f join tenants t on t.id = f.tenant_id where t.slug = p_slug and t.status in ('trial','active');
$$;

create or replace function owner_frames_list(p_tenant uuid)
returns table (frame_id text, enabled boolean, title text[], footer text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return; end if;
  return query select f.frame_id, f.enabled, f.title, f.footer from club_frames f where f.tenant_id = p_tenant;
end $$;

revoke execute on function owner_menu_add(uuid,text,int,text,text), menu_public(text), owner_frame_set(uuid,text,boolean,text[],text), frames_public(text), owner_frames_list(uuid) from public, anon, authenticated;
grant execute on function menu_public(text), frames_public(text) to anon, authenticated;
grant execute on function owner_menu_add(uuid,text,int,text,text), owner_frame_set(uuid,text,boolean,text[],text), owner_frames_list(uuid) to authenticated;

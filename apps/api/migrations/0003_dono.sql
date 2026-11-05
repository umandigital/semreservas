-- 0003 Dashboard do dono (login e senha: Supabase Auth). O dono lê os dados do PRÓPRIO estabelecimento
-- pelas políticas RLS já existentes e age só por funções que conferem o papel (owner/manager) no servidor.

create function my_tenants()
returns table (tenant_id uuid, slug text, name text, role text)
language sql stable security definer set search_path = public as $$
  select t.id, t.slug, t.name, r.role
    from tenant_user_roles r join tenants t on t.id = r.tenant_id
   where r.user_id = auth.uid();
$$;

-- "Acabou hoje": marcar/desmarcar item esgotado (aparece na hora para os clientes).
create function owner_set_sold_out(p_tenant uuid, p_item text, p_sold boolean)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return false; end if;
  if p_sold then
    insert into sold_out_items (tenant_id, item_id, by_user) values (p_tenant, p_item, auth.uid()) on conflict do nothing;
  else
    delete from sold_out_items where tenant_id = p_tenant and item_id = p_item;
  end if;
  return true;
end $$;

-- Link do painel da equipe: ver o atual e trocar por outro (o antigo para de funcionar na hora).
create function owner_staff_link(p_tenant uuid)
returns text language plpgsql stable security definer set search_path = public as $$
declare v text;
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return null; end if;
  select l.token into v from staff_links l where l.tenant_id = p_tenant and l.revoked_at is null order by l.created_at desc limit 1;
  return v;
end $$;

create function owner_rotate_staff_link(p_tenant uuid)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v text := encode(gen_random_bytes(24), 'hex');
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return null; end if;
  update staff_links set revoked_at = now() where tenant_id = p_tenant and revoked_at is null;
  insert into staff_links (token, tenant_id) values (v, p_tenant);
  insert into audit_logs (tenant_id, actor_id, action) values (p_tenant, auth.uid(), 'staff_link_rotated');
  return v;
end $$;

-- Só usuários logados chamam estas funções (anon e público não).
revoke execute on function my_tenants(), owner_set_sold_out(uuid,text,boolean), owner_staff_link(uuid), owner_rotate_staff_link(uuid)
  from public, anon, authenticated;
grant execute on function my_tenants(), owner_set_sold_out(uuid,text,boolean), owner_staff_link(uuid), owner_rotate_staff_link(uuid)
  to authenticated;

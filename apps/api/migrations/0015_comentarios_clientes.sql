-- 0015: painel do dono: ler comentários/avaliações e a lista de clientes do Clube.
-- Só leitura (a moderação e o ajuste de pontos já existem em 0006 e 0005). Idempotente.
-- Privacidade: o dono vê só o PRIMEIRO nome da pessoa; nunca e-mail, nascimento ou id de login completo além do necessário para agir.

create or replace function owner_club_feedback_list(p_tenant uuid, p_status text default null, p_limit int default 100)
returns table (user_id uuid, day date, first_name text, rating int, comment text, liked text[], status text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return; end if;
  if p_status is not null and p_status not in ('pending','published','rejected') then return; end if;
  return query
    select f.user_id, f.day, split_part(coalesce(pp.display_name, 'Cliente'), ' ', 1), f.rating, f.comment, f.liked, f.status, f.created_at
    from club_feedback f left join person_profiles pp on pp.user_id = f.user_id
    where f.tenant_id = p_tenant and (p_status is null or f.status = p_status)
    order by f.created_at desc limit least(greatest(coalesce(p_limit, 100), 1), 300);
end $$;

create or replace function owner_club_members_list(p_tenant uuid, p_limit int default 200)
returns table (user_id uuid, first_name text, joined_at timestamptz, visits bigint, last_visit date, points int, status text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_tenant_member(p_tenant, array['owner','manager']) then return; end if;
  return query
    select m.user_id, split_part(coalesce(pp.display_name, 'Cliente'), ' ', 1), m.joined_at,
      (select count(*) from club_visits v where v.tenant_id = m.tenant_id and v.user_id = m.user_id),
      (select max(v.day) from club_visits v where v.tenant_id = m.tenant_id and v.user_id = m.user_id),
      _club_balance(m.tenant_id, m.user_id), m.status
    from club_members m left join person_profiles pp on pp.user_id = m.user_id
    where m.tenant_id = p_tenant
    order by m.joined_at desc limit least(greatest(coalesce(p_limit, 200), 1), 500);
end $$;

revoke execute on function owner_club_feedback_list(uuid,text,int), owner_club_members_list(uuid,int) from public, anon, authenticated;
grant execute on function owner_club_feedback_list(uuid,text,int), owner_club_members_list(uuid,int) to authenticated;

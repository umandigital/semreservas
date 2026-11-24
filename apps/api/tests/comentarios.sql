-- Testes de 0015: leitura de comentários e clientes só para dono/gerente do próprio restaurante.
begin;
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000c0a1','coment-a','Coment A','a_la_carte','active'),('00000000-0000-0000-0000-00000000c0b1','coment-b','Coment B','a_la_carte','active');
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000c1001'),('00000000-0000-0000-0000-0000000c1002'),('00000000-0000-0000-0000-0000000c1003'),('00000000-0000-0000-0000-0000000c1004') on conflict do nothing;
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000c0a1','00000000-0000-0000-0000-0000000c1001','owner'),('00000000-0000-0000-0000-00000000c0a1','00000000-0000-0000-0000-0000000c1002','staff'),('00000000-0000-0000-0000-00000000c0b1','00000000-0000-0000-0000-0000000c1003','owner');
insert into person_profiles (user_id, display_name, birth_date) values ('00000000-0000-0000-0000-0000000c1004','Maria da Silva','1990-01-01') on conflict do nothing;
insert into club_members (tenant_id, user_id, regulation_version, referral_code) values ('00000000-0000-0000-0000-00000000c0a1','00000000-0000-0000-0000-0000000c1004','v1','CMA001'),('00000000-0000-0000-0000-00000000c0b1','00000000-0000-0000-0000-0000000c1004','v1','CMB001');
insert into club_feedback (tenant_id, user_id, day, rating, comment) values ('00000000-0000-0000-0000-00000000c0a1','00000000-0000-0000-0000-0000000c1004',current_date,5,'Ótimo!'),('00000000-0000-0000-0000-00000000c0b1','00000000-0000-0000-0000-0000000c1004',current_date,1,'Segredo de B');
set local role anon;
do $$ begin
  begin perform * from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1'); raise exception 'FALHA: anon leu comentários'; exception when insufficient_privilege then null; end;
  begin perform * from owner_club_members_list('00000000-0000-0000-0000-00000000c0a1'); raise exception 'FALHA: anon leu clientes'; exception when insufficient_privilege then null; end;
end $$;
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000c1002';   -- garçom
do $$ begin
  if exists (select 1 from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1')) then raise exception 'FALHA: garçom leu comentários'; end if;
  if exists (select 1 from owner_club_members_list('00000000-0000-0000-0000-00000000c0a1')) then raise exception 'FALHA: garçom leu clientes'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000c1001';   -- dono de A
do $$ begin
  if (select count(*) from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1')) <> 1 then raise exception 'FALHA: dono não vê seu comentário'; end if;
  if exists (select 1 from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1') where comment = 'Segredo de B') then raise exception 'FALHA: vazou comentário de B'; end if;
  if (select first_name from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1')) <> 'Maria' then raise exception 'FALHA: deveria mostrar só o primeiro nome'; end if;
  if exists (select 1 from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0b1')) then raise exception 'FALHA: dono de A leu comentários de B'; end if;
  if exists (select 1 from owner_club_members_list('00000000-0000-0000-0000-00000000c0b1')) then raise exception 'FALHA: dono de A leu clientes de B'; end if;
  if (select count(*) from owner_club_members_list('00000000-0000-0000-0000-00000000c0a1')) <> 1 then raise exception 'FALHA: lista de clientes errada'; end if;
  if (select count(*) from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1', 'pending')) <> 1 then raise exception 'FALHA: filtro pendente'; end if;
  if not owner_club_feedback_moderate('00000000-0000-0000-0000-00000000c0a1','00000000-0000-0000-0000-0000000c1004',current_date,'published') then raise exception 'FALHA: moderar'; end if;
  if (select count(*) from owner_club_feedback_list('00000000-0000-0000-0000-00000000c0a1', 'pending')) <> 0 then raise exception 'FALHA: moderação não refletiu'; end if;
end $$;
rollback;
\echo COMENTARIOS: todos os testes passaram

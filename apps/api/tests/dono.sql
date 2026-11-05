-- Dashboard do dono: quem é o usuário, o que pode e o que NUNCA pode (outro tenant, outro papel, sem login).
\set ON_ERROR_STOP on
begin;
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a002','outro','Outro Bar','a_la_carte','active');
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0099','00000000-0000-0000-0000-00000000a002','1');
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000d0001'),('00000000-0000-0000-0000-0000000d0002'),('00000000-0000-0000-0000-0000000d0003');
-- u1 = dono do GastroPub · u2 = garçom (staff) do GastroPub · u3 = dono do Outro Bar
insert into tenant_user_roles values
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000d0001','owner'),
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000d0002','staff'),
 ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000d0003','owner');
insert into staff_links (token, tenant_id) values ('painel-gastropub-original-0000000000000','00000000-0000-0000-0000-00000000a001');
insert into service_requests (tenant_id, table_id, table_label, kind, public_code, cancel_token_hash) values
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000b0001','1','bill','AAAA','x'),
 ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000b0099','1','bill','BBBB','y');
create temp table ctx (k text primary key, v text); grant all on ctx to anon, authenticated;

-- 1) sem login nada funciona
set local role anon;
do $$ begin
  begin perform 1 from my_tenants(); raise exception 'FALHA: anon chamou my_tenants'; exception when insufficient_privilege then null; end;
  begin perform owner_set_sold_out('00000000-0000-0000-0000-00000000a001','h1',true); raise exception 'FALHA: anon marcou esgotado'; exception when insufficient_privilege then null; end;
  begin perform owner_staff_link('00000000-0000-0000-0000-00000000a001'); raise exception 'FALHA: anon leu o link'; exception when insufficient_privilege then null; end;
  begin perform owner_rotate_staff_link('00000000-0000-0000-0000-00000000a001'); raise exception 'FALHA: anon trocou o link'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 2) dono do GastroPub
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d0001';
do $$ begin
  if (select count(*) from my_tenants()) <> 1 or (select role from my_tenants()) <> 'owner' or (select slug from my_tenants()) <> 'gastropub' then raise exception 'FALHA: my_tenants do dono'; end if;
  if not owner_set_sold_out('00000000-0000-0000-0000-00000000a001','h1',true) then raise exception 'FALHA: dono não marcou esgotado'; end if;
  if (select count(*) from sold_out_items) <> 1 then raise exception 'FALHA: dono não lê o esgotado'; end if;
  if owner_set_sold_out('00000000-0000-0000-0000-00000000a002','h1',true) then raise exception 'FALHA: dono marcou esgotado em OUTRO tenant'; end if;
  if owner_staff_link('00000000-0000-0000-0000-00000000a001') <> 'painel-gastropub-original-0000000000000' then raise exception 'FALHA: dono não vê o link'; end if;
  if owner_staff_link('00000000-0000-0000-0000-00000000a002') is not null then raise exception 'FALHA: dono viu link de OUTRO tenant'; end if;
  if (select count(*) from service_requests where tenant_id = '00000000-0000-0000-0000-00000000a002') <> 0 then raise exception 'FALHA: dono leu chamados de outro tenant'; end if;
  if (select count(*) from service_requests) <> 1 then raise exception 'FALHA: dono deveria ver só o próprio chamado'; end if;
  insert into ctx values ('novo', owner_rotate_staff_link('00000000-0000-0000-0000-00000000a001'));
  if owner_rotate_staff_link('00000000-0000-0000-0000-00000000a002') is not null then raise exception 'FALHA: dono trocou link de OUTRO tenant'; end if;
  if (select count(*) from audit_logs where action = 'staff_link_rotated') <> 1 then raise exception 'FALHA: auditoria da troca do link'; end if;
end $$;
reset role;

-- 3) a troca do link vale na hora: o antigo morre, o novo funciona
set local role anon;
do $$ begin
  begin perform 1 from panel_requests('painel-gastropub-original-0000000000000'); raise exception 'FALHA: link antigo ainda funciona';
  exception when others then if sqlerrm <> 'invalid_token' then raise; end if; end;
  if (select count(*) from panel_requests((select v from ctx where k='novo'))) <> 1 then raise exception 'FALHA: link novo não mostra a fila'; end if;
  if (select count(*) from public_sold_out('gastropub')) <> 1 then raise exception 'FALHA: cliente não vê o esgotado marcado pelo dono'; end if;
end $$;
reset role;

-- 4) garçom (staff) NÃO administra: nem esgotado, nem link
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d0002';
do $$ begin
  if (select role from my_tenants()) <> 'staff' then raise exception 'FALHA: papel do garçom'; end if;
  if owner_set_sold_out('00000000-0000-0000-0000-00000000a001','h2',true) then raise exception 'FALHA: garçom marcou esgotado'; end if;
  if owner_staff_link('00000000-0000-0000-0000-00000000a001') is not null then raise exception 'FALHA: garçom viu o link'; end if;
  if owner_rotate_staff_link('00000000-0000-0000-0000-00000000a001') is not null then raise exception 'FALHA: garçom trocou o link'; end if;
  if (select count(*) from audit_logs) <> 0 then raise exception 'FALHA: garçom leu auditoria'; end if;
end $$;
reset role;

-- 5) dono de OUTRO bar não mexe no GastroPub e não vê o link novo
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d0003';
do $$ begin
  if owner_set_sold_out('00000000-0000-0000-0000-00000000a001','h2',false) then raise exception 'FALHA: outro dono mexeu no esgotado'; end if;
  if owner_staff_link('00000000-0000-0000-0000-00000000a001') is not null then raise exception 'FALHA: outro dono viu o link'; end if;
  if owner_rotate_staff_link('00000000-0000-0000-0000-00000000a001') is not null then raise exception 'FALHA: outro dono trocou o link'; end if;
  if (select count(*) from sold_out_items) <> 0 then raise exception 'FALHA: outro dono leu esgotados do GastroPub'; end if;
  if (select count(*) from audit_logs where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 0 then raise exception 'FALHA: outro dono leu auditoria do GastroPub'; end if;
end $$;
reset role;
-- o link novo continua valendo (a tentativa do outro dono não o revogou)
set local role anon;
do $$ begin if (select count(*) from panel_requests((select v from ctx where k='novo'))) <> 1 then raise exception 'FALHA: link novo foi revogado por outro dono'; end if; end $$;
reset role;
rollback;
\echo 'DONO: todos os testes passaram'

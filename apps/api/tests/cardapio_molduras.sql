-- Testes de 0016: novo item, cardápio público e molduras.
begin;
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000d0a1','cm-a','CM A','a_la_carte','active'),('00000000-0000-0000-0000-00000000d0b1','cm-b','CM B','a_la_carte','active');
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000d1001'),('00000000-0000-0000-0000-0000000d1002'),('00000000-0000-0000-0000-0000000d1003');
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000d0a1','00000000-0000-0000-0000-0000000d1001','owner'),('00000000-0000-0000-0000-00000000d0a1','00000000-0000-0000-0000-0000000d1002','staff'),('00000000-0000-0000-0000-00000000d0b1','00000000-0000-0000-0000-0000000d1003','owner');
set local role anon;
do $$ begin
  begin perform owner_menu_add('00000000-0000-0000-0000-00000000d0a1','X',100,'Bebidas',null); raise exception 'FALHA: anon criou item'; exception when insufficient_privilege then null; end;
  begin perform owner_frame_set('00000000-0000-0000-0000-00000000d0a1','f',true,array['a'],'b'); raise exception 'FALHA: anon mexeu em moldura'; exception when insufficient_privilege then null; end;
  begin perform * from owner_frames_list('00000000-0000-0000-0000-00000000d0a1'); raise exception 'FALHA: anon leu lista do dono'; exception when insufficient_privilege then null; end;
  perform * from menu_public('cm-a'); perform * from frames_public('cm-a');   -- públicas: devem funcionar
end $$;
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d1002';   -- garçom
do $$ begin
  if owner_menu_add('00000000-0000-0000-0000-00000000d0a1','Suco',900,'Bebidas',null) is not null then raise exception 'FALHA: garçom criou item'; end if;
  if owner_frame_set('00000000-0000-0000-0000-00000000d0a1','f1',true,array['Oi'],'Rodapé') then raise exception 'FALHA: garçom mexeu em moldura'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d1001';   -- dono de A
do $$ declare v text; begin
  v := owner_menu_add('00000000-0000-0000-0000-00000000d0a1','Suco de Uva',900,'Bebidas','Integral');
  if v is null or v not like 'n-%' then raise exception 'FALHA: dono não criou item'; end if;
  if owner_menu_add('00000000-0000-0000-0000-00000000d0a1','Suco',-5,'Bebidas',null) is not null then raise exception 'FALHA: preço negativo aceito'; end if;
  if owner_menu_add('00000000-0000-0000-0000-00000000d0a1','S',100,'Bebidas',null) is not null then raise exception 'FALHA: nome curto aceito'; end if;
  if owner_menu_add('00000000-0000-0000-0000-00000000d0b1','Invasor',100,'Bebidas',null) is not null then raise exception 'FALHA: dono de A criou item em B'; end if;
  if (select count(*) from menu_public('cm-a') where name = 'Suco de Uva' and price_cents = 900) <> 1 then raise exception 'FALHA: item não aparece no cardápio público'; end if;
  if exists (select 1 from menu_public('cm-b')) then raise exception 'FALHA: cardápio de B tem itens de A'; end if;
  if not owner_frame_set('00000000-0000-0000-0000-00000000d0a1','f1',true,array['Linha 1','Linha 2'],'Rodapé') then raise exception 'FALHA: moldura não salva'; end if;
  if owner_frame_set('00000000-0000-0000-0000-00000000d0a1','f1',true,array['a','b','c','d'],'R') then raise exception 'FALHA: 4 linhas aceitas'; end if;
  if owner_frame_set('00000000-0000-0000-0000-00000000d0b1','f1',true,array['x'],'y') then raise exception 'FALHA: dono de A mexeu em moldura de B'; end if;
  if (select count(*) from owner_frames_list('00000000-0000-0000-0000-00000000d0a1')) <> 1 then raise exception 'FALHA: lista de molduras'; end if;
  if exists (select 1 from owner_frames_list('00000000-0000-0000-0000-00000000d0b1')) then raise exception 'FALHA: dono de A leu molduras de B'; end if;
  if (select count(*) from frames_public('cm-a')) <> 1 or exists (select 1 from frames_public('cm-b')) then raise exception 'FALHA: molduras públicas'; end if;
end $$;
reset role;
do $$ begin if (select count(*) from audit_logs where action in ('menu_item_added','frame_set')) < 2 then raise exception 'FALHA: auditoria'; end if; end $$;
rollback;
\echo CARDAPIO E MOLDURAS: todos os testes passaram

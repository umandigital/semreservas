-- Testes de 0017: equipe (só dono) e canais de entrada.
begin;
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000e0a1','eq-a','EQ A','a_la_carte','active'),('00000000-0000-0000-0000-00000000e0b1','eq-b','EQ B','a_la_carte','active');
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000e1001','dono-a@t.test'),('00000000-0000-0000-0000-0000000e1002','gerente-a@t.test'),('00000000-0000-0000-0000-0000000e1003','dono-b@t.test'),('00000000-0000-0000-0000-0000000e1004','novo@t.test');
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000e1001','owner'),('00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000e1002','manager'),('00000000-0000-0000-0000-00000000e0b1','00000000-0000-0000-0000-0000000e1003','owner');
-- placa de A (NFC e QR) para os canais
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0e01','00000000-0000-0000-0000-00000000e0a1','7');
insert into access_points (id, tenant_id, number) values ('00000000-0000-0000-0000-0000000c0e01','00000000-0000-0000-0000-00000000e0a1','7');
insert into access_point_tokens (token, tenant_id, access_point_id, origin) values ('eq-a-token-nfc-00000000000','00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000c0e01','nfc'),('eq-a-token-qr--00000000000','00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000c0e01','qr');
set local role anon;
do $$ begin
  begin perform * from owner_team_list('00000000-0000-0000-0000-00000000e0a1'); raise exception 'FALHA: anon leu equipe'; exception when insufficient_privilege then null; end;
  begin perform owner_team_set('00000000-0000-0000-0000-00000000e0a1','novo@t.test','staff'); raise exception 'FALHA: anon mudou equipe'; exception when insufficient_privilege then null; end;
  begin perform * from owner_channels('00000000-0000-0000-0000-00000000e0a1', now() - interval '1 day'); raise exception 'FALHA: anon leu canais'; exception when insufficient_privilege then null; end;
  if not plate_open('eq-a-token-nfc-00000000000') then raise exception 'FALHA: abertura NFC não registrada'; end if;
  if not plate_open('eq-a-token-qr--00000000000') then raise exception 'FALHA: abertura QR não registrada'; end if;
  if not plate_open('eq-a-token-qr--00000000000') then raise exception 'FALHA: 2ª abertura QR'; end if;
  if plate_open('token-que-nao-existe-0000000') then raise exception 'FALHA: token inválido registrou'; end if;
end $$;
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1002';   -- gerente de A
do $$ begin
  if exists (select 1 from owner_team_list('00000000-0000-0000-0000-00000000e0a1')) then raise exception 'FALHA: gerente leu a equipe'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0a1','novo@t.test','staff') <> 'denied' then raise exception 'FALHA: gerente deu papel'; end if;
  if owner_team_remove('00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000e1001') then raise exception 'FALHA: gerente removeu o dono'; end if;
  if (select sum(opens) from owner_channels('00000000-0000-0000-0000-00000000e0a1', now() - interval '1 day')) <> 3 then raise exception 'FALHA: gerente não vê canais'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';   -- dono de A
do $$ begin
  if (select count(*) from owner_team_list('00000000-0000-0000-0000-00000000e0a1')) <> 2 then raise exception 'FALHA: lista da equipe'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0a1','NOVO@t.test','staff') <> 'ok' then raise exception 'FALHA: dono não adicionou'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0a1','ninguem@t.test','staff') <> 'not_found' then raise exception 'FALHA: e-mail inexistente'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0a1','novo@t.test','owner') <> 'denied' then raise exception 'FALHA: criou outro dono'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0a1','dono-a@t.test','staff') <> 'denied' then raise exception 'FALHA: rebaixou o dono'; end if;
  if owner_team_set('00000000-0000-0000-0000-00000000e0b1','novo@t.test','staff') <> 'denied' then raise exception 'FALHA: dono de A mexeu na equipe de B'; end if;
  if exists (select 1 from owner_team_list('00000000-0000-0000-0000-00000000e0b1')) then raise exception 'FALHA: dono de A leu equipe de B'; end if;
  if owner_team_remove('00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000e1001') then raise exception 'FALHA: dono removeu a si mesmo'; end if;
  if not owner_team_remove('00000000-0000-0000-0000-00000000e0a1','00000000-0000-0000-0000-0000000e1004') then raise exception 'FALHA: não removeu'; end if;
  if (select count(*) from owner_channels('00000000-0000-0000-0000-00000000e0a1', now() - interval '1 day') where origin = 'qr' and opens = 2) <> 1 then raise exception 'FALHA: contagem QR'; end if;
  if exists (select 1 from owner_channels('00000000-0000-0000-0000-00000000e0b1', now() - interval '1 day')) then raise exception 'FALHA: dono de A leu canais de B'; end if;
end $$;
reset role;
do $$ begin if (select count(*) from audit_logs where action in ('team_role_set','team_role_removed')) < 2 then raise exception 'FALHA: auditoria da equipe'; end if; end $$;
rollback;
\echo EQUIPE E CANAIS: todos os testes passaram

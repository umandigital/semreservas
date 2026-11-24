-- Painel do proprietário: configurações só por dono/gerente do próprio restaurante, auditadas.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e4001'),('00000000-0000-0000-0000-0000000e4002'),('00000000-0000-0000-0000-0000000e4003');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0f2','painel-b','Painel B','a_la_carte','active');
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e4001','owner'),('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e4002','staff'),('00000000-0000-0000-0000-00000000a0f2','00000000-0000-0000-0000-0000000e4003','owner');
set local role anon;
do $$ begin
  begin perform owner_club_settings_set('00000000-0000-0000-0000-00000000a001', true, '{1}', '10:00', '12:00', 0, 100, 60); raise exception 'FALHA: anon mudou configurações'; exception when insufficient_privilege then null; end;
  begin perform owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.3, -54.1, 150, 'flag'); raise exception 'FALHA: anon mudou presença'; exception when insufficient_privilege then null; end;
end $$;
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e4002';   -- garçom
do $$ begin
  if owner_club_settings_set('00000000-0000-0000-0000-00000000a001', true, '{1}', '10:00', '12:00', 0, 100, 60) then raise exception 'FALHA: garçom mudou configurações'; end if;
  if owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.3, -54.1, 150, 'flag') then raise exception 'FALHA: garçom mudou presença'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e4001';   -- dono de A
do $$ begin
  if not owner_club_settings_set('00000000-0000-0000-0000-00000000a001', true, '{2,3,4,5,6,7}', '19:00', '23:30', 30, 200, 120) then raise exception 'FALHA: dono não configurou'; end if;
  if owner_club_settings_set('00000000-0000-0000-0000-00000000a001', true, '{9}', '19:00', '23:30', 30, 200, 120) then raise exception 'FALHA: dia inválido aceito'; end if;
  if owner_club_settings_set('00000000-0000-0000-0000-00000000a0f2', true, '{1}', '10:00', '12:00', 0, 100, 60) then raise exception 'FALHA: dono de A mexeu em B'; end if;
  if not owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.33, -54.10, 150, 'flag') then raise exception 'FALHA: presença não configurada'; end if;
  if owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.33, null, 150, 'flag') then raise exception 'FALHA: lat sem lon aceito'; end if;
  if owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.33, -54.10, 5, 'flag') then raise exception 'FALHA: raio inválido aceito'; end if;
  if owner_presence_set('00000000-0000-0000-0000-00000000a001', -31.33, -54.10, 150, 'qualquer') then raise exception 'FALHA: política inválida aceita'; end if;
end $$;
reset role;
do $$ begin
  if (select radius_m from tenants where slug = 'gastropub') <> 150 then raise exception 'FALHA: raio não gravado'; end if;
  if (select count(*) from audit_logs where action in ('club_settings_set','presence_set')) < 2 then raise exception 'FALHA: auditoria do painel incompleta'; end if;
  if (select hours_enforced from club_settings where tenant_id = '00000000-0000-0000-0000-00000000a0f2') then raise exception 'FALHA: configurações de B foram alteradas'; end if;
end $$;
rollback;
\echo PAINEL: todos os testes passaram

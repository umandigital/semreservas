-- Atendimento pelo painel do dono: assumir/direcionar/concluir, lista de garçons, isolamento entre restaurantes.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e5001'),('00000000-0000-0000-0000-0000000e5002'),('00000000-0000-0000-0000-0000000e5003'),('00000000-0000-0000-0000-0000000e5004');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0a2','atend-b','Atend B','a_la_carte','active');
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e5001','owner'),('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e5002','staff'),('00000000-0000-0000-0000-00000000a0a2','00000000-0000-0000-0000-0000000e5003','owner'),('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e5004','manager');
create temp table ca as select (select id from venue_tables where tenant_id = '00000000-0000-0000-0000-00000000a001' and label = '1') as mesa;
grant select on ca to authenticated;
insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a5001', '00000000-0000-0000-0000-00000000a001', mesa, '1', 'waiter', 'PENDING', 'W001', 'h' from ca;
insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a5002', '00000000-0000-0000-0000-00000000a001', mesa, '1', 'bill', 'PENDING', 'W002', 'h' from ca;
-- visitante: nada
set local role anon;
do $$ begin
  begin perform owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001','x'); raise exception 'FALHA: anon assumiu chamado'; exception when insufficient_privilege then null; end;
  begin perform owner_roster_set('00000000-0000-0000-0000-00000000a001','Carlos', true); raise exception 'FALHA: anon mexeu na lista de garçons'; exception when insufficient_privilege then null; end;
  begin perform count(*) from staff_roster; raise exception 'FALHA: anon leu os garçons'; exception when insufficient_privilege then null; end;
end $$;
-- garçom (staff): lê a lista e os chamados, mas não assume pelo painel do dono
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e5002';
do $$ begin
  if owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001','x') then raise exception 'FALHA: garçom usou função do dono'; end if;
  if owner_request_resolve('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001') then raise exception 'FALHA: garçom concluiu pelo dono'; end if;
  if owner_roster_set('00000000-0000-0000-0000-00000000a001','Carlos', true) then raise exception 'FALHA: garçom mexeu na lista'; end if;
end $$;
-- dono de outro restaurante: nada
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e5003';
do $$ begin
  if owner_request_take('00000000-0000-0000-0000-00000000a0a2','00000000-0000-0000-0000-0000000a5001','x') then raise exception 'FALHA: dono de B assumiu chamado de A (por id)'; end if;
  if owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001','x') then raise exception 'FALHA: dono de B assumiu chamado de A'; end if;
  if (select count(*) from staff_roster where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 0 then raise exception 'FALHA: dono de B leu os garçons de A'; end if;
end $$;
-- dono de A: cadastra garçom, direciona, assume, conclui
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e5001';
do $$ begin
  if not owner_roster_set('00000000-0000-0000-0000-00000000a001','Carlos', true) then raise exception 'FALHA: dono não cadastrou garçom'; end if;
  if owner_roster_set('00000000-0000-0000-0000-00000000a001','   ', true) then raise exception 'FALHA: nome vazio aceito'; end if;
  if not owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001','Carlos') then raise exception 'FALHA: dono não direcionou'; end if;
  if (select handled_by_label from service_requests where id = '00000000-0000-0000-0000-0000000a5001') <> 'Carlos' or (select status from service_requests where id = '00000000-0000-0000-0000-0000000a5001') <> 'ACKNOWLEDGED' then raise exception 'FALHA: chamado deveria estar com o Carlos'; end if;
  if not owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5002', null) then raise exception 'FALHA: dono não assumiu'; end if;
  if (select handled_by_label from service_requests where id = '00000000-0000-0000-0000-0000000a5002') <> 'Proprietário' then raise exception 'FALHA: assumir sem nome deveria marcar Proprietário'; end if;
  if not owner_request_resolve('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001') then raise exception 'FALHA: não concluiu'; end if;
  if owner_request_resolve('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001') then raise exception 'FALHA: concluiu duas vezes'; end if;
  if owner_request_take('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5001','Ana') then raise exception 'FALHA: reabriu chamado concluído'; end if;
end $$;
-- gerente também pode; o garçom (staff) enxerga a lista
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e5004';
do $$ begin if not owner_request_resolve('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000a5002') then raise exception 'FALHA: gerente não concluiu'; end if; end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e5002';
do $$ begin if (select count(*) from staff_roster) <> 1 then raise exception 'FALHA: garçom deveria ler a lista do próprio restaurante'; end if; end $$;
reset role;
do $$ begin
  if (select count(*) from service_request_history where request_id in ('00000000-0000-0000-0000-0000000a5001','00000000-0000-0000-0000-0000000a5002')) < 4 then raise exception 'FALHA: histórico incompleto'; end if;
  if (select count(*) from audit_logs where action in ('request_taken','request_resolved','roster_set')) < 5 then raise exception 'FALHA: auditoria do atendimento incompleta'; end if;
end $$;
rollback;
\echo ATENDIMENTO: todos os testes passaram

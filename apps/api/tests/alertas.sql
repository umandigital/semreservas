-- Alertas configuráveis: dono configura; equipe só lê a do próprio restaurante; ninguém mais.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e6001'),('00000000-0000-0000-0000-0000000e6002'),('00000000-0000-0000-0000-0000000e6003');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0b2','alerta-b','Alerta B','a_la_carte','active');
insert into staff_links (token, tenant_id) values ('painel-alerta-a-teste-0000000000000000','00000000-0000-0000-0000-00000000a001'),('painel-alerta-b-teste-0000000000000000','00000000-0000-0000-0000-00000000a0b2');
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e6001','owner'),('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e6002','staff'),('00000000-0000-0000-0000-00000000a0b2','00000000-0000-0000-0000-0000000e6003','owner');
do $$ begin
  if (select count(*) from alert_settings where tenant_id = '00000000-0000-0000-0000-00000000a0b2' and volume = 10 and interval_s = 4 and escalate_s = 60 and owner_sound and staff_sound) <> 1 then raise exception 'FALHA: restaurante novo deveria nascer com som alto e intermitente'; end if;
end $$;
set local role anon;
do $$ begin
  begin perform owner_alert_set('00000000-0000-0000-0000-00000000a001', true, false, 5, 5, 60); raise exception 'FALHA: anon configurou alertas'; exception when insufficient_privilege then null; end;
  begin perform count(*) from alert_settings; raise exception 'FALHA: anon leu alertas'; exception when insufficient_privilege then null; end;
  if (panel_alert_config('painel-alerta-a-teste-0000000000000000')->>'volume')::int <> 10 then raise exception 'FALHA: equipe deveria ler a configuração'; end if;
  begin perform panel_alert_config('token-invalido-00000000000000000000'); raise exception 'FALHA: link inválido leu configuração'; exception when raise_exception then if sqlerrm <> 'invalid_token' then raise; end if; end;
end $$;
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e6002';   -- garçom: lê, não muda
do $$ begin
  if owner_alert_set('00000000-0000-0000-0000-00000000a001', false, false, 1, 30, 600) then raise exception 'FALHA: garçom mudou alertas'; end if;
  if (select count(*) from alert_settings) <> 1 then raise exception 'FALHA: garçom deveria ler só a configuração do próprio restaurante'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e6003';   -- dono de B: nada em A
do $$ begin
  if owner_alert_set('00000000-0000-0000-0000-00000000a001', false, false, 1, 30, 600) then raise exception 'FALHA: dono de B mudou alertas de A'; end if;
  if (select count(*) from alert_settings where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 0 then raise exception 'FALHA: dono de B leu alertas de A'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e6001';   -- dono de A
do $$ begin
  if not owner_alert_set('00000000-0000-0000-0000-00000000a001', true, false, 8, 6, 90) then raise exception 'FALHA: dono não configurou'; end if;
  if owner_alert_set('00000000-0000-0000-0000-00000000a001', true, true, 11, 6, 90) then raise exception 'FALHA: volume inválido aceito'; end if;
  if owner_alert_set('00000000-0000-0000-0000-00000000a001', true, true, 8, 1, 90) then raise exception 'FALHA: intervalo inválido aceito'; end if;
  if owner_alert_set('00000000-0000-0000-0000-00000000a001', true, true, 8, 6, 5) then raise exception 'FALHA: escalada inválida aceita'; end if;
end $$;
reset role;
do $$ begin
  if (select staff_sound from alert_settings where tenant_id = '00000000-0000-0000-0000-00000000a001') then raise exception 'FALHA: "garçons sem equipamento" não foi gravado'; end if;
  if (select (panel_alert_config('painel-alerta-a-teste-0000000000000000')->>'staff_sound')::boolean) then raise exception 'FALHA: a equipe deveria ler som desligado'; end if;
  if (select count(*) from audit_logs where action = 'alert_set') < 1 then raise exception 'FALHA: auditoria dos alertas incompleta'; end if;
end $$;
rollback;
\echo ALERTAS: todos os testes passaram

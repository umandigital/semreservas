-- Extras: Roleta do Chef, prêmios dos extras e Meu aniversário. Falha (raise exception) se algo quebrar.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e2001'),('00000000-0000-0000-0000-0000000e2002'),('00000000-0000-0000-0000-0000000e2003'),('00000000-0000-0000-0000-0000000e2004');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0d2','extras-b','Extras B','a_la_carte','active');
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0d02','00000000-0000-0000-0000-00000000a0d2','1');
insert into access_points (id, tenant_id, number) values ('00000000-0000-0000-0000-0000000c0d02','00000000-0000-0000-0000-00000000a0d2','1');
insert into access_point_tokens (token, tenant_id, access_point_id, origin) values ('extras-b-token-0000000000','00000000-0000-0000-0000-00000000a0d2','00000000-0000-0000-0000-0000000c0d02','nfc');
create temp table cx as select 'dev-gastropub-p1-nfc-000000'::text as tok, '00000000-0000-0000-0000-00000000a001'::uuid as ta,
  (select id from venue_tables where tenant_id = '00000000-0000-0000-0000-00000000a001' and label = '1') as mesa;
grant select on cx to anon, authenticated;
-- chamados de pedido (um válido, um cancelado, um de outro tipo) criados como superusuário do teste
insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a0001', ta, mesa, '1', 'order', 'PENDING', 'AAAA', 'h' from cx;
insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a0002', ta, mesa, '1', 'order', 'CANCELLED', 'BBBB', 'h' from cx;
insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a0003', ta, mesa, '1', 'waiter', 'PENDING', 'CCCC', 'h' from cx;

insert into service_requests (id, tenant_id, table_id, table_label, kind, status, public_code, cancel_token_hash) select '00000000-0000-0000-0000-0000000a0004', ta, mesa, '1', 'order', 'RESOLVED', 'DDDD', 'h' from cx;
-- fotografias dos pedidos (o que o servidor calculou): 0001 = R$ 90, 0002 (cancelado) = R$ 90, 0004 = R$ 50
insert into order_snapshots (request_id, tenant_id, items, subtotal_cents) select '00000000-0000-0000-0000-0000000a0001', ta, '[]', 9000 from cx;
insert into order_snapshots (request_id, tenant_id, items, subtotal_cents) select '00000000-0000-0000-0000-0000000a0002', ta, '[]', 9000 from cx;
insert into order_snapshots (request_id, tenant_id, items, subtotal_cents) select '00000000-0000-0000-0000-0000000a0004', ta, '[]', 5000 from cx;
-- u1 adulta e u2 menor entram e fazem a visita do dia
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2001';
do $$ declare tok text := (select tok from cx); begin perform club_join(tok,'Ana','1990-06-06','v1'); perform club_checkin(tok); end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2002';
do $$ declare tok text := (select tok from cx); begin perform club_join(tok,'Maria','2010-06-06','v1'); perform club_checkin(tok); end $$;
-- menor de 18: sem roleta
do $$ declare tok text := (select tok from cx); begin
  begin perform roulette_grant(tok, '00000000-0000-0000-0000-0000000a0001', 9000); raise exception 'FALHA: menor ganhou giro'; exception when raise_exception then if sqlerrm <> 'adults_only' then raise; end if; end;
  if (roulette_state(tok)->>'adult')::boolean then raise exception 'FALHA: menor aparece como adulto'; end if;
end $$;
-- adulta: regras de liberação do giro
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2001';
do $$ declare tok text := (select tok from cx); r jsonb; begin
  r := roulette_grant(tok, '00000000-0000-0000-0000-0000000a0004', 99999);   -- o valor do cliente é ignorado
  if (r->>'granted')::boolean then raise exception 'FALHA: pedido abaixo de R$ 80 liberou giro (valor do cliente foi aceito)'; end if;
  begin perform roulette_grant(tok, '00000000-0000-0000-0000-0000000a0002', 9000); raise exception 'FALHA: chamado cancelado liberou giro'; exception when raise_exception then if sqlerrm <> 'invalid_request' then raise; end if; end;
  begin perform roulette_grant(tok, '00000000-0000-0000-0000-0000000a0003', 9000); raise exception 'FALHA: chamado de garçom liberou giro'; exception when raise_exception then if sqlerrm <> 'invalid_request' then raise; end if; end;
  begin perform roulette_grant(tok, gen_random_uuid(), 9000); raise exception 'FALHA: chamado inexistente liberou giro'; exception when raise_exception then if sqlerrm <> 'invalid_request' then raise; end if; end;
  begin perform roulette_spin(tok); raise exception 'FALHA: girou sem giro liberado'; exception when raise_exception then if sqlerrm <> 'no_grant' then raise; end if; end;
  r := roulette_grant(tok, '00000000-0000-0000-0000-0000000a0001', 9000);
  if not (r->>'granted')::boolean then raise exception 'FALHA: pedido de R$ 90 deveria liberar giro: %', r; end if;
  r := roulette_grant(tok, '00000000-0000-0000-0000-0000000a0001', 9000);
  if (r->>'granted')::boolean or r->>'reason' <> 'already' then raise exception 'FALHA: liberou 2 giros para o mesmo chamado: %', r; end if;
  if (roulette_state(tok)->>'grants')::int <> 1 then raise exception 'FALHA: deveria haver 1 giro'; end if;
end $$;
-- 5 giros (liberações de dias anteriores simuladas pelo superusuário); etapas nunca repetem; o 5º ganha
reset role;
insert into roulette_grants (tenant_id, user_id, day, request_id, subtotal_cents, status)
  select ta, '00000000-0000-0000-0000-0000000e2001', current_date - g, gen_random_uuid(), 9000, 'available' from cx, generate_series(1,4) g;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2001';
do $$ declare tok text := (select tok from cx); r jsonb; vistos text[] := '{}'; i int; begin
  for i in 1..5 loop
    r := roulette_spin(tok);
    if r->>'step' = any (vistos) then raise exception 'FALHA: etapa repetida %', r->>'step'; end if;
    vistos := vistos || (r->>'step');
    if (r->>'count')::int <> i then raise exception 'FALHA: contagem errada no giro %: %', i, r; end if;
    if i < 5 and (r->>'won')::boolean then raise exception 'FALHA: ganhou antes do 5º giro'; end if;
    if i = 5 and not (r->>'won')::boolean then raise exception 'FALHA: o 5º giro deveria ganhar: %', r; end if;
  end loop;
  begin perform roulette_spin(tok); raise exception 'FALHA: girou sem giro sobrando'; exception when raise_exception then if sqlerrm <> 'no_grant' then raise; end if; end;
  if (select count(*) from club_extras(tok) where source = 'roulette' and status = 'available') <> 1 then raise exception 'FALHA: deveria existir 1 prêmio da roleta'; end if;
end $$;
-- usar o prêmio: uma vez só; vencido não vale
do $$ declare tok text := (select tok from cx); pid uuid; r jsonb; begin
  select id into pid from club_extras(tok) where source = 'roulette' limit 1;
  r := club_extra_use(tok, pid);
  if length(r->>'code') <> 6 then raise exception 'FALHA: comprovante sem código'; end if;
  begin perform club_extra_use(tok, pid); raise exception 'FALHA: prêmio usado duas vezes'; exception when raise_exception then if sqlerrm <> 'not_active' then raise; end if; end;
end $$;
-- isolamento: associado de B não gira nem usa prêmio em A; anônimo e gravação direta negados
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2003';
do $$ declare tok text := (select tok from cx); begin
  perform club_join('extras-b-token-0000000000','Beto','1985-01-01','v1');
  begin perform roulette_spin(tok); raise exception 'FALHA: cliente de B girou em A'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
  begin perform roulette_grant(tok, '00000000-0000-0000-0000-0000000a0001', 9000); raise exception 'FALHA: cliente de B liberou giro em A'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
  if (select count(*) from club_extras(tok)) <> 0 then raise exception 'FALHA: cliente de B viu prêmios de A'; end if;
  begin insert into extra_prizes (tenant_id,user_id,source,name,code,valid_until) values ((select ta from cx), '00000000-0000-0000-0000-0000000e2003','roulette','x','ZZZZZZ',now()); raise exception 'FALHA: cliente gravou prêmio'; exception when insufficient_privilege then null; end;
end $$;
reset role; set local role anon;
do $$ declare tok text := (select tok from cx); begin
  begin perform roulette_state(tok); raise exception 'FALHA: anon leu roleta'; exception when insufficient_privilege then null; end;
  begin perform roulette_spin(tok); raise exception 'FALHA: anon girou'; exception when insufficient_privilege then null; end;
  begin perform club_birthday_claim(tok); raise exception 'FALHA: anon pegou presente'; exception when insufficient_privilege then null; end;
  begin perform count(*) from extra_prizes; raise exception 'FALHA: anon leu prêmios'; exception when insufficient_privilege then null; end;
end $$;
-- aniversário: só no dia (ou no seguinte), uma vez por ano
reset role;
update person_profiles set birth_date = ((now() at time zone 'America/Sao_Paulo')::date - interval '30 years')::date where user_id = '00000000-0000-0000-0000-0000000e2001';
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2001';
do $$ declare tok text := (select tok from cx); st jsonb; r jsonb; begin
  st := club_birthday_state(tok);
  if not (st->>'can_claim')::boolean or (st->>'days_until')::int <> 0 then raise exception 'FALHA: hoje é o aniversário: %', st; end if;
  r := club_birthday_claim(tok);
  if (select count(*) from club_extras(tok) where source = 'birthday' and status = 'available') <> 1 then raise exception 'FALHA: faltou o presente'; end if;
  begin perform club_birthday_claim(tok); raise exception 'FALHA: presente duas vezes no ano'; exception when raise_exception then if sqlerrm <> 'already_claimed' then raise; end if; end;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2002';
do $$ declare tok text := (select tok from cx); begin
  begin perform club_birthday_claim(tok); raise exception 'FALHA: presente fora do aniversário'; exception when raise_exception then if sqlerrm <> 'not_birthday' then raise; end if; end;
end $$;
-- dono: só gerente/dono liga e desliga; garçom e cliente não
reset role;
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e2004','staff');
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2004';
do $$ begin
  if owner_roulette_set('00000000-0000-0000-0000-00000000a001', false, 1, 60, 'Roubo', 30, false) then raise exception 'FALHA: garçom mudou a roleta'; end if;
  if owner_birthday_set('00000000-0000-0000-0000-00000000a001', false, 'Roubo', 50, 5, 2, false) then raise exception 'FALHA: garçom mudou o aniversário'; end if;
  if (select count(*) from extra_prizes) <> 0 then raise exception 'FALHA: garçom leu prêmios'; end if;
end $$;
reset role;
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a0d2','00000000-0000-0000-0000-0000000e2004','owner') on conflict do nothing;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e2004';
do $$ begin
  if owner_roulette_set('00000000-0000-0000-0000-00000000a001', false, 1, 60, 'Roubo', 30, false) then raise exception 'FALHA: dono de B mexeu na roleta de A'; end if;
  if not owner_roulette_set('00000000-0000-0000-0000-00000000a0d2', true, 10000, 45, 'Pizza grande', 20, true) then raise exception 'FALHA: dono de B não configurou a própria roleta'; end if;
end $$;
reset role;
do $$ begin
  if (select count(*) from audit_logs where action in ('roulette_grant','roulette_spin','extra_prize_used','birthday_claim','roulette_set')) < 8 then raise exception 'FALHA: auditoria dos extras incompleta'; end if;
  if (select min_subtotal_cents from roulette_settings where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 8000 then raise exception 'FALHA: a roleta de A foi alterada'; end if;
end $$;
rollback;
\echo EXTRAS: todos os testes passaram

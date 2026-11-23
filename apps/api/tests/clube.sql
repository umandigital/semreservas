-- Clube: isolamento, idempotência, limites, troca e cancelamento. Falha (raise exception) se qualquer regra quebrar.
\set ON_ERROR_STOP on
begin;
-- usuários: u1 cliente em A; u2 cliente em B; u3 gerente de A; u4 garçom de A; u5 dono de B; u6 sem nada
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e0001'),('00000000-0000-0000-0000-0000000e0002'),('00000000-0000-0000-0000-0000000e0003'),
  ('00000000-0000-0000-0000-0000000e0004'),('00000000-0000-0000-0000-0000000e0005'),('00000000-0000-0000-0000-0000000e0006');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0c2','clube-b','Clube B','a_la_carte','active');
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0c02','00000000-0000-0000-0000-00000000a0c2','1');
insert into access_points (id, tenant_id, number) values ('00000000-0000-0000-0000-0000000c0c02','00000000-0000-0000-0000-00000000a0c2','1');
insert into access_point_tokens (token, tenant_id, access_point_id, origin) values ('clube-b-token-0000000000','00000000-0000-0000-0000-00000000a0c2','00000000-0000-0000-0000-0000000c0c02','nfc');
insert into tenant_user_roles values
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0003','manager'),
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0004','staff'),
 ('00000000-0000-0000-0000-00000000a0c2','00000000-0000-0000-0000-0000000e0005','owner');
insert into club_rewards (id, tenant_id, name, cost_points, min_visits, per_person_month, stock_month) values
 ('00000000-0000-0000-0000-0000000f0b01','00000000-0000-0000-0000-00000000a0c2','Prêmio de B',10,0,null,null);
create temp table ctx as select (select token from access_point_tokens where tenant_id = '00000000-0000-0000-0000-00000000a001' limit 1) as tok_a,
  (select id from club_rewards where tenant_id = '00000000-0000-0000-0000-00000000a001' and cost_points = 200) as rw200,
  (select id from club_rewards where tenant_id = '00000000-0000-0000-0000-00000000a001' and cost_points = 1000) as rw1000;
grant select on ctx to anon, authenticated;

-- 1) Anônimo: sem acesso a tabelas, nenhuma função de cliente/dono; só vê regras e catálogo da própria mesa
set local role anon;
do $$ declare tok text := (select tok_a from ctx); begin
  begin perform count(*) from points_ledger; raise exception 'FALHA: anon leu o extrato'; exception when insufficient_privilege then null; end;
  begin perform count(*) from club_members; raise exception 'FALHA: anon leu associados'; exception when insufficient_privilege then null; end;
  begin perform count(*) from person_profiles; raise exception 'FALHA: anon leu perfis'; exception when insufficient_privilege then null; end;
  begin perform club_join(tok,'Ana','1990-01-01','v1'); raise exception 'FALHA: anon entrou no clube'; exception when insufficient_privilege then null; end;
  begin perform club_redeem(tok, null); raise exception 'FALHA: anon trocou'; exception when insufficient_privilege then null; end;
  begin perform is_platform_admin(); raise exception 'FALHA: anon chamou is_platform_admin'; exception when insufficient_privilege then null; end;
  begin perform _club_credit('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0001','signup','x'); raise exception 'FALHA: anon chamou função interna'; exception when insufficient_privilege then null; end;
  if (select count(*) from club_rules(tok)) < 10 then raise exception 'FALHA: regras públicas não aparecem'; end if;
  if (select count(*) from club_catalog(tok)) <> 4 then raise exception 'FALHA: catálogo público deveria ter 4 prêmios'; end if;
  if (select count(*) from club_catalog('token-invalido-0000000000000')) <> 0 then raise exception 'FALHA: token inválido enxergou catálogo'; end if;
end $$;
reset role;

-- 2) Cliente u1: entrada, idempotência, regras de idade
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0001';
do $$ declare tok text := (select tok_a from ctx); r jsonb; begin
  begin perform club_join(tok,'Ana','2020-01-01','v1'); raise exception 'FALHA: aceitou menor de 13 anos'; exception when raise_exception then if sqlerrm <> 'invalid_birth' then raise; end if; end;
  begin perform club_join(tok,'Ana','1990-05-05',''); raise exception 'FALHA: aceitou sem regulamento'; exception when raise_exception then if sqlerrm <> 'regulation_required' then raise; end if; end;
  begin perform club_join('token-invalido-0000000000000','Ana','1990-05-05','v1'); raise exception 'FALHA: token inválido entrou'; exception when raise_exception then if sqlerrm <> 'invalid_token' then raise; end if; end;
  r := club_join(tok,'Ana','1990-05-05','v1',true);
  if (r->>'credited')::int <> 50 or (r->>'balance')::int <> 50 then raise exception 'FALHA: cadastro deveria dar 50 pontos, deu %', r; end if;
  r := club_join(tok,'Ana','1990-05-05','v1');
  if (r->>'credited')::int <> 0 or (r->>'balance')::int <> 50 then raise exception 'FALHA: entrar de novo duplicou pontos: %', r; end if;
  if (club_me(tok)->>'member')::boolean is not true then raise exception 'FALHA: club_me não achou o associado'; end if;
end $$;

-- 3) Pontos por ações de intenção: limites e ações que o app NÃO pode pedir
do $$ declare tok text := (select tok_a from ctx); r jsonb; begin
  r := club_earn(tok,'instagram_follow'); if (r->>'credited')::int <> 20 then raise exception 'FALHA: instagram deveria dar 20: %', r; end if;
  r := club_earn(tok,'instagram_follow'); if (r->>'credited')::int <> 0 then raise exception 'FALHA: instagram deu pontos duas vezes: %', r; end if;
  r := club_earn(tok,'google_open');      if (r->>'credited')::int <> 20 then raise exception 'FALHA: google deveria dar 20: %', r; end if;
  begin perform club_earn(tok,'checkin'); raise exception 'FALHA: o app pediu check-in direto'; exception when raise_exception then if sqlerrm <> 'action_not_claimable' then raise; end if; end;
  begin perform club_earn(tok,'referral'); raise exception 'FALHA: o app pediu indicação direto'; exception when raise_exception then if sqlerrm <> 'action_not_claimable' then raise; end if; end;
  r := club_earn(tok,'ar_used'); r := club_earn(tok,'ar_used'); r := club_earn(tok,'ar_used');
  r := club_earn(tok,'ar_used'); if (r->>'credited')::int <> 0 then raise exception 'FALHA: RA passou do limite de 3 por dia: %', r; end if;
  if (club_me(tok)->>'balance')::int <> 105 then raise exception 'FALHA: saldo esperado 105, veio %', club_me(tok); end if;
end $$;

-- 4) Troca: saldo, desconto, limite de uma por dia, cancelamento em 2 minutos
do $$ declare tok text := (select tok_a from ctx); r jsonb; rid uuid; begin
  begin perform club_redeem(tok, (select rw1000 from ctx)); raise exception 'FALHA: trocou sem pontos'; exception when raise_exception then if sqlerrm <> 'insufficient_points' then raise; end if; end;
end $$;
reset role;
-- dá 300 pontos pelo caminho do gerente (precisa de papel)
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0004';   -- garçom (staff)
do $$ begin
  if owner_club_adjust('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0001', 300, 'ajuste de teste') then raise exception 'FALHA: garçom ajustou pontos'; end if;
  if owner_club_rule_set('00000000-0000-0000-0000-00000000a001','checkin',99,true,'per_day',1) then raise exception 'FALHA: garçom mudou regra'; end if;
  begin perform count(*) from points_ledger; if (select count(*) from points_ledger) <> 0 then raise exception 'FALHA: garçom leu extrato'; end if; end;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0003';   -- gerente de A
do $$ begin
  if owner_club_adjust('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0001', 300, 'x') then raise exception 'FALHA: ajuste sem motivo foi aceito'; end if;
  if not owner_club_adjust('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e0001', 300, 'ajuste de teste') then raise exception 'FALHA: gerente não conseguiu ajustar'; end if;
  if owner_club_adjust('00000000-0000-0000-0000-00000000a0c2','00000000-0000-0000-0000-0000000e0002', 10, 'invasão de B') then raise exception 'FALHA: gerente de A ajustou em B'; end if;
  if owner_club_reward_set('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000f0b01','Roubo',1,0,null,null,true) is not null then raise exception 'FALHA: gerente de A editou prêmio de B'; end if;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0001';   -- volta a u1
do $$ declare tok text := (select tok_a from ctx); r jsonb; r2 jsonb; begin
  r := club_redeem(tok, (select rw200 from ctx));
  if (r->>'balance')::int <> 205 or length(r->>'code') <> 6 then raise exception 'FALHA: troca deveria deixar 205 pontos e código de 6: %', r; end if;
  begin perform club_redeem(tok, (select rw200 from ctx)); raise exception 'FALHA: duas trocas no mesmo dia'; exception when raise_exception then if sqlerrm <> 'one_per_day' then raise; end if; end;
  r2 := club_cancel_redemption(tok, (r->>'id')::uuid);
  if (r2->>'balance')::int <> 405 then raise exception 'FALHA: cancelar deveria devolver os pontos: %', r2; end if;
  begin perform club_cancel_redemption(tok, (r->>'id')::uuid); raise exception 'FALHA: cancelou duas vezes'; exception when raise_exception then if sqlerrm <> 'not_active' then raise; end if; end;
  begin perform club_redeem(tok, (select rw1000 from ctx)); raise exception 'FALHA: pizza sem 8 visitas'; exception when raise_exception then if sqlerrm not in ('min_visits','insufficient_points') then raise; end if; end;
  r := club_redeem(tok, (select rw200 from ctx));
  begin update points_ledger set delta = 1 where false; raise exception 'FALHA: cliente tem privilégio de update no extrato'; exception when insufficient_privilege then null; end;
  begin update redemptions set status = 'active' where false; raise exception 'FALHA: cliente tem privilégio de update em trocas'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- imutabilidade do extrato mesmo para quem tem privilégio (gatilho)
do $$ begin
  begin update points_ledger set delta = delta + 1 where id = (select min(id) from points_ledger); raise exception 'FALHA: extrato foi alterado';
  exception when raise_exception then if sqlerrm <> 'ledger_immutable' then raise; end if; end;
  begin delete from points_ledger where id = (select min(id) from points_ledger); raise exception 'FALHA: extrato foi apagado';
  exception when raise_exception then if sqlerrm <> 'ledger_immutable' then raise; end if; end;
end $$;
-- janela de 2 minutos: simula troca antiga (tabela editada como superusuário do teste)
do $$ declare rid uuid; begin
  select id into rid from redemptions where status = 'active' limit 1;
  update redemptions set created_at = now() - interval '5 minutes' where id = rid;
end $$;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0001';
do $$ declare tok text := (select tok_a from ctx); rid uuid; begin
  select id into rid from club_my_redemptions(tok) where status = 'active' limit 1;
  begin perform club_cancel_redemption(tok, rid); raise exception 'FALHA: cancelou depois dos 2 minutos'; exception when raise_exception then if sqlerrm <> 'cancel_window_over' then raise; end if; end;
end $$;

-- 5) Isolamento entre restaurantes: u2 (cliente de B) não mexe em A; u1 não troca prêmio de B
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0002';
do $$ declare tok_b text := 'clube-b-token-0000000000'; tok text := (select tok_a from ctx); begin
  perform club_join(tok_b,'Beto','1988-02-02','v1');
  begin perform club_redeem(tok, (select rw200 from ctx)); raise exception 'FALHA: cliente de B trocou em A'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
  if (club_me(tok)->>'member')::boolean then raise exception 'FALHA: cliente de B aparece como associado de A'; end if;
  if (select count(*) from club_my_ledger(tok)) <> 0 then raise exception 'FALHA: cliente de B viu extrato de A'; end if;
  begin perform club_earn(tok,'instagram_follow'); raise exception 'FALHA: cliente de B ganhou ponto em A'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0001';
do $$ declare tok text := (select tok_a from ctx); begin
  begin perform club_redeem('clube-b-token-0000000000', '00000000-0000-0000-0000-0000000f0b01'); raise exception 'FALHA: cliente de A trocou em B'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
  if (select count(*) from points_ledger) <> 0 then raise exception 'FALHA: cliente leu o extrato direto pela tabela'; end if;
end $$;
-- 6) Sem login: nada de cliente funciona; usuário sem associação não entra com token errado
reset role; set local role authenticated; set local request.jwt.claim.sub = '';
do $$ begin
  begin perform club_join((select tok_a from ctx),'Ana','1990-05-05','v1'); raise exception 'FALHA: entrou sem sessão'; exception when raise_exception then if sqlerrm <> 'not_authenticated' then raise; end if; end;
end $$;
-- 7) Dono de B só enxerga o clube de B pelas políticas
reset role; set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e0005';
do $$ begin
  if (select count(*) from club_rewards where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 0 then raise exception 'FALHA: dono de B leu prêmios de A'; end if;
  if (select count(*) from points_ledger where tenant_id = '00000000-0000-0000-0000-00000000a001') <> 0 then raise exception 'FALHA: dono de B leu extrato de A'; end if;
  if (select count(*) from club_rewards) <> 1 then raise exception 'FALHA: dono de B deveria ver só seu prêmio'; end if;
end $$;
-- 8) Auditoria gravada
reset role;
do $$ begin
  if (select count(*) from audit_logs where action in ('club_join','club_redeem','club_redeem_cancelled','club_points_adjusted')) < 4 then raise exception 'FALHA: auditoria do clube incompleta'; end if;
end $$;
rollback;
\echo CLUBE: todos os testes passaram

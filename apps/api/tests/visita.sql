-- Visita e opinião: check-in, bônus, horário, presença, indicação, mesa cheia, feedback. Falha (raise exception) se algo quebrar.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e1001'),('00000000-0000-0000-0000-0000000e1002'),('00000000-0000-0000-0000-0000000e1003'),
  ('00000000-0000-0000-0000-0000000e1004'),('00000000-0000-0000-0000-0000000e1005');
create temp table ctx2 as select 'dev-gastropub-p1-nfc-000000'::text as tok;
grant select on ctx2 to anon, authenticated;
-- ana (1001) e bia (1002) entram; cada uma é associada em A
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  r := club_join(tok,'Ana','1990-01-01','v1');
  perform set_config('app.ana_ref', club_me(tok)->>'referral_code', true);
  begin perform club_checkin('token-invalido-0000000000000'); raise exception 'FALHA: check-in com token inválido'; exception when raise_exception then if sqlerrm <> 'invalid_token' then raise; end if; end;
  r := club_checkin(tok);
  if (r->>'credited')::int <> 30 or (r->>'already')::boolean then raise exception 'FALHA: check-in deveria dar 30: %', r; end if;
  r := club_checkin(tok);
  if (r->>'credited')::int <> 0 or not (r->>'already')::boolean then raise exception 'FALHA: segundo check-in do dia deu pontos: %', r; end if;
  if (club_today(tok)->>'visited')::boolean is not true then raise exception 'FALHA: club_today não viu a visita'; end if;
end $$;
-- bia entra com o código da ana; no 1º check-in, a ana ganha 100
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1002';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  r := club_join(tok,'Bia','1992-02-02','v1', false, current_setting('app.ana_ref'));
  if (select count(*) from club_members) <> 0 then raise exception 'FALHA: cliente leu associados direto'; end if;
end $$;
reset role;
do $$ begin
  if (select referred_by from club_members where user_id = '00000000-0000-0000-0000-0000000e1002') is distinct from '00000000-0000-0000-0000-0000000e1001'::uuid then raise exception 'FALHA: indicação não foi guardada'; end if;
end $$;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1002';
do $$ declare tok text := (select tok from ctx2); begin perform club_checkin(tok); end $$;
reset role;
do $$ begin
  if (select count(*) from points_ledger where user_id = '00000000-0000-0000-0000-0000000e1001' and action = 'referral') <> 1 then raise exception 'FALHA: quem indicou deveria ganhar 1 vez'; end if;
  if (select coalesce(sum(delta),0) from points_ledger where user_id = '00000000-0000-0000-0000-0000000e1001' and action = 'referral') <> 100 then raise exception 'FALHA: indicação deveria dar 100'; end if;
end $$;
-- voltar em até 7 dias e 3 visitas no mês (histórico simulado como superusuário do teste)
insert into club_visits (tenant_id, user_id, day, table_label) select tenant_id, user_id, (now() at time zone 'America/Sao_Paulo')::date - 3, '1' from club_members where user_id = '00000000-0000-0000-0000-0000000e1003';
-- cai (1003): entra e já tem uma visita há 3 dias
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1003';
do $$ declare tok text := (select tok from ctx2); begin perform club_join(tok,'Caio','1991-03-03','v1'); end $$;
reset role;
insert into club_visits (tenant_id, user_id, day, table_label) values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e1003',(now() at time zone 'America/Sao_Paulo')::date - 3,'1');
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1003';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  r := club_checkin(tok);
  if not (r->'bonuses') ? 'return_7d' then raise exception 'FALHA: faltou o bônus de voltar em 7 dias: %', r; end if;
end $$;
-- mesa cheia: ana, bia e caio na mesa 1 hoje -> todos ganham 15 uma vez
reset role;
do $$ begin
  if (select count(*) from points_ledger where action = 'full_table') <> 3 then raise exception 'FALHA: mesa cheia deveria pagar 3 pessoas, pagou %', (select count(*) from points_ledger where action = 'full_table'); end if;
end $$;
-- horário: fora do expediente recusa; dentro aceita
update club_settings set hours_enforced = true, open_days = '{1}', open_from = '00:00', open_to = '00:01', grace_min = 0 where tenant_id = '00000000-0000-0000-0000-00000000a001';
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';
do $$ begin
  begin delete from club_visits where false; raise exception 'FALHA: cliente apagou visitas'; exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from club_visits where user_id = '00000000-0000-0000-0000-0000000e1001' and day = (now() at time zone 'America/Sao_Paulo')::date;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';
do $$ declare tok text := (select tok from ctx2); begin
  begin perform club_checkin(tok); raise exception 'FALHA: check-in fora do horário'; exception when raise_exception then if sqlerrm <> 'closed' then raise; end if; end;
end $$;
reset role;
update club_settings set hours_enforced = false where tenant_id = '00000000-0000-0000-0000-00000000a001';
-- presença: longe recusa, perto aceita, sem posição aceita (block_far)
update tenants set lat = -31.33, lon = -54.10, radius_m = 150, presence_policy = 'block_far' where slug = 'gastropub';
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  begin perform club_checkin(tok, -23.5, -46.6); raise exception 'FALHA: check-in de longe'; exception when raise_exception then if sqlerrm <> 'too_far' then raise; end if; end;
  r := club_checkin(tok, -31.3301, -54.1001);
  if (r->>'already')::boolean then raise exception 'FALHA: check-in perto deveria valer'; end if;
end $$;
reset role;
update tenants set lat = null, lon = null where slug = 'gastropub';
-- feedback: exige visita, uma vez por dia, comentário só com 20+ caracteres e sem link
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1004';
do $$ declare tok text := (select tok from ctx2); begin
  perform club_join(tok,'Duda','1990-04-04','v1');
  begin perform club_feedback(tok, 5); raise exception 'FALHA: opinião sem visita'; exception when raise_exception then if sqlerrm <> 'no_visit' then raise; end if; end;
  perform club_checkin(tok);
  begin perform club_feedback(tok, 9); raise exception 'FALHA: nota inválida'; exception when raise_exception then if sqlerrm <> 'invalid_rating' then raise; end if; end;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1001';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  r := club_feedback(tok, 5, 'Hambúrguer muito saboroso, volto com certeza! veja www.spam.com', array['Burger','Pizza','Brownie','Batata']);
  if (r->>'credited')::int <> 10 + 5 + 5 + 5 then raise exception 'FALHA: opinião deveria dar 25 (nota + 3 curtidas, comentário com link não conta): %', r; end if;
  begin perform club_feedback(tok, 4); raise exception 'FALHA: duas opiniões no mesmo dia'; exception when raise_exception then if sqlerrm <> 'already_sent' then raise; end if; end;
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1002';
do $$ declare tok text := (select tok from ctx2); r jsonb; begin
  r := club_feedback(tok, 4, 'Atendimento muito bom e o prato chegou quentinho.');
  if (r->>'credited')::int <> 10 + 20 then raise exception 'FALHA: nota + comentário válido deveria dar 30: %', r; end if;
  begin perform count(*) from club_feedback; if (select count(*) from club_feedback) <> 0 then raise exception 'FALHA: cliente leu opiniões direto'; end if; end;
end $$;
-- isolamento: quem não é associado não faz check-in; anônimo e garçom/dono de outro restaurante não moderam
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1005';
do $$ declare tok text := (select tok from ctx2); begin
  begin perform club_checkin(tok); raise exception 'FALHA: não associado fez check-in'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end;
  if owner_club_feedback_moderate('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e1001', (now() at time zone 'America/Sao_Paulo')::date, 'published') then raise exception 'FALHA: cliente moderou opinião'; end if;
end $$;
reset role; set local role anon;
do $$ declare tok text := (select tok from ctx2); begin
  begin perform club_checkin(tok); raise exception 'FALHA: anon fez check-in'; exception when insufficient_privilege then null; end;
  begin perform club_feedback(tok, 5); raise exception 'FALHA: anon deu opinião'; exception when insufficient_privilege then null; end;
  begin perform count(*) from club_visits; raise exception 'FALHA: anon leu visitas'; exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e1005','manager');
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e1005';
do $$ begin
  if not owner_club_feedback_moderate('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e1001', (now() at time zone 'America/Sao_Paulo')::date, 'published') then raise exception 'FALHA: gerente não conseguiu moderar'; end if;
  if (select count(*) from club_visits) < 3 then raise exception 'FALHA: gerente deveria ler as visitas do próprio restaurante'; end if;
end $$;
reset role;
do $$ begin if (select count(*) from audit_logs where action in ('club_checkin','club_feedback','club_feedback_moderated')) < 5 then raise exception 'FALHA: auditoria da visita incompleta'; end if; end $$;
rollback;
\echo VISITA: todos os testes passaram

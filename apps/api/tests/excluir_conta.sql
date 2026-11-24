-- Excluir conta: apaga só os dados de quem pede, em cascata; o extrato segue imutável para todos os outros caminhos.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e7001'),('00000000-0000-0000-0000-0000000e7002');
create temp table cd as select 'dev-gastropub-p1-nfc-000000'::text as tok;
grant select on cd to anon, authenticated;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e7001';
do $$ declare tok text := (select tok from cd); begin perform club_join(tok,'Ana','1990-01-01','v1'); perform club_checkin(tok); perform club_earn(tok,'instagram_follow'); end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e7002';
do $$ declare tok text := (select tok from cd); begin perform club_join(tok,'Beto','1991-02-02','v1'); end $$;
reset role;
do $$ begin if (select count(*) from points_ledger where user_id = '00000000-0000-0000-0000-0000000e7001') < 3 then raise exception 'FALHA: preparação do teste'; end if; end $$;
-- anônimo não exclui
set local role anon;
do $$ begin begin perform club_delete_account(); raise exception 'FALHA: anon excluiu conta'; exception when insufficient_privilege then null; end; end $$;
-- sem sessão (sub vazio) recusa
reset role; set local role authenticated; set local request.jwt.claim.sub = '';
do $$ begin begin perform club_delete_account(); raise exception 'FALHA: sem sessão excluiu'; exception when raise_exception then if sqlerrm <> 'not_authenticated' then raise; end if; end; end $$;
-- a Ana exclui a própria conta
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e7001';
do $$ begin if not club_delete_account() then raise exception 'FALHA: exclusão não concluída'; end if; end $$;
reset role;
do $$ begin
  if exists (select 1 from points_ledger where user_id = '00000000-0000-0000-0000-0000000e7001') then raise exception 'FALHA: extrato da Ana ficou'; end if;
  if exists (select 1 from club_members where user_id = '00000000-0000-0000-0000-0000000e7001') or exists (select 1 from person_profiles where user_id = '00000000-0000-0000-0000-0000000e7001') or exists (select 1 from club_visits where user_id = '00000000-0000-0000-0000-0000000e7001') then raise exception 'FALHA: dados da Ana ficaram'; end if;
  if exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000e7001') then raise exception 'FALHA: o login da Ana não foi removido'; end if;
  if (select count(*) from club_members where user_id = '00000000-0000-0000-0000-0000000e7002') <> 1 then raise exception 'FALHA: o Beto foi afetado'; end if;
  if (select count(*) from points_ledger where user_id = '00000000-0000-0000-0000-0000000e7002') < 1 then raise exception 'FALHA: o extrato do Beto sumiu'; end if;
  if (select count(*) from audit_logs where action = 'account_deleted') < 1 then raise exception 'FALHA: exclusão sem auditoria'; end if;
  if current_setting('app.erasing', true) = '1' then raise exception 'FALHA: o sinal de exclusão ficou ligado'; end if;
  -- o extrato do Beto continua imutável fora da exclusão
  begin delete from points_ledger where user_id = '00000000-0000-0000-0000-0000000e7002'; raise exception 'FALHA: extrato foi apagado fora da exclusão de conta'; exception when raise_exception then if sqlerrm <> 'ledger_immutable' then raise; end if; end;
  begin update points_ledger set delta = delta + 1 where user_id = '00000000-0000-0000-0000-0000000e7002'; raise exception 'FALHA: extrato foi alterado'; exception when raise_exception then if sqlerrm <> 'ledger_immutable' then raise; end if; end;
end $$;
rollback;
\echo EXCLUIR CONTA: todos os testes passaram

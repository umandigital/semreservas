-- Testes de 0018: celular e consentimento. Só a própria pessoa lê e grava; o dono não vê o número.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e8001'),('00000000-0000-0000-0000-0000000e8002'),('00000000-0000-0000-0000-0000000e8003');
create temp table ct as select 'dev-gastropub-p1-nfc-000000'::text as tok;
grant select on ct to anon, authenticated;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8001';
do $$ declare tok text := (select tok from ct); begin perform club_join(tok,'Ana','1990-01-01','v1'); end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8002';
do $$ declare tok text := (select tok from ct); begin perform club_join(tok,'Beto','1991-02-02','v1'); end $$;
reset role;
-- anônimo não grava nem lê
set local role anon;
do $$ declare tok text := (select tok from ct); begin
  begin perform club_contact_set(tok,'(11) 91234-5678',true); raise exception 'FALHA: anon gravou celular'; exception when insufficient_privilege then null; end;
  begin perform club_my_contact(tok); raise exception 'FALHA: anon leu celular'; exception when insufficient_privilege then null; end;
end $$;
reset role; set local role authenticated;
-- quem não é do Clube não grava
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8003';
do $$ declare tok text := (select tok from ct); begin begin perform club_contact_set(tok,'11912345678',false); raise exception 'FALHA: não-membro gravou'; exception when raise_exception then if sqlerrm <> 'not_member' then raise; end if; end; end $$;
-- a Ana grava; números inválidos são recusados
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8001';
do $$ declare tok text := (select tok from ct); b text; begin
  foreach b in array array['123','1191234567','(11) 31234-5678','(00) 91234-5678','abcdefghijk','551191234567890'] loop
    begin perform club_contact_set(tok, b, true); raise exception 'FALHA: número inválido aceito: %', b; exception when raise_exception then if sqlerrm <> 'invalid_phone' then raise; end if; end;
  end loop;
  if not club_contact_set(tok,'(11) 91234-5678',true) then raise exception 'FALHA: não gravou'; end if;
  if (club_my_contact(tok)->>'phone') <> '+5511912345678' or (club_my_contact(tok)->>'messaging')::boolean is not true then raise exception 'FALHA: leitura do próprio contato'; end if;
  if not club_contact_set(tok,'+55 21 99876-5432',false) then raise exception 'FALHA: regravar com 55'; end if;
  if (club_my_contact(tok)->>'phone') <> '+5521998765432' or (club_my_contact(tok)->>'messaging')::boolean is not false then raise exception 'FALHA: troca de número e consentimento'; end if;
  perform club_contact_set(tok,'11912345678',true);
end $$;
-- o Beto não vê o número da Ana (só o dele) e a tabela do perfil não é lida por ninguém mais
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8002';
do $$ declare tok text := (select tok from ct); begin
  if (club_my_contact(tok)->>'phone') is not null then raise exception 'FALHA: Beto viu celular que não é dele'; end if;
  if exists (select 1 from person_profiles where user_id = '00000000-0000-0000-0000-0000000e8001') then raise exception 'FALHA: perfil da Ana visível ao Beto'; end if;
end $$;
-- apagar o celular tira o consentimento
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8001';
do $$ declare tok text := (select tok from ct); begin
  perform club_contact_set(tok,'',true);
  if (club_my_contact(tok)->>'phone') is not null or (club_my_contact(tok)->>'messaging')::boolean is not false then raise exception 'FALHA: apagar celular não tirou o consentimento'; end if;
  perform club_contact_set(tok,'11912345678',true);
end $$;
reset role;
do $$ begin
  if exists (select 1 from audit_logs where action = 'club_contact_set' and (detail::text like '%+55%' or detail::text like '%9123%')) then raise exception 'FALHA: o número apareceu no log de auditoria'; end if;
  if (select count(*) from audit_logs where action = 'club_contact_set') < 3 then raise exception 'FALHA: auditoria do contato'; end if;
end $$;
-- a exclusão da conta apaga o celular
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e8001';
do $$ begin perform club_delete_account(); end $$;
reset role;
do $$ begin if exists (select 1 from person_profiles where phone is not null and user_id = '00000000-0000-0000-0000-0000000e8001') then raise exception 'FALHA: celular sobrou após excluir a conta'; end if; end $$;
rollback;
\echo CELULAR: todos os testes passaram

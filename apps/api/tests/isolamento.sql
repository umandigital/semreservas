-- Isolamento entre tenants. Falha (raise exception) se qualquer regra quebrar.
\set ON_ERROR_STOP on
begin;
-- segundo tenant só para o teste
insert into tenants (id, slug, name, establishment_type, status)
values ('00000000-0000-0000-0000-00000000a002','outro','Outro Bar','a_la_carte','active');
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0099','00000000-0000-0000-0000-00000000a002','1');
insert into access_points (id, tenant_id, number) values ('00000000-0000-0000-0000-0000000c0099','00000000-0000-0000-0000-00000000a002','1');
insert into access_point_tokens (token, tenant_id, access_point_id, origin)
values ('dev-outro-p1-nfc-0000000000','00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000c0099','nfc');
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000d0001'),('00000000-0000-0000-0000-0000000d0002'),('00000000-0000-0000-0000-0000000d0003');
-- A=gastropub (dono, garçom); B=outro (dono)
insert into tenant_user_roles values
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000d0001','owner'),
 ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000d0003','staff'),
 ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000d0002','owner');


-- 1) Dono de A só enxerga A
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d0001';
do $$ begin
  if (select count(*) from tenants) <> 1 then raise exception 'FALHA: dono de A enxerga % tenants', (select count(*) from tenants); end if;
  if (select count(*) from venue_tables where tenant_id='00000000-0000-0000-0000-00000000a002') <> 0 then raise exception 'FALHA: A leu mesas de B'; end if;
  if (select count(*) from access_point_tokens where tenant_id='00000000-0000-0000-0000-00000000a002') <> 0 then raise exception 'FALHA: A leu tokens de B'; end if;
end $$;
-- A não consegue gravar em B
do $$ begin
  begin insert into venue_tables (tenant_id,label) values ('00000000-0000-0000-0000-00000000a002','X');
        raise exception 'FALHA: A gravou mesa em B';
  exception when insufficient_privilege then null; end;
end $$;
-- A não altera B (update afeta 0 linhas)
do $$ declare c int; begin
  update tenants set name='invadido' where id='00000000-0000-0000-0000-00000000a002'; get diagnostics c = row_count;
  if c <> 0 then raise exception 'FALHA: A alterou B'; end if;
end $$;
reset role;

-- 2) Garçom lê mesas, mas não grava nem lê tokens
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000d0003';
do $$ begin
  if (select count(*) from venue_tables) <> 3 then raise exception 'FALHA: garçom deveria ver 3 mesas'; end if;
  if (select count(*) from access_point_tokens) <> 0 then raise exception 'FALHA: garçom leu tokens'; end if;
  begin insert into venue_tables (tenant_id,label) values ('00000000-0000-0000-0000-00000000a001','9');
        raise exception 'FALHA: garçom gravou mesa';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- 3) Visitante anônimo: nenhuma tabela, só RPC
set local role anon; set local request.jwt.claim.sub = '';
do $$ begin
  begin perform 1 from tenants; raise exception 'FALHA: anon leu tenants'; exception when insufficient_privilege then null; end;
  begin perform 1 from access_point_tokens; raise exception 'FALHA: anon leu tokens'; exception when insufficient_privilege then null; end;
  if (select table_label from resolve_access_token('dev-gastropub-p2-nfc-000000')) is distinct from '2' then
    raise exception 'FALHA: token da placa 2 deveria resolver mesa 2'; end if;
  if (select count(*) from resolve_access_token('token-que-nao-existe-0000000')) <> 0 then raise exception 'FALHA: token inválido resolveu'; end if;
end $$;
reset role;

-- 4) Revogação: token revogado deixa de resolver
update access_point_tokens set revoked_at = now() where token='dev-gastropub-p2-nfc-000000';
set local role anon;
do $$ begin
  if (select count(*) from resolve_access_token('dev-gastropub-p2-nfc-000000')) <> 0 then raise exception 'FALHA: token revogado resolveu'; end if;
end $$;
reset role;

-- 5) Tenant pausado/rascunho não é público
update tenants set status='paused' where slug='gastropub';
set local role anon;
do $$ begin
  if (select count(*) from public_tenant('gastropub')) <> 0 then raise exception 'FALHA: tenant pausado público'; end if;
  if (select count(*) from resolve_access_token('dev-gastropub-p1-nfc-000000')) <> 0 then raise exception 'FALHA: tenant pausado resolve placa'; end if;
end $$;
reset role;

-- 6) Correção de placa na mesa errada sem regravar a tag
update tenants set status='trial' where slug='gastropub';
update access_point_assignments set valid_to=now() where access_point_id='00000000-0000-0000-0000-0000000c0001' and valid_to is null;
insert into access_point_assignments (tenant_id, access_point_id, table_id)
values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000c0001','00000000-0000-0000-0000-0000000b0003');
set local role anon;
do $$ begin
  if (select table_label from resolve_access_token('dev-gastropub-p1-nfc-000000')) is distinct from '3' then
    raise exception 'FALHA: placa 1 reatribuída deveria resolver mesa 3'; end if;
end $$;
reset role;

rollback;
\echo 'ISOLAMENTO: todos os testes passaram'

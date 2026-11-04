-- Fila de atendimento: criação anônima por token da placa, dedupe, estados, painel por link e isolamento.
\set ON_ERROR_STOP on
begin;
-- GastroPub (seed) + "Outro Bar"; cada um com seu link de painel
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a002','outro','Outro Bar','a_la_carte','active');
insert into tenant_modules (tenant_id, module) values ('00000000-0000-0000-0000-00000000a002','waiter_call');
insert into venue_tables (id, tenant_id, label) values ('00000000-0000-0000-0000-0000000b0099','00000000-0000-0000-0000-00000000a002','1');
insert into access_points (id, tenant_id, number) values ('00000000-0000-0000-0000-0000000c0099','00000000-0000-0000-0000-00000000a002','1');
insert into access_point_tokens values ('dev-outro-p1-nfc-0000000000','00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000c0099','nfc',null);
insert into access_point_assignments (tenant_id, access_point_id, table_id) values ('00000000-0000-0000-0000-00000000a002','00000000-0000-0000-0000-0000000c0099','00000000-0000-0000-0000-0000000b0099');
insert into staff_links (token, tenant_id) values
  ('painel-gastropub-teste-00000000000000','00000000-0000-0000-0000-00000000a001'),
  ('painel-outro-teste-0000000000000000000','00000000-0000-0000-0000-00000000a002');

create temp table ctx (k text primary key, v text);  grant all on ctx to anon, authenticated;
\set PG '''painel-gastropub-teste-00000000000000'''
\set PO '''painel-outro-teste-0000000000000000000'''

-- 1) visitante cria chamado só com o token da placa; a mesa vem do servidor
set local role anon;
with b as (select * from create_service_request('dev-gastropub-p2-nfc-000000','bill')) insert into ctx select 'id', id::text from b;
with w as (select * from create_service_request('dev-gastropub-p2-nfc-000000','waiter'))
  insert into ctx select 'tok', cancel_token from w union all select 'wid', id::text from w;
do $$ declare r record; begin
  select * into r from public_request_status((select v::uuid from ctx where k='id'));
  if r.status <> 'PENDING' or r.table_label <> '2' or r.kind <> 'bill' then raise exception 'FALHA: chamado criado errado %', r; end if;
  if length(r.public_code) <> 4 then raise exception 'FALHA: código curto'; end if;
end $$;

-- 2) repetir mesa+motivo não duplica e não devolve token de cancelamento
do $$ declare r record; begin
  select * into r from create_service_request('dev-gastropub-p2-nfc-000000','bill');
  if not r.already_open or r.cancel_token is not null then raise exception 'FALHA: dedupe'; end if;
  perform 1 from create_service_request('dev-gastropub-p1-nfc-000000','bill');   -- outra mesa pode
end $$;

-- 3) token inválido, motivo inválido, mesa inexistente
do $$ begin
  begin perform 1 from create_service_request('token-que-nao-existe-0000000','waiter'); raise exception 'FALHA: token inválido criou';
  exception when others then if sqlerrm <> 'invalid_token' then raise; end if; end;
  begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','x'); raise exception 'FALHA: motivo inválido criou';
  exception when others then if sqlerrm <> 'invalid_kind' then raise; end if; end;
  begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','other','99'); raise exception 'FALHA: mesa inexistente criou';
  exception when others then if sqlerrm <> 'invalid_table' then raise; end if; end;
  if (select table_label from create_service_request('dev-gastropub-p2-nfc-000000','question','3')) <> '3' then raise exception 'FALHA: correção de mesa'; end if;
  -- a mesa "1" do OUTRO tenant não existe para o token do GastroPub? (existe a mesa 1 do GastroPub: deve cair nela, nunca na do outro)
  if (select table_label from create_service_request('dev-gastropub-p3-nfc-000000','other','1')) <> '1' then raise exception 'FALHA: mesa 1'; end if;
end $$;
reset role;
do $$ begin
  if exists (select 1 from service_requests r where r.tenant_id = '00000000-0000-0000-0000-00000000a002') then raise exception 'FALHA: chamado do GastroPub caiu no outro tenant'; end if;
end $$;

-- 4) módulo desligado bloqueia no servidor
delete from tenant_modules where tenant_id='00000000-0000-0000-0000-00000000a001' and module='waiter_call';
set local role anon;
do $$ begin
  begin perform 1 from create_service_request('dev-gastropub-p3-nfc-000000','waiter'); raise exception 'FALHA: módulo desligado criou';
  exception when others then if sqlerrm <> 'module_disabled' then raise; end if; end;
end $$;
reset role;
insert into tenant_modules values ('00000000-0000-0000-0000-00000000a001','waiter_call',true);

-- 5) anônimo não lê nem escreve tabelas, nem toca em função interna
set local role anon;
do $$ begin
  begin perform 1 from service_requests; raise exception 'FALHA: anon leu service_requests'; exception when insufficient_privilege then null; end;
  begin perform 1 from staff_links; raise exception 'FALHA: anon leu staff_links'; exception when insufficient_privilege then null; end;
  begin perform 1 from sold_out_items; raise exception 'FALHA: anon leu sold_out_items'; exception when insufficient_privilege then null; end;
  begin insert into service_requests (tenant_id,table_id,table_label,kind,public_code,cancel_token_hash) values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000b0001','1','other','AAAA','x'); raise exception 'FALHA: anon gravou direto'; exception when insufficient_privilege then null; end;
  begin perform _panel_tenant('painel-gastropub-teste-00000000000000'); raise exception 'FALHA: anon chamou função interna'; exception when insufficient_privilege then null; end;
  if cancel_service_request((select v::uuid from ctx where k='id'), 'token-errado') then raise exception 'FALHA: cancelou com token errado'; end if;
end $$;
reset role;

-- 6) painel por link: token inválido/revogado/ de outro tenant
set local role anon;
do $$ begin
  begin perform 1 from panel_requests('token-qualquer-que-nao-existe-0000000000'); raise exception 'FALHA: painel aceitou token inválido';
  exception when others then if sqlerrm <> 'invalid_token' then raise; end if; end;
  if (select count(*) from panel_requests('painel-outro-teste-0000000000000000000')) <> 0 then raise exception 'FALHA: painel do outro tenant viu chamados do GastroPub'; end if;
  if (select count(*) from panel_requests('painel-gastropub-teste-00000000000000')) < 4 then raise exception 'FALHA: painel não viu a própria fila'; end if;
  if (select tenant_name from panel_info('painel-gastropub-teste-00000000000000')) <> 'SemReservas GastroPub' then raise exception 'FALHA: panel_info'; end if;
end $$;

-- 7) estados: sem pular etapa, sem assumir duas vezes, só no próprio tenant
do $$ declare c uuid := (select v::uuid from ctx where k='id'); begin
  if panel_change_request('painel-gastropub-teste-00000000000000', c, 'RESOLVED') then raise exception 'FALHA: pulou etapa'; end if;
  if panel_change_request('painel-outro-teste-0000000000000000000', c, 'ACKNOWLEDGED') then raise exception 'FALHA: link de outro tenant assumiu chamado alheio'; end if;
  if not panel_change_request('painel-gastropub-teste-00000000000000', c, 'ACKNOWLEDGED') then raise exception 'FALHA: não assumiu'; end if;
  if panel_change_request('painel-gastropub-teste-00000000000000', c, 'ACKNOWLEDGED') then raise exception 'FALHA: assumiu duas vezes'; end if;
  if panel_change_request('painel-gastropub-teste-00000000000000', c, 'CANCELLED') then raise exception 'FALHA: estado inválido aceito'; end if;
  if not panel_change_request('painel-gastropub-teste-00000000000000', c, 'RESOLVED') then raise exception 'FALHA: não concluiu'; end if;
  if (select status from public_request_status(c)) <> 'RESOLVED' then raise exception 'FALHA: visitante não vê o estado'; end if;
end $$;
reset role;

-- 8) link revogado deixa de funcionar na hora
update staff_links set revoked_at = now() where token = 'painel-outro-teste-0000000000000000000';
set local role anon;
do $$ begin
  begin perform 1 from panel_requests('painel-outro-teste-0000000000000000000'); raise exception 'FALHA: link revogado funcionou';
  exception when others then if sqlerrm <> 'invalid_token' then raise; end if; end;
end $$;

-- 9) cancelar com o token certo; depois a mesa pode chamar de novo
do $$ begin
  if not cancel_service_request((select v::uuid from ctx where k='wid'), (select v from ctx where k='tok')) then raise exception 'FALHA: cancelar com token certo'; end if;
  if (select status from public_request_status((select v::uuid from ctx where k='wid'))) <> 'CANCELLED' then raise exception 'FALHA: status após cancelar'; end if;
  if (select count(*) from create_service_request('dev-gastropub-p2-nfc-000000','waiter') where not already_open) <> 1 then raise exception 'FALHA: não chamou de novo'; end if;
end $$;

-- 10) rodízio: o pedido leva o detalhe (sabor); sabores diferentes coexistem, o mesmo sabor não duplica
do $$ declare a record; b record; c record; begin
  select * into a from create_service_request('dev-gastropub-p3-nfc-000000','kitchen_item', null, 'Pizza Calabresa');
  select * into b from create_service_request('dev-gastropub-p3-nfc-000000','kitchen_item', null, 'Pizza Margherita');
  select * into c from create_service_request('dev-gastropub-p3-nfc-000000','kitchen_item', null, 'Pizza Calabresa');
  if a.already_open or b.already_open then raise exception 'FALHA: dois sabores diferentes deveriam coexistir'; end if;
  if not c.already_open or c.id <> a.id then raise exception 'FALHA: mesmo sabor deveria deduplicar'; end if;
  if (select detail from panel_requests('painel-gastropub-teste-00000000000000') where id = a.id) <> 'Pizza Calabresa' then raise exception 'FALHA: painel não mostra o sabor'; end if;
  if (select detail from public_request_status(a.id)) <> 'Pizza Calabresa' then raise exception 'FALHA: status sem o sabor'; end if;
end $$;
reset role;

-- 10b) esgotado (escrita será do dashboard do dono, com login): o público só lê o do seu slug
insert into sold_out_items (tenant_id, item_id) values ('00000000-0000-0000-0000-00000000a001','h1');
set local role anon;
do $$ begin
  if (select count(*) from public_sold_out('gastropub')) <> 1 or (select count(*) from public_sold_out('outro')) <> 0 then raise exception 'FALHA: public_sold_out'; end if;
  begin delete from sold_out_items; raise exception 'FALHA: anon apagou esgotado'; exception when insufficient_privilege then null; end;
end $$;
-- 11) histórico registra tudo (criado, assumido, concluído)
reset role;
do $$ begin
  if (select count(*) from service_request_history where request_id=(select v::uuid from ctx where k='id')) <> 3 then raise exception 'FALHA: histórico deveria ter 3 linhas'; end if;
end $$;
rollback;
\echo 'CHAMADOS: todos os testes passaram'

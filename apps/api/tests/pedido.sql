-- Pedido validado pelo servidor: subtotal calculado no banco, itens visíveis à equipe, giro liberado a partir do valor calculado.
\set ON_ERROR_STOP on
begin;
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000e3001'),('00000000-0000-0000-0000-0000000e3002'),('00000000-0000-0000-0000-0000000e3003'),('00000000-0000-0000-0000-0000000e3004');
create temp table cp as select 'dev-gastropub-p1-nfc-000000'::text as tok,
  (select item_id from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001' order by price_cents desc limit 1) as caro,
  (select price_cents from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001' order by price_cents desc limit 1) as p_caro,
  (select item_id from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001' order by price_cents limit 1) as barato,
  (select price_cents from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001' order by price_cents limit 1) as p_barato;
grant select on cp to anon, authenticated;
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a0e2','pedido-b','Pedido B','a_la_carte','active');
insert into staff_links (token, tenant_id) values ('painel-pedido-b-teste-000000000000000','00000000-0000-0000-0000-00000000a0e2'),('painel-pedido-a-teste-000000000000000','00000000-0000-0000-0000-00000000a001');
do $$ begin if (select count(*) from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001') < 20 then raise exception 'FALHA: cardápio do GastroPub não foi semeado'; end if; end $$;

-- 1) Visitante (sem login): pedido válido calcula o subtotal; entradas inválidas são recusadas; preço enviado pelo cliente é ignorado
set local role anon;
do $$ declare tok text := (select tok from cp); r jsonb; esperado int; begin
  esperado := (select p_caro from cp) * 2 + (select p_barato from cp);
  r := order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 2, 'price_cents', 1), jsonb_build_object('id', (select barato from cp), 'qty', 1, 'obs', 'sem cebola')));
  if (r->>'subtotal_cents')::int <> esperado then raise exception 'FALHA: subtotal deveria ser %, veio % (preço do cliente foi aceito?)', esperado, r; end if;
  if (r->>'granted')::boolean or r->>'cancel_token' is null then raise exception 'FALHA: visitante não ganha giro e deve receber o token de cancelamento: %', r; end if;
  perform set_config('app.chamado', r->>'id', true);
  begin perform order_call(tok, '[]'::jsonb); raise exception 'FALHA: pedido vazio'; exception when raise_exception then if sqlerrm <> 'invalid_items' then raise; end if; end;
  begin perform order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 0))); raise exception 'FALHA: quantidade 0'; exception when raise_exception then if sqlerrm <> 'invalid_items' then raise; end if; end;
  begin perform order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 21))); raise exception 'FALHA: quantidade 21'; exception when raise_exception then if sqlerrm <> 'invalid_items' then raise; end if; end;
  begin perform order_call(tok, jsonb_build_array(jsonb_build_object('id', 'item-que-nao-existe', 'qty', 1))); raise exception 'FALHA: item inexistente'; exception when raise_exception then if sqlerrm <> 'invalid_items' then raise; end if; end;
  begin perform order_call(tok, '{"id":"x"}'::jsonb); raise exception 'FALHA: itens fora de lista'; exception when raise_exception then if sqlerrm <> 'invalid_items' then raise; end if; end;
  begin perform order_call('token-invalido-0000000000000', jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 1))); raise exception 'FALHA: token inválido'; exception when raise_exception then if sqlerrm <> 'invalid_token' then raise; end if; end;
  begin perform count(*) from order_snapshots; raise exception 'FALHA: anon leu os pedidos'; exception when insufficient_privilege then null; end;
  begin perform count(*) from menu_items; raise exception 'FALHA: anon leu o cardápio direto'; exception when insufficient_privilege then null; end;
  begin perform _roulette_try_grant('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e3001', gen_random_uuid()); raise exception 'FALHA: anon chamou função interna'; exception when insufficient_privilege then null; end;
end $$;
-- 2) Equipe (link secreto) vê os itens; link de outro restaurante e link inválido não
do $$ declare id uuid := current_setting('app.chamado')::uuid; r jsonb; begin
  r := panel_order_items('painel-pedido-a-teste-000000000000000', id);
  if jsonb_array_length(r->'items') <> 2 or (r->>'subtotal_cents')::int <> (select p_caro * 2 + p_barato from cp) then raise exception 'FALHA: a equipe deveria ver os 2 itens e o subtotal: %', r; end if;
  if panel_order_items('painel-pedido-b-teste-000000000000000', id) is not null then raise exception 'FALHA: link de outro restaurante viu o pedido'; end if;
  begin perform panel_order_items('token-invalido-00000000000000000000', id); raise exception 'FALHA: link inválido'; exception when raise_exception then if sqlerrm <> 'invalid_token' then raise; end if; end;
end $$;
reset role;
-- 3) Giro: só com o valor calculado pelo servidor
delete from service_requests;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e3001';
do $$ declare tok text := (select tok from cp); r jsonb; begin
  perform club_join(tok,'Ana','1990-01-01','v1'); perform club_checkin(tok);
  r := order_call(tok, jsonb_build_array(jsonb_build_object('id', (select barato from cp), 'qty', 1)));
  if (r->>'granted')::boolean or r->>'grant_reason' <> 'below_min' then raise exception 'FALHA: pedido pequeno liberou giro: %', r; end if;
end $$;
reset role; delete from service_requests;
set local role authenticated;
do $$ declare tok text := (select tok from cp); r jsonb; begin
  r := order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 20)));
  if not (r->>'granted')::boolean then raise exception 'FALHA: pedido grande deveria liberar giro: %', r; end if;
  if (roulette_state(tok)->>'grants')::int <> 1 then raise exception 'FALHA: deveria haver 1 giro'; end if;
  r := order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 20)));
  if (r->>'granted')::boolean or not (r->>'already_open')::boolean then raise exception 'FALHA: o mesmo chamado liberou outro giro: %', r; end if;
  begin perform roulette_grant(tok, gen_random_uuid(), 999999); raise exception 'FALHA: giro por chamado inexistente'; exception when raise_exception then if sqlerrm <> 'invalid_request' then raise; end if; end;
end $$;
-- quem não é do Clube não ganha giro mesmo com pedido grande
reset role; delete from service_requests;
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e3002';
do $$ declare tok text := (select tok from cp); r jsonb; begin
  r := order_call(tok, jsonb_build_array(jsonb_build_object('id', (select caro from cp), 'qty', 20)));
  if (r->>'granted')::boolean or r->>'grant_reason' <> 'not_member' then raise exception 'FALHA: não associado ganhou giro: %', r; end if;
end $$;
-- 4) Dono: preço do cardápio só por quem tem papel; muda o próximo pedido; auditado
reset role;
insert into tenant_user_roles values ('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e3003','staff'),('00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000e3004','manager');
set local role authenticated; set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e3003';
do $$ begin if owner_menu_set('00000000-0000-0000-0000-00000000a001', (select caro from cp), 'Teste', 1, true) then raise exception 'FALHA: garçom mudou preço'; end if; end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000e3004';
do $$ begin
  if not owner_menu_set('00000000-0000-0000-0000-00000000a001', (select caro from cp), 'Item de teste', 1234, true) then raise exception 'FALHA: gerente não mudou preço'; end if;
  if owner_menu_set('00000000-0000-0000-0000-00000000a0c2', 'x', 'Invasão', 1, true) then raise exception 'FALHA: gerente de A mexeu no cardápio de B'; end if;
  if (select price_cents from menu_items where tenant_id = '00000000-0000-0000-0000-00000000a001' and item_id = (select caro from cp)) <> 1234 then raise exception 'FALHA: preço não mudou'; end if;
  if (select count(*) from order_snapshots) < 0 then raise exception 'x'; end if;
end $$;
reset role;
do $$ begin if (select count(*) from audit_logs where action in ('menu_item_set','roulette_grant')) < 2 then raise exception 'FALHA: auditoria do pedido incompleta'; end if; end $$;
rollback;
\echo PEDIDO: todos os testes passaram

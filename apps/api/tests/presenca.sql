-- Presença e anti-trote: raio, políticas, bloqueio de aparelho e privacidade da posição.
\set ON_ERROR_STOP on
begin;
insert into staff_links (token, tenant_id) values ('painel-gastropub-presenca-0000000000000','00000000-0000-0000-0000-00000000a001');
insert into tenants (id, slug, name, establishment_type, status) values ('00000000-0000-0000-0000-00000000a002','outro','Outro Bar','a_la_carte','active');
insert into staff_links (token, tenant_id) values ('painel-outro-presenca-000000000000000000','00000000-0000-0000-0000-00000000a002');
create temp table ctx (k text primary key, v text); grant all on ctx to anon, authenticated;
-- GastroPub fica na Praça Silveira Martins, Bagé (ponto fictício de teste): -31.3306, -54.1069 · raio 150 m
update tenants set lat = -31.3306, lon = -54.1069, radius_m = 150, presence_policy = 'block_far' where id = '00000000-0000-0000-0000-00000000a001';

-- 0) a conta da distância confere: 0,001° de latitude ≈ 111 m; 0,01° ≈ 1,11 km
do $$ declare a int := _distance_m(-31.3306,-54.1069,-31.3316,-54.1069); b int := _distance_m(-31.3306,-54.1069,-31.3406,-54.1069); c int := _distance_m(0,0,0,0);
begin
  if a not between 108 and 114 then raise exception 'FALHA: 0,001° deveria dar ~111 m, deu %', a; end if;
  if b not between 1100 and 1120 then raise exception 'FALHA: 0,01° deveria dar ~1110 m, deu %', b; end if;
  if c <> 0 then raise exception 'FALHA: distância zero'; end if;
end $$;

set local role anon;
-- 1) no local (≈ 55 m): aceita e marca "near"
do $$ declare r record; begin
  select * into r from create_service_request('dev-gastropub-p1-nfc-000000','bill',null,null,'aparelho-aaaaaaaa',-31.3311,-54.1069);
  insert into ctx values ('perto', r.id::text);
end $$;
-- 2) longe (≈ 1,1 km, "de casa"): RECUSA
do $$ begin
  begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','bill',null,null,'aparelho-bbbbbbbb',-31.3406,-54.1069); raise exception 'FALHA: chamado de longe foi aceito';
  exception when others then if sqlerrm <> 'too_far' then raise; end if; end;
-- 3) sem localização (negou o GPS): aceita, mas marcado "unknown" (política block_far)
  perform 1 from create_service_request('dev-gastropub-p3-nfc-000000','bill',null,null,'aparelho-cccccccc');
end $$;
-- 4) coordenadas inválidas são ignoradas (viram "não verificado"), nunca causam erro nem liberam como "perto"
do $$ begin perform 1 from create_service_request('dev-gastropub-p3-nfc-000000','question',null,null,'aparelho-cccccccc',999,999); end $$;
reset role;
do $$ begin
  if (select presence from service_requests where id=(select v::uuid from ctx where k='perto')) <> 'near' then raise exception 'FALHA: deveria ser near'; end if;
  if (select count(*) from service_requests where presence='unknown' and table_label='3') <> 2 then raise exception 'FALHA: sem localização deveria ser unknown'; end if;
  if (select count(*) from service_requests where presence='far') <> 0 then raise exception 'FALHA: chamado "far" gravado sob block_far'; end if;
  -- privacidade: nenhuma coluna guarda a posição (só veredito e distância)
  if exists (select 1 from information_schema.columns where table_name='service_requests' and column_name in ('lat','lon','latitude','longitude')) then raise exception 'FALHA: posição gravada'; end if;
  if (select distance_m from service_requests where id=(select v::uuid from ctx where k='perto')) not between 50 and 60 then raise exception 'FALHA: distância gravada errada'; end if;
end $$;

-- 5) política "flag": aceita de longe, mas o painel vê "far"
update tenants set presence_policy = 'flag' where id = '00000000-0000-0000-0000-00000000a001';
set local role anon;
do $$ begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','other',null,null,'aparelho-dddddddd',-31.3406,-54.1069); end $$;
do $$ begin if (select presence from panel_requests('painel-gastropub-presenca-0000000000000') where table_label='2' and kind='other') <> 'far' then raise exception 'FALHA: painel deveria ver far'; end if; end $$;
reset role;

-- 6) política "require": sem localização é recusado
update tenants set presence_policy = 'require' where id = '00000000-0000-0000-0000-00000000a001';
set local role anon;
do $$ begin
  begin perform 1 from create_service_request('dev-gastropub-p1-nfc-000000','other',null,null,'aparelho-eeeeeeee'); raise exception 'FALHA: require aceitou sem localização';
  exception when others then if sqlerrm <> 'location_required' then raise; end if; end;
  perform 1 from create_service_request('dev-gastropub-p1-nfc-000000','other',null,null,'aparelho-eeeeeeee',-31.3311,-54.1069);   -- com localização perto: ok
end $$;
reset role;

-- 7) política "off" e restaurante sem coordenadas: nada é verificado
update tenants set presence_policy = 'off' where id = '00000000-0000-0000-0000-00000000a001';
set local role anon;
do $$ begin perform 1 from create_service_request('dev-gastropub-p3-nfc-000000','order',null,null,'aparelho-ffffffff',-31.3406,-54.1069); end $$;
reset role;
do $$ begin if (select presence from service_requests where table_label='3' and kind='order') <> 'unknown' then raise exception 'FALHA: off não deveria verificar'; end if; end $$;
update tenants set presence_policy = 'block_far' where id = '00000000-0000-0000-0000-00000000a001';
update tenants set lat = null, lon = null where id = '00000000-0000-0000-0000-00000000a001';
set local role anon;
do $$ begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','question',null,null,'aparelho-gggggggg',-31.3406,-54.1069); end $$;   -- sem coordenadas cadastradas: não bloqueia
reset role;
update tenants set lat = -31.3306, lon = -54.1069 where id = '00000000-0000-0000-0000-00000000a001';

-- 8) trote: a equipe marca "sem ninguém"; 2 trotes do mesmo aparelho bloqueiam por 24 h
set local role anon;
do $$ declare a record; b record; begin
  select * into a from create_service_request('dev-gastropub-p1-nfc-000000','waiter',null,null,'aparelho-trote001');
  if not panel_false_alarm('painel-gastropub-presenca-0000000000000', a.id) then raise exception 'FALHA: não marcou trote'; end if;
  if panel_false_alarm('painel-gastropub-presenca-0000000000000', a.id) then raise exception 'FALHA: marcou trote duas vezes o mesmo chamado'; end if;
  if panel_false_alarm('painel-outro-presenca-000000000000000000', a.id) then raise exception 'FALHA: outro tenant marcou trote'; end if;
  select * into b from create_service_request('dev-gastropub-p1-nfc-000000','waiter',null,null,'aparelho-trote001');   -- 1 trote só: ainda pode
  if not panel_false_alarm('painel-gastropub-presenca-0000000000000', b.id) then raise exception 'FALHA: segundo trote'; end if;
  begin perform 1 from create_service_request('dev-gastropub-p1-nfc-000000','waiter',null,null,'aparelho-trote001'); raise exception 'FALHA: aparelho com 2 trotes não foi bloqueado';
  exception when others then if sqlerrm <> 'device_blocked' then raise; end if; end;
  -- outro aparelho na mesma mesa continua podendo
  perform 1 from create_service_request('dev-gastropub-p1-nfc-000000','waiter',null,null,'aparelho-honesto1');
end $$;
reset role;
-- o bloqueio acaba sozinho depois de 24 h
update device_flags set blocked_until = now() - interval '1 minute' where device_id = 'aparelho-trote001';
set local role anon;
do $$ begin perform 1 from create_service_request('dev-gastropub-p2-nfc-000000','waiter',null,null,'aparelho-trote001'); end $$;
reset role;

-- 9) limite por aparelho: no máximo 6 chamados em 10 minutos
do $$ begin
  insert into service_requests (tenant_id, table_id, table_label, kind, public_code, cancel_token_hash, device_id, status, created_at)
  select '00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-0000000b0003','3','other','ZZZZ','x','aparelho-spammer1','RESOLVED', now() - (g || ' seconds')::interval from generate_series(1,6) g;
end $$;
set local role anon;
do $$ begin
  begin perform 1 from create_service_request('dev-gastropub-p3-nfc-000000','bill',null,null,'aparelho-spammer1'); raise exception 'FALHA: aparelho passou do limite';
  exception when others then if sqlerrm <> 'rate_limited' then raise; end if; end;
end $$;
-- 10) anônimo não lê device_flags nem chama a função interna
do $$ begin
  begin perform 1 from device_flags; raise exception 'FALHA: anon leu device_flags'; exception when insufficient_privilege then null; end;
  begin perform _distance_m(0,0,0,0); raise exception 'FALHA: anon chamou função interna'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
\echo 'PRESENCA: todos os testes passaram'

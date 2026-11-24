-- Retira as placas de DESENVOLVIMENTO do GastroPub (tokens fixos e públicos no repositório) do banco real.
-- Rodar ANTES do placas.sql gerado (que cria as placas reais com tokens aleatórios). Seguro de repetir.
begin;
update access_point_tokens set revoked_at = now()
 where token like 'dev-%' and revoked_at is null;
update access_point_assignments set valid_to = now()
 where valid_to is null and access_point_id in
   (select id from access_points where tenant_id = (select id from tenants where slug = 'gastropub') and number in ('1','2','3'));
update access_points set state = 'revoked', number = 'dev-' || number
 where tenant_id = (select id from tenants where slug = 'gastropub') and number in ('1','2','3');
commit;
select (select count(*) from access_point_tokens where token like 'dev-%' and revoked_at is null) as tokens_dev_ainda_ativos;

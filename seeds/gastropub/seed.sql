-- Seed do SemReservas GastroPub: 1 estabelecimento, módulos de salão, mesas 1..3 e 3 placas.
-- Tokens de DESENVOLVIMENTO (fixos de propósito, só para teste local). Placas reais
-- terão tokens gerados pelo Master (ADR-0004).
insert into tenants (id, slug, name, establishment_type, status)
values ('00000000-0000-0000-0000-00000000a001','gastropub','SemReservas GastroPub','a_la_carte','trial');

insert into tenant_modules (tenant_id, module)
select '00000000-0000-0000-0000-00000000a001', m
from unnest(array['menu_feed','selection_for_waiter','waiter_call','wifi','instagram','google_link']) m;

insert into venue_tables (id, tenant_id, label)
select ('00000000-0000-0000-0000-0000000b000' || n)::uuid, '00000000-0000-0000-0000-00000000a001', n::text
from generate_series(1,3) n;

insert into access_points (id, tenant_id, number)
select ('00000000-0000-0000-0000-0000000c000' || n)::uuid, '00000000-0000-0000-0000-00000000a001', n::text
from generate_series(1,3) n;

insert into access_point_assignments (tenant_id, access_point_id, table_id)
select '00000000-0000-0000-0000-00000000a001',
       ('00000000-0000-0000-0000-0000000c000' || n)::uuid,
       ('00000000-0000-0000-0000-0000000b000' || n)::uuid
from generate_series(1,3) n;

insert into access_point_tokens (token, tenant_id, access_point_id, origin)
select 'dev-gastropub-p' || n || '-' || o || '-000000', '00000000-0000-0000-0000-00000000a001',
       ('00000000-0000-0000-0000-0000000c000' || n)::uuid, o
from generate_series(1,3) n, unnest(array['nfc','qr']) o;

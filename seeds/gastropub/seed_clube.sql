-- Clube do GastroPub (teste): catálogo de prêmios de docs/10 (valores de teste; o dono ajusta no painel).
insert into club_rewards (tenant_id, name, cost_points, min_visits, per_person_month, stock_month, sort_order)
select t.id, v.name, v.cost, v.vis, v.pp, v.stock, v.ord from tenants t,
 (values ('Sorvete com 2 bolas',200,0,4,null::int,1), ('Refrigerante ou entrada',350,0,null::int,null::int,2),
         ('30% de desconto na conta (até R$ 30, conta mínima R$ 80)',500,0,null::int,null::int,3), ('Pizza à escolha',1000,8,1,null::int,4)) as v(name,cost,vis,pp,stock,ord)
where t.slug = 'gastropub' and not exists (select 1 from club_rewards r where r.tenant_id = t.id);

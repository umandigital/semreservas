-- Cardápio do GastroPub no banco (preços em centavos): fonte de verdade do valor do pedido (migração 0009).
-- Gerado a partir de apps/consumidor/src/data/cardapio.ts. Seguro de repetir (atualiza nome e preço).
insert into menu_items (tenant_id, item_id, name, price_cents)
select t.id, v.item_id, v.name, v.price from tenants t, (values
 ('h1','Clássico da Casa',3490),
 ('h2','Duplo Cheddar',4290),
 ('h3','Bacon BBQ',3990),
 ('h5','Burger Quádruplo',6290),
 ('h6','Burger Rústico',4890),
 ('h4','Veggie de Grão-de-bico',3690),
 ('p6','Pizza Carne e Abobrinha',5990),
 ('p1','Margherita',4990),
 ('p2','Calabresa',5290),
 ('p3','Quatro Queijos',5890),
 ('p4','Pizza do Pub',6190),
 ('p5','Meio a Meio',5690),
 ('m1','Fettuccine à Bolonhesa',4690),
 ('x1','Hot Roll (teste de RA)',3890),
 ('x2','Prato Fotográfico (teste de RA)',4290),
 ('x3','Caveira Sem Base (teste)',1000),
 ('x4','Santi (teste de fotogrametria)',1000),
 ('x5','Santi, cabeça e pescoço (teste)',1000),
 ('pt1','Batatas na Tigela',2990),
 ('a1','Batata Rústica',2490),
 ('a2','Onion Rings',2690),
 ('a3','Frango Crocante',3890),
 ('a4','Mix de Petiscos',5490),
 ('b1','Chope Pilsen',1290),
 ('b2','IPA da Casa',1890),
 ('b3','Limonada Suíça',1190),
 ('b4','Refrigerante lata',700),
 ('s1','Brownie com Sorvete',1990),
 ('s2','Petit Gâteau',2490),
 ('s3','Gelato do Dia',1490),
 ('s4','Torta de Limão',1690)
) as v(item_id, name, price) where t.slug = 'gastropub'
on conflict (tenant_id, item_id) do update set name = excluded.name, price_cents = excluded.price_cents;

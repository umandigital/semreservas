-- Dá o papel de DONO do GastroPub a uma conta já criada no Supabase (Authentication, Users, Add user, com e-mail e senha).
-- Troque o e-mail abaixo pelo e-mail da conta e rode no SQL Editor. Seguro de repetir.
insert into tenant_user_roles (tenant_id, user_id, role)
select t.id, u.id, 'owner' from tenants t, auth.users u
 where t.slug = 'gastropub' and lower(u.email) = lower('TROQUE-PELO-SEU-EMAIL@exemplo.com')
on conflict (tenant_id, user_id) do update set role = 'owner';
select r.role, u.email from tenant_user_roles r join auth.users u on u.id = r.user_id where r.tenant_id = (select id from tenants where slug = 'gastropub');

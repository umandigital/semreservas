-- 0010 Só mostrar e pagar o que existe: desliga as ações do catálogo que o app ainda NÃO sabe cumprir.
-- O cliente só vê "como ganhar" o que de fato consegue ganhar (honestidade das regras). O dono liga de novo no painel quando a ação for construída.
-- Desligadas por enquanto: instalar o app, ativar avisos, pedido pelo app (pontos), realidade aumentada, nota ao prato (por prato),
-- sugestão, compartilhar o app, check-in em campanha, e os outros canais (TikTok, Facebook, WhatsApp).
update club_action_rules set enabled = false
 where action in ('install_app','enable_notifications','order_via_app','ar_used','rate_dish','suggestion','share_app','campaign_checkin','channel_tiktok','channel_facebook','channel_whatsapp');

-- Restaurantes novos já nascem assim (as demais regras continuam ligadas).
create or replace function _club_seed(p_tenant uuid) returns void language sql security definer set search_path = public as $$
  insert into club_settings (tenant_id) values (p_tenant) on conflict do nothing;
  insert into club_action_rules (tenant_id, action, points, enabled, limit_kind, limit_n)
    select p_tenant, action, def_points,
           action not in ('install_app','enable_notifications','order_via_app','ar_used','rate_dish','suggestion','share_app','campaign_checkin','channel_tiktok','channel_facebook','channel_whatsapp'),
           def_limit, def_limit_n from club_actions on conflict do nothing;
$$;
revoke execute on function _club_seed(uuid) from public, anon, authenticated;

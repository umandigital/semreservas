-- 0018: celular da pessoa e consentimento para mensagens do restaurante. Idempotente.
-- O celular é DADO PESSOAL da pessoa (fica no perfil dela; só ela lê). O restaurante só poderá usá-lo para mensagens se a pessoa
-- aceitar (consentimento por restaurante, com data, que ela pode tirar quando quiser). O número nunca vai para o log de auditoria.
-- Excluir a conta apaga tudo (club_delete_account já apaga o perfil e a adesão).

alter table person_profiles add column if not exists phone text check (phone is null or phone ~ '^\+55[1-9][0-9]9[0-9]{8}$');
alter table club_members add column if not exists messaging_consent boolean not null default false;
alter table club_members add column if not exists messaging_consent_at timestamptz;

-- Grava (ou apaga, se vier vazio) o celular e o consentimento da PRÓPRIA pessoa, no restaurante da placa.
create or replace function club_contact_set(p_token text, p_phone text, p_messaging boolean default false)
returns boolean language plpgsql security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid(); d text; v text; ok boolean := coalesce(p_messaging, false);
begin
  if u is null then raise exception 'not_authenticated'; end if;
  if t is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from club_members where tenant_id = t and user_id = u and status = 'active') then raise exception 'not_member'; end if;
  d := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if btrim(coalesce(p_phone, '')) = '' then v := null; ok := false;       -- campo vazio apaga o celular e tira também o consentimento
  elsif length(d) = 11 then v := '+55' || d;
  elsif length(d) = 13 and left(d, 2) = '55' then v := '+' || d;
  else raise exception 'invalid_phone'; end if;
  if v is not null and v !~ '^\+55[1-9][0-9]9[0-9]{8}$' then raise exception 'invalid_phone'; end if;
  update person_profiles set phone = v where user_id = u;
  if not found then raise exception 'not_member'; end if;
  update club_members set messaging_consent = ok, messaging_consent_at = case when ok then now() else null end where tenant_id = t and user_id = u;
  perform _audit(t, 'club_contact_set', jsonb_build_object('has_phone', v is not null, 'messaging', ok));   -- sem o número
  return true;
end $$;

create or replace function club_my_contact(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t uuid := _club_tenant(p_token); u uuid := auth.uid();
begin
  if u is null or t is null then return null; end if;
  return (select jsonb_build_object('phone', pp.phone, 'messaging', m.messaging_consent)
          from club_members m join person_profiles pp on pp.user_id = m.user_id where m.tenant_id = t and m.user_id = u);
end $$;

revoke execute on function club_contact_set(text,text,boolean), club_my_contact(text) from public, anon, authenticated;
grant execute on function club_contact_set(text,text,boolean), club_my_contact(text) to authenticated;

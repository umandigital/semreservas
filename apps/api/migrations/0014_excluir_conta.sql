-- 0014 Excluir minha conta (LGPD): a pessoa apaga o próprio cadastro, pontos, trocas, opiniões e prêmios; o login também é removido.
-- O extrato continua imutável para todo o resto: só esta função, ao apagar a conta inteira, tem permissão de remover as linhas da pessoa.
create or replace function _ledger_imutavel() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' and current_setting('app.erasing', true) = '1' then return old; end if;   -- só a exclusão de conta liga este sinal (dentro da função abaixo)
  raise exception 'ledger_immutable';
end $$;

create or replace function club_delete_account() returns boolean language plpgsql security definer set search_path = public, auth as $$
declare u uuid := auth.uid(); t record;
begin
  if u is null then raise exception 'not_authenticated'; end if;
  for t in select tenant_id from club_members where user_id = u loop
    perform _audit(t.tenant_id, 'account_deleted', jsonb_build_object('had_membership', true));       -- sem identificar a pessoa
  end loop;
  perform set_config('app.erasing', '1', true);                                          -- vale só dentro desta transação
  update order_snapshots set user_id = null where user_id = u;                          -- os itens do pedido ficam para a equipe, sem a pessoa
  delete from club_members where user_id = u;                                            -- apaga em cascata pontos, trocas, visitas, opiniões, prêmios e giros
  delete from person_profiles where user_id = u;
  perform set_config('app.erasing', '0', true);
  delete from auth.users where id = u;                                                   -- remove o login
  return true;
end $$;
revoke execute on function club_delete_account() from public, anon, authenticated;
grant execute on function club_delete_account() to authenticated;

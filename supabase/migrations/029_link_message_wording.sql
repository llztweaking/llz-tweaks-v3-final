-- Ajusta a mensagem de link_license_discord (tela de Cadastro) quando a key já está
-- vinculada a outro Discord, pro texto pedido pelo cliente.
create or replace function link_license_discord(p_key text)
returns table (ok boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key license_keys%rowtype;
  v_discord_id text;
  v_discord_username text;
begin
  if auth.uid() is null then
    return query select false, 'Você precisa estar conectado ao Discord.';
    return;
  end if;

  select identity_data->>'provider_id',
         coalesce(identity_data->>'full_name', identity_data->>'name', identity_data->>'preferred_username', identity_data->'custom_claims'->>'global_name')
    into v_discord_id, v_discord_username
    from auth.identities
    where user_id = auth.uid() and provider = 'discord'
    limit 1;

  if v_discord_id is null then
    return query select false, 'Não foi possível confirmar sua conta do Discord. Conecte novamente.';
    return;
  end if;

  select * into v_key from license_keys where upper(key) = upper(p_key);
  if not found then
    return query select false, 'Key inválida ou não cadastrada. Faça seu cadastro ou insira os seus dados corretamente.';
    return;
  end if;

  if upper(v_key.status) in ('BLOCKED') then
    return query select false, 'Licença ' || v_key.status || '.';
    return;
  end if;

  if v_key.discord_uid is not null and v_key.discord_uid <> v_discord_id then
    return query select false, 'Essa key já foi cadastrada em um outro discord. Insira os dados corretos ou entre em contato com o suporte informando seu problema!';
    return;
  end if;

  update license_keys
    set discord_uid = v_discord_id, discord_id = coalesce(v_discord_username, discord_id)
    where id = v_key.id;

  insert into license_logs (license_key, action, message)
    values (v_key.key, 'discord_link', 'Key vinculada ao Discord ' || coalesce(v_discord_username, v_discord_id));

  return query select true, 'ok';
end;
$$;
grant execute on function link_license_discord(text) to authenticated;

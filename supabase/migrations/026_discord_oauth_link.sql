-- Vínculo real de conta do Discord (via OAuth do Supabase, não texto digitado à mão) a uma key.
-- discord_uid = ID estável do Discord (nunca muda, mesmo se o cliente trocar de @usuário) —
-- é isso que impede "qualquer nome + a key" de logar, como o Luc testou.
-- O login antigo (redeem_or_login_license, com discord de texto livre) continua funcionando
-- do mesmo jeito pra quem ainda não passou pelo cadastro novo — nada quebra pros clientes atuais.
alter table license_keys add column if not exists discord_uid text;
create index if not exists license_keys_discord_uid_idx on license_keys (discord_uid);

-- Chamada pela tela de Cadastro, já autenticado via Discord OAuth. O ID do Discord nunca vem
-- de parâmetro do cliente — é sempre lido de auth.identities, preenchido pelo próprio Supabase
-- durante a troca OAuth (impossível de falsificar pelo app).
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
    return query select false, 'Key inválida ou não encontrada.';
    return;
  end if;

  if upper(v_key.status) in ('BLOCKED') then
    return query select false, 'Licença ' || v_key.status || '.';
    return;
  end if;

  if v_key.discord_uid is not null and v_key.discord_uid <> v_discord_id then
    return query select false, 'Esta key já está vinculada a outra conta do Discord. Fale com o suporte se isso for um engano.';
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

-- Login pela conta já vinculada (tela de login mostrando "@usuario Conectado").
-- Espelha a lógica de redeem_or_login_license (ativação/expiração/hwid), mas nunca confia em
-- discord de texto livre: o ID vem sempre da sessão autenticada, nunca de parâmetro do cliente.
create or replace function login_with_linked_discord(p_key text, p_hwid text)
returns table (ok boolean, plan_name text, status text, message text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key license_keys%rowtype;
  v_license licenses%rowtype;
  v_plan_name text;
  v_discord_id text;
  v_discord_username text;
begin
  if auth.uid() is null then
    return query select false, null::text, null::text, 'Sessão do Discord inválida. Conecte novamente.', null::timestamptz;
    return;
  end if;

  select identity_data->>'provider_id',
         coalesce(identity_data->>'full_name', identity_data->>'name', identity_data->>'preferred_username', identity_data->'custom_claims'->>'global_name')
    into v_discord_id, v_discord_username
    from auth.identities
    where user_id = auth.uid() and provider = 'discord'
    limit 1;

  if v_discord_id is null then
    return query select false, null::text, null::text, 'Sessão do Discord inválida. Conecte novamente.', null::timestamptz;
    return;
  end if;

  select * into v_key from license_keys where upper(key) = upper(p_key);
  if not found then
    return query select false, null::text, null::text, 'Licença inválida ou não encontrada.', null::timestamptz;
    return;
  end if;

  if v_key.discord_uid is null then
    return query select false, null::text, null::text, 'Esta key ainda não foi vinculada a uma conta do Discord. Use "Cadastre-se aqui" primeiro.', null::timestamptz;
    return;
  end if;

  if v_key.discord_uid <> v_discord_id then
    return query select false, null::text, null::text, 'Esta key está vinculada a outra conta do Discord.', null::timestamptz;
    return;
  end if;

  if upper(v_key.status) in ('BLOCKED') then
    return query select false, null::text, v_key.status, 'Licença ' || v_key.status || '.', null::timestamptz;
    return;
  end if;

  if upper(v_key.status) = 'EXPIRED' or (v_key.expires_at is not null and v_key.expires_at < now()) then
    if not exists (select 1 from licenses where id = v_key.id) then
      return query select false, null::text, 'EXPIRED', 'Licença expirada antes de ser ativada.', v_key.expires_at;
      return;
    end if;
  end if;

  select * into v_license from licenses where id = v_key.id;

  if not found then
    insert into licenses (id, user_id, license_key, plan_id, status, hwid, activated_at, expires_at, created_at, updated_at)
    values (v_key.id, auth.uid(), v_key.key, v_key.plan, 'ACTIVE', p_hwid, now(), v_key.expires_at, now(), now());

    update license_keys set first_used_at = coalesce(first_used_at, now()) where id = v_key.id;

    insert into license_logs (license_key, action, message)
      values (v_key.key, 'activation', 'Licença ' || v_key.key || ' ativada por ' || coalesce(v_discord_username, v_discord_id));

    select * into v_license from licenses where id = v_key.id;
  else
    if upper(v_license.status) not in ('ACTIVE', 'EXPIRED') then
      return query select false, null::text, v_license.status, 'Licença ' || v_license.status || '.', v_license.expires_at;
      return;
    end if;

    if v_license.expires_at is not null and v_license.expires_at < now() then
      if v_license.status <> 'EXPIRED' then
        update licenses set status = 'EXPIRED', updated_at = now() where id = v_license.id;
      end if;
      v_license.status := 'EXPIRED';
      insert into license_logs (license_key, action, message)
        values (v_key.key, 'login', 'Login de ' || coalesce(v_discord_username, v_discord_id) || ' com assinatura expirada');
    else
      if v_license.hwid is not null and p_hwid is not null and v_license.hwid <> p_hwid then
        return query select false, null::text, v_license.status, 'Licença vinculada a outro dispositivo. Peça reset de HWID ao suporte.', v_license.expires_at;
        return;
      end if;

      update licenses
        set hwid = coalesce(v_license.hwid, p_hwid), updated_at = now()
        where id = v_license.id;

      insert into license_logs (license_key, action, message)
        values (v_key.key, 'login', 'Login de ' || coalesce(v_discord_username, v_discord_id));
    end if;
  end if;

  select name into v_plan_name from plans where id = v_license.plan_id;

  insert into client_sessions (license_id, license_key, discord_username, hwid)
    values (v_license.id, v_key.key, coalesce(v_discord_username, v_discord_id), p_hwid);

  return query select
    true,
    coalesce(v_plan_name, v_license.plan_id),
    v_license.status,
    case when v_license.status = 'EXPIRED' then 'Assinatura expirada. Renove seu plano para continuar.' else 'ok' end,
    v_license.expires_at;
end;
$$;
grant execute on function login_with_linked_discord(text, text) to authenticated;

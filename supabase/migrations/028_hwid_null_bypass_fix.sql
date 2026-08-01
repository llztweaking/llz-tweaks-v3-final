-- CORREÇÃO DE SEGURANÇA: em redeem_or_login_license e login_with_linked_discord, a checagem
-- de HWID só disparava quando "v_license.hwid is not null AND p_hwid is not null" — ou seja,
-- se a chamada da função chegasse com p_hwid = null (o app oficial só manda null quando o
-- PowerShell falha ao ler o MachineGuid, mas qualquer script externo com a anon key pode
-- simplesmente sempre mandar null), a trava de "um dispositivo só" era pulada inteira, mesmo
-- pra uma licença que já tinha HWID travado. Agora: se a licença já tem HWID gravado, um
-- login sem HWID (p_hwid null) é tratado como dispositivo diferente e barrado igual.
create or replace function redeem_or_login_license(p_key text, p_discord text, p_hwid text, p_user_id uuid)
returns table (ok boolean, plan_name text, status text, message text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key license_keys%rowtype;
  v_license licenses%rowtype;
  v_plan_name text;
begin
  select * into v_key from license_keys where upper(key) = upper(p_key);

  if not found then
    return query select false, null::text, null::text, 'Licença inválida ou não encontrada.', null::timestamptz;
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
    if p_user_id is null then
      return query select false, null::text, null::text, 'Sessão inválida. Tente novamente.', null::timestamptz;
      return;
    end if;

    insert into licenses (id, user_id, license_key, plan_id, status, hwid, activated_at, expires_at, created_at, updated_at)
    values (v_key.id, p_user_id, v_key.key, v_key.plan, 'ACTIVE', p_hwid, now(), v_key.expires_at, now(), now());

    update license_keys
      set first_used_at = now(), discord_id = coalesce(p_discord, discord_id)
      where id = v_key.id;

    insert into license_logs (license_key, action, message) values (v_key.key, 'activation', 'Licença ' || v_key.key || ' ativada por ' || coalesce(p_discord, '?'));

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
      insert into license_logs (license_key, action, message) values (v_key.key, 'login', 'Login de ' || coalesce(p_discord, '?') || ' com assinatura expirada');
    else
      if v_license.hwid is not null and (p_hwid is null or v_license.hwid <> p_hwid) then
        return query select false, null::text, v_license.status, 'Licença vinculada a outro dispositivo. Peça reset de HWID ao suporte.', v_license.expires_at;
        return;
      end if;

      update licenses
        set hwid = coalesce(v_license.hwid, p_hwid), updated_at = now()
        where id = v_license.id;

      insert into license_logs (license_key, action, message) values (v_key.key, 'login', 'Login de ' || coalesce(p_discord, '?'));
    end if;
  end if;

  select name into v_plan_name from plans where id = v_license.plan_id;

  insert into client_sessions (license_id, license_key, discord_username, hwid)
    values (v_license.id, v_key.key, p_discord, p_hwid);

  return query select
    true,
    coalesce(v_plan_name, v_license.plan_id),
    v_license.status,
    case when v_license.status = 'EXPIRED' then 'Assinatura expirada. Renove seu plano para continuar.' else 'ok' end,
    v_license.expires_at;
end;
$$;
grant execute on function redeem_or_login_license(text, text, text, uuid) to anon, authenticated;

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
    return query select false, null::text, null::text, 'Key inválida ou não cadastrada. Faça seu cadastro ou insira os seus dados corretamente.', null::timestamptz;
    return;
  end if;

  if v_key.discord_uid is null then
    return query select false, null::text, null::text, 'Key inválida ou não cadastrada. Faça seu cadastro ou insira os seus dados corretamente.', null::timestamptz;
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
      if v_license.hwid is not null and (p_hwid is null or v_license.hwid <> p_hwid) then
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

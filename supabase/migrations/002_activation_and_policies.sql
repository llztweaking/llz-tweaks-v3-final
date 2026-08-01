-- Fase 1: liga o schema já existente (license_keys, licenses, plans, actions...) a uma
-- função de ativação/login segura, e define quem pode acessar o quê.
-- Rode isso inteiro no SQL Editor do Supabase.

-- 1) Times (você/equipe) que fizerem login por e-mail+senha (Supabase Auth) têm acesso total
--    às tabelas de gestão. Clientes nunca usam essas policies diretamente — só a função abaixo.
do $$
declare
  t text;
begin
  for t in select unnest(array['plans','actions','license_keys','licenses','admin_logs',
                               'execution_logs','license_logs','client_sessions','sessions',
                               'admins','app_versions'])
  loop
    execute format('drop policy if exists "authenticated_full_access" on %I', t);
    execute format(
      'create policy "authenticated_full_access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t
    );
  end loop;
end $$;

-- 2) Função que o APP DO CLIENTE chama pra logar (ativa a chave na primeira vez, ou só valida depois).
--    SECURITY DEFINER: roda com privilégio elevado, ignorando as policies acima,
--    mas só devolve dados da PRÓPRIA licença informada — nunca a lista de todas.
create or replace function redeem_or_login_license(p_key text, p_discord text, p_hwid text)
returns table (ok boolean, plan_name text, status text, message text)
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
    return query select false, null::text, null::text, 'Licença inválida ou não encontrada.';
    return;
  end if;

  if v_key.status in ('revoked', 'banned') then
    return query select false, null::text, v_key.status, 'Licença ' || v_key.status || '.';
    return;
  end if;

  select * into v_license from licenses where id = v_key.id;

  if not found then
    -- Primeira ativação desta chave.
    if v_key.expires_at is not null and v_key.expires_at < now() then
      return query select false, null::text, 'expired', 'Licença expirada antes de ser ativada.';
      return;
    end if;

    insert into licenses (id, user_id, plan_id, status, hwid, activated_at, expires_at, created_at, updated_at)
    values (v_key.id, gen_random_uuid(), v_key.plan, 'active', p_hwid, now(), v_key.expires_at, now(), now());

    update license_keys
      set status = 'used', first_used_at = now(), discord_id = coalesce(p_discord, discord_id)
      where id = v_key.id;

    insert into license_logs (action, message) values ('activation', 'Licença ' || v_key.key || ' ativada por ' || coalesce(p_discord, '?'));

    select * into v_license from licenses where id = v_key.id;
  else
    -- Login de retorno: valida estado.
    if v_license.status <> 'active' then
      return query select false, null::text, v_license.status, 'Licença ' || v_license.status || '.';
      return;
    end if;

    if v_license.expires_at is not null and v_license.expires_at < now() then
      update licenses set status = 'expired', updated_at = now() where id = v_license.id;
      return query select false, null::text, 'expired', 'Licença expirada.';
      return;
    end if;

    if v_license.hwid is not null and p_hwid is not null and v_license.hwid <> p_hwid then
      return query select false, null::text, v_license.status, 'Licença vinculada a outro dispositivo. Peça reset de HWID ao suporte.';
      return;
    end if;

    update licenses
      set hwid = coalesce(v_license.hwid, p_hwid), updated_at = now()
      where id = v_license.id;

    insert into license_logs (action, message) values ('login', 'Login de ' || coalesce(p_discord, '?'));
  end if;

  select name into v_plan_name from plans where id = v_license.plan_id;

  insert into client_sessions (license_id, license_key, discord_username, hwid)
    values (v_license.id, v_key.key, p_discord, p_hwid);

  return query select true, coalesce(v_plan_name, v_license.plan_id), 'active', 'ok';
end;
$$;

-- 3) Só a função pode ser chamada pela chave anon (o app do cliente). Nenhuma tabela é
--    lida/escrita diretamente por ela.
revoke all on license_keys, licenses, plans, actions, admin_logs, execution_logs,
  license_logs, client_sessions, sessions, admins, app_versions
  from anon, authenticated;

grant execute on function redeem_or_login_license(text, text, text) to anon;

-- Autenticados (admin) ainda precisam de select/insert/update/delete além das policies de RLS:
grant select, insert, update, delete on
  plans, actions, license_keys, licenses, admin_logs, execution_logs,
  license_logs, client_sessions, sessions, admins, app_versions
  to authenticated;

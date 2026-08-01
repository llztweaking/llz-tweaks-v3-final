-- RPC leve pra revalidar periodicamente a licença de uma sessão já logada
-- (usado pelo app pra detectar ban/expiração sem precisar reabrir o programa).
-- Só lê o status de UMA chave específica, nunca lista outras licenças.
create or replace function check_license_status(p_key text)
returns table (status text, expires_at timestamptz, plan_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_license licenses%rowtype;
  v_plan_name text;
begin
  select * into v_license from licenses where upper(license_key) = upper(p_key);

  if not found then
    return query select 'NOT_FOUND'::text, null::timestamptz, null::text;
    return;
  end if;

  if upper(v_license.status) = 'ACTIVE' and v_license.expires_at is not null and v_license.expires_at < now() then
    update licenses set status = 'EXPIRED', updated_at = now() where id = v_license.id;
    v_license.status := 'EXPIRED';
  end if;

  select name into v_plan_name from plans where id = v_license.plan_id;

  return query select v_license.status, v_license.expires_at, coalesce(v_plan_name, v_license.plan_id);
end;
$$;

grant execute on function check_license_status(text) to anon, authenticated;

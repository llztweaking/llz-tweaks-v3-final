-- Corrige recursão infinita: a policy de "admins" consultava a própria tabela "admins"
-- pra decidir se podia consultar "admins". Agora usa uma função SECURITY DEFINER
-- (que ignora RLS internamente) pra quebrar esse ciclo.

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

do $$
declare
  t text;
begin
  for t in select unnest(array['plans','actions','license_keys','licenses','admin_logs',
                               'execution_logs','license_logs','client_sessions','sessions',
                               'admins','app_versions'])
  loop
    execute format('drop policy if exists "admin_full_access" on %I', t);
    execute format('create policy "admin_full_access" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

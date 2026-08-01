-- CORREÇÃO DE SEGURANÇA: a policy anterior tratava qualquer sessão autenticada
-- (inclusive as anônimas dos clientes, usadas em todo login por licença) como admin.
-- Agora só quem estiver cadastrado na tabela "admins" tem acesso de gestão.

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
      'create policy "admin_full_access" on %I for all using (exists (select 1 from admins a where a.id = auth.uid())) with check (exists (select 1 from admins a where a.id = auth.uid()))',
      t
    );
  end loop;
end $$;

-- Te cadastra como admin de verdade, ligando ao usuário que você criou em
-- Authentication > Users. TROQUE o e-mail abaixo pelo que você cadastrou lá.
insert into admins (id, discord_username, role)
select id, 'admin', 'super_admin'
from auth.users
where email = 'TROQUE-PELO-SEU-EMAIL@exemplo.com'
on conflict (id) do nothing;

-- Confirma se funcionou (deve aparecer 1 linha com seu id).
select * from admins;

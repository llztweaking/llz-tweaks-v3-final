-- Adiciona hierarquia de planos (pra dar pra comparar "esse plano dá acesso a essa ação?")
alter table plans add column if not exists tier integer;
update plans set tier = 1 where id = 'BASIC';
update plans set tier = 2 where id = 'COMPETITIVE';
update plans set tier = 3 where id = 'EXTREME';

-- Popula o catálogo de ações com as 3 otimizações que já existem no app hoje.
-- O "id" tem que bater com o nome usado em electron/main.cjs e scripts/*.ps1 —
-- essa tabela é só metadado/permissão, o script em si continua local (nunca
-- executamos código vindo direto do banco, por segurança).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('restore-defaults', 'Restaurar padrões', 'Reverte o plano de energia para o perfil balanceado do Windows.', 'energia', null, 'BASIC', false, 'low', true),
  ('safe-cleanup', 'Limpeza segura', 'Remove os arquivos temporários da pasta TEMP do usuário atual.', 'limpeza', null, 'BASIC', false, 'low', true),
  ('competitive-profile', 'Perfil competitivo', 'Aplica o plano de energia de alto desempenho para jogos.', 'energia', null, 'BASIC', false, 'low', true)
on conflict (id) do nothing;

-- O app do cliente (chave anon) precisa poder ler o catálogo de ações habilitadas
-- e os planos (são só metadados públicos, sem dado sensível de outros clientes).
drop policy if exists "anon_read_enabled_actions" on actions;
create policy "anon_read_enabled_actions" on actions for select using (enabled = true);
grant select on actions to anon;

drop policy if exists "anon_read_plans" on plans;
create policy "anon_read_plans" on plans for select using (true);
grant select on plans to anon;

-- E precisa poder registrar (só inserir, nunca ler) o próprio histórico de execução.
drop policy if exists "anon_insert_own_execution_logs" on execution_logs;
create policy "anon_insert_own_execution_logs" on execution_logs for insert with check (user_id = auth.uid());
grant insert on execution_logs to anon;

select a.id, a.name, a.min_plan, p.tier, a.enabled from actions a left join plans p on p.id = a.min_plan;

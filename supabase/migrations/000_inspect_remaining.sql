-- 1) Colunas das tabelas que ainda faltam ver (admin_logs completo + o resto)
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('admin_logs', 'admins', 'app_versions', 'client_sessions', 'execution_logs', 'license_keys', 'license_logs', 'sessions')
order by table_name, ordinal_position;

-- 2) O que já tem dentro de plans (só 3 linhas, seguro de ver)
select * from plans;

-- 3) Quais tabelas já têm RLS (row level security) ligado
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 4) Funções (RPCs) que já existem no banco
select routine_name, data_type as return_type
from information_schema.routines
where routine_schema = 'public';

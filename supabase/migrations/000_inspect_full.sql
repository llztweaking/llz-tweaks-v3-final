-- Diagnóstico completo (só leitura, não altera nada no banco).

-- 1) Todas as tabelas existentes no schema public
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- 2) Todas as colunas de todas as tabelas do schema public
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

-- 3) Chaves estrangeiras (pra entender o que "user_id" e "plan_id" referenciam)
select
  tc.table_name, kcu.column_name,
  ccu.table_name as references_table, ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu on tc.constraint_name = ccu.constraint_name
where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public';

-- 4) Quantidade de linhas em licenses e plans (pra saber se já tem dado real de cliente)
select 'licenses' as tabela, count(*) from licenses
union all
select 'plans' as tabela, count(*) from plans;

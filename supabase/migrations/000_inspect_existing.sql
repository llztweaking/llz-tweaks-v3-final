-- Só para diagnóstico: mostra o que já existe no banco antes de mexer em mais nada.
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('plans', 'licenses', 'action_logs')
order by table_name, ordinal_position;

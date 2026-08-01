select conname, (regexp_matches(pg_get_constraintdef(oid), '''([^'']+)''', 'g'))[1] as valor_permitido
from pg_constraint
where conname in ('license_keys_status_check', 'license_keys_plan_check', 'licenses_status_check')
order by conname;

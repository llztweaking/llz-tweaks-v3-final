select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in ('license_keys'::regclass, 'licenses'::regclass)
  and contype = 'c';

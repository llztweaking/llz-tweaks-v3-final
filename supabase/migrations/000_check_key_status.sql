select lk.key, lk.status as status_da_chave, l.status as status_da_licenca
from license_keys lk
left join licenses l on l.id = lk.id
where lk.key = 'LLZ-PRMD-RVD8-1B0R';

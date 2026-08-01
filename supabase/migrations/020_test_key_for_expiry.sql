-- Chave de teste dedicada só pra validar o fluxo de expiração, sem mexer na
-- LLZ-ADMIN-0001 que vocês já usam. Ativa normalmente (expira só daqui a 1 ano),
-- deixando a real "ativação" acontecer pelo próprio fluxo de login do app.
insert into license_keys (key, plan, status, expires_at)
values ('LLZ-TEST-EXPIRE', 'EXTREME', 'active', now() + interval '1 year')
on conflict (key) do update set status = 'active', expires_at = now() + interval '1 year';

select key, plan, status, expires_at from license_keys where key = 'LLZ-TEST-EXPIRE';

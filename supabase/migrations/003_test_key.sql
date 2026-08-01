-- Cria uma chave de teste pra validarmos a função de ativação/login.
insert into license_keys (key, plan, status)
values ('LLZ-DEV-TEST', 'EXTREME', 'unused')
on conflict (key) do nothing;

select * from license_keys;

-- Chave nova e limpa, só pra você conseguir passar da tela de login inicial
-- e chegar até a aba Admin (que pede e-mail/senha separado).
insert into license_keys (key, plan, status)
values ('LLZ-ADMIN-0001', 'EXTREME', 'active')
on conflict (key) do nothing;

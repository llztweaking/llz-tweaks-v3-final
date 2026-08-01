-- Registra o Luc como admin. TROQUE o e-mail abaixo pelo que você cadastrou
-- em Authentication > Users para ele.
insert into admins (id, discord_username, role)
select id, '@5rol', 'super_admin'
from auth.users
where email = 'TROQUE-PELO-EMAIL-DO-LUC@exemplo.com'
on conflict (id) do nothing;

-- Confirma o resultado (deve aparecer 2 linhas agora: você e o Luc).
select * from admins;

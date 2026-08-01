-- Remove o acesso de admin da conta antiga (rodriguesftw), de 25/06.
-- Isso já tira o acesso ao painel Admin imediatamente.
delete from admins where id = '0fc244d4-6dd2-4b34-91c0-22768f4c0702';

select * from admins;

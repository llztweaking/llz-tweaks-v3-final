-- Simplifica o modelo de planos: some com BASIC/COMPETITIVE/EXTREME (e a hierarquia
-- de "tier" que restringia otimizações por plano) e passa a existir só MENSAL e ANUAL,
-- sem nenhuma diferença de permissões entre eles — só duração/cobrança.
-- A remoção das restrições em si (o "locked" nas telas) é feita no código do app,
-- não aqui; este script só arruma os dados e o catálogo de planos.

-- 1) Solta a constraint ANTES de mexer nos dados — ela só aceitava BASIC/COMPETITIVE/
--    EXTREME, então gravar 'MENSAL' antes de soltar essa trava falha (foi o que
--    aconteceu na primeira tentativa). Se o nome da constraint for outro no seu banco,
--    esse DROP simplesmente não faz nada (IF EXISTS) e o ADD constraint no passo 5
--    pode falhar — me avisa o erro exato que eu ajusto.
alter table license_keys drop constraint if exists license_keys_plan_check;

-- 2) Cria os dois planos novos (mesmo tier pros dois = nenhuma restrição relativa entre eles).
insert into plans (id, name, tier)
values ('MENSAL', 'Mensal', 1), ('ANUAL', 'Anual', 1)
on conflict (id) do update set name = excluded.name, tier = excluded.tier;

-- 3) Remapeia todo mundo que hoje está em BASIC/COMPETITIVE/EXTREME para MENSAL.
--    (Escolha padrão segura; o Admin pode promover manualmente pra ANUAL quem for
--    assinante anual, pela própria tela de Admin > editar plano do cliente.)
update license_keys set plan = 'MENSAL' where plan in ('BASIC', 'COMPETITIVE', 'EXTREME');
update licenses set plan_id = 'MENSAL' where plan_id in ('BASIC', 'COMPETITIVE', 'EXTREME');
update actions set min_plan = 'MENSAL' where min_plan in ('BASIC', 'COMPETITIVE', 'EXTREME');

-- 4) Agora que nada mais referencia os planos antigos, remove eles do catálogo.
delete from plans where id in ('BASIC', 'COMPETITIVE', 'EXTREME');

-- 5) Recoloca a trava, agora só aceitando os dois planos novos.
alter table license_keys add constraint license_keys_plan_check check (plan in ('MENSAL', 'ANUAL'));

select id, name, tier from plans order by name;

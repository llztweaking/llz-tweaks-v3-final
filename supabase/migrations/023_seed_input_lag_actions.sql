-- Otimizações de input lag de mouse e teclado (aumenta o tamanho da fila de dados do
-- driver e desativa teclas de acessibilidade que podem interferir durante jogos).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('keyboard-input-lag-off', 'Reduzir Input Lag do Teclado', 'Aumenta a fila de dados do driver do teclado e desativa Sticky Keys, Toggle Keys e Filter Keys, evitando atrasos e ativações acidentais durante jogos.', 'teclado', null, 'MENSAL', true, 'low', true),
  ('mouse-input-lag-off', 'Reduzir Input Lag do Mouse', 'Aumenta a fila de dados do driver do mouse e desativa o MouseKeys, evitando atrasos e ativações acidentais durante jogos.', 'mouse', null, 'MENSAL', true, 'low', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions where id in ('keyboard-input-lag-off', 'mouse-input-lag-off');

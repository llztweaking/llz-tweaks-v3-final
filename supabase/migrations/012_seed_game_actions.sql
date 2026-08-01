-- Catálogo de otimizações por jogo. Disponível a partir do plano COMPETITIVE (tier 2+).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('game-cs2', 'CS2', 'Prioridade de processo alta, GPU dedicada e otimizações de tela cheia para Counter-Strike 2.', 'jogos', 'cs2', 'COMPETITIVE', false, 'low', true),
  ('game-valorant', 'Valorant', 'Prioridade de processo alta, GPU dedicada e otimizações de tela cheia para Valorant.', 'jogos', 'valorant', 'COMPETITIVE', false, 'low', true),
  ('game-fortnite', 'Fortnite', 'Prioridade de processo alta, GPU dedicada e otimizações de tela cheia para Fortnite.', 'jogos', 'fortnite', 'COMPETITIVE', false, 'low', true),
  ('game-fivem', 'FiveM', 'Prioridade de processo alta, GPU dedicada e otimizações de tela cheia para FiveM.', 'jogos', 'fivem', 'COMPETITIVE', false, 'low', true)
on conflict (id) do nothing;

select id, name, game, min_plan, enabled from actions order by category, name;

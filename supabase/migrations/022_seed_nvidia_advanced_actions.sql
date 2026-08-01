-- Otimizações "avançadas" da NVIDIA, mostradas dentro do modal "Otimizações Avançadas"
-- na aba NVIDIA (não aparecem soltas na grade principal).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('nvidia-power-state-lock', 'Travar Estado de Energia da GPU', 'Impede que a placa NVIDIA reduza o clock por economia de energia durante jogos, mantendo desempenho máximo constante.', 'nvidia', null, 'MENSAL', true, 'low', true),
  ('nvidia-apply-profile', 'Aplicar Perfil Avançado NVIDIA', 'Aplica um perfil de driver com ajustes avançados (gerenciamento de energia, otimização por threads, pré-renderização, cache de shader e buffering) usando o NVIDIA Profile Inspector.', 'nvidia', null, 'MENSAL', true, 'low', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions where id in ('nvidia-power-state-lock', 'nvidia-apply-profile');

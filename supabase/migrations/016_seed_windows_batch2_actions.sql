-- Segunda leva de otimizações da aba "Windows": input lag, standby list e reparo de serviços essenciais.
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('input-lag-off', 'Reduzir Input Lag', 'Desativa USB Selective Suspend, Fullscreen Optimizations e ajusta o agendador de multimídia (MMCSS) para reduzir latência de mouse/teclado e rede em jogos.', 'windows', null, 'BASIC', true, 'low', true),
  ('standby-list-clear', 'Limpar Standby List', 'Libera memória RAM em espera (Standby List). Pode ajudar em casos específicos de stutter.', 'windows', null, 'BASIC', true, 'low', true),
  ('restore-essential-services', 'Restaurar Serviços Essenciais', 'Verifica e reativa serviços essenciais do Windows (DiagTrack, Windows Update, BITS, rede, etc.) caso tenham sido desativados por outro programa.', 'windows', null, 'BASIC', true, 'low', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions where category = 'windows' order by name;

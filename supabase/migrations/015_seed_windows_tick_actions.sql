-- Novas otimizações da aba "Windows" (antiga "Sistema"): memória e timer do sistema.
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('memory-usage-performance', 'Memória: priorizar desempenho', 'Ajusta o gerenciamento de memória do NTFS (fsutil) para priorizar desempenho em vez de economia de RAM.', 'windows', null, 'BASIC', true, 'low', true),
  ('platform-tick-on', 'Ativar Platform Tick', 'Ativa o uso do relógio de plataforma (bcdedit /set useplatformtick yes) para maior precisão de temporização do sistema.', 'windows', null, 'BASIC', true, 'medium', true),
  ('disable-dynamictick-on', 'Desativar Dynamic Tick', 'Desativa o Dynamic Tick do Windows (bcdedit /set disabledynamictick yes), reduzindo microtravamentos em jogos.', 'windows', null, 'BASIC', true, 'medium', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions where category = 'windows' order by name;

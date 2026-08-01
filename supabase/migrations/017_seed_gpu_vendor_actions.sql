-- Otimizações específicas de fabricante de GPU, mostradas apenas na aba NVIDIA ou AMD
-- (a aba certa aparece sozinha no menu, de acordo com a placa de vídeo detectada no PC do cliente).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  ('nvidia-telemetry-off', 'Desativar Telemetria NVIDIA', 'Desativa o serviço de telemetria da NVIDIA (NvTelemetryContainer), reduzindo uso de fundo.', 'nvidia', null, 'BASIC', true, 'low', true),
  ('nvidia-driver-restart', 'Reiniciar Serviço do Driver NVIDIA', 'Reinicia o serviço do driver de exibição NVIDIA. Útil para resolver travamentos pontuais sem reiniciar o PC.', 'nvidia', null, 'BASIC', true, 'low', true),
  ('nvidia-shader-cache-clear', 'Limpar Cache de Shaders NVIDIA', 'Remove o cache de shaders específico da NVIDIA (GLCache/DXCache).', 'nvidia', null, 'BASIC', false, 'low', true),
  ('amd-events-restart', 'Reiniciar Serviço de Eventos AMD', 'Reinicia o serviço de eventos do Radeon Software (quando presente). Útil para resolver travamentos pontuais.', 'amd', null, 'BASIC', true, 'low', true),
  ('amd-shader-cache-clear', 'Limpar Cache de Shaders AMD', 'Remove o cache de shaders específico da AMD (DxCache/DxcCache).', 'amd', null, 'BASIC', false, 'low', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions where category in ('nvidia','amd') order by category, name;

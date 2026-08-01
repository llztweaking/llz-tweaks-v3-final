-- Catálogo das novas otimizações (categorias: jogos, mouse, teclado, interface, energia, internet, armazenamento, reparo).
-- "requires_admin" espelha o campo "elevated" correspondente em electron/main.cjs (scripts que pedem UAC).
insert into actions (id, name, description, category, game, min_plan, requires_admin, risk_level, enabled)
values
  -- Jogos
  ('game-mode-on', 'Ativar Modo de Jogo', 'Ativa o Modo de Jogo nativo do Windows para priorizar recursos durante partidas.', 'jogos', null, 'BASIC', false, 'low', true),
  ('gamebar-off', 'Desativar Xbox Game Bar', 'Desativa a Xbox Game Bar e as capturas em segundo plano, reduzindo consumo de recursos.', 'jogos', null, 'BASIC', false, 'low', true),
  ('explorer-restart', 'Reiniciar Explorer', 'Reinicia o Windows Explorer para aplicar mudanças pendentes sem precisar reiniciar o PC.', 'jogos', null, 'BASIC', false, 'low', true),

  -- Mouse
  ('mouse-accel-off', 'Desativar Aceleração do Mouse', 'Desativa o "Enhance Pointer Precision" e ajusta a sensibilidade para 6/11, padrão competitivo.', 'mouse', null, 'BASIC', false, 'low', true),

  -- Teclado
  ('keyboard-accessibility-off', 'Desativar Teclas de Acessibilidade', 'Desativa Sticky Keys, Toggle Keys e Filter Keys, evitando ativações acidentais durante jogos.', 'teclado', null, 'BASIC', false, 'low', true),

  -- Interface
  ('visual-performance', 'Melhor Desempenho Visual', 'Desativa animações e efeitos visuais do Windows para priorizar desempenho.', 'interface', null, 'BASIC', false, 'low', true),

  -- Energia
  ('ultimate-performance', 'Ultimate Performance', 'Ativa o plano de energia Ultimate Performance (quando suportado pelo hardware/Windows).', 'energia', null, 'BASIC', true, 'low', true),

  -- Rede / Internet
  ('dns-flush', 'Limpar Cache DNS', 'Limpa o cache de resolução DNS do Windows.', 'internet', null, 'BASIC', false, 'low', true),
  ('ip-renew', 'Renovar IP', 'Libera e renova o endereço IP local.', 'internet', null, 'BASIC', false, 'low', true),
  ('winsock-reset', 'Resetar Winsock', 'Reseta o catálogo Winsock. Pode exigir reinicialização do computador.', 'internet', null, 'BASIC', false, 'medium', true),
  ('tcpip-reset', 'Resetar Pilha TCP/IP', 'Reseta a pilha de rede TCP/IP para as configurações padrão. Pode exigir reinicialização.', 'internet', null, 'BASIC', false, 'medium', true),

  -- Armazenamento
  ('empty-recycle-bin', 'Esvaziar Lixeira', 'Remove permanentemente os arquivos da Lixeira.', 'armazenamento', null, 'BASIC', false, 'medium', true),
  ('clear-prefetch', 'Limpar Prefetch', 'Remove os arquivos de pré-carregamento (Prefetch) do Windows.', 'armazenamento', null, 'BASIC', true, 'low', true),
  ('open-disk-cleanup', 'Abrir Limpeza de Disco', 'Abre a ferramenta nativa de Limpeza de Disco do Windows.', 'armazenamento', null, 'BASIC', false, 'low', true),
  ('dx-shader-cache-clear', 'Limpar Cache do DirectX', 'Remove o cache de shaders do DirectX (DX Shader Cache).', 'armazenamento', null, 'BASIC', false, 'low', true),
  ('windows-update-cache-clear', 'Limpar Cache do Windows Update', 'Limpa os arquivos temporários baixados pelo Windows Update.', 'armazenamento', null, 'BASIC', true, 'medium', true),
  ('thumbcache-clear', 'Limpar Cache de Miniaturas', 'Remove o cache de miniaturas (Thumbcache) do Explorer.', 'armazenamento', null, 'BASIC', false, 'low', true),

  -- Reparo
  ('sfc-scan', 'Verificar Arquivos do Sistema (SFC)', 'Executa o System File Checker para verificar e reparar arquivos do sistema. Pode levar vários minutos.', 'reparo', null, 'BASIC', true, 'medium', true),
  ('dism-repair', 'Reparar Imagem do Windows (DISM)', 'Executa o DISM para reparar a imagem do sistema Windows. Pode levar vários minutos.', 'reparo', null, 'BASIC', true, 'medium', true),
  ('chkdsk-schedule', 'Verificar Disco (CHKDSK)', 'Agenda uma verificação completa do disco (CHKDSK) para a próxima inicialização do Windows.', 'reparo', null, 'BASIC', true, 'medium', true)
on conflict (id) do nothing;

select id, name, category, min_plan, requires_admin, risk_level, enabled from actions order by category, name;

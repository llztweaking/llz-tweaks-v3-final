-- As otimizações por jogo (CS2/Valorant/Fortnite/FiveM) agora rodam elevadas
-- (electron/main.cjs) porque ajustar a prioridade do processo do jogo falhava
-- silenciosamente quando o jogo rodava com integridade maior que o app.
-- Espelha esse elevated=true aqui, como documentado na migração 014.
update actions set requires_admin = true
where id in ('game-cs2', 'game-valorant', 'game-fortnite', 'game-fivem');

select id, name, requires_admin from actions where id in ('game-cs2', 'game-valorant', 'game-fortnite', 'game-fivem');

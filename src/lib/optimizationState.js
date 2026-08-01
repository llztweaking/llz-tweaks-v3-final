const KEY = 'llz.optimizations.applied'

export const REVERTIBLE_IDS = new Set([
  'competitive-profile',
  'game-cs2',
  'game-valorant',
  'game-fortnite',
  'game-fivem',
  'ultimate-performance',
  'game-mode-on',
  'gamebar-off',
  'visual-performance',
  'mouse-accel-off',
  'keyboard-accessibility-off',
  'memory-usage-performance',
  'platform-tick-on',
  'disable-dynamictick-on',
  'input-lag-off',
  'nvidia-telemetry-off',
  'nvidia-power-state-lock',
  'keyboard-input-lag-off',
  'mouse-input-lag-off'
])

export function isRevertible(id) {
  return REVERTIBLE_IDS.has(id)
}

export function getAppliedMap() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

export function setAppliedState(id, applied) {
  const map = getAppliedMap()
  if (applied) {
    map[id] = true
  } else {
    delete map[id]
  }
  localStorage.setItem(KEY, JSON.stringify(map))
  return map
}

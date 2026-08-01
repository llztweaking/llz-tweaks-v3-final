const HISTORY_KEY = 'llz.history'
const COUNT_KEY = 'llz.history.count'
const LIMIT = 50

export function addHistoryEntry(label) {
  const entries = getHistory()
  entries.unshift({ label, at: Date.now() })
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, LIMIT)))
  localStorage.setItem(COUNT_KEY, String(getHistoryCount() + 1))
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export function getHistoryCount() {
  return Number(localStorage.getItem(COUNT_KEY)) || 0
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
  localStorage.removeItem(COUNT_KEY)
}

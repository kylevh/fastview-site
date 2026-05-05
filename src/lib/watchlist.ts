const STORAGE_KEY = 'fastview.watchlist.v1'

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

export function setWatchlist(next: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function isWatched(recordNumber: string) {
  return getWatchlist().includes(recordNumber)
}

export function addWatched(recordNumber: string) {
  const current = getWatchlist()
  if (current.includes(recordNumber)) return current
  const next = [recordNumber, ...current]
  setWatchlist(next)
  return next
}

export function removeWatched(recordNumber: string) {
  const next = getWatchlist().filter((x) => x !== recordNumber)
  setWatchlist(next)
  return next
}


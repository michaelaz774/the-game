// storage.ts — localStorage adapter for ScoreEntry persistence
import type { ScoreEntry } from '../types'

const STORAGE_KEY = 'rbc_gp_scores'

/** Persist a ScoreEntry to localStorage (silent on quota/parse errors). */
export function saveScore(entry: ScoreEntry): void {
  try {
    const existing = getScores()
    existing.push(entry)
    // Sort ascending by lapTimeMs (fastest first)
    existing.sort((a, b) => a.lapTimeMs - b.lapTimeMs)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // Quota exceeded or serialisation error — degrade silently
  }
}

/** Returns all stored scores sorted fastest-first. */
export function getScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return (parsed as ScoreEntry[]).sort((a, b) => a.lapTimeMs - b.lapTimeMs)
  } catch {
    return []
  }
}

/** Returns the single fastest local entry, or null if none. */
export function getPersonalBest(): ScoreEntry | null {
  const scores = getScores()
  return scores.length > 0 ? scores[0] : null
}

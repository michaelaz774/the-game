// leaderboard.ts — pluggable adapter: Supabase when configured, localStorage fallback.
// Merges both sources so the leaderboard works fully offline (bad expo wifi!).
import type { ScoreEntry } from '../types'
import { saveScore, getScores } from './storage'
import { getSupabase } from './supabase'

const TABLE = 'scores'

/**
 * Submit a score. Always writes to localStorage. If Supabase is configured,
 * also upserts to the remote table; a network failure is swallowed silently.
 */
export async function submitScore(entry: ScoreEntry): Promise<void> {
  // Always persist locally first
  saveScore(entry)

  const sb = getSupabase()
  if (!sb) return

  try {
    await sb.from(TABLE).insert({
      name: entry.name,
      department: entry.department ?? null,
      lap_time_ms: entry.lapTimeMs,
      correct: entry.correct,
      total: entry.total,
      created_at: new Date(entry.createdAt).toISOString(),
    })
  } catch {
    // Network failure — local storage already written, degrade gracefully
  }
}

/**
 * Fetch the top `limit` scores. Merges remote (Supabase) and local results,
 * deduplicates by name+lapTimeMs, and returns sorted fastest-first.
 * Falls back to local-only on any Supabase error.
 */
export async function fetchTopScores(limit: number): Promise<ScoreEntry[]> {
  const local = getScores()
  const sb = getSupabase()

  let remote: ScoreEntry[] = []

  if (sb) {
    try {
      const { data, error } = await sb
        .from(TABLE)
        .select('name, department, lap_time_ms, correct, total, created_at')
        .order('lap_time_ms', { ascending: true })
        .limit(limit)

      if (!error && data) {
        remote = data.map((row) => ({
          name: row.name as string,
          department: (row.department as string | null) ?? undefined,
          lapTimeMs: row.lap_time_ms as number,
          correct: row.correct as number,
          total: row.total as number,
          createdAt: new Date(row.created_at as string).getTime(),
        }))
      }
    } catch {
      // Network failure — fall through to local-only
    }
  }

  // Merge, dedupe by name+lapTimeMs key, sort, slice
  const merged = [...remote, ...local]
  const seen = new Set<string>()
  const deduped = merged.filter((e) => {
    const key = `${e.name}|${e.lapTimeMs}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  deduped.sort((a, b) => a.lapTimeMs - b.lapTimeMs)
  return deduped.slice(0, limit)
}

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
      email: entry.email ?? null,
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

/** Which store the displayed scores came from. */
export type LeaderboardSource = 'live' | 'local'

export interface LeaderboardResult {
  entries: ScoreEntry[]
  /** 'live' = shared Supabase data; 'local' = this device's localStorage only. */
  source: LeaderboardSource
}

/**
 * Fetch the top `limit` scores from a SINGLE source — never a mix.
 *
 * When Supabase is configured and reachable, returns the shared remote board
 * tagged 'live'. Otherwise (not configured, or a network/query error) returns
 * this device's localStorage board tagged 'local'. The `source` lets the UI
 * label exactly what the viewer is looking at.
 */
export async function fetchTopScores(limit: number): Promise<LeaderboardResult> {
  const sb = getSupabase()

  if (sb) {
    try {
      const { data, error } = await sb
        .from(TABLE)
        .select('name, email, department, lap_time_ms, correct, total, created_at')
        .order('lap_time_ms', { ascending: true })
        .limit(limit)

      if (!error && data) {
        const entries: ScoreEntry[] = data.map((row) => ({
          name: row.name as string,
          email: (row.email as string | null) ?? undefined,
          department: (row.department as string | null) ?? undefined,
          lapTimeMs: row.lap_time_ms as number,
          correct: row.correct as number,
          total: row.total as number,
          createdAt: new Date(row.created_at as string).getTime(),
        }))
        return { entries, source: 'live' }
      }
    } catch {
      // Network/query failure — fall through to local-only below.
    }
  }

  // Local-only: already sorted fastest-first by storage.getScores().
  return { entries: getScores().slice(0, limit), source: 'local' }
}

/**
 * Live updates: invoke `onChange` whenever a score is inserted/updated/deleted
 * in the remote table, so a display can refetch immediately instead of waiting
 * for the next poll. Returns an unsubscribe function. No-op (returns a no-op
 * unsubscribe) when Supabase isn't configured — callers should still poll as a
 * fallback for the offline/local case.
 */
export function subscribeScores(onChange: () => void): () => void {
  const sb = getSupabase()
  if (!sb) return () => {}

  const channel = sb
    .channel('public:scores')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => onChange(),
    )
    .subscribe()

  return () => {
    void sb.removeChannel(channel)
  }
}

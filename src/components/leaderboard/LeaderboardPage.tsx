// LeaderboardPage.tsx — standalone, full-screen live timing board for the booth
// display (route: /leaderboard). Shows the top-three podium with full stats and
// a scrollable list of runner-ups. Stays live by combining Supabase realtime
// (instant on every new score) with a polling fallback for the offline/local
// leaderboard.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ScoreEntry } from '../../types'
import {
  fetchTopScores,
  subscribeScores,
  type LeaderboardSource,
} from '../../lib/leaderboard'
import { formatLapTime } from '../../game/timing'
import './leaderboardPage.css'

// Pull a deep board so the runner-up list is worth scrolling.
const MAX_ENTRIES = 100
// Fallback poll cadence — realtime drives most updates; this catches the
// local-only case and any missed events.
const POLL_MS = 8000

/** Gap to the leader as F1 broadcast "+s.mmm" (or "+m:ss.mmm" past a minute). */
function gapDisplay(ms: number): string {
  return '+' + formatLapTime(ms).replace(/^0:/, '')
}

function accuracy(entry: ScoreEntry): number {
  return entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0
}

function PodiumCard({
  entry,
  pos,
  leaderTime,
}: {
  entry: ScoreEntry
  pos: number
  leaderTime: number
}) {
  const gap = entry.lapTimeMs - leaderTime
  return (
    <div className={`lbp-podium__card lbp-podium__card--p${pos}`}>
      <div className="lbp-podium__medal" aria-hidden="true">
        {pos === 1 ? '🏆' : pos === 2 ? '🥈' : '🥉'}
      </div>
      <div className="lbp-podium__pos">P{pos}</div>
      <div className="lbp-podium__name" title={entry.name}>
        {entry.name}
      </div>
      {entry.department && (
        <div className="lbp-podium__dept" title={entry.department}>
          {entry.department}
        </div>
      )}
      <div className="lbp-podium__time">{formatLapTime(entry.lapTimeMs)}</div>
      <div className="lbp-podium__stats">
        <div className="lbp-stat">
          <span className="lbp-stat__value">{accuracy(entry)}%</span>
          <span className="lbp-stat__label">accuracy</span>
        </div>
        <div className="lbp-stat">
          <span className="lbp-stat__value">
            {entry.correct}/{entry.total}
          </span>
          <span className="lbp-stat__label">correct</span>
        </div>
        <div className="lbp-stat">
          <span className="lbp-stat__value">
            {pos === 1 ? '—' : gapDisplay(gap)}
          </span>
          <span className="lbp-stat__label">{pos === 1 ? 'leader' : 'gap'}</span>
        </div>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [source, setSource] = useState<LeaderboardSource>('local')
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  // Avoid overlapping/duplicate fetches when realtime + poll fire close together.
  const inFlight = useRef(false)

  const reload = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    try {
      const { entries, source: src } = await fetchTopScores(MAX_ENTRIES)
      setScores(entries)
      setSource(src)
      setUpdatedAt(Date.now())
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    void reload()
    const unsubscribe = subscribeScores(() => void reload())
    const poll = window.setInterval(() => void reload(), POLL_MS)
    return () => {
      unsubscribe()
      window.clearInterval(poll)
    }
  }, [reload])

  const leaderTime = scores.length > 0 ? scores[0].lapTimeMs : 0
  const podium = scores.slice(0, 3)
  const runnersUp = scores.slice(3)
  // Classic podium ordering: P2 · P1 (elevated) · P3.
  const podiumOrder: Array<{ entry: ScoreEntry; pos: number } | null> = [
    podium[1] ? { entry: podium[1], pos: 2 } : null,
    podium[0] ? { entry: podium[0], pos: 1 } : null,
    podium[2] ? { entry: podium[2], pos: 3 } : null,
  ]

  return (
    <div className="lbp">
      {/* ── Header / live status ── */}
      <header className="lbp__header">
        <div className="lbp__title-group">
          <div className="lbp__series">RBC AI Grand Prix</div>
          <h1 className="lbp__title">Live Timing</h1>
        </div>
        <div className="lbp__status">
          {source === 'live' ? (
            <span className="lbp__badge lbp__badge--live">
              <span className="lbp__live-dot" aria-hidden="true" />
              LIVE DATA
            </span>
          ) : (
            <span className="lbp__badge lbp__badge--local" title="Scores stored on this device only — not synced live">
              LOCAL DATA
            </span>
          )}
          <span className="lbp__racers">{scores.length} racers</span>
          {updatedAt && (
            <span className="lbp__updated">
              updated{' '}
              {new Date(updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
        </div>
      </header>

      {loading && scores.length === 0 ? (
        <div className="lbp__empty">Loading times…</div>
      ) : scores.length === 0 ? (
        <div className="lbp__empty">No laps set yet — be the first on track!</div>
      ) : (
        <>
          {/* ── Podium ── */}
          <section className="lbp-podium" aria-label="Top three">
            {podiumOrder.map((slot, i) =>
              slot ? (
                <PodiumCard
                  key={`${slot.entry.name}-${slot.entry.lapTimeMs}`}
                  entry={slot.entry}
                  pos={slot.pos}
                  leaderTime={leaderTime}
                />
              ) : (
                <div key={`empty-${i}`} className="lbp-podium__card lbp-podium__card--empty" />
              ),
            )}
          </section>

          {/* ── Runner-ups (scrollable) ── */}
          <section className="lbp-tower" aria-label="Runner-ups">
            {runnersUp.length === 0 ? (
              <div className="lbp-tower__empty">
                Waiting on more drivers to set a lap…
              </div>
            ) : (
              <>
                <div className="lbp-tower__head">
                  <span className="lbp-tower__col lbp-tower__col--pos">POS</span>
                  <span className="lbp-tower__col lbp-tower__col--driver">DRIVER</span>
                  <span className="lbp-tower__col lbp-tower__col--acc">ACC</span>
                  <span className="lbp-tower__col lbp-tower__col--time">LAP</span>
                  <span className="lbp-tower__col lbp-tower__col--gap">GAP</span>
                </div>
                <div className="lbp-tower__rows">
                  {runnersUp.map((entry, idx) => {
                    const pos = idx + 4
                    return (
                      <div
                        key={`${entry.name}-${entry.lapTimeMs}-${pos}`}
                        className="lbp-tower__row"
                      >
                        <span className="lbp-tower__col lbp-tower__col--pos">P{pos}</span>
                        <span className="lbp-tower__col lbp-tower__col--driver">
                          <span className="lbp-tower__name">{entry.name}</span>
                          {entry.department && (
                            <span className="lbp-tower__dept">{entry.department}</span>
                          )}
                        </span>
                        <span className="lbp-tower__col lbp-tower__col--acc">
                          {accuracy(entry)}%
                        </span>
                        <span className="lbp-tower__col lbp-tower__col--time">
                          {formatLapTime(entry.lapTimeMs)}
                        </span>
                        <span className="lbp-tower__col lbp-tower__col--gap">
                          {gapDisplay(entry.lapTimeMs - leaderTime)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}

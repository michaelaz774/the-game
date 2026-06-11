import { useEffect, useState } from 'react'
import type { ScoreEntry } from '../../types'
import { fetchTopScores } from '../../lib/leaderboard'
import { formatLapTime } from '../../game/timing'
import '../pitwall.css'

interface LeaderboardProps {
  highlightName?: string
  /** Bump this to force a refetch (e.g. after the player's score is submitted). */
  refreshKey?: number
}

export default function Leaderboard({ highlightName, refreshKey = 0 }: LeaderboardProps) {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchTopScores(8).then(({ entries }) => {
      if (!cancelled) {
        setScores(entries)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const leaderTime = scores.length > 0 ? scores[0].lapTimeMs : null

  return (
    <div className="pw-lb">
      <div className="pw-lb__title">Timing Tower</div>
      <div className="pw-lb__tower">
        {loading && <div className="pw-lb__loading">Loading times…</div>}
        {!loading && scores.length === 0 && (
          <div className="pw-lb__empty">No scores yet — be the first!</div>
        )}
        {!loading && scores.map((entry, idx) => {
          const pos = idx + 1
          const gapMs = leaderTime !== null ? entry.lapTimeMs - leaderTime : 0
          const isP1 = pos === 1
          const isHighlight =
            highlightName != null &&
            entry.name.toLowerCase() === highlightName.toLowerCase()

          const rowClass = [
            'pw-lb__row',
            isP1 ? 'pw-lb__row--p1' : '',
            isHighlight ? 'pw-lb__row--highlight' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div key={`${entry.name}-${entry.lapTimeMs}-${idx}`} className={rowClass}>
              <div className="pw-lb__pos">P{pos}</div>
              <div className="pw-lb__info">
                <div className="pw-lb__name">{entry.name}</div>
                <div className="pw-lb__score-meta">
                  {entry.correct}/{entry.total} correct
                </div>
              </div>
              <div className="pw-lb__times">
                <div className="pw-lb__laptime">{formatLapTime(entry.lapTimeMs)}</div>
                {!isP1 && (
                  <div className="pw-lb__gap">+{formatLapTime(gapMs).replace(/^\d+:/, '')}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

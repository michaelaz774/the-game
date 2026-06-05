import { useEffect, useRef } from 'react'
import { useGame } from '../game/useGame'
import { formatLapTime } from '../game/timing'
import type { ScoreEntry } from '../types'
import { submitScore } from '../lib/leaderboard'
import Leaderboard from './leaderboard/Leaderboard'
import './pitwall.css'

export function Result() {
  const game = useGame()
  const { state } = game
  const submitted = useRef(false)

  // Submit score exactly once on mount
  useEffect(() => {
    if (submitted.current) return
    if (state.lapTimeMs === null || state.finishedAt === null) return

    submitted.current = true

    const entry: ScoreEntry = {
      name: state.playerName || 'ANON',
      email: state.email || undefined,
      department: state.department || undefined,
      lapTimeMs: state.lapTimeMs,
      correct: state.correctCount,
      total: state.raceQuestions.length + state.pitQuestions.length,
      createdAt: state.finishedAt,
    }

    submitScore(entry)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lapMs = state.lapTimeMs ?? 0
  const lapDisplay = formatLapTime(lapMs)
  const total = state.raceQuestions.length + state.pitQuestions.length
  const correct = state.correctCount
  const playerName = state.playerName || 'DRIVER'

  return (
    <div className="pw-result">
      {/* Checkered header stripe */}
      <div className="pw-result__header" aria-hidden="true" />

      {/* Hero result card — designed to be screenshot-worthy */}
      <div className="pw-result__card">
        <div className="pw-result__race-name">RBC AI Grand Prix</div>
        <div className="pw-result__player-name">{playerName}</div>

        <div className="pw-result__lap-label">LAP TIME</div>
        <div className="pw-result__lap-time" aria-label={`Lap time: ${lapDisplay}`}>
          {lapDisplay}
        </div>

        <div className="pw-result__score-row">
          <div className="pw-result__score-pill">
            <strong>{correct}</strong>/{total} correct
          </div>
          <div className="pw-result__score-pill">
            {total > 0
              ? Math.round((correct / total) * 100)
              : 0}
            % accuracy
          </div>
        </div>
      </div>

      {/* Soft CTA — data scientist conversation starter */}
      <div className="pw-result__cta" role="complementary" aria-label="Talk to a data scientist">
        <div className="pw-result__cta-icon" aria-hidden="true">👋</div>
        <div className="pw-result__cta-body">
          <div className="pw-result__cta-title">Talk to a data scientist</div>
          <div className="pw-result__cta-text">
            Curious how AI shapes RBC's decisions — from fraud detection to personalised
            banking? Come chat with our team at the booth.
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pw-result__actions">
        <button
          className="pw-result__again-btn"
          onClick={() => game.reset()}
          aria-label="Race again"
        >
          🔁 Race Again
        </button>
      </div>

      {/* Leaderboard */}
      <Leaderboard highlightName={state.playerName} />
    </div>
  )
}

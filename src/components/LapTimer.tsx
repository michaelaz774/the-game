// ============================================================================
// LapTimer — live F1-style running lap clock shown during racing & pit stop.
// Ticks via requestAnimationFrame for that fast-moving millisecond feel.
// Freezes when the lap finishes. Also surfaces accumulated time penalties.
// ============================================================================

import { useEffect, useState } from 'react'
import { useGame } from '../game/useGame'
import { formatLapTime } from '../game/timing'
import './lapTimer.css'

export function LapTimer(): JSX.Element | null {
  const { state } = useGame()
  const [now, setNow] = useState<number>(() => Date.now())

  const running = state.startedAt != null && state.finishedAt == null

  useEffect(() => {
    if (!running) return
    let raf = 0
    const tick = () => {
      setNow(Date.now())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // Nothing to show before the lights go out.
  if (state.startedAt == null) return null

  const elapsed = (state.finishedAt ?? now) - state.startedAt

  return (
    <div className="lap-timer" role="timer" aria-live="off">
      <span className="lap-timer__label">LAP</span>
      <span className="lap-timer__time">{formatLapTime(Math.max(0, elapsed))}</span>
      {state.penaltyMs > 0 && (
        <span className="lap-timer__pen">+{Math.round(state.penaltyMs / 1000)}s</span>
      )}
    </div>
  )
}

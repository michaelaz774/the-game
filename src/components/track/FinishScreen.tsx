// FinishScreen.tsx — checkered-flag celebration + confetti, then → result
import { useEffect } from 'react'
import { useGame } from '../../game/useGame'
import { fireConfetti } from './confetti'
import './track.css'

const AUTO_ADVANCE_MS = 2500

export function FinishScreen() {
  const { toResult } = useGame()

  useEffect(() => {
    // Fire confetti immediately on mount
    fireConfetti()

    const timer = setTimeout(() => {
      toResult()
    }, AUTO_ADVANCE_MS)

    return () => clearTimeout(timer)
  }, [toResult])

  return (
    <div className="finish-screen" role="status" aria-label="Lap complete">
      {/* Subtle checkered background */}
      <div className="finish-screen__checkers" aria-hidden="true" />

      {/* Flag emoji */}
      <div className="finish-screen__flag" aria-hidden="true">
        🏁
      </div>

      {/* Headline */}
      <h1 className="finish-screen__headline">LAP COMPLETE!</h1>

      {/* Sub-label */}
      <p className="finish-screen__sub">Calculating your lap time…</p>

      {/* Loading spinner while waiting */}
      <div className="finish-screen__spinner" aria-hidden="true" />
    </div>
  )
}

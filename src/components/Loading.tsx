// Loading.tsx — splash shown on first load while audio buffers.
// Streams both mp3s (see prefetchAudio) and reveals the game once they're
// fully downloaded, with a safety timeout so flaky wifi can't trap players.
import { useEffect, useState } from 'react'
import { prefetchAudio } from '../lib/audio'
import './loading.css'

// If buffering stalls, let players through anyway after this long.
const SAFETY_TIMEOUT_MS = 8000

export function Loading({ onReady }: { onReady: () => void }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      onReady()
    }

    const timer = setTimeout(finish, SAFETY_TIMEOUT_MS)
    prefetchAudio(setPct).then(finish).catch(finish)

    return () => clearTimeout(timer)
  }, [onReady])

  return (
    <div className="loading" role="status" aria-live="polite" aria-label="Loading">
      <div className="loading__tyre" aria-hidden="true" />

      <h1 className="loading__title">RBC AI GRAND PRIX</h1>
      <p className="loading__sub">WARMING UP THE GRID…</p>

      <div className="loading__bar" aria-hidden="true">
        <div className="loading__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="loading__pct">{pct}%</p>
    </div>
  )
}

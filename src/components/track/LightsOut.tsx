// LightsOut.tsx — F1 5-light start sequence
import { useEffect, useState } from 'react'
import { useGame } from '../../game/useGame'
import './track.css'

const LIGHT_DELAY_MS  = 800   // each light illuminates ~0.8s apart
const GO_SHOW_MS      = 1600  // "GO!" shown for this long before beginLap fires
const TOTAL_LIGHTS    = 5

export function LightsOut() {
  const { beginLap } = useGame()

  // How many lights are currently lit (0–5)
  const [lit, setLit] = useState(0)
  // Whether all lights are out (= GO!)
  const [go, setGo] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Light up 1..5 sequentially
    for (let i = 1; i <= TOTAL_LIGHTS; i++) {
      timers.push(
        setTimeout(() => setLit(i), i * LIGHT_DELAY_MS)
      )
    }

    // All out — show GO
    const allOutDelay = (TOTAL_LIGHTS + 1) * LIGHT_DELAY_MS
    timers.push(
      setTimeout(() => {
        setLit(0)
        setGo(true)
      }, allOutDelay)
    )

    // Begin lap and advance screen
    timers.push(
      setTimeout(() => {
        beginLap()
      }, allOutDelay + GO_SHOW_MS)
    )

    return () => timers.forEach(clearTimeout)
  }, [beginLap])

  return (
    <div className="lights-out" role="status" aria-live="polite" aria-label="Race start sequence">
      {/* ── Gantry ── */}
      <div className="lights-out__gantry" aria-hidden="true">
        {Array.from({ length: TOTAL_LIGHTS }, (_, i) => (
          <div key={i} className="lights-out__panel">
            <div className={`lights-out__light${lit > i ? ' lights-out__light--on' : ''}`} />
          </div>
        ))}
      </div>

      {/* ── GO flash ── */}
      {go && (
        <div className="lights-out__go" aria-label="Go!">
          GO!
        </div>
      )}

      {/* ── Supporting text ── */}
      {!go && (
        <>
          <p className="lights-out__label">
            {lit === 0 ? 'READY' : `LIGHT ${lit} / ${TOTAL_LIGHTS}`}
          </p>
          <p className="lights-out__subtitle">RBC AI GRAND PRIX</p>
        </>
      )}
    </div>
  )
}

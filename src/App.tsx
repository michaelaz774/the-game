// ============================================================================
// INTEGRATION ROOT — owned by the integrator.
// This file defines the exact import paths + component contracts every agent
// must satisfy. Each screen component consumes useGame() directly and renders
// itself full-bleed inside .gp-stage. App only switches on state.screen.
// ============================================================================

import { useEffect, useState } from 'react'
import { GameProvider, useGame } from './game/useGame'
import { Loading } from './components/Loading'
import { Landing } from './components/Landing'
import { LightsOut } from './components/track/LightsOut'
import { RaceScreen } from './components/quiz/RaceScreen'
import { PitStop } from './components/pitstop/PitStop'
import { FinishScreen } from './components/track/FinishScreen'
import { Result } from './components/Result'
import { startMusic, stopMusic } from './lib/audio'

function Screens() {
  const { state } = useGame()

  // "Lose My Mind" loops while the player is racing (track + pit stop),
  // and stops once they cross the finish line.
  useEffect(() => {
    if (state.screen === 'racing' || state.screen === 'pit') {
      startMusic()
    } else {
      stopMusic()
    }
  }, [state.screen])

  switch (state.screen) {
    case 'landing':
      return <Landing />
    case 'lights':
      return <LightsOut />
    case 'racing':
      return <RaceScreen />
    case 'pit':
      return <PitStop />
    case 'finish':
      return <FinishScreen />
    case 'result':
      return <Result />
    default:
      return <Landing />
  }
}

export default function App() {
  // Hold on the splash until both audio cues are buffered (prefetchAudio),
  // so the lights/beep and music are ready the instant the player starts.
  const [ready, setReady] = useState(false)

  return (
    <div className="gp-stage">
      {ready ? (
        <GameProvider>
          <Screens />
        </GameProvider>
      ) : (
        <Loading onReady={() => setReady(true)} />
      )}
    </div>
  )
}

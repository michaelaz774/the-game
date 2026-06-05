// ============================================================================
// INTEGRATION ROOT — owned by the integrator.
// This file defines the exact import paths + component contracts every agent
// must satisfy. Each screen component consumes useGame() directly and renders
// itself full-bleed inside .gp-stage. App only switches on state.screen.
// ============================================================================

import { GameProvider, useGame } from './game/useGame'
import { Landing } from './components/Landing'
import { LightsOut } from './components/track/LightsOut'
import { RaceScreen } from './components/quiz/RaceScreen'
import { PitStop } from './components/pitstop/PitStop'
import { FinishScreen } from './components/track/FinishScreen'
import { Result } from './components/Result'

function Screens() {
  const { state } = useGame()
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
  return (
    <GameProvider>
      <div className="gp-stage">
        <Screens />
      </div>
    </GameProvider>
  )
}

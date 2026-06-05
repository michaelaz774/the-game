// ============================================================================
// RaceScreen — race sector: Track (progress) on top, QuestionCard below.
// Manages local disabled+feedback timing so taps feel instant and responsive.
// ============================================================================

import React, { useState, useCallback, useEffect } from 'react'
import { useGame } from '../../game/useGame'
import { Track } from '../track/Track'
import { QuestionCard } from './QuestionCard'
import './quiz.css'

const FEEDBACK_DURATION_MS = 700

export function RaceScreen(): JSX.Element {
  const { state, currentQuestion, answerRace } = useGame()
  const [disabled, setDisabled] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [funFact, setFunFact] = useState<string | null>(null)

  // Reset local state whenever question index changes (engine advanced to next)
  useEffect(() => {
    setDisabled(false)
    setFeedback(null)
    setFunFact(null)
  }, [state.currentIndex])

  const handleAnswer = useCallback(
    (i: 0 | 1) => {
      if (disabled || !currentQuestion) return
      setDisabled(true)
      const correct = answerRace(i)
      const fb: 'correct' | 'wrong' = correct ? 'correct' : 'wrong'
      setFeedback(fb)
      if (correct && currentQuestion.funFact) {
        setFunFact(currentQuestion.funFact)
      }
      // After feedback window, clear local state. Engine will have advanced state.
      setTimeout(() => {
        setFeedback(null)
        setFunFact(null)
        // disabled will be reset by the useEffect above when currentIndex changes
        // but if the engine hasn't changed (last question transition) we still clear
        setDisabled(false)
      }, FEEDBACK_DURATION_MS)
    },
    [disabled, currentQuestion, answerRace]
  )

  if (!currentQuestion) {
    return (
      <div className="race-screen">
        <Track progress={state.progress} phase="race" />
        <div className="race-screen__loading">Loading…</div>
      </div>
    )
  }

  return (
    <div className="race-screen">
      <Track progress={state.progress} phase="race" />

      <div className="race-screen__body">
        <div className="race-screen__meta">
          <span className="race-screen__label">SECTOR 1</span>
          <span className="race-screen__counter">
            Q {state.currentIndex + 1} / {state.raceQuestions.length}
          </span>
        </div>

        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          disabled={disabled}
          feedback={feedback}
        />

        {funFact && (
          <div className="race-screen__funfact" aria-live="polite">
            <span className="race-screen__funfact-icon">💡</span>
            {funFact}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// PitStop — 4 rapid-fire tire-change questions with countdown per question.
// Fast, punchy, urgent. Four tire slots fill as correct answers come in.
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useGame } from '../../game/useGame'
import { Track } from '../track/Track'
import { LapTimer } from '../LapTimer'
import { QuestionCard } from '../quiz/QuestionCard'
import { PIT_QUESTION_TIME_MS } from '../../types'
import '../quiz/quiz.css'

const FEEDBACK_DURATION_MS = 600

type TireState = 'empty' | 'snapping' | 'done'

export function PitStop(): JSX.Element {
  const { state, currentQuestion, answerPit } = useGame()

  // Tire slots: one per pit question (4 total)
  const [tires, setTires] = useState<TireState[]>(['empty', 'empty', 'empty', 'empty'])

  // Local question flow state
  const [disabled, setDisabled] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  // Countdown: ms remaining for current question
  const [timeLeft, setTimeLeft] = useState(PIT_QUESTION_TIME_MS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answeredRef = useRef(false) // guard against double-fire

  const currentPitIndex = state.currentIndex // 0..3

  // ---- helpers ----
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const submitAnswer = useCallback(
    (i: 0 | 1, onTime: boolean) => {
      if (answeredRef.current) return
      answeredRef.current = true
      stopTimer()
      setDisabled(true)
      const correct = answerPit(i, onTime)
      const fb: 'correct' | 'wrong' = correct ? 'correct' : 'wrong'
      setFeedback(fb)

      // Snap-on animation for the correct tire slot
      if (correct) {
        setTires(prev => {
          const next = [...prev] as TireState[]
          next[currentPitIndex] = 'snapping'
          return next
        })
        setTimeout(() => {
          setTires(prev => {
            const next = [...prev] as TireState[]
            next[currentPitIndex] = 'done'
            return next
          })
        }, 350)
      }

      setTimeout(() => {
        setFeedback(null)
        setDisabled(false)
        // reset for next question (useEffect on currentIndex will also fire)
      }, FEEDBACK_DURATION_MS)
    },
    [answerPit, currentPitIndex]
  )

  // Reset countdown + answered guard when question index changes
  useEffect(() => {
    answeredRef.current = false
    setDisabled(false)
    setFeedback(null)
    setTimeLeft(PIT_QUESTION_TIME_MS)

    stopTimer()
    const start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, PIT_QUESTION_TIME_MS - elapsed)
      setTimeLeft(remaining)
      if (remaining <= 0) {
        stopTimer()
        // auto-submit wrong answer due to timeout
        submitAnswer(0, false)
      }
    }, 50)

    return stopTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentIndex])

  const handleAnswer = useCallback(
    (i: 0 | 1) => {
      if (disabled || answeredRef.current || !currentQuestion) return
      const onTime = timeLeft > 0
      submitAnswer(i, onTime)
    },
    [disabled, currentQuestion, timeLeft, submitAnswer]
  )

  const countdownFraction = timeLeft / PIT_QUESTION_TIME_MS
  const countdownClass =
    countdownFraction < 0.25
      ? 'pit-countdown--critical'
      : countdownFraction < 0.5
      ? 'pit-countdown--warning'
      : ''

  return (
    <div className="pit-screen">
      <LapTimer />
      <Track progress={state.progress} phase="pit" />

      <div className="pit-screen__body">
        <div className="pit-screen__header">
          <div className="pit-screen__headline">PIT STOP</div>
          <div className="pit-screen__subline">CHANGE ALL 4 TYRES!</div>
        </div>

        {/* Tire slots */}
        <div className="pit-tires" aria-label="Tire change progress">
          {([0, 1, 2, 3] as const).map(idx => {
            const ts = tires[idx]
            const isCurrent = idx === currentPitIndex
            return (
              <div
                key={idx}
                className={[
                  'pit-tire',
                  ts === 'done' ? 'pit-tire--done' : '',
                  ts === 'snapping' ? 'pit-tire--snapping' : '',
                  isCurrent && ts === 'empty' ? 'pit-tire--active' : '',
                ].join(' ')}
                aria-label={`Tire ${idx + 1}: ${ts === 'done' ? 'changed' : isCurrent ? 'current' : 'pending'}`}
              >
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  {/* Outer tyre */}
                  <circle cx="20" cy="20" r="18" strokeWidth="4" className="pit-tire__outer" />
                  {/* Rim */}
                  <circle cx="20" cy="20" r="9" strokeWidth="3" className="pit-tire__rim" />
                  {/* Spokes */}
                  {[0, 60, 120, 180, 240, 300].map(deg => {
                    const rad = (deg * Math.PI) / 180
                    const x1 = 20 + 9 * Math.cos(rad)
                    const y1 = 20 + 9 * Math.sin(rad)
                    const x2 = 20 + 14 * Math.cos(rad)
                    const y2 = 20 + 14 * Math.sin(rad)
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" className="pit-tire__spoke" />
                  })}
                </svg>
                <span className="pit-tire__num">{idx + 1}</span>
              </div>
            )
          })}
        </div>

        {/* Countdown bar */}
        <div className={`pit-countdown ${countdownClass}`} role="timer" aria-label={`${Math.ceil(timeLeft / 1000)}s remaining`}>
          <div
            className="pit-countdown__bar"
            style={{ transform: `scaleX(${countdownFraction})` }}
          />
        </div>

        {/* Question */}
        {currentQuestion ? (
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={disabled}
            feedback={feedback}
          />
        ) : (
          <div className="pit-screen__loading">Loading…</div>
        )}
      </div>
    </div>
  )
}

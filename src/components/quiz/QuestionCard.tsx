// ============================================================================
// QuestionCard — category tag, question text, two big stacked option buttons.
// Parent controls disabled + feedback state; this component is purely presentational.
// ============================================================================

import React from 'react'
import { Question } from '../../types'
import './quiz.css'

interface QuestionCardProps {
  question: Question
  onAnswer: (i: 0 | 1) => void
  disabled?: boolean
  feedback?: 'correct' | 'wrong' | null
}

export function QuestionCard({
  question,
  onAnswer,
  disabled = false,
  feedback = null,
}: QuestionCardProps): JSX.Element {
  return (
    <div className="qcard" aria-live="polite">
      <span className="qcard__category">{question.category}</span>
      <p className="qcard__text">{question.text}</p>
      <div className="qcard__options">
        {(question.options as [string, string]).map((opt, idx) => {
          const i = idx as 0 | 1
          let btnClass = 'qcard__btn'
          if (feedback && disabled) {
            if (i === question.correctIndex) {
              btnClass += ' qcard__btn--correct'
            } else if (feedback === 'wrong' && i !== question.correctIndex) {
              btnClass += ' qcard__btn--wrong'
            }
          }
          return (
            <button
              key={i}
              className={btnClass}
              onClick={() => !disabled && onAnswer(i)}
              disabled={disabled}
              aria-label={`Option ${i + 1}: ${opt}`}
              aria-pressed={false}
            >
              <span className="qcard__btn-letter">{i === 0 ? 'A' : 'B'}</span>
              <span className="qcard__btn-text">{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

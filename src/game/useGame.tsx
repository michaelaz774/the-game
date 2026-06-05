// useGame.tsx — Race Engineer: game engine + state (Agent 1)
// Exports: GameProvider, useGame

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react'
import type { GameApi, GameState, Question } from '../types'
import { raceQuestions as allRaceQuestions, pitQuestions as allPitQuestions } from '../data/questions'
import { computeLapTimeMs } from './timing'
import { raceAnswerPenalty, pitAnswerPenalty, computeProgress } from './scoring'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RACE_Q_COUNT = 10
const PIT_Q_COUNT = 4

// ---------------------------------------------------------------------------
// Shuffle helper (Fisher-Yates)
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------------------------------------------------------------------------
// Initial state factory
// ---------------------------------------------------------------------------

function buildInitialState(): GameState {
  const raceQs = shuffle(allRaceQuestions).slice(0, RACE_Q_COUNT)
  const pitQs = shuffle(allPitQuestions).slice(0, PIT_Q_COUNT)

  return {
    screen: 'landing',
    playerName: '',
    department: '',
    raceQuestions: raceQs,
    pitQuestions: pitQs,
    phase: 'race',
    currentIndex: 0,
    correctCount: 0,
    penaltyMs: 0,
    startedAt: null,
    finishedAt: null,
    lapTimeMs: null,
    progress: 0,
    lastAnswerCorrect: null,
  }
}

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_PROFILE'; name: string; department: string }
  | { type: 'START_RACE' }
  | { type: 'BEGIN_LAP' }
  | { type: 'ANSWER_RACE'; option: 0 | 1 }
  | { type: 'ANSWER_PIT'; option: 0 | 1; onTime: boolean }
  | { type: 'TO_RESULT' }
  | { type: 'RESET' }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_PROFILE': {
      return {
        ...state,
        playerName: action.name,
        department: action.department,
      }
    }

    case 'START_RACE': {
      // landing → lights
      return { ...state, screen: 'lights' }
    }

    case 'BEGIN_LAP': {
      // lights → racing; stamp startedAt
      return {
        ...state,
        screen: 'racing',
        startedAt: Date.now(),
        progress: computeProgress('race', 0, state.raceQuestions.length, PIT_Q_COUNT, 'racing'),
      }
    }

    case 'ANSWER_RACE': {
      const question = state.raceQuestions[state.currentIndex]
      if (!question) return state

      const correct = action.option === question.correctIndex
      const penalty = raceAnswerPenalty(correct)
      const nextIndex = state.currentIndex + 1
      const isLastRaceQ = nextIndex >= state.raceQuestions.length

      if (isLastRaceQ) {
        // Transition to pit
        const newState: GameState = {
          ...state,
          correctCount: state.correctCount + (correct ? 1 : 0),
          penaltyMs: state.penaltyMs + penalty,
          lastAnswerCorrect: correct,
          phase: 'pit',
          screen: 'pit',
          currentIndex: 0,
          progress: computeProgress('pit', 0, state.raceQuestions.length, PIT_Q_COUNT, 'pit'),
        }
        return newState
      }

      return {
        ...state,
        correctCount: state.correctCount + (correct ? 1 : 0),
        penaltyMs: state.penaltyMs + penalty,
        lastAnswerCorrect: correct,
        currentIndex: nextIndex,
        progress: computeProgress('race', nextIndex, state.raceQuestions.length, PIT_Q_COUNT, 'racing'),
      }
    }

    case 'ANSWER_PIT': {
      const question = state.pitQuestions[state.currentIndex]
      if (!question) return state

      const correct = action.option === question.correctIndex
      const penalty = pitAnswerPenalty(correct, action.onTime)
      const nextIndex = state.currentIndex + 1
      const isLastPitQ = nextIndex >= PIT_Q_COUNT

      if (isLastPitQ) {
        // Compute finishedAt and lapTimeMs, transition to finish
        const finishedAt = Date.now()
        const startedAt = state.startedAt ?? finishedAt
        const totalPenalty = state.penaltyMs + penalty
        const lapTimeMs = computeLapTimeMs(startedAt, finishedAt, totalPenalty)

        return {
          ...state,
          correctCount: state.correctCount + (correct ? 1 : 0),
          penaltyMs: totalPenalty,
          lastAnswerCorrect: correct,
          currentIndex: nextIndex,
          finishedAt,
          lapTimeMs,
          screen: 'finish',
          progress: 1.0,
        }
      }

      return {
        ...state,
        correctCount: state.correctCount + (correct ? 1 : 0),
        penaltyMs: state.penaltyMs + penalty,
        lastAnswerCorrect: correct,
        currentIndex: nextIndex,
        progress: computeProgress('pit', nextIndex, state.raceQuestions.length, PIT_Q_COUNT, 'pit'),
      }
    }

    case 'TO_RESULT': {
      return { ...state, screen: 'result' }
    }

    case 'RESET': {
      return buildInitialState()
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GameContext = createContext<GameApi | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function GameProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState)

  const setProfile = useCallback(
    (p: { name: string; department: string }) => {
      dispatch({
        type: 'SET_PROFILE',
        name: p.name,
        department: p.department,
      })
    },
    [],
  )

  const startRace = useCallback(() => {
    dispatch({ type: 'START_RACE' })
  }, [])

  const beginLap = useCallback(() => {
    dispatch({ type: 'BEGIN_LAP' })
  }, [])

  const answerRace = useCallback(
    (option: 0 | 1): boolean => {
      const question = state.raceQuestions[state.currentIndex]
      const correct = question ? option === question.correctIndex : false
      dispatch({ type: 'ANSWER_RACE', option })
      return correct
    },
    [state.raceQuestions, state.currentIndex],
  )

  const answerPit = useCallback(
    (option: 0 | 1, onTime: boolean): boolean => {
      const question = state.pitQuestions[state.currentIndex]
      const correct = question ? option === question.correctIndex : false
      dispatch({ type: 'ANSWER_PIT', option, onTime })
      return correct
    },
    [state.pitQuestions, state.currentIndex],
  )

  const toResult = useCallback(() => {
    dispatch({ type: 'TO_RESULT' })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  // Derived values
  const activeQuestions: Question[] =
    state.phase === 'race' ? state.raceQuestions : state.pitQuestions

  const currentQuestion: Question | null =
    activeQuestions[state.currentIndex] ?? null

  const phaseTotal: number = activeQuestions.length

  const api: GameApi = {
    state,
    currentQuestion,
    phaseTotal,
    setProfile,
    startRace,
    beginLap,
    answerRace,
    answerPit,
    toResult,
    reset,
  }

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useGame(): GameApi {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame() must be used inside <GameProvider>')
  }
  return ctx
}

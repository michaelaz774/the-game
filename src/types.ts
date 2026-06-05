// ============================================================================
// SHARED CONTRACT — every agent builds against these types. Do not change
// without updating CONTRACT.md and notifying the integrator (App.tsx owner).
// ============================================================================

export type Phase = 'race' | 'pit'

/** A single trivia question. Exactly two options. */
export interface Question {
  id: string
  phase: Phase
  category: string
  text: string
  options: [string, string] // exactly two
  correctIndex: 0 | 1
  funFact?: string
}

/** Which full-screen view is currently shown. App.tsx switches on this. */
export type GameScreen =
  | 'landing' // QR landing + name entry
  | 'lights' // 5-light F1 start sequence
  | 'racing' // main race sector: car + race questions
  | 'pit' // pit stop: 4 rapid tire-change questions
  | 'finish' // checkered flag + confetti, auto-advances to result
  | 'result' // lap time + leaderboard + share

/** A leaderboard / personal-best record. */
export interface ScoreEntry {
  name: string
  department?: string // captured at sign-in (lead capture for the booth)
  lapTimeMs: number // total lap time INCLUDING penalties
  correct: number
  total: number
  createdAt: number // epoch ms
}

/** Authoritative game state owned by the engine (Agent 1). */
export interface GameState {
  screen: GameScreen
  playerName: string
  department: string // captured on the landing form
  raceQuestions: Question[] // ordered race-sector questions
  pitQuestions: Question[] // exactly 4 pit-stop questions
  phase: Phase // which question list is active
  currentIndex: number // index within the active phase list
  correctCount: number // correct answers so far (race + pit)
  penaltyMs: number // accumulated time penalties
  startedAt: number | null // epoch ms when lap timer started (beginLap)
  finishedAt: number | null // epoch ms when lap completed
  lapTimeMs: number | null // computed final lap time incl penalties
  progress: number // 0..1 car position around the lap (for Track)
  lastAnswerCorrect: boolean | null // for transient answer feedback
}

/** The API exposed by useGame(). Components consume this directly. */
export interface GameApi {
  state: GameState
  /** Current question for the active phase, or null. */
  currentQuestion: Question | null
  /** Total number of questions in the active phase. */
  phaseTotal: number

  /** Capture the player's sign-in details on the landing screen. */
  setProfile(p: { name: string; department: string }): void
  startRace(): void // landing -> lights
  beginLap(): void // lights done -> racing; starts the lap timer
  /** Answer a race question. Returns whether it was correct. Auto-advances; transitions to 'pit' after the last race question. */
  answerRace(option: 0 | 1): boolean
  /** Answer a pit question. `onTime` false adds a fumble penalty. Returns correctness. Auto-advances; transitions to 'finish' after the 4th. */
  answerPit(option: 0 | 1, onTime: boolean): boolean
  toResult(): void // finish -> result
  reset(): void // result/anywhere -> landing (new player)
}

// Tuning constants shared across the game (engine is source of truth).
// Penalties are deliberately large so ACCURACY beats raw speed — a player who
// guesses fast but wrong must not be able to out-rank a slower, more correct one.
export const RACE_PENALTY_MS = 10000 // wrong race answer (+10s)
export const PIT_WRONG_PENALTY_MS = 8000 // wrong tire question (+8s)
export const PIT_SLOW_PENALTY_MS = 5000 // tire question answered too slowly (+5s)
export const PIT_QUESTION_TIME_MS = 4000 // per-tire countdown

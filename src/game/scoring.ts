// scoring.ts — pure penalty/scoring helpers for the Race Engineer game engine

import {
  RACE_PENALTY_MS,
  PIT_WRONG_PENALTY_MS,
  PIT_SLOW_PENALTY_MS,
} from '../types'

/**
 * Returns the penalty in ms to add for a wrong race answer.
 */
export function raceAnswerPenalty(correct: boolean): number {
  return correct ? 0 : RACE_PENALTY_MS
}

/**
 * Returns the penalty in ms to add for a pit stop answer.
 * Wrong answer adds PIT_WRONG_PENALTY_MS.
 * Not on time (slow or timeout) adds PIT_SLOW_PENALTY_MS.
 * Both can stack if wrong AND slow.
 */
export function pitAnswerPenalty(correct: boolean, onTime: boolean): number {
  let penalty = 0
  if (!correct) penalty += PIT_WRONG_PENALTY_MS
  if (!onTime) penalty += PIT_SLOW_PENALTY_MS
  return penalty
}

/**
 * Computes the progress value (0..1) for the car position around the lap.
 *
 * Map:
 *   race sector:  answered k of N race questions → 0..(0.55 * k/N)
 *   pit phase:    flat ~0.6 (car is parked in pit)
 *   finish:       1.0
 */
export function computeProgress(
  phase: 'race' | 'pit',
  currentIndex: number,
  raceTotal: number,
  pitTotal: number,
  screen: string,
): number {
  if (screen === 'finish' || screen === 'result') return 1.0

  if (phase === 'race') {
    // 0..0.55 as race questions are answered
    const fraction = raceTotal > 0 ? currentIndex / raceTotal : 0
    return fraction * 0.55
  }

  // pit phase: car is in pit box, progress holds near 0.6
  // advance slightly within pit (0.6..0.65) based on pit questions answered
  const fraction = pitTotal > 0 ? currentIndex / pitTotal : 0
  return 0.6 + fraction * 0.05
}

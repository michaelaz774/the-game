// timing.ts — pure lap-time helpers for the Race Engineer game engine

/**
 * Formats a lap time in milliseconds to F1 broadcast format: m:ss.mmm
 * e.g. 83456 → "1:23.456"
 */
export function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const millis = ms % 1000

  const ss = String(seconds).padStart(2, '0')
  const mmm = String(millis).padStart(3, '0')

  return `${minutes}:${ss}.${mmm}`
}

/**
 * Computes the final lap time from timestamps and accumulated penalties.
 */
export function computeLapTimeMs(
  startedAt: number,
  finishedAt: number,
  penaltyMs: number,
): number {
  return finishedAt - startedAt + penaltyMs
}

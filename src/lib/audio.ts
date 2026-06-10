// audio.ts — centralized sound playback for the Grand Prix.
// Two cues:
//   • startingLights — the 5-light "beep once per second" start sequence.
//   • music ("Lose My Mind") — loops throughout the lap, stops at the finish.
//
// All playback is triggered after a user gesture (the Landing "start" tap),
// so it satisfies browser autoplay policies.

import startingLightsUrl from '../assets/starting-lights.mp3'
import musicUrl from '../assets/lose-my-mind.mp3'

// ---------------------------------------------------------------------------
// Starting lights
// ---------------------------------------------------------------------------

let lightsEl: HTMLAudioElement | null = null

/** Play the 5-light start beep from the top. */
export function playStartingLights(): void {
  if (!lightsEl) {
    lightsEl = new Audio(startingLightsUrl)
    lightsEl.preload = 'auto'
  }
  lightsEl.currentTime = 0
  void lightsEl.play().catch(() => {})
}

/** Stop the start beep (e.g. on early exit / reset). */
export function stopStartingLights(): void {
  if (!lightsEl) return
  lightsEl.pause()
  lightsEl.currentTime = 0
}

// ---------------------------------------------------------------------------
// Background music ("Lose My Mind") — loops while the player races.
// ---------------------------------------------------------------------------

let musicEl: HTMLAudioElement | null = null

/** Start the looping race music. Idempotent — no-op if already playing. */
export function startMusic(): void {
  if (!musicEl) {
    musicEl = new Audio(musicUrl)
    musicEl.loop = true
    musicEl.preload = 'auto'
  }
  if (!musicEl.paused) return
  void musicEl.play().catch(() => {})
}

/** Stop the race music and rewind to the start. */
export function stopMusic(): void {
  if (!musicEl) return
  musicEl.pause()
  musicEl.currentTime = 0
}

// audio.ts — centralized sound playback for the Grand Prix.
// Two cues:
//   • startingLights — the 5-light "beep once per second" start sequence.
//   • music ("Lose My Mind") — loops throughout the lap, stops at the finish.
//
// prefetchAudio() downloads both files up front (streamed, with byte-accurate
// progress for the loading screen) and hands the finished blobs to the audio
// elements, so playback is instant even on slow expo wifi — nothing is fetched
// on-demand at the moment a cue fires.
//
// All playback is triggered after a user gesture (the Landing "start" tap),
// so it satisfies browser autoplay policies.

import startingLightsUrl from '../assets/starting-lights.mp3'
import musicUrl from '../assets/lose-my-mind.mp3'

// ---------------------------------------------------------------------------
// Lazily-built singletons (one element per cue, reused for the whole session).
// Created without a src; prefetchAudio() assigns a fully-downloaded blob URL.
// playX() falls back to the network URL if it ever runs before prefetch.
// ---------------------------------------------------------------------------

let lightsEl: HTMLAudioElement | null = null
let musicEl: HTMLAudioElement | null = null

function getLights(): HTMLAudioElement {
  if (!lightsEl) {
    lightsEl = new Audio()
    lightsEl.preload = 'auto'
  }
  return lightsEl
}

function getMusic(): HTMLAudioElement {
  if (!musicEl) {
    musicEl = new Audio()
    musicEl.loop = true
    musicEl.preload = 'auto'
  }
  return musicEl
}

// ---------------------------------------------------------------------------
// Prefetch with progress — call once on app start (the loading screen).
// ---------------------------------------------------------------------------

let prefetchPromise: Promise<void> | null = null

/** Stream `url` into a Blob, reporting (bytesReceived, totalBytes) per chunk. */
async function fetchWithProgress(
  url: string,
  onChunk: (received: number, total: number) => void,
): Promise<Blob> {
  const res = await fetch(url)
  const total = Number(res.headers.get('Content-Length')) || 0

  // Streaming unsupported (or no body) — fall back to a plain blob fetch.
  if (!res.body) {
    const blob = await res.blob()
    onChunk(blob.size, blob.size || 1)
    return blob
  }

  const reader = res.body.getReader()
  const chunks: BlobPart[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value as BlobPart)
    received += value.length
    onChunk(received, total)
  }
  return new Blob(chunks)
}

/**
 * Download both audio cues, reporting combined progress as a 0–100 integer.
 * Resolves once both are fully buffered. Idempotent — repeat calls return the
 * same in-flight/settled promise (later callers still get progress updates).
 */
export function prefetchAudio(onProgress?: (pct: number) => void): Promise<void> {
  const sources = [
    { url: startingLightsUrl, assign: (u: string) => { getLights().src = u; getLights().load() } },
    { url: musicUrl, assign: (u: string) => { getMusic().src = u; getMusic().load() } },
  ]

  const received = new Array(sources.length).fill(0)
  const totals = new Array(sources.length).fill(0)

  const report = () => {
    if (!onProgress) return
    const totalAll = totals.reduce((a, b) => a + b, 0)
    const recvAll = received.reduce((a, b) => a + b, 0)
    const pct = totalAll > 0 ? Math.min(100, Math.round((recvAll / totalAll) * 100)) : 0
    onProgress(pct)
  }

  if (!prefetchPromise) {
    prefetchPromise = (async () => {
      await Promise.all(
        sources.map(async (s, i) => {
          const blob = await fetchWithProgress(s.url, (r, t) => {
            received[i] = r
            totals[i] = t
            report()
          })
          s.assign(URL.createObjectURL(blob))
        }),
      )
    })()
  }

  // Ensure the final 100% lands even for callers that joined a settled promise.
  prefetchPromise.then(() => onProgress?.(100)).catch(() => {})
  return prefetchPromise
}

// ---------------------------------------------------------------------------
// Starting lights
// ---------------------------------------------------------------------------

/** Play the 5-light start beep from the top. */
export function playStartingLights(): void {
  const el = getLights()
  if (!el.src) el.src = startingLightsUrl // fallback if prefetch hasn't run
  el.currentTime = 0
  void el.play().catch(() => {})
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

/**
 * "Unlock" the music element for later, timer-driven playback.
 *
 * Call this from inside a user gesture (the Landing GO tap). The race music
 * doesn't actually start until the lights go out, but that transition is
 * timer-driven (no gesture), and browsers reject the *first* play() on an
 * element unless it happens during a gesture. So here we briefly play it muted
 * and immediately pause+rewind: the element is now "blessed" and a later
 * startMusic() will play even without a fresh gesture — without making any
 * sound during the countdown.
 */
export function primeMusic(): void {
  const el = getMusic()
  if (!el.src) el.src = musicUrl // fallback if prefetch hasn't run
  el.muted = true
  void el
    .play()
    .then(() => {
      el.pause()
      el.currentTime = 0
      el.muted = false
    })
    .catch(() => {
      el.muted = false
    })
}

/** Start the looping race music. Idempotent — no-op if already playing. */
export function startMusic(): void {
  const el = getMusic()
  if (!el.src) el.src = musicUrl // fallback if prefetch hasn't run
  el.muted = false
  if (!el.paused) return
  void el.play().catch(() => {})
}

/** Stop the race music and rewind to the start. */
export function stopMusic(): void {
  if (!musicEl) return
  musicEl.pause()
  musicEl.currentTime = 0
}

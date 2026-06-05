# RBC AI Grand Prix — Build Contract

A mobile-first web game. Player scans a QR code, plays on their **own phone**.
A car laps an F1 track while they answer **two-option** trivia questions. Mid-lap
the car pits for **4 rapid-fire "tire change" questions**. At the finish they get a
**lap time** (F1 format `1:23.456`) and a leaderboard position.

**Stack:** React 18 + Vite + TypeScript, plain CSS (CSS variables in `src/theme.css`).
**Everything is bundled & offline-capable.** Assume bad expo wifi.

## Golden rules for every agent
1. Build ONLY the files you own (listed below). Never edit another agent's files,
   `App.tsx`, `theme.css`, or `types.ts`.
2. Import shared types from `../types` (adjust depth). Use the EXACT export names
   and signatures defined here so cross-agent imports resolve.
3. Components consume state via `useGame()` (from `./game/useGame`) — do not invent
   props beyond what's specified. Each screen renders full-bleed; the parent gives
   it `.gp-stage` (mobile width, flex column, relative).
4. Use theme CSS variables (`var(--rbc-blue)`, `var(--f1-red)`, etc.). Mobile-first,
   big tap targets (min 56px tall), no hover-only interactions.
5. Keep it self-contained: no network calls except the optional Supabase adapter,
   which MUST degrade gracefully to local storage when env vars are absent.

## Shared types (`src/types.ts`) — already written
`Question`, `GameScreen`, `ScoreEntry`, `GameState`, `GameApi`, and tuning consts
`RACE_PENALTY_MS`, `PIT_WRONG_PENALTY_MS`, `PIT_SLOW_PENALTY_MS`, `PIT_QUESTION_TIME_MS`.

## Game flow / screens
`landing → lights → racing → pit → finish → result` (see `GameScreen`).

---

## Agent 1 — Race Engineer (game engine + state)
**Owns:** `src/game/useGame.tsx`, `src/game/timing.ts`, `src/game/scoring.ts`
- Export `GameProvider({children}: {children: React.ReactNode}): JSX.Element` and
  `useGame(): GameApi` from `src/game/useGame.tsx`.
- Implements the full `GameApi` (see types.ts). Source the questions from
  `src/data/questions.ts` (`raceQuestions`, `pitQuestions`). On mount/reset, take
  the configured number of race questions (default 6) and exactly 4 pit questions.
- `progress` = fraction of total questions answered, mapped 0..1 around the lap;
  reserve a middle band of the lap for the pit (e.g. race fills 0→0.55, pit holds
  near 0.6, final sector 0.6→1.0 on finish). Keep it monotonic & smooth.
- Timing: `beginLap()` stamps `startedAt`; lap time = `(finishedAt - startedAt) + penaltyMs`.
  Wrong race answer adds `RACE_PENALTY_MS`; wrong pit `PIT_WRONG_PENALTY_MS`; slow
  pit `PIT_SLOW_PENALTY_MS`. Put pure helpers in `timing.ts` (formatLapTime → `m:ss.mmm`)
  and `scoring.ts`.
- On finishing the 4th pit question: compute `lapTimeMs`, set `finishedAt`, screen `finish`.
- `toResult()` → screen `result`. `reset()` → fresh state, screen `landing`,
  reshuffles questions. Export `formatLapTime(ms: number): string` from `timing.ts`.

## Agent 2 — Aero & Animation (track/car/visual sequences)
**Owns:** `src/components/track/Track.tsx`, `src/components/track/LightsOut.tsx`,
`src/components/track/FinishScreen.tsx`, `src/components/track/confetti.ts`,
`src/components/track/track.css`
- `Track(props: { progress: number; phase: 'race' | 'pit' | 'finish' }): JSX.Element`
  — an SVG circuit (RBC-blue car on a dark asphalt track w/ red-white kerbs). The
  car sits at `progress` along the path (use `getPointAtLength`). Show a pit-lane
  spur; when `phase==='pit'` park the car in the pit box. Designed to sit at the
  top portion of the screen above the question card.
- `LightsOut(): JSX.Element` — full-screen 5-red-light sequence (light up 1..5 with
  ~0.8s beats, then all out = GO). On completion call `useGame().beginLap()`.
- `FinishScreen(): JSX.Element` — checkered flag + `fireConfetti()`, big "LAP COMPLETE",
  then after ~2.5s call `useGame().toResult()`.
- `confetti.ts` exports `fireConfetti(): void` (wraps `canvas-confetti`).

## Agent 3 — Quiz UI (question cards + race/pit screens)
**Owns:** `src/components/quiz/QuestionCard.tsx`, `src/components/quiz/RaceScreen.tsx`,
`src/components/pitstop/PitStop.tsx`, `src/components/quiz/quiz.css`
- `QuestionCard(props: { question: Question; onAnswer: (i: 0 | 1) => void;
  disabled?: boolean; feedback?: 'correct' | 'wrong' | null }): JSX.Element` — shows
  category tag, question text, two big stacked option buttons. On tap, flash
  correct/wrong color then call `onAnswer`. Lock input while `disabled`.
- `RaceScreen(): JSX.Element` — imports `Track` (from `../track/Track`) and
  `QuestionCard`. Renders the track up top (phase `'race'`, `progress` from state)
  and the current race question below. Calls `useGame().answerRace(i)`; shows brief
  feedback (+ funFact optional) before the engine advances.
- `PitStop(): JSX.Element` — "PIT STOP — change all 4 tires!" Renders the `Track`
  (phase `'pit'`) and four tire slots. Each pit question has a visible countdown of
  `PIT_QUESTION_TIME_MS`; answering correctly mounts a tire with a satisfying snap.
  Call `useGame().answerPit(i, onTime)` where `onTime` = answered before countdown
  hit 0 (on timeout, auto-submit a wrong answer with `onTime=false`). Fast, punchy, loud visuals.

## Agent 4 — Strategist (question content)
**Owns:** `src/data/questions.ts`
- Export `raceQuestions: Question[]` (~10, phase `'race'`) and `pitQuestions: Question[]`
  (~6, phase `'pit'`, very short/snappy since they're timed). Two options each,
  `correctIndex` 0|1, a `funFact` where fun.
- Theme: ~40% playful general **F1 trivia** (broad appeal), ~60% **AI / data-science**
  literacy framed in F1 metaphors (telemetry→ML, tire-deg prediction→forecasting,
  fraud detection, "human vs AI", AI myth-busting). These double as awareness of what
  an enterprise bank AI division does — keep claims generic, DO NOT fabricate specific
  internal RBC product names. Pit questions = ultra-quick gut-check binaries.
- Add a top-of-file comment block: `// REAL CONTENT GOES HERE — replace freely.`
  so the client can swap real questions in one edit.

## Agent 5 — Pit Wall (landing, result, leaderboard, share, deploy)
**Owns:** `src/components/Landing.tsx`, `src/components/Result.tsx`,
`src/components/leaderboard/Leaderboard.tsx`, `src/lib/storage.ts`,
`src/lib/leaderboard.ts`, `src/lib/supabase.ts`, `src/lib/qr.ts`,
`vercel.json`, `README.md`, `.env.example`
- `Landing(): JSX.Element` — branded "RBC AI Grand Prix" splash, name/initials input
  (≤12 chars), big GO button → `useGame().setName(name); useGame().startRace()`.
- `Result(): JSX.Element` — hero LAP TIME via `formatLapTime` (from `../game/timing`),
  correct/total, a shareable result-card vibe, "RACE AGAIN" (`useGame().reset()`),
  soft "Talk to a data scientist" CTA, and renders `<Leaderboard highlightName=... />`.
  On mount, submit the score via `lib/leaderboard.submitScore`.
- `Leaderboard(props: { highlightName?: string }): JSX.Element` — F1 **timing-tower**
  styling (P1.. with `+0.xxx` gaps), top ~8 from `lib/leaderboard.fetchTopScores`.
- `lib/storage.ts` — localStorage: `saveScore(e: ScoreEntry)`, `getScores(): ScoreEntry[]`,
  `getPersonalBest(): ScoreEntry | null`.
- `lib/leaderboard.ts` — pluggable adapter: `submitScore(e)`, `fetchTopScores(limit)`.
  Uses Supabase when configured (table `scores`), else falls back to `storage.ts`.
- `lib/supabase.ts` — create client from `import.meta.env.VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY`; export `getSupabase()` returning client or `null`.
- `lib/qr.ts` — `generateQrDataUrl(text: string): Promise<string>` via `qrcode`.
- `README.md` — how to run (`npm i && npm run dev`), play on phone via LAN/QR,
  enable Supabase (SQL for `scores` table), and deploy static (`vercel.json` included).
- `.env.example` — the two VITE_SUPABASE_* vars (commented, optional).

---

## Integration note
`App.tsx` (integrator-owned) imports: `./game/useGame`, `./components/Landing`,
`./components/track/LightsOut`, `./components/quiz/RaceScreen`,
`./components/pitstop/PitStop`, `./components/track/FinishScreen`, `./components/Result`.
Honour those paths and export names exactly.

# RBC AI Grand Prix

A mobile-first F1-themed AI trivia game. Players scan a QR code, answer
trivia on their own phone, and get an F1-style lap time on a live leaderboard.

---

## Quick start

```bash
npm install
npm run dev
```

The dev server prints a local URL (`http://localhost:5173`) and a LAN URL
(`http://192.168.x.x:5173`). Attendees join via the **LAN URL** on their phones.

### Show the QR code

Generate a QR pointing to your LAN or deployed URL — paste the URL into any
QR generator, or use the built-in helper:

```ts
import { generateQrDataUrl } from './src/lib/qr'
const dataUrl = await generateQrDataUrl('http://192.168.1.42:5173')
// display in an <img src={dataUrl} /> on a presenter screen
```

---

## Deploy to Vercel (static site)

1. Push the repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com) — framework auto-detected as Vite.
3. Set the two optional environment variables (see below) if you want a shared
   leaderboard.
4. Deploy. The `vercel.json` included handles the SPA rewrite automatically.

```bash
# or via CLI
npx vercel --prod
```

---

## Shared leaderboard with Supabase (optional)

Without Supabase the game works **100% offline** — each device has its own
local leaderboard persisted in `localStorage`. This is the safe default for
unreliable expo wifi.

To enable a live shared leaderboard:

### 1. Create the `scores` table

Run this SQL in the Supabase SQL editor:

```sql
create table if not exists scores (
  id          bigint generated always as identity primary key,
  name        text        not null,
  department  text,
  linkedin    text,
  lap_time_ms integer     not null,
  correct     integer     not null,
  total       integer     not null,
  created_at  timestamptz not null default now()
);

-- Index for fast leaderboard queries
create index on scores (lap_time_ms asc);

-- Enable Row Level Security
alter table scores enable row level security;

-- Allow anonymous inserts (players submit their own score)
create policy "anon insert"
  on scores for insert
  to anon
  with check (true);

-- Allow anyone to read scores (public leaderboard)
create policy "public read"
  on scores for select
  to anon
  using (true);
```

### 2. Add environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

On Vercel add the same two variables under **Settings → Environment Variables**.

The app merges Supabase results with local storage so it always has something
to show — if the network drops mid-event, scores are buffered locally.

---

## Project structure (key files)

```
src/
  components/
    Landing.tsx          # Name entry + GO screen
    Result.tsx           # Lap time result + share card
    leaderboard/
      Leaderboard.tsx    # F1 timing-tower leaderboard
    pitwall.css          # Styles for the above
  lib/
    storage.ts           # localStorage adapter
    leaderboard.ts       # Supabase ↔ local pluggable adapter
    supabase.ts          # Supabase client factory
    qr.ts                # QR code generator
  game/                  # Game engine (Agent 1)
  data/questions.ts      # Trivia content (Agent 4 — swap freely)
vercel.json              # Vercel static SPA config
.env.example             # Environment variable template
```

---

## Customising questions

Open `src/data/questions.ts` — the top comment says `// REAL CONTENT GOES HERE`.
Replace `raceQuestions` and `pitQuestions` arrays with your own content.
Each question needs: `id`, `phase`, `category`, `text`, `options: [string, string]`,
`correctIndex: 0 | 1`, and an optional `funFact`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |

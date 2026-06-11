import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import LeaderboardPage from './components/leaderboard/LeaderboardPage.tsx'
import './theme.css'

// Lightweight path routing — vercel.json rewrites every path to index.html, so
// we pick the root view from the URL. /leaderboard is the standalone live
// timing board (booth display); everything else is the game.
const isLeaderboard =
  window.location.pathname.replace(/\/+$/, '') === '/leaderboard'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isLeaderboard ? <LeaderboardPage /> : <App />}
  </React.StrictMode>,
)

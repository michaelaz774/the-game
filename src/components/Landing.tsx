import { useState } from 'react'
import { useGame } from '../game/useGame'
import './pitwall.css'

export function Landing() {
  const game = useGame()
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')

  const trimmedName = name.trim()
  const trimmedDept = department.trim()
  // Both name and department are required to start.
  const canGo = trimmedName.length > 0 && trimmedDept.length > 0

  function handleGo() {
    if (!canGo) return
    game.setProfile({
      name: trimmedName,
      department: trimmedDept,
    })
    game.startRace()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && canGo) handleGo()
  }

  return (
    <div className="pw-landing">
      {/* Top checkered accent stripe */}
      <div className="pw-landing__stripe" aria-hidden="true" />

      {/* RBC badge */}
      <div className="pw-landing__badge">
        <span className="pw-landing__badge-dot" aria-hidden="true" />
        RBC AI Division
      </div>

      {/* Title */}
      <h1 className="pw-landing__title">
        RBC AI<br />
        <span>Grand Prix</span>
      </h1>

      {/* Tagline */}
      <p className="pw-landing__sub">
        Race the clock on AI &amp; F1 trivia. Every wrong answer adds a time
        penalty — drive clean and set the fastest lap.
      </p>

      {/* Sign-in form */}
      <div className="pw-landing__form">
        <label className="pw-landing__label" htmlFor="driver-name">
          Name <span className="pw-landing__req">*</span>
        </label>
        <input
          id="driver-name"
          className="pw-landing__input"
          type="text"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={28}
          placeholder="e.g. Mike A."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label className="pw-landing__label" htmlFor="driver-dept">
          Department <span className="pw-landing__req">*</span>
        </label>
        <input
          id="driver-dept"
          className="pw-landing__input"
          type="text"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          maxLength={40}
          placeholder="e.g. Capital Markets"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="pw-landing__go"
          disabled={!canGo}
          onClick={handleGo}
          aria-label="Start the race"
        >
          <span>🏁</span>
          GO
        </button>
        <p className="pw-landing__consent">
          Share your details to join the leaderboard and chat with our AI team.
        </p>
      </div>
    </div>
  )
}

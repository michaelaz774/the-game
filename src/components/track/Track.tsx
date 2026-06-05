// Track.tsx — SVG F1 circuit with animated car position
import { useRef, useEffect, useCallback } from 'react'
import './track.css'

interface TrackProps {
  progress: number          // 0..1 along the lap
  phase: 'race' | 'pit' | 'finish'
}

// ─── SVG layout constants ────────────────────────────────────────────────────
// ViewBox: 0 0 320 180 — landscape circuit that fits in a 320×180 box
const VB_W = 320
const VB_H = 180

// The main racing-line path (clockwise F1-style oval-ish circuit)
// Starts at the start/finish straight (right side), goes clockwise.
const RACING_LINE =
  'M 270,120 ' +              // Start/Finish line (right of S/F straight)
  'C 290,120 300,110 300,90 ' + // Hairpin entry (right)
  'C 300,55  280,35  240,30 ' + // Fast right-hander
  'C 200,25  170,22  140,28 ' + // Long left-sweep top
  'C 100,34  70,40   50,60 ' +  // Downhill chicane approach
  'C 30,80   28,100  50,118 ' + // Left hairpin
  'C 70,135  110,140 150,138 ' + // Bottom straight
  'C 190,136 230,130 260,126 ' + // Complex sector
  'C 270,124 275,122 270,120'    // Back to S/F

// Track ribbon is wider — offset from racing line visually via stroke-width
// Outer kerb = even wider; inner kerb = narrower

// Pit lane spur — diverges from the racing line near the S/F straight
const PIT_ENTRY_PATH =
  'M 260,126 C 262,130 262,135 260,142'
const PIT_LANE_PATH =
  'M 260,142 L 200,148 L 150,148 L 100,145'
const PIT_EXIT_PATH =
  'M 100,145 C 80,143 68,138 50,118'

// Car SVG shape — a tiny F1 car viewed from above (~18×10 units)
function CarShape() {
  return (
    <g className="track-car">
      {/* Body */}
      <ellipse cx="0" cy="0" rx="9" ry="4.5" fill="var(--rbc-blue)" />
      {/* Nose cone */}
      <polygon points="9,0 14,-1.5 14,1.5" fill="var(--rbc-blue-deep)" />
      {/* Cockpit */}
      <ellipse cx="1" cy="0" rx="3.5" ry="2.2" fill="var(--rbc-blue-deep)" />
      <ellipse cx="1" cy="0" rx="2" ry="1.3" fill="#0d1a2e" />
      {/* Front wing */}
      <rect x="11" y="-5.5" width="5" height="1.8" rx="0.5" fill="#1a2a50" />
      <rect x="11" y="3.7" width="5" height="1.8" rx="0.5" fill="#1a2a50" />
      {/* Rear wing */}
      <rect x="-10" y="-6" width="5" height="2" rx="0.5" fill="#1a2a50" />
      <rect x="-10" y="4" width="5" height="2" rx="0.5" fill="#1a2a50" />
      {/* Wheels */}
      <ellipse cx="6"  cy="-5.5" rx="2.2" ry="1.5" fill="#0d1118" />
      <ellipse cx="6"  cy="5.5"  rx="2.2" ry="1.5" fill="#0d1118" />
      <ellipse cx="-4" cy="-5.5" rx="2.2" ry="1.5" fill="#0d1118" />
      <ellipse cx="-4" cy="5.5"  rx="2.2" ry="1.5" fill="#0d1118" />
      {/* Halo */}
      <path d="M-1,-2 Q1,-3.5 3,-2" fill="none" stroke="var(--rbc-gold)" strokeWidth="0.8" />
      {/* Speed-line glow on body */}
      <line x1="-7" y1="-1.5" x2="-3" y2="-1.5" stroke="rgba(0,70,173,0.6)" strokeWidth="1" />
      <line x1="-7" y1="1.5"  x2="-3" y2="1.5"  stroke="rgba(0,70,173,0.6)" strokeWidth="1" />
    </g>
  )
}

export function Track({ progress, phase }: TrackProps) {
  const racingPathRef = useRef<SVGPathElement>(null)
  const pitPathRef    = useRef<SVGPathElement>(null)
  const carGroupRef   = useRef<SVGGElement>(null)

  // ── Pit lane combined path for parking ─────────────────────────────────────
  // When phase==='pit' we interpolate the car along the pit-entry + pit-lane path
  const pitFullPath =
    'M 260,126 C 262,130 262,135 260,142 L 200,148 L 150,148 L 100,145'

  const positionCar = useCallback(() => {
    const carEl = carGroupRef.current
    if (!carEl) return

    if (phase === 'pit') {
      // Park car in pit box at roughly the middle of the pit lane
      const pitPath = pitPathRef.current
      if (!pitPath) return
      const pitLen = pitPath.getTotalLength()
      // progress 0→1 maps to pit entry → pit box (middle of pit lane)
      const t      = Math.min(Math.max(progress, 0), 1)
      const dist   = t * pitLen * 0.6 // only travel to ~60% (mid-pit-box)
      const pt     = pitPath.getPointAtLength(dist)
      let angle    = 0
      if (dist > 1) {
        const ptPrev = pitPath.getPointAtLength(Math.max(0, dist - 2))
        angle = Math.atan2(pt.y - ptPrev.y, pt.x - ptPrev.x) * (180 / Math.PI)
      }
      carEl.setAttribute(
        'transform',
        `translate(${pt.x.toFixed(2)},${pt.y.toFixed(2)}) rotate(${angle.toFixed(1)})`
      )
      return
    }

    const racingPath = racingPathRef.current
    if (!racingPath) return
    const totalLen = racingPath.getTotalLength()
    const dist     = Math.min(Math.max(progress, 0), 1) * totalLen
    const pt       = racingPath.getPointAtLength(dist)

    // Tangent angle
    let angle = 0
    if (dist > 1) {
      const ptPrev = racingPath.getPointAtLength(Math.max(0, dist - 3))
      angle = Math.atan2(pt.y - ptPrev.y, pt.x - ptPrev.x) * (180 / Math.PI)
    }

    carEl.setAttribute(
      'transform',
      `translate(${pt.x.toFixed(2)},${pt.y.toFixed(2)}) rotate(${angle.toFixed(1)})`
    )
  }, [progress, phase])

  useEffect(() => {
    positionCar()
  }, [positionCar])

  return (
    <div className="track-wrapper">
      <svg
        className="track-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        aria-label="F1 circuit map"
        role="img"
      >
        {/* ── hidden reference paths for getPointAtLength ── */}
        <path
          ref={racingPathRef}
          className="track-racing-line"
          d={RACING_LINE}
        />
        {/* Combined pit path for positioning */}
        <path
          ref={pitPathRef}
          className="track-racing-line"
          d={pitFullPath}
        />

        {/* ── Outer kerb (widest) ── */}
        <path
          className="track-kerb track-kerb--outer"
          d={RACING_LINE}
          strokeWidth={22}
          fill="none"
        />
        {/* ── Inner kerb ── */}
        <path
          className="track-kerb track-kerb--inner"
          d={RACING_LINE}
          strokeWidth={20}
          fill="none"
          strokeDashoffset={5}
        />

        {/* ── Asphalt ribbon ── */}
        <path
          className="track-ribbon"
          d={RACING_LINE}
          strokeWidth={16}
        />

        {/* ── Pit-lane spur ── */}
        <path className="track-pit-lane" d={PIT_ENTRY_PATH} strokeWidth={6} />
        <path className="track-pit-lane" d={PIT_LANE_PATH}  strokeWidth={6} />
        <path className="track-pit-lane" d={PIT_EXIT_PATH}  strokeWidth={6} />

        {/* Pit box rectangle */}
        <rect
          className="track-pit-box"
          x={145} y={143} width={60} height={10} rx={2}
        />
        <text className="track-pit-label" x={175} y={148}>PIT</text>

        {/* ── Start / Finish line (checkered pattern) ── */}
        {/* S/F is at x≈270, y=120..128 on the main straight */}
        <line
          className="track-sf-line"
          x1={265} y1={112} x2={265} y2={128}
        />
        <line
          className="track-sf-line--black"
          x1={265} y1={112} x2={265} y2={128}
        />
        {/* SF label */}
        <text
          x={263}
          y={108}
          fontSize="5"
          fill="var(--kerb-white)"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          S/F
        </text>

        {/* ── Sector markers ── */}
        {/* Sector 1 indicator — top of circuit */}
        <circle cx={240} cy={30} r={3} fill="none" stroke="var(--rbc-gold)" strokeWidth={1} opacity={0.5} />
        {/* Sector 2 indicator — left hairpin */}
        <circle cx={50}  cy={118} r={3} fill="none" stroke="var(--rbc-gold)" strokeWidth={1} opacity={0.5} />

        {/* ── Car (group positioned by JS) ── */}
        <g ref={carGroupRef} style={{ willChange: 'transform' }}>
          <CarShape />
        </g>
      </svg>
    </div>
  )
}

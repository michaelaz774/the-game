// LightsOut.tsx — F1 5-light start sequence
import { useEffect, useState } from "react";
import { useGame } from "../../game/useGame";
import { playStartingLights, stopStartingLights } from "../../lib/audio";
import "./track.css";

// Synced to the starting-lights beep, which sounds once per second per light.
const LIGHT_DELAY_MS = 1000; // one light (and one beep) per second
const GO_SHOW_MS = 1600; // "GO!" shown for this long before beginLap fires
const TOTAL_LIGHTS = 5;

// Manual sync knob. The audio has a little startup latency + lead-in silence,
// so the first light can flash slightly BEFORE its beep. Increase this to push
// the lights LATER (wait for the beep); decrease (can go negative) to pull them
// EARLIER. Tweak in ~50ms steps until the red light lands on the beep.
const BEEP_OFFSET_MS = 500;

export function LightsOut() {
  const { beginLap } = useGame();

  // How many lights are currently lit (0–5)
  const [lit, setLit] = useState(0);
  // Whether all lights are out (= GO!)
  const [go, setGo] = useState(false);

  useEffect(() => {
    // Kick off the beep sequence in lockstep with the lights.
    playStartingLights();

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Light up 1..5 sequentially, one per beep (light 1 with the first beep).
    for (let i = 1; i <= TOTAL_LIGHTS; i++) {
      timers.push(
        setTimeout(() => setLit(i), BEEP_OFFSET_MS + (i - 1) * LIGHT_DELAY_MS),
      );
    }

    // All out — show GO
    const allOutDelay = BEEP_OFFSET_MS + TOTAL_LIGHTS * LIGHT_DELAY_MS;
    timers.push(
      setTimeout(() => {
        setLit(0);
        setGo(true);
      }, allOutDelay),
    );

    // Begin lap and advance screen
    timers.push(
      setTimeout(() => {
        beginLap();
      }, allOutDelay + GO_SHOW_MS),
    );

    return () => {
      timers.forEach(clearTimeout);
      stopStartingLights();
    };
  }, [beginLap]);

  return (
    <div
      className="lights-out"
      role="status"
      aria-live="polite"
      aria-label="Race start sequence"
    >
      {/* ── Gantry ── */}
      <div className="lights-out__gantry" aria-hidden="true">
        {Array.from({ length: TOTAL_LIGHTS }, (_, i) => (
          <div key={i} className="lights-out__panel">
            <div
              className={`lights-out__light${lit > i ? " lights-out__light--on" : ""}`}
            />
          </div>
        ))}
      </div>

      {/* ── GO flash ── */}
      {go && (
        <div className="lights-out__go" aria-label="Go!">
          GO!
        </div>
      )}

      {/* ── Supporting text ── */}
      {!go && (
        <>
          <p className="lights-out__label">
            {lit === 0 ? "READY" : `LIGHT ${lit} / ${TOTAL_LIGHTS}`}
          </p>
          <p className="lights-out__subtitle">RBC AI GRAND PRIX</p>
        </>
      )}
    </div>
  );
}

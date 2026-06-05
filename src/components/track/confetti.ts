// confetti.ts — wraps canvas-confetti with RBC / F1 brand colours
import confetti from 'canvas-confetti'

export function fireConfetti(): void {
  const colors = ['#0046ad', '#fedf01', '#e10600', '#ffffff', '#003087']

  // First burst — wide fan from centre-top
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { x: 0.5, y: 0.15 },
    colors,
    startVelocity: 55,
    gravity: 0.9,
    ticks: 220,
  })

  // Left-side cannon
  confetti({
    particleCount: 60,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.5 },
    colors,
    startVelocity: 45,
    gravity: 0.85,
    ticks: 200,
  })

  // Right-side cannon
  confetti({
    particleCount: 60,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.5 },
    colors,
    startVelocity: 45,
    gravity: 0.85,
    ticks: 200,
  })

  // Delayed second burst
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { x: 0.5, y: 0.1 },
      colors,
      startVelocity: 50,
      gravity: 0.8,
      ticks: 240,
    })
  }, 600)
}

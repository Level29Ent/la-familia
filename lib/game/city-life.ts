// Shared by moving traffic and signal lamps. One 24-second cycle, with clearance.
export function trafficSignal(seconds: number): 'green' | 'amber' | 'red' {
  const phase = ((seconds % 24) + 24) % 24
  return phase < 10 ? 'green' : phase < 12 ? 'amber' : 'red'
}
export function trafficPosition(
  z: number,
  reverse: boolean,
  dt: number,
  seconds: number,
  speed: number,
) {
  const direction = reverse ? 1 : -1
  const distance = Math.max(0, Math.min(dt, 0.1)) * speed
  const stop = [-18, -54, -90]
    .map((crossing) => crossing - direction * 5)
    .find((line) => (line - z) * direction >= 0 && (line - z) * direction <= distance + 0.05)
  if (stop !== undefined && trafficSignal(seconds) !== 'green') return stop
  const next = z + distance * direction
  return next > 25 ? -97 : next < -97 ? 25 : next
}

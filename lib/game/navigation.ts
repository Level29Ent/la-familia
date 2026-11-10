export type Bounds = { minX: number; maxX: number; minZ: number; maxZ: number }
export type Obstacle = Bounds
export type Navigation = {
  start: [number, number, number]
  yaw: number
  bounds: Bounds
  obstacles: Obstacle[]
  targets: { id: string; door: [number, number] }[]
  focusRange: number
  speed: number
}

export const ROOM_NAVIGATION: Navigation = {
  start: [0, 1.7, 4.5],
  yaw: 0,
  bounds: { minX: -6.5, maxX: 6.5, minZ: -6.5, maxZ: 6.5 },
  // Furniture and vault footprints include the player's clearance radius.
  obstacles: [
    { minX: -6.5, maxX: -3.4, minZ: -2.4, maxZ: 2.4 },
    { minX: -3.5, maxX: -1.3, minZ: -1.6, maxZ: 1.6 },
    { minX: 1.8, maxX: 5.8, minZ: 0.8, maxZ: 3.2 },
    { minX: -2.3, maxX: 2.3, minZ: -6.5, maxZ: -4.8 },
  ],
  targets: [
    { id: 'vault', door: [0, -5.1] },
    { id: 'exit', door: [0, 6.7] },
  ],
  focusRange: 3.8,
  speed: 3,
}

export function moveWithin(position: { x: number; z: number }, dx: number, dz: number, nav: Navigation) {
  const { bounds, obstacles } = nav
  const clear = (x: number, z: number) =>
    !obstacles.some((o) => x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ)
  const x = Math.max(bounds.minX, Math.min(bounds.maxX, position.x + dx))
  const nextX = clear(x, position.z) ? x : position.x
  const z = Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z + dz))
  return { x: nextX, z: clear(nextX, z) ? z : position.z }
}

export function focusedTarget(position: { x: number; z: number }, yaw: number, nav: Navigation) {
  let best: string | null = null
  let score = Infinity
  for (const target of nav.targets) {
    const dx = target.door[0] - position.x
    const dz = target.door[1] - position.z
    const dist = Math.hypot(dx, dz)
    if (dist > nav.focusRange) continue
    const facing = dist < 0.01 ? 1 : (dx * -Math.sin(yaw) + dz * -Math.cos(yaw)) / dist
    if (facing < 0.35) continue
    const next = dist * (1.6 - facing)
    if (next < score) {
      best = target.id
      score = next
    }
  }
  return best
}

// Keep the orbit camera on the walkable side of walls and furniture.
export function followCamera(
  position: { x: number; z: number },
  yaw: number,
  pitch: number,
  distance: number,
  nav: Navigation,
) {
  let allowed = 0.35
  for (let d = 0.35; d <= distance; d += 0.1) {
    const x = position.x + Math.sin(yaw) * d
    const z = position.z + Math.cos(yaw) * d
    if (
      x < nav.bounds.minX ||
      x > nav.bounds.maxX ||
      z < nav.bounds.minZ ||
      z > nav.bounds.maxZ ||
      nav.obstacles.some((o) => x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ)
    )
      break
    allowed = d
  }
  return {
    x: position.x + Math.sin(yaw) * allowed,
    z: position.z + Math.cos(yaw) * allowed,
    y: Math.min(3.9, 1.65 + Math.tan(pitch) * allowed),
  }
}

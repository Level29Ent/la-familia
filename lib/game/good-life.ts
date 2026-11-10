import type { Bounds } from './navigation'

export const ASSET_LOCATIONS: Record<string, string> = {
  watch: 'Gold watch and chain on your character; display case on the safe-house desk.',
  wardrobe: 'A bespoke clothing rail and shoe display in the safe house; a gold lapel pin on your character.',
  sedan:
    'Drive your midnight-blue sedan from the street: use Drive sedan, or E when beside it. W/S accelerate and reverse; A/D steer; Space brakes; E exits.',
  penthouse:
    'Your illuminated Bellini penthouse tower overlooks the street; its framed deed hangs in the safe house.',
  art: 'A permanent collection of framed paintings on the safe-house walls, separate from Decor Shop accents.',
  yacht:
    'Your moored family yacht appears at the waterfront beside City Hall; a model sits on your safe-house desk. Display only, not sailable.',
}
export type CarPose = { x: number; z: number; yaw: number; speed: number }
export const SEDAN_START: CarPose = { x: -3.4, z: 7, yaw: Math.PI, speed: 0 }
export const PARKED_CARS = [-3, -35, -73].map((z) => ({ minX: 2.7, maxX: 6.2, minZ: z - 3, maxZ: z + 3 }))
export function driveCar(
  car: CarPose,
  throttle: number,
  steering: number,
  brake: boolean,
  dt: number,
  bounds: Bounds,
): CarPose {
  const step = Math.max(0, Math.min(dt, 0.05))
  let speed = car.speed + throttle * 9 * step
  speed *= Math.exp(-(brake ? 12 : throttle === 0 ? 2.2 : 0.35) * step)
  speed = Math.max(-5, Math.min(16, speed))
  if (Math.abs(speed) < 0.02) speed = 0
  const yaw = car.yaw - steering * 1.5 * step * Math.min(1, Math.abs(speed) / 3) * Math.sign(speed)
  const x = car.x + Math.sin(yaw) * speed * step
  const z = car.z + Math.cos(yaw) * speed * step
  const blocked =
    x < bounds.minX + 2 ||
    x > bounds.maxX - 2 ||
    z < bounds.minZ + 2 ||
    z > bounds.maxZ - 2 ||
    PARKED_CARS.some((o) => x > o.minX && x < o.maxX && z > o.minZ && z < o.maxZ)
  return blocked ? { ...car, yaw, speed: 0 } : { x, z, yaw, speed }
}
export function carExit(car: CarPose, bounds: Bounds) {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, car.x - Math.cos(car.yaw) * 1.7)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, car.z + Math.sin(car.yaw) * 1.7)),
  }
}

export function goodLifeRoomNavigation(assets: string[], room: import('./navigation').Navigation) {
  return assets.includes('wardrobe')
    ? { ...room, obstacles: [...room.obstacles, { minX: -6.5, maxX: -5.7, minZ: 2.7, maxZ: 6.1 }] }
    : room
}

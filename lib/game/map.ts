import { CITY_BUILDINGS, CITY_BOUNDS } from './city'
export type MapPosition = { x: number; z: number; yaw?: number }
export type MapFilter = 'all' | 'business' | 'home' | 'headquarters' | 'safehouse'
export function mapPoint(position: MapPosition) {
  return {
    x: Math.max(CITY_BOUNDS.minX, Math.min(CITY_BOUNDS.maxX, position.x)),
    y: -Math.max(CITY_BOUNDS.minZ, Math.min(CITY_BOUNDS.maxZ, position.z)),
  }
}
export function nearestAddress(position: MapPosition) {
  return CITY_BUILDINGS.reduce(
    (best, b) =>
      Math.hypot(position.x - b.door[0], position.z - b.door[1]) <
      Math.hypot(position.x - best.door[0], position.z - best.door[1])
        ? b
        : best,
    CITY_BUILDINGS[0],
  )
}
export function mapBuildings(filter: MapFilter, search: string) {
  const term = search.trim().toLocaleLowerCase()
  return CITY_BUILDINGS.filter(
    (b) =>
      (filter === 'all' || b.kind === filter) && `${b.name} ${b.district}`.toLocaleLowerCase().includes(term),
  )
}

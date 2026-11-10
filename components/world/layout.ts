import type { Navigation } from '@/lib/game/navigation'
import { BUSINESSES } from '@/lib/game/config'

export type BuildingStyle = {
  wall: string
  trim: string
  neon: string
  height: number
  width: number
  depth: number
}

export const BUILDING_STYLES: Record<string, BuildingStyle> = {
  hustle: { wall: '#5a3a2e', trim: '#2a1c17', neon: '#f5c451', height: 8, width: 9, depth: 8 },
  numbers: { wall: '#3d4a3a', trim: '#1e261d', neon: '#7ee0a1', height: 10, width: 10, depth: 8 },
  speakeasy: { wall: '#4a2c2c', trim: '#241414', neon: '#ff6b5b', height: 11, width: 10, depth: 8 },
  protection: { wall: '#3a3f4a', trim: '#1b1e24', neon: '#8fb8ff', height: 12, width: 10, depth: 8 },
  chopshop: { wall: '#4b4237', trim: '#231f1a', neon: '#ffa94d', height: 9, width: 11, depth: 8 },
  casino: { wall: '#2f2a3d', trim: '#17141f', neon: '#e879f9', height: 16, width: 11, depth: 8 },
  docks: { wall: '#2e3a40', trim: '#151c20', neon: '#67e8f9', height: 10, width: 11, depth: 8 },
  nightclub: { wall: '#3b2333', trim: '#1c1018', neon: '#ff4fa3', height: 18, width: 11, depth: 8 },
  bakery: { wall: '#72503b', trim: '#30231b', neon: '#ffd59b', height: 9, width: 10, depth: 8 },
  tailor: { wall: '#304c4b', trim: '#152b2a', neon: '#8de3d5', height: 12, width: 10, depth: 8 },
  pawn: { wall: '#514630', trim: '#292217', neon: '#e6ce79', height: 10, width: 10, depth: 8 },
  cinema: { wall: '#4b2939', trim: '#25121c', neon: '#ff8cb1', height: 17, width: 12, depth: 8 },
  hotel: { wall: '#38465b', trim: '#1b2533', neon: '#9ebfff', height: 24, width: 12, depth: 8 },
  cityhall: { wall: '#7d776c', trim: '#4a463f', neon: '#f5d98a', height: 20, width: 18, depth: 10 },
}

export type Placement = {
  id: string
  position: [number, number, number]
  rotationY: number
  door: [number, number]
}

export const STREET_HALF_WIDTH = 7
export const SPACING = 7

export const PLACEMENTS: Placement[] = BUSINESSES.map((b, i) => {
  const style = BUILDING_STYLES[b.id]
  if (b.id === 'cityhall') {
    const z = -(BUSINESSES.length - 1) * SPACING - 12
    return { id: b.id, position: [0, 0, z], rotationY: 0, door: [0, z + style.depth / 2] }
  }
  const side = i % 2 === 0 ? -1 : 1
  const x = side * (STREET_HALF_WIDTH + style.depth / 2)
  const z = -i * SPACING
  return {
    id: b.id,
    position: [x, 0, z],
    rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
    door: [side * STREET_HALF_WIDTH, z],
  }
})

const cityHall = PLACEMENTS[PLACEMENTS.length - 1]

export const PLAYER_BOUNDS = {
  minX: -STREET_HALF_WIDTH + 0.7,
  maxX: STREET_HALF_WIDTH - 0.7,
  minZ: cityHall.door[1] + 1.2,
  maxZ: 14,
}

export const PLAYER_START: [number, number, number] = [0, 1.7, 11]

export const SAFE_HOUSE_PLACEMENT: Placement = {
  id: 'safehouse',
  position: [11, 0, 10],
  rotationY: -Math.PI / 2,
  door: [7, 10],
}
export const SAFE_HOUSE_STYLE: BuildingStyle = {
  wall: '#43554d',
  trim: '#1d302a',
  neon: '#bfe6c4',
  height: 10,
  width: 10,
  depth: 8,
}
export const INTERACTION_PLACEMENTS = [...PLACEMENTS, SAFE_HOUSE_PLACEMENT]

export const STREET_NAVIGATION: Navigation = {
  start: PLAYER_START,
  yaw: 0,
  bounds: PLAYER_BOUNDS,
  obstacles: [],
  targets: INTERACTION_PLACEMENTS,
  focusRange: 9,
  speed: 6,
}
export const STREET_RETURN_NAVIGATION: Navigation = {
  ...STREET_NAVIGATION,
  start: [5, 1.7, 10],
  yaw: Math.PI / 2,
}

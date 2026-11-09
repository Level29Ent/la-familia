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

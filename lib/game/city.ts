import { BUSINESSES, EASTSIDE_BUSINESSES, MARKET_BUSINESSES } from './config'
import type { Navigation, Obstacle } from './navigation'

export const FAMILIES = [
  {
    id: 'moretti',
    name: 'Moretti Family',
    district: 'Little Italy',
    color: '#d16b64',
    strength: 8,
    reward: 60,
  },
  {
    id: 'volkov',
    name: 'Volkov Syndicate',
    district: 'Market Ward',
    color: '#7ea7dc',
    strength: 20,
    reward: 180,
  },
  {
    id: 'doyle',
    name: 'Doyle Outfit',
    district: 'Harbor Quarter',
    color: '#87b984',
    strength: 36,
    reward: 420,
  },
] as const
export type BuildingKind = 'business' | 'home' | 'headquarters' | 'safehouse'
export type CityBuilding = {
  id: string
  name: string
  kind: BuildingKind
  district: string
  family?: string
  theme: 'shop' | 'bar' | 'workshop' | 'office' | 'home'
  position: [number, number, number]
  rotationY: number
  door: [number, number]
  color: string
  height: number
  width: number
  depth: number
}
export const AVENUES = [-36, 0, 36, 72, 108, 144, 180]
export const CROSS_STREETS = [18, -18, -54, -90]
const homes = [
  'Rosa Apartments',
  'Mulberry Brownstone',
  'Garden Court',
  'Orchard House',
  'Mariner Flats',
  'Union Tenement',
  'Cedar Residence',
  'Mercer Row',
  'Canal Apartments',
  'Pearl House',
  'Dockside Rooms',
  'Willow Townhouse',
  'Liberty Court',
  'Harbor View',
]
const district = ['Little Italy', 'Market Ward', 'Harbor Quarter']
const inventory = [
  ...BUSINESSES.filter((b) => !EASTSIDE_BUSINESSES.some((e) => e.id === b.id) && !MARKET_BUSINESSES.some(e => e.id === b.id)).map((b) => ({ id: b.id, name: b.name, kind: 'business' as const })),
  { id: 'safehouse', name: 'Family Safe House', kind: 'safehouse' as const },
  ...FAMILIES.map((f) => ({
    id: `hq-${f.id}`,
    name: `${f.name} Social Club`,
    kind: 'headquarters' as const,
  })),
  ...homes.map((name, i) => ({ id: `home-${i + 1}`, name, kind: 'home' as const })),
]
// Keep each family's social club in its home district.
const catalog = Array.from({ length: 36 }, (_, index) => {
  const special =
    index === 1
      ? 'safehouse'
      : index === 3
        ? 'hq-moretti'
        : index === 15
          ? 'hq-volkov'
          : index === 31
            ? 'hq-doyle'
            : null
  const slot = special
    ? inventory.findIndex((b) => b.id === special)
    : inventory.findIndex((b) => b.kind !== 'safehouse' && b.kind !== 'headquarters')
  return inventory.splice(slot, 1)[0]
})
// Append Eastside without moving any of the original 36 addresses.
catalog.push(
  ...EASTSIDE_BUSINESSES.map((b) => ({ id: b.id, name: b.name, kind: 'business' as const })),
  ...['Riverside Terrace', 'Eastgate Apartments', 'Foundry House', 'Station Row'].map((name, i) => ({ id: `home-${15 + i}`, name, kind: 'home' as const })),
)
catalog.push(...['Olive Terrace', 'Grand Central Apartments', 'Saint James Court', 'Prospect Towers', 'Maple Cottage', 'Riverton Apartments', 'Crown Heights', 'Parkside Apartments', 'Birch Row', 'Regent Apartments', 'Westbrook House', 'Sky Garden Apartments'].map((name, i) => ({ id: `home-${19+i}`, name, kind: 'home' as const })))
catalog.push(...MARKET_BUSINESSES.map(b => ({ id: b.id, name: b.name, kind: 'business' as const })))
// Four buildings per block; Eastside extends the original grid one column east.
export const CITY_BUILDINGS: CityBuilding[] = catalog.map((item, i) => {
  const block = Math.floor(i / 4),
    slot = i % 4
  const row = i < 36 ? Math.floor(block / 3) : Math.floor(((i - 36) % 12) / 4),
    column = i < 36 ? block % 3 : i < 48 ? 3 : i < 60 ? 4 : 5
  const x = -18 + column * 36 + (slot % 2 ? 8 : -8)
  const z = -row * 36 + (slot < 2 ? 8 : -8)
  const south = slot < 2
  const family = item.kind === 'headquarters' ? item.id.slice(3) : undefined
  const theme =
    item.kind === 'home' || item.kind === 'safehouse'
      ? 'home'
      : /speakeasy|casino|nightclub|diner|jazz/.test(item.id)
        ? 'bar'
        : /chopshop|laundry|printing|garage|warehouse/.test(item.id)
          ? 'workshop'
          : item.kind === 'headquarters' || /hotel|cityhall|protection|radio|taxidepot/.test(item.id)
            ? 'office'
            : 'shop'
  return {
    ...item,
    family,
    theme,
    district: i < 36 ? district[row] : i < 48 ? 'Eastside' : 'Garden Heights',
    position: [x, 0, z],
    rotationY: south ? 0 : Math.PI,
    door: [x, z + (south ? 6 : -6)],
    color: ['#735745', '#5f7276', '#756657', '#775551'][i % 4],
    height: /Apartments|Towers/.test(item.name) ? 25 + (i % 3) * 5 : item.kind === 'home' ? 10 + (i % 3) * 3 : 9 + (i % 4) * 3,
    width: 10,
    depth: 9,
  }
})
export const CITY_BOUNDS = { minX: -43, maxX: 187, minZ: -97, maxZ: 25 }
export const CITY_OBSTACLES: Obstacle[] = CITY_BUILDINGS.map((b) => ({
  minX: b.position[0] - b.width / 2 - 0.45,
  maxX: b.position[0] + b.width / 2 + 0.45,
  minZ: b.position[2] - b.depth / 2 - 0.45,
  maxZ: b.position[2] + b.depth / 2 + 0.45,
}))
export const CITY_NAVIGATION: Navigation = {
  start: [-26, 1.7, 20],
  yaw: 0,
  bounds: CITY_BOUNDS,
  obstacles: CITY_OBSTACLES,
  targets: CITY_BUILDINGS,
  focusRange: 5.5,
  speed: 6,
}
export function outsideBuilding(id: string): Navigation {
  const b = CITY_BUILDINGS.find((b) => b.id === id)
  if (!b) return CITY_NAVIGATION
  const south = b.rotationY === 0
  return {
    ...CITY_NAVIGATION,
    start: [b.door[0], 1.7, b.door[1] + (south ? 1.5 : -1.5)],
    yaw: south ? 0 : Math.PI,
  }
}
export const INTERIOR_NAVIGATION: Navigation = {
  start: [0, 1.7, 4.5],
  yaw: 0,
  bounds: { minX: -6.4, maxX: 6.4, minZ: -6.4, maxZ: 6.4 },
  obstacles: [
    { minX: -6.4, maxX: -3, minZ: -4.9, maxZ: 2 },
    { minX: 3, maxX: 6.4, minZ: -4.9, maxZ: 2 },
    { minX: -2.8, maxX: 2.8, minZ: -5.2, maxZ: -2.7 },
  ],
  targets: [{ id: 'exit', door: [0, 6.6] }],
  focusRange: 4,
  speed: 3.5,
}
export function patrolPosition(index: number, seconds: number): [number, number] {
  const row = Math.floor(index / 4),
    lane = index % 4
  const x0 = -32 + lane * 26,
    z0 = 21 - row * 36
  const t = (((seconds * 1.1 + index * 7) % 40) + 40) % 40
  return t < 20 ? [x0 + t, z0] : [x0 + 40 - t, z0]
}

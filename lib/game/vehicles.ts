import type { GameState } from './engine'

export const VEHICLES = [
  {
    id: 'sedan',
    name: 'Armored Sedan',
    kind: 'sedan',
    cost: 25000,
    color: '#213f68',
    speed: 16,
    acceleration: 9,
    steering: 1.5,
  },
  {
    id: 'taxi',
    name: 'Yellow Cab',
    kind: 'taxi',
    cost: 600,
    color: '#e4b438',
    speed: 15,
    acceleration: 10,
    steering: 1.7,
  },
  {
    id: 'pickup',
    name: 'Delivery Pickup',
    kind: 'pickup',
    cost: 1400,
    color: '#65826c',
    speed: 13,
    acceleration: 8,
    steering: 1.35,
  },
  {
    id: 'roadster',
    name: 'Crimson Roadster',
    kind: 'roadster',
    cost: 4500,
    color: '#a63e3b',
    speed: 21,
    acceleration: 13,
    steering: 1.9,
  },
  {
    id: 'van',
    name: 'Panel Delivery Van',
    kind: 'van',
    cost: 2800,
    color: '#d3c8ac',
    speed: 12,
    acceleration: 7,
    steering: 1.2,
  },
] as const
export type VehicleId = (typeof VEHICLES)[number]['id']
export type VehicleKind = (typeof VEHICLES)[number]['kind']
export type FleetState = { owned: VehicleId[]; selected: VehicleId | null }
export type FleetAction = { type: 'vehicleBuy' | 'vehicleSelect'; id: string }
export const initialFleet = (): FleetState => ({ owned: [], selected: null })
export function restoreFleet(saved: Partial<FleetState> | undefined, assets: string[]): FleetState {
  const owned = VEHICLES.filter((v) =>
    v.id === 'sedan' ? assets.includes('sedan') : Array.isArray(saved?.owned) && saved.owned.includes(v.id),
  ).map((v) => v.id)
  const selected = owned.find((id) => id === saved?.selected) ?? owned[0] ?? null
  return { owned, selected }
}
export function activeVehicle(state: GameState) {
  const fleet = restoreFleet(state.fleet, state.assets)
  return VEHICLES.find((v) => v.id === fleet.selected) ?? null
}
export function fleetAction(state: GameState, action: FleetAction): GameState {
  const vehicle = VEHICLES.find((v) => v.id === action.id)
  if (!vehicle) return state
  const fleet = restoreFleet(state.fleet, state.assets)
  if (action.type === 'vehicleSelect') {
    if (!fleet.owned.includes(vehicle.id)) return state
    return { ...state, fleet: { ...fleet, selected: vehicle.id } }
  }
  if (fleet.owned.includes(vehicle.id) || state.cash < vehicle.cost) return state
  return {
    ...state,
    cash: state.cash - vehicle.cost,
    assets: vehicle.id === 'sedan' ? [...state.assets, 'sedan'] : state.assets,
    fleet: { owned: [...fleet.owned, vehicle.id], selected: vehicle.id },
  }
}
export const PARKED_VEHICLES: { x: number; z: number; kind: VehicleKind; color: string }[] = [
  { x: -33, z: 7, kind: 'sedan', color: '#274743' },
  { x: 39, z: -29, kind: 'taxi', color: '#e4b438' },
  { x: 69, z: -67, kind: 'pickup', color: '#354861' },
  { x: 75, z: 4, kind: 'roadster', color: '#a63e3b' },
  { x: 105, z: -32, kind: 'van', color: '#d3c8ac' },
  { x: 111, z: -71, kind: 'taxi', color: '#e4b438' },
]

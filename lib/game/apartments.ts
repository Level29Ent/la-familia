import type { GameState } from './engine'
import { CITY_BUILDINGS } from './city'

export const APARTMENT_BUILDINGS = CITY_BUILDINGS.filter(
  (b) => b.kind === 'home' && /Apartments|Flats|Rooms|Towers/.test(b.name),
)
export const SUITE_TYPES = [
  { name: 'Courtyard studio', number: '101', price: 450, rent: 35, color: '#77988a' },
  { name: 'Family one-bedroom', number: '202', price: 700, rent: 55, color: '#b79068' },
  { name: 'Skyline penthouse', number: '303', price: 1100, rent: 85, color: '#7d88a9' },
] as const
export const SUITES = APARTMENT_BUILDINGS.flatMap((b, index) =>
  SUITE_TYPES.map((suite, type) => ({
    ...suite,
    id: `${b.id}:${suite.number}`,
    buildingId: b.id,
    type,
    price: suite.price + index * 175,
  })),
)
export const TENANTS = [
  {
    id: 'resident',
    name: 'Local professional',
    description: 'Standard rent · 8 condition wear per payment',
    multiplier: 1,
    wear: 8,
    level: 0,
  },
  {
    id: 'family',
    name: 'Neighborhood family',
    description: '85% rent · gentle 5 condition wear per payment',
    multiplier: 0.85,
    wear: 5,
    level: 0,
  },
  {
    id: 'executive',
    name: 'Visiting executive',
    description: '160% rent · 12 condition wear · renovated suite required',
    multiplier: 1.6,
    wear: 12,
    level: 1,
  },
] as const
export type TenantId = (typeof TENANTS)[number]['id']
export type SuiteState = {
  id: string
  level: number
  condition: number
  tenant: TenantId | null
  leaseMs: number
  rentMs: number
  repairMs: number
  earned: number
  visited: boolean
}
export type ApartmentState = { suites: SuiteState[]; log: string[]; payments: number }
export type ApartmentAction =
  | { type: 'suiteBuy' | 'suiteRenovate' | 'suiteRepair'; id: string }
  | { type: 'suiteVisit'; id: string; location: string }
  | { type: 'suiteLease'; id: string; tenant: string }
export const initialApartments = (): ApartmentState => ({
  suites: [],
  log: ['Buy a suite, choose a tenant, and build a rental portfolio.'],
  payments: 0,
})
const number = (n: unknown, fallback: number, max: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : fallback
export function restoreApartments(saved?: Partial<ApartmentState>): ApartmentState {
  if (!saved || typeof saved !== 'object') return initialApartments()
  const source = Array.isArray(saved.suites) ? saved.suites : []
  return {
    suites: SUITES.flatMap((config) => {
      const s = source.find((s) => s?.id === config.id)
      if (!s) return []
      const level = Math.floor(number(s.level, 0, 2))
      const leaseMs = number(s.leaseMs, 0, 300000)
      const tenant =
        TENANTS.find((t) => t.id === s.tenant && t.level <= level && leaseMs > 0)?.id ?? null
      return [
        {
          id: config.id,
          level,
          condition: number(s.condition, 100, 100),
          tenant,
          leaseMs: tenant ? leaseMs : 0,
          rentMs: tenant ? Math.max(1, number(s.rentMs, 60000, 60000)) : 60000,
          repairMs: number(s.repairMs, 0, 15000),
          earned: number(s.earned, 0, 1e15),
          visited: tenant ? s.visited === true : false,
        },
      ]
    }),
    payments: Math.floor(number(saved.payments, 0, 1e9)),
    log: Array.isArray(saved.log)
      ? saved.log
          .filter((s): s is string => typeof s === 'string')
          .slice(0, 8)
          .map((s) => s.slice(0, 200))
      : initialApartments().log,
  }
}
const suiteAddress = (id: string) => {
  const suite = SUITES.find((s) => s.id === id)!
  return `${APARTMENT_BUILDINGS.find((b) => b.id === suite.buildingId)?.name} · Suite ${suite.number}`
}
export function suiteRent(s: SuiteState, tenant = s.tenant) {
  const config = SUITES.find((c) => c.id === s.id)
  const offer = TENANTS.find((t) => t.id === tenant)
  return config && offer ? Math.floor(config.rent * (1 + s.level * 0.4) * offer.multiplier) : 0
}
export const renovationCost = (s: SuiteState) => 200 * (s.level + 1)
export const repairCost = (s: SuiteState) => 20 + Math.ceil((100 - s.condition) * 1.2)
const record = (p: ApartmentState, message: string) => ({
  ...p,
  log: [message, ...p.log].slice(0, 8),
})
export function apartmentAction(state: GameState, a: ApartmentAction): GameState {
  if (state.dynasty.jailMs) return state
  const config = SUITES.find((s) => s.id === a.id)
  if (!config) return state
  const portfolio = state.apartments
  const current = portfolio.suites.find((s) => s.id === a.id)
  if (a.type === 'suiteBuy') {
    if (current || state.cash < config.price) return state
    return {
      ...state,
      cash: state.cash - config.price,
      apartments: record(
        {
          ...portfolio,
          suites: [
            ...portfolio.suites,
            {
              id: a.id,
              level: 0,
              condition: 100,
              tenant: null,
              leaseMs: 0,
              rentMs: 60000,
              repairMs: 0,
              earned: 0,
              visited: false,
            },
          ],
        },
        `Purchased suite ${config.number} at ${APARTMENT_BUILDINGS.find((b) => b.id === config.buildingId)?.name}.`,
      ),
    }
  }
  if (!current || current.repairMs) return state
  let next = { ...current },
    cost = 0,
    message = ''
  if (a.type === 'suiteVisit') {
    if (
      a.location !== config.buildingId ||
      !current.tenant ||
      current.visited ||
      current.condition > 85
    )
      return state
    cost = 10
    next = { ...next, visited: true, condition: Math.min(100, current.condition + 15) }
    message = `${suiteAddress(config.id)}: tenant request completed on site. Condition +15.`
  } else if (a.type === 'suiteLease') {
    const tenant = TENANTS.find((t) => t.id === a.tenant)
    if (!tenant || current.tenant || current.condition < 60 || current.level < tenant.level)
      return state
    next = { ...next, tenant: tenant.id, leaseMs: 300000, rentMs: 60000, visited: false }
    message = `${suiteAddress(config.id)}: ${tenant.name} signed a five-minute active-play lease.`
  } else if (a.type === 'suiteRenovate') {
    if (current.tenant || current.level >= 2) return state
    cost = renovationCost(current)
    next = { ...next, level: current.level + 1, condition: 100 }
    message = `${suiteAddress(config.id)} renovated to ${['Original', 'Renovated', 'Luxury'][next.level]}.`
  } else {
    if (current.condition >= 100) return state
    cost = repairCost(current)
    next.repairMs = 15000
    message = `Repairs ordered for suite ${config.number}. Rent pauses for 15 active seconds; the lease clock continues.`
  }
  if (state.cash < cost) return state
  return {
    ...state,
    cash: state.cash - cost,
    apartments: record(
      { ...portfolio, suites: portfolio.suites.map((s) => (s === current ? next : s)) },
      message,
    ),
  }
}
export function tickApartments(state: GameState, rawMs: number): GameState {
  const dt = number(rawMs, 0, 60000)
  if (!dt || state.dynasty.jailMs || !state.apartments.suites.length) return state
  let earned = 0,
    payments = 0,
    notices: string[] = []
  const suites = state.apartments.suites.map((original) => {
    let s = { ...original },
      remaining = dt
    // Integrate exact event boundaries so one long tick equals smaller ticks.
    while (remaining > 0) {
      const collecting = !!s.tenant && !s.repairMs && s.condition >= 30
      const slice = Math.min(
        remaining,
        s.repairMs || Infinity,
        s.tenant ? s.leaseMs : Infinity,
        collecting ? s.rentMs : Infinity,
      )
      remaining -= slice
      const repairing = s.repairMs > 0
      if (s.tenant) s.leaseMs = Math.max(0, s.leaseMs - slice)
      if (collecting) s.rentMs = Math.max(0, s.rentMs - slice)
      if (repairing) {
        s.repairMs = Math.max(0, s.repairMs - slice)
        if (!s.repairMs) {
          s.condition = 100
          notices.push(`${suiteAddress(s.id)}: repairs complete.`)
        }
      }
      if (collecting && s.rentMs === 0) {
        const rent = suiteRent(s)
        earned += rent
        payments++
        s.earned += rent
        s.rentMs = 60000
        s.condition = Math.max(0, s.condition - TENANTS.find((t) => t.id === s.tenant)!.wear)
        if (s.condition < 30) notices.push(`${suiteAddress(s.id)}: repairs needed; rent suspended.`)
      }
      if (s.tenant && s.leaseMs === 0) {
        s.tenant = null
        s.rentMs = 60000
        notices.push(`${suiteAddress(s.id)}: lease ended. Choose a new tenant in Apartments.`)
      }
      if (!s.tenant && !s.repairMs) break
    }
    return s
  })
  const p = state.apartments
  if (earned) notices.push(`Apartment rent received · +$${earned}`)
  return {
    ...state,
    cash: state.cash + earned,
    runEarnings: state.runEarnings + earned,
    lifetimeEarnings: state.lifetimeEarnings + earned,
    apartments: {
      ...p,
      suites,
      payments: p.payments + payments,
      log: [...notices.reverse(), ...p.log].slice(0, 8),
    },
  }
}

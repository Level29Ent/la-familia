import { FAMILIES } from './city'
import type { GameState } from './engine'

export type RivalState = { influence: number; truceMs: number; cooldownMs: number }
export type CityState = {
  crew: number
  stamina: number
  elapsedMs: number
  nextMoveMs: number
  families: Record<string, RivalState>
  victories: number
  message: string
}
export type CityAction =
  { type: 'recruit' } | { type: 'rest' } | { type: 'rival'; id: string; move: 'challenge' | 'truce' }
export function initialCity(): CityState {
  return {
    crew: 1,
    stamina: 100,
    elapsedMs: 0,
    nextMoveMs: 60000,
    victories: 0,
    message:
      'Three rival families run the city. Build your crew, enter their clubs, and contest their influence.',
    families: Object.fromEntries(FAMILIES.map((f) => [f.id, { influence: 60, truceMs: 0, cooldownMs: 0 }])),
  }
}
const finite = (n: unknown, fallback: number, max: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : fallback
export function restoreCity(saved?: Partial<CityState>): CityState {
  const fresh = initialCity()
  if (!saved || typeof saved !== 'object') return fresh
  return {
    ...fresh,
    crew: Math.max(1, Math.floor(finite(saved.crew, 1, 50))),
    stamina: finite(saved.stamina, 100, 100),
    victories: Math.floor(finite(saved.victories, 0, 1000000)),
    elapsedMs: finite(saved.elapsedMs, 0, 1e12),
    nextMoveMs: Math.max(1, finite(saved.nextMoveMs, 60000, 60000)),
    message: typeof saved.message === 'string' ? saved.message.slice(0, 250) : fresh.message,
    families: Object.fromEntries(
      FAMILIES.map((f) => {
        const r = saved.families?.[f.id]
        return [
          f.id,
          {
            influence: finite(r?.influence, 60, 100),
            truceMs: finite(r?.truceMs, 0, 120000),
            cooldownMs: finite(r?.cooldownMs, 0, 30000),
          },
        ]
      }),
    ),
  }
}
export function crewPower(state: GameState): number {
  const managers = Object.values(state.businesses).filter((b) => b.managed).length
  return state.city.crew * 3 + managers * 2 + Math.floor(Math.sqrt(Math.max(0, state.respect)))
}
export function recruitCost(state: GameState) {
  return 15 * state.city.crew ** 2
}
export function opposition(state: GameState, id: string) {
  const f = FAMILIES.find((f) => f.id === id)
  return f ? f.strength + Math.floor(state.city.families[id].influence / 15) : Infinity
}
export function cityAction(state: GameState, action: CityAction): GameState {
  const city = state.city
  if (state.dynasty.jailMs) return state
  if (action.type === 'recruit') {
    const cost = recruitCost(state)
    if (city.crew >= 50 || state.cash < cost) return state
    return {
      ...state,
      cash: state.cash - cost,
      city: { ...city, crew: city.crew + 1, message: 'A new associate joins your family.' },
    }
  }
  if (action.type === 'rest') {
    if (city.stamina === 100) return state
    return { ...state, city: { ...city, stamina: 100, message: 'You rested at home. Your crew is ready.' } }
  }
  const family = FAMILIES.find((f) => f.id === action.id)
  if (!family) return state
  const rival = city.families[family.id]
  if (action.move === 'truce') {
    const cost = family.reward / 2
    if (state.cash < cost || rival.truceMs > 0) return state
    return {
      ...state,
      cash: state.cash - cost,
      city: {
        ...city,
        message: `${family.name} agreed to a two-minute truce.`,
        families: { ...city.families, [family.id]: { ...rival, truceMs: 120000 } },
      },
    }
  }
  if (rival.cooldownMs > 0 || rival.truceMs > 0 || city.stamina < 25 || rival.influence === 0) return state
  const won = crewPower(state) >= opposition(state, family.id)
  // A deterministic, disclosed strength check: no hidden dice or surprise wallet loss.
  const reward = won ? family.reward : 0
  return {
    ...state,
    dynasty: { ...state.dynasty, heat: Math.min(100,state.dynasty.heat+20), hostility: [...new Set([...state.dynasty.hostility,family.id])], xp: state.dynasty.xp+(won ? 20 : 0) },
    cash: state.cash + reward,
    runEarnings: state.runEarnings + reward,
    lifetimeEarnings: state.lifetimeEarnings + reward,
    city: {
      ...city,
      stamina: city.stamina - 25,
      victories: city.victories + (won ? 1 : 0),
      message: won
        ? `Your crew outmaneuvered ${family.name}. Earned $${reward}; their influence fell by 20.`
        : `${family.name} held their ground. Recruit more associates before trying again.`,
      families: {
        ...city.families,
        [family.id]: {
          ...rival,
          influence: Math.max(0, rival.influence - (won ? 20 : 0)),
          cooldownMs: 30000,
        },
      },
    },
  }
}
export function tickCity(city: CityState, rawMs: number): CityState {
  const dt = Math.max(0, Math.min(Number.isFinite(rawMs) ? rawMs : 0, 60000))
  if (!dt) return city
  const nextMoveMs = city.nextMoveMs - dt
  const families = Object.fromEntries(
    FAMILIES.map((f) => {
      const r = city.families[f.id]
      const recovering = nextMoveMs <= 0 && r.truceMs === 0 && r.influence < 100
      return [
        f.id,
        {
          influence: Math.min(100, r.influence + (recovering ? 5 : 0)),
          truceMs: Math.max(0, r.truceMs - dt),
          cooldownMs: Math.max(0, r.cooldownMs - dt),
        },
      ]
    }),
  )
  return {
    ...city,
    families,
    stamina: Math.min(100, city.stamina + dt / 5000),
    elapsedMs: city.elapsedMs + dt,
    nextMoveMs: nextMoveMs <= 0 ? 60000 : nextMoveMs,
    message:
      nextMoveMs <= 0
        ? 'Rival crews are rebuilding their influence. A paid truce stops their recovery.'
        : city.message,
  }
}

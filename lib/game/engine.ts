import {
  ASSETS,
  OPERATIONS,
  OBJECTIVES,
  BUSINESSES,
  MILESTONES,
  OFFLINE_CAP_SECONDS,
  RESPECT_BONUS_PER_POINT,
  UPGRADES,
  type BusinessConfig,
} from './config'

export type BusinessState = {
  owned: number
  managed: boolean
  running: boolean
  progress: number
}

export type GameState = {
  cash: number
  runEarnings: number
  lifetimeEarnings: number
  respect: number
  businesses: Record<string, BusinessState>
  upgrades: string[]
  lastSaved: number
  startedAt: number
  heists: number
  assets: string[]
  objectives: string[]
  operationsCompleted: number
  operation: { id: string; remainingMs: number } | null
}

export type BuyAmount = 1 | 10 | 100 | 'max'

export function createInitialState(respect = 0, lifetimeEarnings = 0, heists = 0): GameState {
  const businesses: Record<string, BusinessState> = {}
  for (const b of BUSINESSES) {
    businesses[b.id] = {
      owned: b.id === 'hustle' ? 1 : 0,
      managed: false,
      running: false,
      progress: 0,
    }
  }
  const now = Date.now()
  return {
    cash: 0,
    runEarnings: 0,
    lifetimeEarnings,
    respect,
    businesses,
    upgrades: [],
    lastSaved: now,
    startedAt: now,
    heists,
    assets: [],
    objectives: [],
    operationsCompleted: 0,
    operation: null,
  }
}

export function milestoneSpeedMultiplier(owned: number) {
  let mult = 1
  for (const m of MILESTONES) if (owned >= m) mult *= 2
  return mult
}

export function nextMilestone(owned: number) {
  return MILESTONES.find((m) => m > owned) ?? null
}

export function previousMilestone(owned: number) {
  let prev = 0
  for (const m of MILESTONES) if (owned >= m) prev = m
  return prev
}

export function cycleTime(config: BusinessConfig, owned: number) {
  return (config.cycleSeconds * 1000) / milestoneSpeedMultiplier(owned)
}

export function respectMultiplier(respect: number) {
  return 1 + respect * RESPECT_BONUS_PER_POINT
}

export function profitMultiplier(state: GameState, businessId: string) {
  let mult = respectMultiplier(state.respect)
  for (const id of state.upgrades) {
    const up = UPGRADES.find((u) => u.id === id)
    if (up && (up.target === 'all' || up.target === businessId)) mult *= up.multiplier
  }
  for (const asset of ASSETS) if (state.assets.includes(asset.id)) mult *= asset.multiplier
  return mult
}

export function revenuePerCycle(state: GameState, config: BusinessConfig) {
  const owned = state.businesses[config.id].owned
  return config.baseRevenue * owned * profitMultiplier(state, config.id)
}

export function revenuePerSecond(state: GameState, config: BusinessConfig) {
  const owned = state.businesses[config.id].owned
  if (owned === 0) return 0
  return revenuePerCycle(state, config) / (cycleTime(config, owned) / 1000)
}

export function totalIncomePerSecond(state: GameState) {
  return BUSINESSES.reduce(
    (sum, b) => (state.businesses[b.id].managed ? sum + revenuePerSecond(state, b) : sum),
    0,
  )
}

export function costFor(config: BusinessConfig, owned: number, amount: number) {
  const g = config.costGrowth
  return (config.baseCost * Math.pow(g, owned) * (Math.pow(g, amount) - 1)) / (g - 1)
}

export function maxAffordable(config: BusinessConfig, owned: number, cash: number) {
  const g = config.costGrowth
  const first = config.baseCost * Math.pow(g, owned)
  if (cash < first) return 0
  return Math.floor(Math.log((cash * (g - 1)) / first + 1) / Math.log(g))
}

export function resolveBuyAmount(config: BusinessConfig, owned: number, cash: number, amount: BuyAmount) {
  if (amount === 'max') return Math.max(1, maxAffordable(config, owned, cash))
  return amount
}

export function totalRespectFor(lifetimeEarnings: number) {
  return Math.floor(10 * Math.sqrt(lifetimeEarnings / 1e9))
}

export function claimableRespect(state: GameState) {
  return Math.max(0, totalRespectFor(state.lifetimeEarnings) - state.respect)
}

export function tick(state: GameState, dtMs: number): GameState {
  let earned = 0
  let changed = false
  const businesses = { ...state.businesses }

  for (const config of BUSINESSES) {
    const b = businesses[config.id]
    if (b.owned === 0 || (!b.running && !b.managed)) continue
    changed = true
    const cycle = cycleTime(config, b.owned)
    let progress = b.progress + dtMs
    let running = b.running

    if (b.managed) {
      const cycles = Math.floor(progress / cycle)
      if (cycles > 0) {
        earned += cycles * revenuePerCycle(state, config)
        progress -= cycles * cycle
      }
      running = true
    } else if (progress >= cycle) {
      earned += revenuePerCycle(state, config)
      progress = 0
      running = false
    }

    businesses[config.id] = { ...b, progress, running }
  }

  let operation = state.operation
  let operationsCompleted = state.operationsCompleted
  if (operation) {
    changed = true
    operation = {
      ...operation,
      remainingMs: Math.max(0, operation.remainingMs - dtMs),
    }
    if (operation.remainingMs === 0) {
      earned += OPERATIONS.find((o) => o.id === operation!.id)?.reward ?? 0
      operationsCompleted++
      operation = null
    }
  }
  if (!changed) return state
  return {
    ...state,
    businesses,
    operation,
    operationsCompleted,
    cash: state.cash + earned,
    runEarnings: state.runEarnings + earned,
    lifetimeEarnings: state.lifetimeEarnings + earned,
  }
}

export function computeOfflineEarnings(state: GameState, now: number) {
  const elapsedSeconds = Math.min((now - state.lastSaved) / 1000, OFFLINE_CAP_SECONDS)
  if (elapsedSeconds < 10) return { earnings: 0, seconds: 0 }
  return {
    earnings: totalIncomePerSecond(state) * elapsedSeconds,
    seconds: elapsedSeconds,
  }
}

export function objectiveProgress(state: GameState, metric: string) {
  switch (metric) {
    case 'earnings':
      return state.runEarnings
    case 'businesses':
      return Object.values(state.businesses).filter((b) => b.owned > 0).length
    case 'managers':
      return Object.values(state.businesses).filter((b) => b.managed).length
    case 'assets':
      return state.assets.length
    case 'operations':
      return state.operationsCompleted
    default:
      return 0
  }
}

export type EmpireAction = {
  type: 'asset' | 'operation' | 'objective'
  id: string
}

export function empireAction(state: GameState, action: EmpireAction): GameState {
  if (action.type === 'asset') {
    const asset = ASSETS.find((a) => a.id === action.id)
    if (!asset || state.assets.includes(asset.id) || state.cash < asset.cost) return state
    return {
      ...state,
      cash: state.cash - asset.cost,
      assets: [...state.assets, asset.id],
    }
  }
  if (action.type === 'operation') {
    const op = OPERATIONS.find((o) => o.id === action.id)
    if (!op || state.operation || state.cash < op.cost || !state.businesses[op.required]?.owned) return state
    return {
      ...state,
      cash: state.cash - op.cost,
      operation: { id: op.id, remainingMs: op.seconds * 1000 },
    }
  }
  const goal = OBJECTIVES.find((o) => o.id === action.id)
  if (!goal || state.objectives.includes(goal.id) || objectiveProgress(state, goal.metric) < goal.goal)
    return state
  return {
    ...state,
    cash: state.cash + goal.reward,
    objectives: [...state.objectives, goal.id],
  }
}

// Keep existing empires intact when new properties or progression systems are added.
export function restoreState(saved: Partial<GameState>): GameState {
  const fresh = createInitialState()
  return {
    ...fresh,
    ...saved,
    businesses: { ...fresh.businesses, ...saved.businesses },
  }
}

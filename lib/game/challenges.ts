import type { GameState } from './engine'

export const CHALLENGES = [
  {
    id: 'espresso',
    title: 'Espresso express',
    description:
      'A free first challenge: pick up coffee, travel 40m, then deliver to the diner. Any route, on foot or in an owned vehicle.',
    stops: ['coffeehouse', 'diner'],
    meters: 40,
    seconds: 180,
    reward: 100,
  },
  {
    id: 'furnish',
    title: 'The showroom circuit',
    description:
      'Inspect a restored cabinet, take it to Rosa Apartments, then report back. Travel 50m between each stop.',
    stops: ['furniture', 'home-1', 'furniture'],
    meters: 50,
    seconds: 240,
    reward: 220,
  },
  {
    id: 'dispatch',
    title: 'Five-district dispatch',
    description:
      'Collect the dispatch book, then serve one address in each district. Travel 40m per leg. Map travel alone never counts.',
    stops: ['courieroffice', 'diner', 'hq-volkov', 'hq-doyle', 'garage', 'home-20'],
    meters: 40,
    seconds: 420,
    reward: 420,
  },
] as const
export type ChallengeRun = { id: string; checkpoint: number; remainingMs: number; meters: number }
export type ChallengeState = {
  run: ChallengeRun | null
  cooldownMs: number
  records: { id: string; wins: number; bestMs: number }[]
  log: string[]
  completed: number
}
export type ChallengeAction =
  | { type: 'challengeStart'; id: string }
  | { type: 'challengeCancel' }
  | { type: 'challengeMove'; meters: number }
  | { type: 'challengeCheck'; id: string; checkpoint: number; location: string }
export const initialChallenges = (): ChallengeState => ({
  run: null,
  cooldownMs: 0,
  records: [],
  completed: 0,
  log: ['City Express is hiring. Choose a free route challenge.'],
})
const finite = (n: unknown, fallback: number, max: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : fallback
export function restoreChallenges(saved?: Partial<ChallengeState>): ChallengeState {
  if (!saved || typeof saved !== 'object') return initialChallenges()
  const config = CHALLENGES.find((c) => c.id === saved.run?.id)
  const run =
    config && saved.run && saved.run.remainingMs > 0
      ? {
          id: config.id,
          checkpoint: Math.min(
            config.stops.length - 1,
            Math.floor(finite(saved.run.checkpoint, 0, 10)),
          ),
          remainingMs: finite(saved.run.remainingMs, config.seconds * 1000, config.seconds * 1000),
          meters: finite(saved.run.meters, 0, 10000),
        }
      : null
  return {
    run,
    cooldownMs: finite(saved.cooldownMs, 0, 30000),
    completed: Math.floor(finite(saved.completed, 0, 1e9)),
    records: CHALLENGES.flatMap((c) => {
      const r = Array.isArray(saved.records) ? saved.records.find((r) => r?.id === c.id) : undefined
      return r
        ? [
            {
              id: c.id,
              wins: Math.floor(finite(r.wins, 0, 1e9)),
              bestMs: finite(r.bestMs, 0, c.seconds * 1000),
            },
          ]
        : []
    }),
    log: Array.isArray(saved.log)
      ? saved.log
          .filter((s): s is string => typeof s === 'string')
          .slice(0, 8)
          .map((s) => s.slice(0, 250))
      : initialChallenges().log,
  }
}
const notice = (c: ChallengeState, text: string): ChallengeState => ({
  ...c,
  log: [text, ...c.log].slice(0, 8),
})
export function challengeAction(state: GameState, a: ChallengeAction): GameState {
  if (state.dynasty.jailMs) return state
  const c = state.challenges
  if (a.type === 'challengeStart') {
    const config = CHALLENGES.find((c) => c.id === a.id)
    if (!config || c.run || c.cooldownMs) return state
    return {
      ...state,
      challenges: notice(
        { ...c, run: { id: a.id, checkpoint: 0, remainingMs: config.seconds * 1000, meters: 0 } },
        `${config.title} started. Enter the first stop to collect the order.`,
      ),
    }
  }
  if (a.type === 'challengeCancel')
    return c.run
      ? {
          ...state,
          challenges: notice(
            { ...c, run: null, cooldownMs: 30000 },
            'Route cancelled. No cash lost; dispatch reopens in 30 seconds.',
          ),
        }
      : state
  const run = c.run,
    config = CHALLENGES.find((c) => c.id === run?.id)
  if (!run || !config || run.remainingMs <= 0) return state
  if (a.type === 'challengeMove') {
    if (!run.checkpoint || !Number.isFinite(a.meters) || a.meters <= 0 || a.meters > 8) return state
    return {
      ...state,
      challenges: { ...c, run: { ...run, meters: Math.min(10000, run.meters + a.meters) } },
    }
  }
  if (
    a.id !== run.id ||
    a.checkpoint !== run.checkpoint ||
    a.location !== config.stops[run.checkpoint] ||
    (run.checkpoint > 0 && run.meters < config.meters)
  )
    return state
  if (run.checkpoint < config.stops.length - 1)
    return {
      ...state,
      challenges: notice(
        { ...c, run: { ...run, checkpoint: run.checkpoint + 1, meters: 0 } },
        `${config.title}: checkpoint ${run.checkpoint + 1}/${config.stops.length} confirmed. Travel ${config.meters}m to the next stop.`,
      ),
    }
  const elapsed = config.seconds * 1000 - run.remainingMs
  const medal =
    elapsed <= config.seconds * 400 ? 'Gold' : elapsed <= config.seconds * 700 ? 'Silver' : 'Bronze'
  const reward =
    config.reward +
    (medal === 'Gold'
      ? Math.floor(config.reward / 2)
      : medal === 'Silver'
        ? Math.floor(config.reward / 4)
        : 0)
  const record = c.records.find((r) => r.id === config.id)
  const next = {
    id: config.id,
    wins: (record?.wins ?? 0) + 1,
    bestMs: record ? Math.min(record.bestMs, elapsed) : elapsed,
  }
  return {
    ...state,
    cash: state.cash + reward,
    runEarnings: state.runEarnings + reward,
    lifetimeEarnings: state.lifetimeEarnings + reward,
    dynasty: { ...state.dynasty, xp: state.dynasty.xp + 35 },
    challenges: notice(
      {
        ...c,
        run: null,
        cooldownMs: 30000,
        completed: c.completed + 1,
        records: [...c.records.filter((r) => r.id !== config.id), next],
      },
      `${config.title} · ${medal} · +$${reward} · +35 family XP. Best ${Math.ceil(next.bestMs / 1000)}s.`,
    ),
  }
}
export function tickChallenges(state: GameState, rawMs: number): GameState {
  if (state.dynasty.jailMs) return state
  const dt = finite(rawMs, 0, 60000),
    c = state.challenges
  if (!dt || (!c.run && !c.cooldownMs)) return state
  const run = c.run ? { ...c.run, remainingMs: Math.max(0, c.run.remainingMs - dt) } : null
  if (run && run.remainingMs === 0)
    return {
      ...state,
      challenges: notice(
        { ...c, run: null, cooldownMs: 30000 },
        'Time ran out. No wallet penalty. Try a shorter route or a vehicle next time.',
      ),
    }
  return { ...state, challenges: { ...c, run, cooldownMs: Math.max(0, c.cooldownMs - dt) } }
}

import type { GameState } from './engine'
import { RECRUITS } from './dynasty'
import { DISTRICTS } from './city-play'

export const HARBOR_MISSIONS = [
  {
    title: 'A favor on Orchard Street',
    briefing:
      'Rosa’s food shipment never arrived. Start small: help the neighborhood before asking for its trust.',
    locations: ['grocer', 'diner'],
    steps: ['Accept Rosa’s parcel', 'Deliver the parcel to the diner'],
    reward: 150,
  },
  {
    title: 'The missing manifest',
    briefing:
      'A damaged delivery truck holds the clue. Hire an associate in Family & law, choose their support, and trace the paperwork to Riverside Warehouse.',
    locations: ['garage', 'warehouse'],
    steps: ['Inspect the truck with your associate', 'Compare the warehouse manifest'],
    reward: 350,
  },
  {
    title: 'Across town',
    briefing:
      'Move the recovered shipment to Bellini Hotel. After loading, travel 90m on foot or 60m in an owned vehicle. Map travel does not count.',
    locations: ['warehouse', 'hotel'],
    steps: ['Load the recovered shipment', 'Hand over the shipment at the hotel'],
    reward: 500,
  },
  {
    title: 'A seat at the table',
    briefing:
      'At Blue Note, the dock workers ask what kind of family you will become. Your decision changes loyalty and the final settlement.',
    locations: ['jazz', 'hq-doyle'],
    steps: ['Hear the dock workers’ petition', 'Deliver your terms to Doyle'],
    reward: 250,
  },
  {
    title: 'The harbor belongs to…',
    briefing:
      'Doyle is ready to settle. An alliance buys a lasting ceasefire. A takeover grants control but invites retaliation. Return to the warehouse to make it official.',
    locations: ['hq-doyle', 'warehouse'],
    steps: ['Settle with the Doyle Outfit', 'Open the new harbor operation'],
    reward: 1000,
  },
] as const
export type HarborState = {
  chapter: number
  step: number
  support: string | null
  walked: number
  driven: number
  workers: 'community' | 'pressure' | null
  ending: 'alliance' | 'takeover' | null
  investments: string[]
  council: string[]
  log: string[]
}
export type HarborAction =
  | { type: 'harborSupport'; id: string }
  | { type: 'harborMove'; meters: number; driving: boolean }
  | { type: 'harborStep'; chapter: number; step: number; location: string; choice?: string }
  | { type: 'harborInvest'; district: string; member: string }
export const initialHarbor = (): HarborState => ({
  chapter: 0,
  step: 0,
  support: null,
  walked: 0,
  driven: 0,
  workers: null,
  ending: null,
  investments: [],
  council: [],
  log: ['Rosa is waiting at Orchard Grocers.'],
})
export function restoreHarbor(saved?: Partial<HarborState>): HarborState {
  const h = initialHarbor()
  if (!saved || typeof saved !== 'object') return h
  h.chapter = Number.isInteger(saved.chapter) ? Math.max(0, Math.min(5, saved.chapter!)) : 0
  h.step = h.chapter < 5 && saved.step === 1 ? 1 : 0
  h.support = RECRUITS.some((r) => r.id === saved.support) ? saved.support! : null
  const distance = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(10000, n)) : 0
  h.walked = distance(saved.walked)
  h.driven = distance(saved.driven)
  h.workers = saved.workers === 'community' || saved.workers === 'pressure' ? saved.workers : null
  h.ending = saved.ending === 'alliance' || saved.ending === 'takeover' ? saved.ending : null
  // Incomplete saves cannot manufacture an ending or bypass the petition.
  if (h.chapter < 4 || (h.chapter === 4 && h.step === 0)) h.ending = null
  if (h.chapter < 3 || (h.chapter === 3 && h.step === 0)) h.workers = null
  h.investments = Array.isArray(saved.investments)
    ? [
        ...new Set(
          saved.investments.filter(
            (d): d is string => typeof d === 'string' && DISTRICTS.some((valid) => valid === d),
          ),
        ),
      ]
    : []
  const council = Array.isArray(saved.council) ? saved.council : []
  h.council = h.investments.map((_, i) => RECRUITS.find((r) => r.id === council[i])?.id ?? '')
  h.log = Array.isArray(saved.log)
    ? saved.log
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 8)
        .map((s) => s.slice(0, 250))
    : h.log
  return h
}
export const harborReady = (state: GameState) =>
  state.harbor.walked >= 90 || state.harbor.driven >= 60
const available = (s: GameState, id: string) =>
  s.dynasty.members.some((m) => m.id === id && !m.recoveryMs) &&
  !s.dynasty.missions.some((m) => m.memberId === id)
export function harborAction(state: GameState, action: HarborAction): GameState {
  if (state.dynasty.jailMs) return state
  const h = state.harbor
  if (action.type === 'harborSupport') {
    if (h.chapter !== 1 || h.step !== 0 || !available(state, action.id)) return state
    return { ...state, harbor: { ...h, support: action.id } }
  }
  if (action.type === 'harborMove') {
    if (
      h.chapter !== 2 ||
      h.step !== 1 ||
      !Number.isFinite(action.meters) ||
      action.meters <= 0 ||
      action.meters > 8
    )
      return state
    if (
      action.driving &&
      (!state.fleet.selected || !state.fleet.owned.includes(state.fleet.selected))
    )
      return state
    const key = action.driving ? 'driven' : 'walked'
    return { ...state, harbor: { ...h, [key]: Math.min(10000, h[key] + action.meters) } }
  }
  if (action.type === 'harborInvest') {
    const contact = state.play.contacts.find((c) => c.id === action.member)
    if (
      !DISTRICTS.some((d) => d === action.district) ||
      h.investments.includes(action.district) ||
      h.council.includes(action.member) ||
      state.cash < 300 ||
      !contact ||
      contact.grade < 2 ||
      !available(state, action.member)
    )
      return state
    return {
      ...state,
      cash: state.cash - 300,
      harbor: {
        ...h,
        investments: [...h.investments, action.district],
        council: [...h.council, action.member],
        log: [
          `${action.district}: $300 community investment approved by ${RECRUITS.find((r) => r.id === action.member)?.name}.`,
          ...h.log,
        ].slice(0, 8),
      },
      play: {
        ...state.play,
        territories: state.play.territories.map((t) =>
          t.district === action.district ? { ...t, control: Math.min(100, t.control + 25) } : t,
        ),
      },
    }
  }
  const mission = HARBOR_MISSIONS[h.chapter]
  if (
    !mission ||
    action.chapter !== h.chapter ||
    action.step !== h.step ||
    mission.locations[h.step] !== action.location
  )
    return state
  if (h.chapter === 1 && (!h.support || !available(state, h.support))) return state
  if (h.chapter === 2 && h.step === 1 && !harborReady(state)) return state
  if (h.chapter === 3 && h.step === 0 && !['community', 'pressure'].includes(action.choice ?? ''))
    return state
  if (h.chapter === 4 && h.step === 0 && !['alliance', 'takeover'].includes(action.choice ?? ''))
    return state
  const next: HarborState = {
    ...h,
    step: h.step === 0 ? 1 : 0,
    chapter: h.step === 1 ? h.chapter + 1 : h.chapter,
  }
  let dynasty = state.dynasty,
    city = state.city,
    play = state.play
  let reward = h.step === 1 ? mission.reward : 0
  if (h.chapter === 1 && h.step === 1) {
    const role = RECRUITS.find((r) => r.id === h.support)?.role
    if (role === 'collector') reward += 75
    if (role === 'guard') dynasty = { ...dynasty, heat: Math.max(0, dynasty.heat - 15) }
    if (role === 'hitman') dynasty = { ...dynasty, xp: dynasty.xp + 75 }
  }
  if (h.chapter === 3 && h.step === 0) {
    next.workers = action.choice as HarborState['workers']
    const community = next.workers === 'community'
    play = {
      ...play,
      contacts: play.contacts.map((c) => ({
        ...c,
        loyalty: Math.max(0, Math.min(100, c.loyalty + (community ? 15 : -10))),
      })),
    }
    dynasty = { ...dynasty, heat: Math.min(100, dynasty.heat + (community ? 0 : 15)) }
    if (!community) reward += 200
  }
  if (h.chapter === 4 && h.step === 0) next.ending = action.choice as HarborState['ending']
  if (next.chapter === 5) {
    const alliance = h.ending === 'alliance'
    city = {
      ...city,
      families: {
        ...city.families,
        doyle: { ...city.families.doyle, influence: alliance ? city.families.doyle.influence : 0 },
      },
    }
    dynasty = {
      ...dynasty,
      hostility: alliance
        ? dynasty.hostility.filter((id) => id !== 'doyle')
        : [...new Set([...dynasty.hostility, 'doyle'])],
      heat: Math.min(100, dynasty.heat + (alliance ? 0 : 20)),
    }
    play = {
      ...play,
      territories: play.territories.map((t) =>
        t.district === 'Harbor Quarter'
          ? {
              ...t,
              control: alliance ? Math.max(t.control, h.workers === 'community' ? 50 : 25) : 100,
            }
          : t,
      ),
    }
  }
  next.log = [
    `${mission.steps[h.step]}${reward ? ` · +$${reward}` : ''}${action.choice ? ` · ${action.choice}` : ''}`,
    ...h.log,
  ].slice(0, 8)
  return {
    ...state,
    harbor: next,
    dynasty,
    city,
    play,
    cash: state.cash + reward,
    lifetimeEarnings: state.lifetimeEarnings + reward,
    runEarnings: state.runEarnings + reward,
  }
}

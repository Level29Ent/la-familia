import type { GameState } from './engine'
import { CITY_BUILDINGS, FAMILIES } from './city'
import { RECRUITS, rankIndex } from './dynasty'
import { activeVehicle } from './vehicles'

export const DISTRICTS = [
  'Little Italy',
  'Market Ward',
  'Harbor Quarter',
  'Eastside',
  'Garden Heights',
] as const
export const JOBS = [
  {
    id: 'delivery',
    title: 'Neighborhood delivery',
    location: 'grocer',
    destination: 'diner',
    cost: 0,
    reward: 45,
    seconds: 20,
    open: 6,
    close: 22,
    description: 'Pick up a grocery parcel, then take it to Midnight Diner.',
  },
  {
    id: 'taxi',
    title: 'Cross-town taxi fare',
    location: 'taxidepot',
    destination: 'hotel',
    cost: 0,
    reward: 120,
    seconds: 30,
    open: 0,
    close: 24,
    description: 'Use an owned taxi to carry a passenger from the depot to the hotel.',
  },
  {
    id: 'repair',
    title: 'Workshop tune-up',
    location: 'garage',
    destination: 'garage',
    cost: 10,
    reward: 80,
    seconds: 25,
    open: 7,
    close: 21,
    description: 'Inspect, fit the replacement part, then test the repaired engine.',
  },
  {
    id: 'rent',
    title: 'Residential rent round',
    location: 'home-1',
    destination: 'home-20',
    cost: 0,
    reward: 65,
    seconds: 20,
    open: 8,
    close: 20,
    description: 'Collect the rent ledger at Rosa Apartments; finish at Grand Central Apartments.',
  },
  {
    id: 'club',
    title: 'Book the evening band',
    location: 'jazz',
    destination: 'jazz',
    cost: 15,
    reward: 100,
    seconds: 25,
    open: 18,
    close: 6,
    description: 'Arrange the set list, check the stage, then open the evening show.',
  },
  { id: 'coffee', title: 'The morning rush', location: 'coffeehouse', destination: 'coffeehouse', cost: 0, reward: 75, seconds: 8, open: 0, close: 24, description: 'Grind the beans, pull the espresso, then serve the waiting tables.' },
  { id: 'barber', title: 'A cut above', location: 'barbershop', destination: 'barbershop', cost: 5, reward: 95, seconds: 10, open: 6, close: 22, description: 'Consult with the customer, shape the cut, then finish with a warm towel.' },
  { id: 'restore', title: 'Restore a family heirloom', location: 'furniture', destination: 'furniture', cost: 15, reward: 140, seconds: 12, open: 0, close: 24, description: 'Sand the timber, repair the joints, then polish the restored cabinet.' },
] as const
export const JOB_STEPS: Record<string, string[]> = {
  repair: ['Inspect engine', 'Fit replacement part', 'Test repaired engine'],
  club: ['Arrange set list', 'Check stage', 'Open evening show'],
  coffee: ['Grind the beans', 'Pull the espresso', 'Serve the tables'],
  barber: ['Consult with customer', 'Shape the cut', 'Apply warm towel'],
  restore: ['Sand the timber', 'Repair the joints', 'Polish the cabinet'],
}
export type JobId = (typeof JOBS)[number]['id']
export type JobState = { id: JobId; remainingMs: number; step: number; meters: number }
export type Contact = {
  id: string
  taskStart: number
  loyalty: number
  xp: number
  grade: number
  talkMs: number
  quest: boolean
  contract: boolean
}
export type Territory = { district: string; control: number; attacks: number }
export type PlayState = {
  timeMs: number
  guide: string[]
  guideHidden: boolean
  job: JobState | null
  completed: number
  jobCooldownMs: number
  territories: Territory[]
  territoryMs: number
  contacts: Contact[]
  rents: string[]
  rentMs: number
  events: string[]
  eventId: number
  quality: 'balanced' | 'low'
}
export type PlayAction =
  | { type: 'driveMeters'; meters: number }
  | { type: 'waitTime'; hour: 6 | 18 }
  | { type: 'guideClaim'; id: string }
  | { type: 'guideToggle' }
  | { type: 'startJob'; id: string; location: string }
  | { type: 'jobStep'; location: string }
  | { type: 'cancelJob' }
  | { type: 'territory'; district: string }
  | { type: 'talk'; id: string; choice: 'respect' | 'business' | 'threaten' }
  | { type: 'promoteMember'; id: string }
  | { type: 'contactQuest'; id: string }
  | { type: 'buyRental'; id: string }
  | { type: 'quality'; value: 'balanced' | 'low' }
export function initialPlay(): PlayState {
  return {
    timeMs: 0,
    guide: [],
    guideHidden: false,
    job: null,
    completed: 0,
    jobCooldownMs: 0,
    territories: DISTRICTS.map((d) => ({ district: d, control: 0, attacks: 0 })),
    territoryMs: 120000,
    contacts: [],
    rents: [],
    rentMs: 60000,
    events: ['Welcome to the city. Start your First Fifteen Minutes goals.'],
    eventId: 0,
    quality: 'balanced',
  }
}
const num = (v: unknown, f: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : f
export function restorePlay(saved?: Partial<PlayState>): PlayState {
  const p = initialPlay()
  if (!saved || typeof saved !== 'object') return p
  const job = JOBS.find((j) => j.id === saved.job?.id)
  return {
    ...p,
    timeMs: num(saved.timeMs, 0, 1e12),
    guide: GUIDE.filter((g) => Array.isArray(saved.guide) && saved.guide.includes(g.id)).map((g) => g.id),
    guideHidden: saved.guideHidden === true,
    job: job
      ? {
          id: job.id,
          remainingMs: num(saved.job?.remainingMs, job.seconds * 1000, job.seconds * 1000),
          step: Math.floor(num(saved.job?.step, 0, 2)),
          meters: num(saved.job?.meters, 0, 100000),
        }
      : null,
    completed: Math.floor(num(saved.completed, 0, 1e6)),
    jobCooldownMs: num(saved.jobCooldownMs, 0, 30000),
    territoryMs: num(saved.territoryMs, 120000, 120000),
    rentMs: num(saved.rentMs, 60000, 60000),
    territories: DISTRICTS.map((d) => {
      const t = Array.isArray(saved.territories) ? saved.territories.find((t) => t?.district === d) : null
      return { district: d, control: num(t?.control, 0, 100), attacks: Math.floor(num(t?.attacks, 0, 1e6)) }
    }),
    contacts: RECRUITS.filter(
      (r) => Array.isArray(saved.contacts) && saved.contacts.some((c) => c?.id === r.id),
    ).map((r) => {
      const c = saved.contacts!.find((c) => c?.id === r.id)!
      return {
        id: r.id,
        taskStart: Math.floor(num(c.taskStart, 0, 1e6)),
        loyalty: num(c.loyalty, 50, 100),
        xp: num(c.xp, 0, 1e6),
        grade: Math.floor(num(c.grade, 0, 2)),
        talkMs: num(c.talkMs, 0, 30000),
        quest: c.quest === true,
        contract: c.contract === true,
      }
    }),
    rents: CITY_BUILDINGS.filter(
      (b) => b.kind === 'home' && Array.isArray(saved.rents) && saved.rents.includes(b.id),
    ).map((b) => b.id),
    events: Array.isArray(saved.events)
      ? saved.events
          .filter((e) => typeof e === 'string')
          .slice(0, 6)
          .map((e) => e.slice(0, 220))
      : p.events,
    eventId: Math.floor(num(saved.eventId, 0, 1e9)),
    quality: saved.quality === 'low' ? 'low' : 'balanced',
  }
}
export function cityTime(play: PlayState) {
  const minutes = (8 * 60 + Math.floor(play.timeMs / 1000)) % (24 * 60)
  return {
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
    label: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    night: minutes < 360 || minutes >= 1080,
  }
}
export function jobOpen(id: string, play: PlayState) {
  const j = JOBS.find((j) => j.id === id)
  if (!j) return false
  const h = cityTime(play).hour
  return j.open < j.close ? h >= j.open && h < j.close : h >= j.open || h < j.close
}
export function contactFor(state: GameState, id: string): Contact {
  return (
    state.play.contacts.find((c) => c.id === id) ?? {
      id,
      taskStart: 0,
      loyalty: 50,
      xp: 0,
      grade: 0,
      talkMs: 0,
      quest: false,
      contract: false,
    }
  )
}
export function territoryStrength(state: GameState) {
  return (
    state.city.crew * 3 +
    state.dynasty.members.length * 3 +
    state.dynasty.members.reduce((n, m) => n + contactFor(state, m.id).grade * 4, 0) +
    rankIndex(state) * 3
  )
}
export function territoryEnemy(state: GameState, district: string) {
  const i = DISTRICTS.indexOf(district as (typeof DISTRICTS)[number])
  const f = FAMILIES[i % 3]
  return 8 + i * 4 + Math.floor(state.city.families[f.id].influence / 20)
}
export function territoryOwner(control: number) {
  return control >= 75 ? 'Bellini' : control > 0 ? 'Contested' : 'Rival controlled'
}
export function rentalCost(id: string) {
  const i = CITY_BUILDINGS.filter((b) => b.kind === 'home').findIndex((b) => b.id === id)
  return i < 0 ? Infinity : 300 + i * 150
}
export const GUIDE = [
  {
    id: 'earn',
    title: 'Your first street income',
    reward: 25,
    target: 'hustle',
    hint: 'Collect from your free Street Hustle. R collects when facing it; the Ledger also has a Run button.',
  },
  {
    id: 'job',
    title: 'Finish your first city activity',
    reward: 150,
    target: 'grocer',
    hint: 'Visit Orchard Grocers, start a delivery and finish inside Midnight Diner.',
  },
  {
    id: 'hire',
    title: 'Meet your first associate',
    reward: 100,
    target: 'hustle',
    hint: 'Open Family & law, talk to Joey, then hire him for $60.',
  },
  {
    id: 'home',
    title: 'Buy your first safe house',
    reward: 150,
    target: 'safehouse',
    hint: 'Buy the abandoned property for $250. Rewards above help fund the purchase.',
  },
  {
    id: 'district',
    title: 'Contest Little Italy',
    reward: 100,
    target: 'hq-moretti',
    hint: 'Recruit enough associates and open the Territory tab. Compare strength before contesting.',
  },
] as const
export function guideReady(state: GameState, id: string) {
  return id === 'earn'
    ? state.runEarnings >= 1
    : id === 'job'
      ? state.play.completed >= 1
      : id === 'hire'
        ? state.dynasty.members.length >= 1
        : id === 'home'
          ? state.dynasty.estate >= 0
          : id === 'district'
            ? state.play.territories.some((t) => t.district === 'Little Italy' && t.control >= 25)
            : false
}
const event = (p: PlayState, message: string): PlayState => ({
  ...p,
  events: [message, ...p.events].slice(0, 6),
  eventId: p.eventId + 1,
})
function paid(state: GameState, amount: number, play: PlayState): GameState {
  return {
    ...state,
    cash: state.cash + amount,
    runEarnings: state.runEarnings + amount,
    lifetimeEarnings: state.lifetimeEarnings + amount,
    play,
  }
}
export function playAction(state: GameState, a: PlayAction): GameState {
  const p = state.play
  if (a.type === 'quality')
    return { ...state, play: { ...p, quality: a.value === 'low' ? 'low' : 'balanced' } }
  if (a.type === 'guideToggle') return { ...state, play: { ...p, guideHidden: !p.guideHidden } }
  if (state.dynasty.jailMs) return state
  if (a.type === 'waitTime') {
    if (!state.dynasty.shelter) return state
    const now = (8 * 60 * 1000 + p.timeMs) % (24 * 60 * 1000),
      target = a.hour * 60 * 1000,
      delta = (target - now + 24 * 60 * 1000) % (24 * 60 * 1000)
    return {
      ...state,
      play: event(
        { ...p, timeMs: p.timeMs + delta },
        `Rested until ${a.hour}:00. Clock advanced; no offline mission, rent or crew payouts were simulated.`,
      ),
    }
  }
  if (a.type === 'guideClaim') {
    const g = GUIDE.find((g) => g.id === a.id)
    if (
      !g ||
      p.guide.includes(g.id) ||
      !guideReady(state, g.id) ||
      GUIDE.slice(0, GUIDE.indexOf(g)).some((g) => !p.guide.includes(g.id))
    )
      return state
    return paid(
      state,
      g.reward,
      event({ ...p, guide: [...p.guide, g.id] }, `Opening goal complete: ${g.title} · +$${g.reward}`),
    )
  }
  if (a.type === 'driveMeters') {
    if (
      p.job?.id !== 'taxi' ||
      activeVehicle(state)?.id !== 'taxi' ||
      !Number.isFinite(a.meters) ||
      a.meters <= 0 ||
      a.meters > 8
    )
      return state
    return { ...state, play: { ...p, job: { ...p.job, meters: p.job.meters + a.meters } } }
  }
  if (a.type === 'startJob') {
    const j = JOBS.find((j) => j.id === a.id)
    if (
      !j ||
      j.location !== a.location ||
      p.job ||
      p.jobCooldownMs ||
      state.cash < j.cost ||
      !jobOpen(j.id, p) ||
      (j.id === 'taxi' && activeVehicle(state)?.id !== 'taxi')
    )
      return state
    return {
      ...state,
      cash: state.cash - j.cost,
      play: event(
        { ...p, job: { id: j.id, remainingMs: j.seconds * 1000, step: 0, meters: 0 } },
        `${j.title} accepted. ${j.description}`,
      ),
    }
  }
  if (a.type === 'cancelJob')
    return p.job
      ? {
          ...state,
          play: event(
            { ...p, job: null, jobCooldownMs: 10000 },
            'Activity cancelled. Any booking/material cost is not refunded.',
          ),
        }
      : state
  if (a.type === 'jobStep') {
    const job = p.job,
      j = JOBS.find((j) => j.id === job?.id)
    if (
      !job ||
      !j ||
      a.location !== j.destination ||
      job.remainingMs > 0 ||
      (j.id === 'taxi' && (activeVehicle(state)?.id !== 'taxi' || job.meters < 30))
    )
      return state
    const steps = JOB_STEPS[j.id]
    if (steps && job.step < steps.length - 1)
      return {
        ...state,
        play: event(
          { ...p, job: { ...job, step: job.step + 1, remainingMs: ['coffee', 'barber', 'restore'].includes(j.id) ? 3000 : 0 } },
          `${steps[job.step]} complete. Next: ${steps[job.step + 1]}.`,
        ),
      }
    const contacts = p.contacts.map((c) => ({ ...c, xp: c.xp + 10 }))
    return paid(
      { ...state, dynasty: { ...state.dynasty, xp: state.dynasty.xp + 15 } },
      j.reward,
      event(
        { ...p, contacts, job: null, completed: p.completed + 1, jobCooldownMs: 10000 },
        `${j.title} complete · +$${j.reward} · +15 rank XP`,
      ),
    )
  }
  if (a.type === 'territory') {
    if (a.district === 'Harbor Quarter' && state.harbor?.chapter === 5 && state.harbor.ending === 'alliance') return state
    const t = p.territories.find((t) => t.district === a.district)
    if (!t || state.cash < 35 || state.city.stamina < 15 || t.control === 100) return state
    const win = territoryStrength(state) >= territoryEnemy(state, a.district),
      f = FAMILIES[DISTRICTS.indexOf(a.district as (typeof DISTRICTS)[number]) % 3]
    return {
      ...state,
      cash: state.cash - 35,
      city: { ...state.city, stamina: state.city.stamina - 15 },
      dynasty: {
        ...state.dynasty,
        heat: Math.min(100, state.dynasty.heat + 10),
        hostility: [...new Set([...state.dynasty.hostility, f.id])],
      },
      play: event(
        {
          ...p,
          territories: p.territories.map((x) =>
            x === t ? { ...x, control: Math.min(100, x.control + (win ? 25 : 0)) } : x,
          ),
        },
        win
          ? `${a.district}: Bellini influence +25. Hold 75+ for protection income.`
          : `${a.district}: rivals held the block. Build crew strength before another contest.`,
      ),
    }
  }
  if (a.type === 'buyRental') {
    const cost = rentalCost(a.id)
    if (!Number.isFinite(cost) || state.cash < cost || p.rents.includes(a.id)) return state
    return {
      ...state,
      cash: state.cash - cost,
      play: event(
        { ...p, rents: [...p.rents, a.id] },
        `Rental purchased: ${CITY_BUILDINGS.find((b) => b.id === a.id)!.name}. Earn $25 each active minute.`,
      ),
    }
  }
  const r = RECRUITS.find((r) => r.id === a.id)
  if (!r) return state
  const c = contactFor(state, r.id),
    m = state.dynasty.members.find((m) => m.id === r.id),
    busy = !!m?.recoveryMs || state.dynasty.missions.some((m) => m.memberId === r.id)
  let next = c,
    message = ''
  if (a.type === 'talk') {
    if (c.talkMs) return state
    next = {
      ...c,
      talkMs: 30000,
      loyalty: Math.max(0, Math.min(100, c.loyalty + (a.choice === 'threaten' ? -10 : 10))),
      xp: c.xp + 5,
    }
    message =
      a.choice === 'respect'
        ? `${r.name}: “Respect goes both ways. You can count on me.” Loyalty +10.`
        : a.choice === 'business'
          ? `${r.name}: “Finish a city activity and prove you can deliver.” Personal task accepted.`
          : `${r.name}: “I work better with trust than threats.” Loyalty −10.`
    if (a.choice === 'business')
      next = { ...next, taskStart: c.quest ? c.taskStart : p.completed, quest: true }
  } else if (a.type === 'contactQuest') {
    if (!c.quest || c.contract || p.completed <= c.taskStart) return state
    next = { ...c, contract: true, loyalty: Math.min(100, c.loyalty + 15), xp: c.xp + 50 }
    message = `${r.name}'s personal task complete · +15 loyalty, +50 member XP, +$50.`
  } else if (a.type === 'promoteMember') {
    const xp = c.grade === 0 ? 50 : 150,
      cost = c.grade === 0 ? 150 : 600
    if (!m || busy || c.grade >= 2 || c.loyalty < 60 || c.xp < xp || state.cash < cost) return state
    next = { ...c, grade: c.grade + 1 }
    message = `${r.name} promoted to ${next.grade === 1 ? 'Made Man' : 'Capo'}. Mission and guard power increased.`
    state = { ...state, cash: state.cash - cost }
  }
  const play = event({ ...p, contacts: [...p.contacts.filter((x) => x.id !== r.id), next] }, message)
  return a.type === 'contactQuest' ? paid(state, 50, play) : { ...state, play }
}
export function tickPlay(state: GameState, raw: number): GameState {
  const dt = Math.max(0, Math.min(Number.isFinite(raw) ? raw : 0, 60000))
  if (!dt || state.dynasty.jailMs) return state
  let p = {
    ...state.play,
    timeMs: state.play.timeMs + dt,
    jobCooldownMs: Math.max(0, state.play.jobCooldownMs - dt),
    job: state.play.job
      ? { ...state.play.job, remainingMs: Math.max(0, state.play.job.remainingMs - dt) }
      : null,
    contacts: state.play.contacts.map((c) => ({ ...c, talkMs: Math.max(0, c.talkMs - dt) })),
    rentMs: state.play.rentMs - dt,
    territoryMs: state.play.territoryMs - dt,
  }
  let income = 0
  if (p.rentMs <= 0) {
    income = p.rents.length * 25 + p.territories.filter((t) => t.control >= 75).length * 40
    p = { ...p, rentMs: 60000 }
    if (income) p = event(p, `Rent and protection collected · +$${income}`)
  }
  if (p.territoryMs <= 0) {
    let changed = false
    p = {
      ...p,
      territoryMs: 120000,
      territories: p.territories.map((t, i) => {
        const f = FAMILIES[i % 3]
        if (f.id === 'doyle' && state.harbor?.chapter === 5 && state.harbor.ending === 'alliance') return t
        if (t.control > 0 && state.city.families[f.id].truceMs === 0) {
          const guarded = state.dynasty.members.filter(
            (m) =>
              m.duty === 'guard' && !m.recoveryMs && !state.dynasty.missions.some((o) => o.memberId === m.id),
          ).length
          const loss = Math.max(0, 15 - guarded * 5 - (state.harbor?.investments.includes(t.district) ? 5 : 0))
          changed = changed || loss > 0
          return { ...t, control: Math.max(0, t.control - loss), attacks: t.attacks + 1 }
        }
        return t
      }),
    }
    if (changed)
      p = event(
        p,
        'Rival crews contested your districts. Assign guards or negotiate truces to protect influence.',
      )
  }
  return paid(state, income, p)
}

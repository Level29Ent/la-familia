import { contactFor } from './city-play'
import type { GameState } from './engine'
import { FAMILIES } from './city'

export const RANKS = [
  { name: 'Street Associate', xp: 0, color: '#a7aaa0' },
  { name: 'Made Man', xp: 100, color: '#91b79b' },
  { name: 'Capo', xp: 300, color: '#86b0d9' },
  { name: 'Underboss', xp: 800, color: '#b098d1' },
  { name: 'Don', xp: 1800, color: '#e1b76b' },
  { name: 'Godfather', xp: 4000, color: '#f4d992' },
] as const
export const ESTATES = [
  {
    name: 'Abandoned Trap House',
    cost: 250,
    wall: '#777061',
    floor: '#5d4b3d',
    trim: '#554c40',
    security: 1,
  },
  {
    name: 'Renovated Row House',
    cost: 5000,
    wall: '#9d987b',
    floor: '#85644b',
    trim: '#d3ba83',
    security: 3,
  },
  { name: 'Family Brownstone', cost: 75000, wall: '#617e74', floor: '#7e5740', trim: '#cfa461', security: 7 },
  { name: "Don's Mansion", cost: 650000, wall: '#ddd0ae', floor: '#af9c7c', trim: '#d8b960', security: 12 },
  {
    name: 'Godfather Estate',
    cost: 3500000,
    wall: '#e5ddc4',
    floor: '#d2c9ad',
    trim: '#edc76f',
    security: 20,
  },
] as const
export const RECRUITS = [
  {
    id: 'joey',
    name: 'Joey Two-Coats',
    role: 'collector',
    cost: 60,
    power: 3,
    wage: 12,
    position: [-30, 0, 16],
  },
  { id: 'lucia', name: 'Lucia Vale', role: 'guard', cost: 180, power: 7, wage: 0, position: [6, 0, 23] },
  { id: 'frank', name: 'Frankie Ash', role: 'hitman', cost: 320, power: 13, wage: 0, position: [42, 0, 23] },
  {
    id: 'maria',
    name: 'Maria Ledger',
    role: 'collector',
    cost: 750,
    power: 5,
    wage: 35,
    position: [78, 0, 23],
  },
  { id: 'vince', name: 'Vince Iron', role: 'guard', cost: 1400, power: 16, wage: 0, position: [-30, 0, -13] },
  {
    id: 'ada',
    name: 'Ada Nightingale',
    role: 'hitman',
    cost: 2800,
    power: 25,
    wage: 0,
    position: [6, 0, -13],
  },
  {
    id: 'nino',
    name: 'Nino Courier',
    role: 'collector',
    cost: 6000,
    power: 8,
    wage: 100,
    position: [42, 0, -49],
  },
  { id: 'rosa', name: 'Rosa Steel', role: 'guard', cost: 12000, power: 32, wage: 0, position: [78, 0, -49] },
] as const
export type Duty = 'idle' | 'collect' | 'guard'
export type Member = { id: string; duty: Duty; recoveryMs: number }
export type Mission = {
  memberId: string
  familyId: string
  remainingMs: number
  power: number
  enemy: number
}
export type DynastyState = {
  disruptionMs: number
  xp: number
  estate: number
  members: Member[]
  missions: Mission[]
  heat: number
  arrestMs: number
  jailMs: number
  collectionMs: number
  raidMs: number
  hostility: string[]
  shelter: boolean
  log: string[]
  hits: number
  raids: number
}
export type DynastyAction =
  | { type: 'estateUpgrade' }
  | { type: 'payLawyer' }
  | { type: 'bail' }
  | { type: 'meetHire'; id: string }
  | { type: 'duty'; id: string; duty: Duty }
  | { type: 'sendHit'; id: string; family: string }
  | { type: 'shelter'; inside: boolean }
export function initialDynasty(): DynastyState {
  return {
    disruptionMs: 0,
    xp: 0,
    estate: -1,
    members: [],
    missions: [],
    heat: 0,
    arrestMs: 30000,
    jailMs: 0,
    collectionMs: 30000,
    raidMs: 90000,
    hostility: [],
    shelter: false,
    log: ['Start as a Street Associate. Earn $250 to buy your first abandoned safe house.'],
    hits: 0,
    raids: 0,
  }
}
const number = (v: unknown, fallback: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : fallback
const notice = (d: DynastyState, message: string) => ({ ...d, log: [message, ...d.log].slice(0, 8) })
export function restoreDynasty(saved?: Partial<DynastyState>, legacy = false): DynastyState {
  const d = initialDynasty()
  if (!saved || typeof saved !== 'object')
    return legacy
      ? { ...d, estate: 2, log: ['Your existing safe house is preserved as a Family Brownstone.'] }
      : d
  const members = RECRUITS.filter(
    (r) => Array.isArray(saved.members) && saved.members.some((m) => m?.id === r.id),
  ).map((r) => {
    const m = saved.members!.find((m) => m?.id === r.id)!
    const duty: Duty = m.duty === 'guard' || m.duty === 'collect' ? m.duty : 'idle'
    return { id: r.id, duty, recoveryMs: number(m.recoveryMs, 0, 60000) }
  })
  const seen = new Set<string>()
  const missions = (Array.isArray(saved.missions) ? saved.missions : [])
    .filter((m) => {
      if (
        !m ||
        seen.has(m.memberId) ||
        !members.some((a) => a.id === m.memberId) ||
        !FAMILIES.some((f) => f.id === m.familyId)
      )
        return false
      seen.add(m.memberId)
      return true
    })
    .map((m) => ({
      memberId: m.memberId,
      familyId: m.familyId,
      remainingMs: number(m.remainingMs, 30000, 45000),
      power: number(m.power, 0, 500),
      enemy: number(m.enemy, 100, 500),
    }))
  return {
    ...d,
    members,
    missions,
    estate:
      typeof saved.estate === 'number' && Number.isFinite(saved.estate)
        ? Math.max(-1, Math.min(4, Math.floor(saved.estate)))
        : -1,
    disruptionMs: number(saved.disruptionMs, 0, 30000),
    xp: number(saved.xp, 0, 1e7),
    heat: number(saved.heat, 0, 100),
    jailMs: number(saved.jailMs, 0, 30000),
    arrestMs: number(saved.arrestMs, 30000, 30000),
    raidMs: number(saved.raidMs, 90000, 90000),
    collectionMs: number(saved.collectionMs, 30000, 30000),
    hits: number(saved.hits, 0, 1e6),
    raids: number(saved.raids, 0, 1e6),
    hostility: FAMILIES.filter((f) => Array.isArray(saved.hostility) && saved.hostility.includes(f.id)).map(
      (f) => f.id,
    ),
    log: Array.isArray(saved.log)
      ? saved.log
          .filter((s) => typeof s === 'string')
          .slice(0, 8)
          .map((s) => s.slice(0, 240))
      : d.log,
  }
}
export function rankScore(state: GameState) {
  return Math.floor(state.dynasty.xp + Math.sqrt(Math.max(0, state.lifetimeEarnings)) * 2)
}
export function rankIndex(state: GameState) {
  const xp = rankScore(state)
  return RANKS.reduce((rank, r, i) => (xp >= r.xp ? i : rank), 0)
}
export function defense(state: GameState) {
  return (
    (ESTATES[state.dynasty.estate]?.security ?? 0) +
    state.dynasty.members
      .filter(
        (m) =>
          m.duty === 'guard' && !m.recoveryMs && !state.dynasty.missions.some((o) => o.memberId === m.id),
      )
      .reduce((s, m) => s + RECRUITS.find((r) => r.id === m.id)!.power + contactFor(state, m.id).grade * 4, 0)
  )
}
export function missionPower(state: GameState, id: string) {
  return (
    (RECRUITS.find((r) => r.id === id)?.power ?? 0) +
    contactFor(state, id).grade * 5 +
    Math.floor(Math.max(0, contactFor(state, id).loyalty - 50) / 10) +
    rankIndex(state) * 5 +
    Math.floor(state.city.crew / 2)
  )
}
export function missionEnemy(state: GameState, family: string) {
  return (
    (FAMILIES.find((f) => f.id === family)?.strength ?? 999) +
    Math.floor((state.city.families[family]?.influence ?? 100) / 10)
  )
}
export function dynastyAction(state: GameState, action: DynastyAction): GameState {
  if (action.type === 'sendHit' && action.family === 'doyle' && state.harbor?.chapter === 5 && state.harbor.ending === 'alliance') return state
  let d = state.dynasty
  if (action.type === 'shelter')
    return d.shelter === action.inside ? state : { ...state, dynasty: { ...d, shelter: action.inside } }
  if (action.type === 'bail') {
    if (!d.jailMs || state.cash < 200) return state
    return {
      ...state,
      cash: state.cash - 200,
      dynasty: notice({ ...d, jailMs: 0, heat: 10, arrestMs: 30000 }, 'Bail paid. You are free to move.'),
    }
  }
  if (d.jailMs) return state
  if (action.type === 'estateUpgrade') {
    const next = ESTATES[d.estate + 1]
    if (!next || state.cash < next.cost) return state
    return {
      ...state,
      cash: state.cash - next.cost,
      dynasty: notice(
        { ...d, estate: d.estate + 1, xp: d.xp + 40 },
        `New residence: ${next.name}. Your home and security have visibly improved.`,
      ),
    }
  }
  if (action.type === 'payLawyer') {
    if (state.cash < 100 || d.heat === 0) return state
    return {
      ...state,
      cash: state.cash - 100,
      dynasty: notice(
        { ...d, heat: Math.max(0, d.heat - 45), arrestMs: 30000 },
        'Your lawyer reduced police heat by 45.',
      ),
    }
  }
  if (action.type === 'meetHire') {
    const r = RECRUITS.find((r) => r.id === action.id)
    if (!r || state.cash < r.cost || d.members.some((m) => m.id === r.id)) return state
    return {
      ...state,
      cash: state.cash - r.cost,
      dynasty: notice(
        {
          ...d,
          xp: d.xp + 25,
          members: [
            ...d.members,
            {
              id: r.id,
              duty: r.role === 'collector' ? 'collect' : r.role === 'guard' ? 'guard' : 'idle',
              recoveryMs: 0,
            },
          ],
        },
        `${r.name} joined your family as a ${r.role}.`,
      ),
    }
  }
  const member = d.members.find((m) => m.id === action.id)
  if (!member || member.recoveryMs || d.missions.some((m) => m.memberId === action.id)) return state
  if (action.type === 'duty') {
    if (!['idle', 'guard', 'collect'].includes(action.duty)) return state
    return {
      ...state,
      dynasty: {
        ...d,
        members: d.members.map((m) => (m.id === member.id ? { ...m, duty: action.duty } : m)),
      },
    }
  }
  const f = FAMILIES.find((f) => f.id === action.family)
  if (
    !f ||
    rankIndex(state) < 1 ||
    state.cash < 40 ||
    d.heat >= 80 ||
    state.city.families[f.id].truceMs > 0 ||
    state.city.families[f.id].influence === 0
  )
    return state
  const mission = {
    memberId: member.id,
    familyId: f.id,
    remainingMs: 30000,
    power: missionPower(state, member.id),
    enemy: missionEnemy(state, f.id),
  }
  return {
    ...state,
    cash: state.cash - 40,
    dynasty: notice(
      {
        ...d,
        heat: Math.min(100, d.heat + 30),
        missions: [...d.missions, mission],
        hostility: [...new Set([...d.hostility, f.id])],
      },
      `${RECRUITS.find((r) => r.id === member.id)!.name} left on a 30-second hit against ${f.name}. Retaliation is now possible.`,
    ),
  }
}
export function tickDynasty(state: GameState, raw: number): GameState {
  const dt = Math.max(0, Math.min(Number.isFinite(raw) ? raw : 0, 60000))
  if (!dt) return state
  let d = state.dynasty,
    cash = state.cash,
    income = 0,
    city = state.city
  if (d.jailMs > 0) {
    const remaining = Math.max(0, d.jailMs - dt)
    return {
      ...state,
      dynasty: remaining
        ? { ...d, jailMs: remaining }
        : notice({ ...d, jailMs: 0, heat: 10, arrestMs: 30000 }, 'Released from police custody.'),
    }
  }
  d = {
    ...d,
    members: d.members.map((m) => ({ ...m, recoveryMs: Math.max(0, m.recoveryMs - dt) })),
    missions: d.missions.map((m) => ({ ...m, remainingMs: Math.max(0, m.remainingMs - dt) })),
    disruptionMs: Math.max(0, d.disruptionMs - dt),
    collectionMs: d.collectionMs - dt,
    raidMs: d.raidMs - dt,
    heat: Math.max(0, d.heat - dt / (d.shelter ? 1200 : 12000)),
  }
  for (const m of d.missions.filter((m) => m.remainingMs === 0)) {
    const won = m.power >= m.enemy,
      r = city.families[m.familyId]
    if (won) {
      income += 100
      city = {
        ...city,
        families: { ...city.families, [m.familyId]: { ...r, influence: Math.max(0, r.influence - 30) } },
      }
    }
    d = notice(
      {
        ...d,
        xp: d.xp + (won ? 80 : 10),
        hits: d.hits + (won ? 1 : 0),
        members: d.members.map((a) => (a.id === m.memberId ? { ...a, recoveryMs: won ? 15000 : 60000 } : a)),
      },
      won
        ? `Hit complete: ${m.familyId} lost 30 influence. Your family earned $100 and 80 XP.`
        : `Hit failed against ${m.familyId}. Your operative needs 60 seconds to recover.`,
    )
  }
  d = { ...d, missions: d.missions.filter((m) => m.remainingMs > 0) }
  if (d.collectionMs <= 0) {
    const proceeds = d.members
      .filter((m) => m.duty === 'collect' && !m.recoveryMs && !d.missions.some((o) => o.memberId === m.id))
      .reduce((sum, m) => sum + Math.max(5, RECRUITS.find((r) => r.id === m.id)!.wage), 0)
    income += proceeds
    d = { ...d, collectionMs: 30000, xp: d.xp + (proceeds ? 5 : 0) }
  }
  if (d.raidMs <= 0) {
    const enemies = FAMILIES.filter(
      (f) =>
        !(f.id === 'doyle' && state.harbor?.chapter === 5 && state.harbor.ending === 'alliance') && d.hostility.includes(f.id) && city.families[f.id].truceMs === 0 && city.families[f.id].influence > 0,
    )
    const threat = enemies[d.raids % Math.max(1, enemies.length)]
    if (threat) {
      const power = threat.strength + Math.floor(city.families[threat.id].influence / 10)
      const blocked = defense({ ...state, dynasty: d }) >= power
      const loss = blocked ? 0 : Math.min(cash, 50 + threat.strength * 3)
      cash -= loss
      d = notice(
        {
          ...d,
          disruptionMs: blocked ? d.disruptionMs : 30000,
          raids: d.raids + 1,
          xp: d.xp + (blocked ? 20 : 0),
        },
        blocked
          ? `${threat.name} sent a hit. Your guards and home security stopped it.`
          : `${threat.name} hit your empire. Wallet loss $${loss}; business income −20% for 30 seconds. Assign guards, upgrade home security or negotiate a truce. Vault savings are safe.`,
      )
    }
    d = { ...d, raidMs: 90000 }
  }
  if (d.heat >= 60 && !d.shelter) d = { ...d, arrestMs: Math.max(0, d.arrestMs - dt) }
  else d = { ...d, arrestMs: 30000 }
  if (d.arrestMs === 0) {
    const fine = Math.min(cash, 150)
    cash -= fine
    d = notice(
      { ...d, jailMs: 30000, arrestMs: 30000 },
      `Police arrested you. Fine $${fine}; 30 seconds in custody or $200 bail. Vault funds are protected.`,
    )
  }
  return {
    ...state,
    cash: cash + income,
    city,
    dynasty: d,
    runEarnings: state.runEarnings + income,
    lifetimeEarnings: state.lifetimeEarnings + income,
  }
}

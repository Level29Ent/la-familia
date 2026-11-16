const test = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  ts = require('typescript')
require.extensions['.ts'] = (m, f) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(f, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    f,
  )
const {
  createInitialState,
  restoreState,
  tick,
  retireEmpire,
  computeOfflineEarnings,
} = require('../lib/game/engine.ts')
const {
  SUITES,
  SUITE_TYPES,
  APARTMENT_BUILDINGS,
  TENANTS,
  apartmentAction,
  tickApartments,
  restoreApartments,
  suiteRent,
  renovationCost,
  repairCost,
} = require('../lib/game/apartments.ts')
const { CITY_BUILDINGS } = require('../lib/game/city.ts')
const id = SUITES[0].id
const action = (s, type, more = {}) => apartmentAction(s, { type, id, ...more })
const rich = () => ({ ...createInitialState(), cash: 100000 })
const bought = () => action(rich(), 'suiteBuy')
const leased = () => action(bought(), 'suiteLease', { tenant: 'resident' })
const advance = (s, count) => {
  for (let i = 0; i < count; i++) s = tickApartments(s, 60000)
  return s
}

test('every suite has a real home, unique number, deterministic price, and accessible tour entrance', () => {
  assert.ok(APARTMENT_BUILDINGS.length >= 10)
  assert.equal(SUITES.length, APARTMENT_BUILDINGS.length * 3)
  assert.equal(new Set(SUITES.map((s) => s.id)).size, SUITES.length)
  for (const b of APARTMENT_BUILDINGS) {
    assert.equal(b.kind, 'home')
    assert.equal(
      CITY_BUILDINGS.find((c) => c.id === b.id),
      b,
    )
    assert.ok(b.door.every(Number.isFinite))
    assert.deepEqual(
      SUITES.filter((s) => s.buildingId === b.id).map((s) => s.number),
      ['101', '202', '303'],
    )
  }
  assert.equal(SUITES[0].price, 450)
  assert.equal(SUITE_TYPES.length, 3)
})
test('suite deeds debit exact price once, require funds, and reject unknown and unowned operations', () => {
  let s = createInitialState()
  assert.equal(action(s, 'suiteBuy'), s)
  assert.equal(action(s, 'suiteLease', { tenant: 'resident' }), s)
  assert.equal(action(s, 'suiteRenovate'), s)
  assert.equal(action(s, 'suiteRepair'), s)
  assert.equal(action(rich(), 'suiteBuy', { id: 'bad' }).apartments.suites.length, 0)
  s = { ...s, cash: 450 }
  s = action(s, 'suiteBuy')
  assert.equal(s.cash, 0)
  assert.equal(s.apartments.suites.length, 1)
  assert.equal(action(s, 'suiteBuy'), s)
})
test('five-minute leases pay exactly five times and cannot be stacked or farmed after expiry', () => {
  let s = leased(),
    initial = s.cash
  assert.equal(action(s, 'suiteLease', { tenant: 'family' }), s)
  s = tickApartments(s, 59999)
  assert.equal(s.cash, initial)
  s = tickApartments(s, 1)
  assert.equal(s.cash, initial + 35)
  s = advance(s, 4)
  assert.equal(s.cash, initial + 175)
  assert.equal(s.apartments.payments, 5)
  assert.equal(s.apartments.suites[0].tenant, null)
  assert.equal(s.apartments.suites[0].condition, 60)
  assert.equal(advance(s, 3).cash, s.cash)
})
test('tenant choices trade rent for wear, executives need renovation, and levels are capped', () => {
  let s = bought()
  assert.equal(action(s, 'suiteLease', { tenant: 'fake' }), s)
  assert.equal(action(s, 'suiteLease', { tenant: 'executive' }), s)
  const price = renovationCost(s.apartments.suites[0]),
    before = s.cash
  s = action(s, 'suiteRenovate')
  assert.equal(s.cash, before - price)
  assert.equal(s.apartments.suites[0].level, 1)
  const premium = action(s, 'suiteLease', { tenant: 'executive' })
  assert.equal(suiteRent(premium.apartments.suites[0]), 78)
  assert.equal(action(premium, 'suiteRenovate'), premium)
  s = action(s, 'suiteRenovate')
  assert.equal(s.apartments.suites[0].level, 2)
  assert.equal(action(s, 'suiteRenovate'), s)
  for (const tenant of TENANTS) {
    const testState = advance(action(s, 'suiteLease', { tenant: tenant.id }), 1)
    assert.equal(testState.apartments.suites[0].condition, 100 - tenant.wear)
    assert.equal(testState.apartments.suites[0].earned, Math.floor(35 * 1.8 * tenant.multiplier))
  }
})
test('poor-condition rent suspends, repairs cost money and pause rent while lease continues', () => {
  let s = advance(leased(), 5)
  s = action(s, 'suiteLease', { tenant: 'resident' })
  s = advance(s, 4)
  assert.equal(s.apartments.suites[0].condition, 28)
  const before = s.cash
  assert.equal(tickApartments(s, 59000).cash, before)
  const cost = repairCost(s.apartments.suites[0])
  s = action(s, 'suiteRepair')
  assert.equal(s.cash, before - cost)
  assert.equal(s.apartments.suites[0].repairMs, 15000)
  assert.equal(action(s, 'suiteRepair'), s)
  assert.equal(action(s, 'suiteRenovate'), s)
  s = tickApartments(s, 15000)
  assert.equal(s.apartments.suites[0].condition, 100)
  assert.equal(s.apartments.suites[0].leaseMs, 45000)
  assert.equal(s.apartments.suites[0].rentMs, 60000)
  s = tickApartments(s, 45000)
  assert.equal(s.apartments.suites[0].tenant, null)
  assert.equal(s.cash, before - cost)
  assert.equal(action(s, 'suiteRepair'), s)
})
test('vacant repairs finish and insufficient maintenance and renovation funds cannot alter suites', () => {
  let s = advance(leased(), 5)
  const poor = { ...s, cash: 0 }
  assert.equal(action(poor, 'suiteRepair'), poor)
  assert.equal(action(poor, 'suiteRenovate'), poor)
  s = action(s, 'suiteRepair')
  s = tickApartments(s, 20000)
  assert.equal(s.apartments.suites[0].condition, 100)
  assert.equal(s.apartments.suites[0].repairMs, 0)
  assert.equal(s.apartments.suites[0].tenant, null)
})
test('on-site tenant requests require the matching building, condition, money and one visit per lease', () => {
  let s = leased()
  const visit = (s) => action(s, 'suiteVisit', { location: SUITES[0].buildingId })
  assert.equal(visit(s), s)
  s = advance(s, 2)
  assert.equal(action(s, 'suiteVisit', { location: 'home-unknown' }), s)
  const poor = { ...s, cash: 0 }
  assert.equal(visit(poor), poor)
  const before = s.cash
  s = visit(s)
  assert.equal(s.cash, before - 10)
  assert.equal(s.apartments.suites[0].condition, 99)
  s = advance(s, 2)
  assert.equal(visit(s), s)
  s = advance(s, 1)
  s = action(s, 'suiteLease', { tenant: 'family' })
  assert.equal(s.apartments.suites[0].visited, false)
})
test('ticks integrate rent, expiry and repairs consistently independent of frame sizes', () => {
  let s = advance(leased(), 1)
  s = tickApartments(s, 30000)
  s = action(s, 'suiteRepair')
  const once = tickApartments(s, 60000)
  let pieces = s
  for (let i = 0; i < 600; i++) pieces = tickApartments(pieces, 100)
  assert.deepEqual(pieces.apartments.suites, once.apartments.suites)
  assert.equal(pieces.cash, once.cash)
  assert.equal(pieces.apartments.payments, once.apartments.payments)
  for (const ms of [-1, NaN, Infinity, 0]) assert.equal(tickApartments(s, ms), s)
  assert.deepEqual(tickApartments(s, 999999).apartments.suites, once.apartments.suites)
})
test('custody and offline time do not progress suites; engine ticks do', () => {
  let s = leased()
  const jailed = { ...s, dynasty: { ...s.dynasty, jailMs: 10000 } }
  assert.equal(tickApartments(jailed, 60000), jailed)
  assert.equal(action(jailed, 'suiteRepair'), jailed)
  assert.equal(action(jailed, 'suiteBuy', { id: SUITES[1].id }), jailed)
  assert.deepEqual(tick(jailed, 1000).apartments, s.apartments)
  assert.equal(computeOfflineEarnings(s, s.lastSaved + 3600000).earnings, 0)
  s = tick(s, 60000)
  assert.equal(s.apartments.payments, 1)
})
test('saves preserve leased suites, money and legacy deeds; malformed and duplicate suites are sanitized', () => {
  let s = action(advance(leased(), 2), 'suiteRepair')
  s = { ...s, play: { ...s.play, rents: ['home-1'] } }
  const copy = restoreState(JSON.parse(JSON.stringify(s)))
  assert.deepEqual(copy.apartments, s.apartments)
  assert.equal(copy.cash, s.cash)
  assert.deepEqual(copy.play.rents, ['home-1'])
  assert.equal(restoreState({ cash: 456, play: s.play }).cash, 456)
  assert.deepEqual(restoreState({}).apartments.suites, [])
  const malformed = restoreApartments({
    suites: [
      null,
      {
        id,
        level: 99,
        tenant: 'executive',
        condition: -4,
        leaseMs: Infinity,
        rentMs: NaN,
        repairMs: 99999,
      },
      { id },
      { id: 'fake' },
    ],
    log: [null, 'saved'],
    payments: Infinity,
  })
  assert.equal(malformed.suites.length, 1)
  assert.equal(malformed.suites[0].condition, 0)
  assert.equal(malformed.suites[0].level, 2)
  assert.equal(malformed.suites[0].tenant, null)
  assert.equal(malformed.suites[0].repairMs, 15000)
  assert.deepEqual(malformed.log, ['saved'])
  assert.equal(malformed.payments, 0)
  const invalidTenant = restoreApartments({
    suites: [{ id, level: 0, tenant: 'executive', leaseMs: 99999 }],
  })
  assert.equal(invalidTenant.suites[0].tenant, null)
})
test('retirement clears suites without changing inherited residence and vault behavior', () => {
  let s = leased()
  s = {
    ...s,
    lifetimeEarnings: 1e12,
    dynasty: { ...s.dynasty, estate: 3 },
    safeHouse: { ...s.safeHouse, balance: 100 },
  }
  const retired = retireEmpire(s)
  assert.deepEqual(retired.apartments.suites, [])
  assert.equal(retired.dynasty.estate, 3)
  assert.equal(retired.safeHouse.balance, 100)
})

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
  CHALLENGES,
  challengeAction,
  tickChallenges,
  restoreChallenges,
} = require('../lib/game/challenges.ts')
const { JOBS, JOB_STEPS, playAction, tickPlay } = require('../lib/game/city-play.ts')
const { BUSINESSES, MARKET_BUSINESSES } = require('../lib/game/config.ts')
const { CITY_BUILDINGS, CITY_OBSTACLES, CITY_BOUNDS } = require('../lib/game/city.ts')
const { ambientPopulation } = require('../lib/game/city-life.ts')
const start = (id = 'espresso') =>
  challengeAction(createInitialState(), { type: 'challengeStart', id })
const check = (s) => {
  const r = s.challenges.run,
    c = CHALLENGES.find((c) => c.id === r.id)
  return challengeAction(s, {
    type: 'challengeCheck',
    id: r.id,
    checkpoint: r.checkpoint,
    location: c.stops[r.checkpoint],
  })
}
const move = (s) => {
  for (let i = 0; i < 10; i++) s = challengeAction(s, { type: 'challengeMove', meters: 6 })
  return s
}
const finish = (s) => {
  const c = CHALLENGES.find((c) => c.id === s.challenges.run.id)
  for (let i = 0; i < c.stops.length; i++) {
    if (i) s = move(s)
    s = check(s)
  }
  return s
}

test('new businesses are real reachable map addresses with original anchors unchanged and save defaults', () => {
  assert.equal(BUSINESSES.length, 30)
  assert.equal(CITY_BUILDINGS.length, 64)
  assert.deepEqual(CITY_BUILDINGS.find((b) => b.id === 'hustle').position, [-26, 0, 8])
  assert.deepEqual(CITY_BUILDINGS.find((b) => b.id === 'home-30').position, [134, 0, -80])
  for (const config of MARKET_BUSINESSES) {
    const b = CITY_BUILDINGS.find((b) => b.id === config.id)
    assert.ok(b && b.kind === 'business')
    assert.ok(b.door[0] <= CITY_BOUNDS.maxX)
    const s = createInitialState()
    delete s.businesses[b.id]
    assert.equal(restoreState(s).businesses[b.id].owned, 0)
    s.businesses[b.id] = { owned: 1, managed: true, running: true, progress: 0 }
    assert.equal(tick(s, config.cycleSeconds * 1000).cash, config.baseRevenue)
  }
})
test('new shifts require correct workplace and timed steps, charge materials and pay exactly once', () => {
  for (const id of ['coffee', 'barber', 'restore']) {
    const j = JOBS.find((j) => j.id === id)
    let s = { ...createInitialState(), cash: 100 }
    assert.equal(playAction(s, { type: 'startJob', id, location: 'diner' }), s)
    s = playAction(s, { type: 'startJob', id, location: j.location })
    assert.equal(s.cash, 100 - j.cost)
    assert.equal(playAction(s, { type: 'jobStep', location: j.location }), s)
    s = tickPlay(s, j.seconds * 1000)
    for (let stage = 0; stage < 2; stage++) {
      s = playAction(s, { type: 'jobStep', location: j.location })
      assert.equal(s.play.job.step, stage + 1)
      assert.equal(s.play.job.remainingMs, 3000)
      assert.equal(s.cash, 100 - j.cost)
      assert.equal(playAction(s, { type: 'jobStep', location: j.location }), s)
      s = tickPlay(s, 3000)
    }
    s = playAction(s, { type: 'jobStep', location: j.location })
    assert.equal(s.cash, 100 - j.cost + j.reward)
    assert.equal(s.play.completed, 1)
    assert.equal(playAction(s, { type: 'jobStep', location: j.location }), s)
    assert.equal(playAction(s, { type: 'startJob', id, location: j.location }), s)
    assert.equal(JOB_STEPS[id].length, 3)
  }
})
test('challenge start is free, unique, guarded and cancelled runs have no wallet penalty', () => {
  const empty = createInitialState()
  assert.equal(challengeAction(empty, { type: 'challengeStart', id: 'fake' }), empty)
  let s = start()
  assert.equal(s.cash, 0)
  assert.equal(challengeAction(s, { type: 'challengeStart', id: 'furnish' }), s)
  s = challengeAction(s, { type: 'challengeCancel' })
  assert.equal(s.challenges.run, null)
  assert.equal(s.challenges.cooldownMs, 30000)
  assert.equal(s.cash, 0)
  assert.equal(challengeAction(s, { type: 'challengeStart', id: 'espresso' }), s)
  s = tickChallenges(s, 30000)
  assert.ok(challengeAction(s, { type: 'challengeStart', id: 'espresso' }).challenges.run)
})
test('checkpoints reject wrong location, stale actions, skipped stops and map-only movement', () => {
  let s = start(),
    r = s.challenges.run
  const a = { type: 'challengeCheck', id: r.id, checkpoint: 0, location: 'coffeehouse' }
  assert.equal(challengeAction(s, { ...a, location: 'diner' }), s)
  assert.equal(challengeAction(s, { ...a, checkpoint: 1 }), s)
  s = challengeAction(s, a)
  assert.equal(challengeAction(s, a), s)
  assert.equal(check(s), s)
  for (const meters of [NaN, Infinity, -1, 0, 9, 1000])
    assert.equal(challengeAction(s, { type: 'challengeMove', meters }), s)
  s = move(s)
  s = check(s)
  assert.equal(s.challenges.completed, 1)
  assert.equal(challengeAction(s, { ...a, checkpoint: 1, location: 'diner' }), s)
})
test('all routes are completable, award one gold payout and XP, and retain records', () => {
  for (const c of CHALLENGES) {
    assert.ok(c.stops.every((id) => CITY_BUILDINGS.some((b) => b.id === id)))
    let s = finish(start(c.id))
    assert.equal(s.cash, c.reward + Math.floor(c.reward / 2))
    assert.equal(s.challenges.completed, 1)
    assert.equal(s.challenges.records[0].wins, 1)
    assert.equal(s.dynasty.xp, 35)
    assert.match(s.challenges.log[0], /Gold/)
    s = tickChallenges(s, 30000)
    s = challengeAction(s, { type: 'challengeStart', id: c.id })
    s = finish(s)
    assert.equal(s.challenges.records[0].wins, 2)
  }
})
test('speed tiers pay disclosed silver and bronze rewards; timeout gives no reward or fine', () => {
  let s = start()
  s = tickChallenges(tickChallenges(s, 60000), 30000)
  s = finish(s)
  assert.equal(s.cash, 125)
  assert.match(s.challenges.log[0], /Silver/)
  s = start()
  s = tickChallenges(tickChallenges(tickChallenges(s, 60000), 60000), 30000)
  s = finish(s)
  assert.equal(s.cash, 100)
  assert.match(s.challenges.log[0], /Bronze/)
  s = start()
  for (let i = 0; i < 3; i++) s = tickChallenges(s, 60000)
  assert.equal(s.challenges.run, null)
  assert.equal(s.cash, 0)
  assert.equal(s.challenges.completed, 0)
  assert.match(s.challenges.log[0], /Time ran out/)
})
test('custody and offline time never advance challenges; live ticks and cooldowns do', () => {
  const s = start(),
    jailed = { ...s, dynasty: { ...s.dynasty, jailMs: 10000 } }
  assert.equal(tickChallenges(jailed, 60000), jailed)
  assert.equal(challengeAction(jailed, { type: 'challengeCancel' }), jailed)
  assert.equal(computeOfflineEarnings(s, s.lastSaved + 1000000).earnings, 0)
  assert.deepEqual(tick(jailed, 1000).challenges, s.challenges)
  assert.equal(tick(s, 1000).challenges.run.remainingMs, 179000)
  for (const ms of [0, -1, NaN, Infinity]) assert.equal(tickChallenges(s, ms), s)
})
test('legacy and malformed saves sanitize challenge state, and reload resumes without resetting its clock', () => {
  let s = check(start())
  s = tickChallenges(move(s), 1000)
  const restored = restoreState(JSON.parse(JSON.stringify(s)))
  assert.deepEqual(restored.challenges, s.challenges)
  assert.equal(restoreState({ cash: 77 }).cash, 77)
  assert.equal(restoreState({}).challenges.run, null)
  const malformed = restoreChallenges({
    run: { id: 'espresso', checkpoint: 99, meters: NaN, remainingMs: 999999 },
    records: [null, { id: 'espresso', wins: -5, bestMs: Infinity }],
    completed: -1,
    log: [3, 'saved'],
  })
  assert.equal(malformed.run.checkpoint, 1)
  assert.equal(malformed.run.remainingMs, 180000)
  assert.equal(malformed.run.meters, 0)
  assert.equal(malformed.records[0].wins, 0)
  assert.deepEqual(malformed.log, ['saved'])
  assert.equal(restoreChallenges({ run: { id: 'fake', remainingMs: 99 } }).run, null)
  s = { ...s, lifetimeEarnings: 1e12 }
  assert.equal(retireEmpire(s).challenges.run, null)
})
test('Low graphics stays low at night instead of rendering six cars', () => {
  // Regression: previous `night ? 6 : low ? 3 : 5` selected 6 before checking low.
  assert.equal(ambientPopulation(true, true).traffic, 3)
  assert.equal(ambientPopulation(true, false).traffic, 3)
  assert.equal(ambientPopulation(true, true).citizens, 8)
  assert.equal(ambientPopulation(false, true).traffic, 6)
  assert.equal(ambientPopulation(false, false).citizens, 24)
})

const { simulationSteps, moveWithin } = require('../lib/game/navigation.ts')
test('slow frames retain movement time in safe substeps, while tab resumes remain bounded', () => {
  const nav = { bounds: { minX: -10, maxX: 10, minZ: -10, maxZ: 10 }, obstacles: [] }
  let position = { x: 0, z: 0 }
  for (let frame = 0; frame < 10; frame++) for (const dt of simulationSteps(0.1)) position = moveWithin(position, 6 * dt, 0, nav)
  assert.ok(Math.abs(position.x - 6) < 1e-8)
  assert.ok(simulationSteps(0.25).every(dt => dt <= 0.05))
  assert.equal(simulationSteps(10).reduce((a,b) => a+b,0), 0.25)
  for (const invalid of [NaN, Infinity, -1, 0]) assert.deepEqual(simulationSteps(invalid), [])
  const wall = { ...nav, obstacles: [{ minX: 2, maxX: 3, minZ: -10, maxZ: 10 }] }
  position = { x: 0, z: 0 }
  for (let frame = 0; frame < 20; frame++) for (const dt of simulationSteps(0.25)) position = moveWithin(position, 6 * dt, 0, wall)
  assert.ok(position.x < 2, JSON.stringify(position))
})

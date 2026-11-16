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
const { createInitialState, restoreState, tick, retireEmpire } = require('../lib/game/engine.ts')
const {
  initialPlay,
  restorePlay,
  playAction,
  tickPlay,
  JOBS,
  GUIDE,
  cityTime,
  jobOpen,
  territoryStrength,
  territoryEnemy,
  contactFor,
} = require('../lib/game/city-play.ts')
const { dynastyAction, missionPower, defense } = require('../lib/game/dynasty.ts')
const rich = () => ({ ...createInitialState(), cash: 10000 })
const advance = (s, ms) => tickPlay(s, ms)

test('opening goals are sequential, one-time and checked against actual play', () => {
  let s = createInitialState()
  assert.equal(playAction(s, { type: 'guideClaim', id: 'earn' }), s)
  s = { ...s, runEarnings: 1 }
  assert.equal(playAction(s, { type: 'guideClaim', id: 'job' }), s)
  s = playAction(s, { type: 'guideClaim', id: 'earn' })
  assert.equal(s.cash, 25)
  assert.equal(playAction(s, { type: 'guideClaim', id: 'earn' }), s)
  assert.equal(playAction(s, { type: 'guideClaim', id: 'fake' }), s)
  s = playAction(s, { type: 'guideToggle' })
  assert.equal(s.play.guideHidden, true)
})
test('delivery requires correct pickup, actual completion destination, timer and cooldown; pays once', () => {
  let s = createInitialState()
  assert.equal(playAction(s, { type: 'startJob', id: 'delivery', location: 'hotel' }), s)
  s = playAction(s, { type: 'startJob', id: 'delivery', location: 'grocer' })
  assert.equal(s.play.job.id, 'delivery')
  assert.equal(playAction(s, { type: 'startJob', id: 'repair', location: 'garage' }), s)
  assert.equal(playAction(s, { type: 'jobStep', location: 'diner' }), s)
  s = advance(s, 20000)
  assert.equal(playAction(s, { type: 'jobStep', location: 'grocer' }), s)
  s = playAction(s, { type: 'jobStep', location: 'diner' })
  assert.equal(s.cash, 45)
  assert.equal(s.play.completed, 1)
  assert.equal(playAction(s, { type: 'jobStep', location: 'diner' }), s)
  assert.equal(playAction(s, { type: 'startJob', id: 'delivery', location: 'grocer' }), s)
})
test('taxi fare requires selected ownership; workshop has three distinct steps and charges materials', () => {
  let s = rich()
  assert.equal(playAction(s, { type: 'startJob', id: 'taxi', location: 'taxidepot' }), s)
  s = { ...s, fleet: { owned: ['taxi'], selected: 'taxi' } }
  s = playAction(s, { type: 'startJob', id: 'taxi', location: 'taxidepot' })
  s = advance(s, 30000)
  assert.equal(playAction(s, { type: 'jobStep', location: 'hotel' }), s)
  for (let i = 0; i < 5; i++) s = playAction(s, { type: 'driveMeters', meters: 6 })
  s = playAction(s, { type: 'jobStep', location: 'hotel' })
  assert.equal(s.cash, 10120)
  s = rich()
  s = playAction(s, { type: 'startJob', id: 'repair', location: 'garage' })
  assert.equal(s.cash, 9990)
  s = advance(s, 25000)
  for (let i = 0; i < 2; i++) {
    s = playAction(s, { type: 'jobStep', location: 'garage' })
    assert.equal(s.play.job.step, i + 1)
    assert.equal(s.cash, 9990)
  }
  s = playAction(s, { type: 'jobStep', location: 'garage' })
  assert.equal(s.cash, 10070)
})
test('club and rental activities obey clock schedules; rent purchase is wallet gated and pays passively', () => {
  let s = rich()
  assert.equal(jobOpen('club', s.play), false)
  assert.equal(jobOpen('rent', s.play), true)
  assert.equal(playAction(s, { type: 'startJob', id: 'club', location: 'jazz' }), s)
  s = { ...s, play: { ...s.play, timeMs: 12 * 60000 } }
  assert.equal(cityTime(s.play).hour, 20)
  assert.equal(jobOpen('club', s.play), true)
  s = playAction(s, { type: 'startJob', id: 'club', location: 'jazz' })
  s = advance(s, 25000)
  for (let i = 0; i < 3; i++) s = playAction(s, { type: 'jobStep', location: 'jazz' })
  assert.equal(s.cash, 10085)
  s = rich()
  s = playAction(s, { type: 'buyRental', id: 'home-1' })
  assert.equal(s.cash, 9700)
  assert.equal(playAction(s, { type: 'buyRental', id: 'home-1' }), s)
  assert.equal(playAction(s, { type: 'buyRental', id: 'hustle' }), s)
  s = advance(s, 60000)
  assert.equal(s.cash, 9725)
})
test('territory captures disclose strength, spend resources, pay protection and suffer rival takebacks', () => {
  let s = rich()
  assert.ok(territoryStrength(s) < territoryEnemy(s, 'Little Italy'))
  const lost = playAction(s, { type: 'territory', district: 'Little Italy' })
  assert.equal(lost.play.territories[0].control, 0)
  assert.equal(lost.cash, 9965)
  s = { ...s, city: { ...s.city, crew: 12 } }
  for (let i = 0; i < 4; i++) {
    s = { ...s, city: { ...s.city, stamina: 100 } }
    s = playAction(s, { type: 'territory', district: 'Little Italy' })
  }
  assert.equal(s.play.territories[0].control, 100)
  assert.equal(playAction(s, { type: 'territory', district: 'Little Italy' }), s)
  const before = s.cash
  s = advance(s, 60000)
  assert.equal(s.cash, before + 40)
  s = advance(s, 60000)
  assert.equal(s.play.territories[0].control, 85)
  const guarded = {
    ...s,
    play: { ...s.play, territoryMs: 1 },
    dynasty: {
      ...s.dynasty,
      members: ['joey', 'lucia', 'frank'].map((id) => ({ id, duty: 'guard', recoveryMs: 0 })),
    },
  }
  assert.equal(advance(guarded, 1).play.territories[0].control, 85)
  const truce = {
    ...s,
    play: { ...s.play, territoryMs: 1 },
    city: {
      ...s.city,
      families: { ...s.city.families, moretti: { ...s.city.families.moretti, truceMs: 30000 } },
    },
  }
  assert.equal(advance(truce, 1).play.territories[0].control, 85)
})
test('conversations change loyalty; personal tasks pay once and promotions require loyalty, work and hiring', () => {
  let s = rich()
  s = playAction(s, { type: 'talk', id: 'joey', choice: 'business' })
  assert.equal(contactFor(s, 'joey').loyalty, 60)
  assert.equal(playAction(s, { type: 'talk', id: 'joey', choice: 'respect' }), s)
  assert.equal(playAction(s, { type: 'contactQuest', id: 'joey' }), s)
  s = { ...s, play: { ...s.play, completed: 1 } }
  s = playAction(s, { type: 'contactQuest', id: 'joey' })
  assert.equal(s.cash, 10050)
  assert.equal(playAction(s, { type: 'contactQuest', id: 'joey' }), s)
  assert.equal(playAction(s, { type: 'promoteMember', id: 'joey' }), s)
  s = dynastyAction(s, { type: 'meetHire', id: 'joey' })
  const power = missionPower(s, 'joey'),
    guard = defense({
      ...s,
      dynasty: { ...s.dynasty, members: [{ id: 'joey', duty: 'guard', recoveryMs: 0 }] },
    })
  s = playAction(s, { type: 'promoteMember', id: 'joey' })
  assert.equal(contactFor(s, 'joey').grade, 1)
  assert.ok(missionPower(s, 'joey') > power)
  assert.ok(
    defense({ ...s, dynasty: { ...s.dynasty, members: [{ id: 'joey', duty: 'guard', recoveryMs: 0 }] } }) >
      guard,
  )
  s = advance(s, 30000)
  s = playAction(s, { type: 'talk', id: 'joey', choice: 'threaten' })
  assert.equal(contactFor(s, 'joey').loyalty, 65)
})
test('all new state migrates, sanitizes, resumes and resets without losing old property', () => {
  const old = rich()
  delete old.play
  assert.deepEqual(restoreState(old).play, initialPlay())
  const dirty = restorePlay({
    timeMs: Infinity,
    territories: [{ district: 'Little Italy', control: 999 }],
    contacts: [{ id: 'fake' }],
    job: { id: 'fake' },
    rents: ['hustle', 'home-1'],
    quality: 'fake',
  })
  assert.equal(dirty.timeMs, 0)
  assert.equal(dirty.job, null)
  assert.deepEqual(dirty.rents, ['home-1'])
  assert.equal(dirty.territories[0].control, 100)
  assert.equal(dirty.quality, 'balanced')
  let s = playAction(rich(), { type: 'startJob', id: 'repair', location: 'garage' })
  s = advance(s, 10000)
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(s))).play, s.play)
  assert.deepEqual(retireEmpire({ ...s, lifetimeEarnings: 1e12 }).play, initialPlay())
  const jailed = { ...s, dynasty: { ...s.dynasty, jailMs: 30000 } }
  assert.equal(playAction(jailed, { type: 'jobStep', location: 'garage' }), jailed)
  assert.equal(tickPlay(jailed, 10000), jailed)
})
test('opening rewards plus ordinary activities fund a first home without long repetitive grinding', () => {
  let s = { ...createInitialState(), runEarnings: 1, cash: 1 }
  s = playAction(s, { type: 'guideClaim', id: 'earn' })
  s = playAction(s, { type: 'startJob', id: 'delivery', location: 'grocer' })
  s = advance(s, 20000)
  s = playAction(s, { type: 'jobStep', location: 'diner' })
  s = playAction(s, { type: 'guideClaim', id: 'job' })
  s = dynastyAction(s, { type: 'meetHire', id: 'joey' })
  s = playAction(s, { type: 'guideClaim', id: 'hire' })
  assert.ok(s.cash >= 250)
  s = dynastyAction(s, { type: 'estateUpgrade' })
  assert.equal(s.dynasty.estate, 0)
  s = playAction(s, { type: 'guideClaim', id: 'home' })
  assert.ok(s.cash >= 150)
})

test('waiting indoors changes only the clock, not payouts or timers', () => {
  let s = rich()
  assert.equal(playAction(s, { type: 'waitTime', hour: 18 }), s)
  s = { ...s, dynasty: { ...s.dynasty, shelter: true } }
  const next = playAction(s, { type: 'waitTime', hour: 18 })
  assert.equal(cityTime(next.play).hour, 18)
  assert.equal(next.cash, s.cash)
  assert.equal(next.play.rentMs, s.play.rentMs)
  assert.equal(next.dynasty.raidMs, s.dynasty.raidMs)
})

test('personal tasks cannot be claimed using work done before acceptance', () => {
  let s = { ...rich(), play: { ...initialPlay(), completed: 3 } }
  s = playAction(s, { type: 'talk', id: 'joey', choice: 'business' })
  assert.equal(contactFor(s, 'joey').taskStart, 3)
  assert.equal(playAction(s, { type: 'contactQuest', id: 'joey' }), s)
  s = { ...s, play: { ...s.play, completed: 4 } }
  assert.equal(playAction(s, { type: 'contactQuest', id: 'joey' }).cash, s.cash + 50)
})

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
const { harborAction, restoreHarbor, HARBOR_MISSIONS } = require('../lib/game/harbor.ts')
const { dynastyAction } = require('../lib/game/dynasty.ts')
const { cityAction } = require('../lib/game/rivals.ts')
const { playAction, tickPlay } = require('../lib/game/city-play.ts')
const { trafficSignal, trafficPosition } = require('../lib/game/city-life.ts')
const step = (s, choice) =>
  harborAction(s, {
    type: 'harborStep',
    chapter: s.harbor.chapter,
    step: s.harbor.step,
    location: HARBOR_MISSIONS[s.harbor.chapter].locations[s.harbor.step],
    choice,
  })
const hired = () => ({
  ...createInitialState(),
  dynasty: {
    ...createInitialState().dynasty,
    members: [{ id: 'joey', duty: 'idle', recoveryMs: 0 }],
  },
})
function campaign(ending, workers = 'community', mode = 'walk') {
  let s = createInitialState()
  s = step(step(s))
  s = dynastyAction(s, { type: 'meetHire', id: 'joey' })
  s = harborAction(s, { type: 'harborSupport', id: 'joey' })
  s = step(step(s))
  s = step(s)
  if (mode === 'drive') s = { ...s, fleet: { owned: ['taxi'], selected: 'taxi' } }
  for (let i = 0; i < 15; i++)
    s = harborAction(s, { type: 'harborMove', meters: 6, driving: mode === 'drive' })
  s = step(s)
  s = step(s, workers)
  s = step(s)
  s = step(s, ending)
  return step(s)
}
test('opening is free, ordered and pays once; stale actions, wrong locations and custody cannot advance', () => {
  let s = createInitialState()
  const action = { type: 'harborStep', chapter: 0, step: 0, location: 'grocer' }
  assert.equal(harborAction(s, { ...action, location: 'hotel' }), s)
  assert.equal(harborAction(s, { ...action, chapter: 4 }), s)
  s = harborAction(s, action)
  assert.equal(s.cash, 0)
  assert.equal(harborAction(s, action), s)
  s = step(s)
  assert.equal(s.cash, 150)
  assert.equal(step(s), s) // A hired support member is required for chapter two.
  const jailed = { ...s, dynasty: { ...s.dynasty, jailMs: 1000 } }
  assert.equal(harborAction(jailed, { type: 'harborSupport', id: 'joey' }), jailed)
})
test('support must be hired, available and present at both stops; each role has an effect', () => {
  for (const [id, bonus, heat, xp] of [
    ['joey', 75, 40, 0],
    ['lucia', 0, 25, 0],
    ['frank', 0, 40, 75],
  ]) {
    let s = hired()
    s = {
      ...s,
      dynasty: { ...s.dynasty, heat: 40, members: [{ id, duty: 'idle', recoveryMs: 0 }] },
      harbor: { ...s.harbor, chapter: 1 },
    }
    assert.equal(harborAction(s, { type: 'harborSupport', id: 'unknown' }), s)
    s = harborAction(s, { type: 'harborSupport', id })
    s = step(s)
    const away = { ...s, dynasty: { ...s.dynasty, missions: [{ memberId: id }] } }
    assert.equal(step(away), away)
    s = step(s)
    assert.equal(s.cash, 350 + bonus)
    assert.equal(s.dynasty.heat, heat)
    assert.equal(s.dynasty.xp, xp)
  }
})
test('shipment needs actual accumulated travel; invalid distances, unowned driving and offline ticks do not complete it', () => {
  let s = {
    ...createInitialState(),
    harbor: { ...createInitialState().harbor, chapter: 2, step: 1 },
  }
  for (const meters of [Infinity, NaN, -1, 0, 9, 1000])
    assert.equal(harborAction(s, { type: 'harborMove', meters, driving: false }), s)
  assert.equal(harborAction(s, { type: 'harborMove', meters: 8, driving: true }), s)
  assert.equal(step(s), s)
  s = tick(s, 60000)
  assert.equal(s.harbor.walked, 0)
  for (let i = 0; i < 15; i++)
    s = harborAction(s, { type: 'harborMove', meters: 6, driving: false })
  s = restoreState(JSON.parse(JSON.stringify(s)))
  assert.equal(s.harbor.walked, 90)
  assert.equal(step(s).harbor.chapter, 3)
})
test('both endings complete from a fresh wallet, on foot or in a vehicle, with locked lasting consequences', () => {
  for (const mode of ['walk', 'drive'])
    for (const ending of ['alliance', 'takeover']) {
      let s = campaign(ending, 'community', mode)
      assert.equal(s.harbor.chapter, 5)
      assert.equal(s.harbor.ending, ending)
      assert.equal(s.cash, 2265)
      assert.equal(s.harbor.workers, 'community')
      assert.equal(s.dynasty.hostility.includes('doyle'), ending === 'takeover')
      const oldCash = s.cash
      assert.equal(
        harborAction(s, { type: 'harborStep', chapter: 4, step: 1, location: 'warehouse' }),
        s,
      )
      if (ending === 'alliance') {
        assert.equal(cityAction(s, { type: 'rival', id: 'doyle', move: 'challenge' }), s)
        assert.equal(dynastyAction(s, { type: 'sendHit', family: 'doyle', id: 'joey' }), s)
        assert.equal(playAction(s, { type: 'territory', district: 'Harbor Quarter' }), s)
        s = { ...s, play: { ...s.play, territoryMs: 1 } }
        const before = s.play.territories.find((t) => t.district === 'Harbor Quarter').control
        s = tickPlay(s, 1000)
        assert.equal(
          s.play.territories.find((t) => t.district === 'Harbor Quarter').control,
          before,
        )
      } else
        assert.equal(s.play.territories.find((t) => t.district === 'Harbor Quarter').control, 100)
      assert.equal(s.cash, oldCash)
    }
})
test('worker decision affects loyalty and earnings and rejects invalid choices', () => {
  let s = hired()
  s = {
    ...s,
    harbor: { ...s.harbor, chapter: 3 },
    play: { ...s.play, contacts: [{ id: 'joey', loyalty: 50 }] },
  }
  assert.equal(step(s, 'cheat'), s)
  const community = step(s, 'community'),
    pressure = step(s, 'pressure')
  assert.equal(community.play.contacts[0].loyalty, 65)
  assert.equal(pressure.play.contacts[0].loyalty, 40)
  assert.equal(pressure.cash, 200)
  assert.equal(pressure.dynasty.heat, 15)
  assert.equal(
    campaign('alliance', 'community').play.territories.find((t) => t.district === 'Harbor Quarter')
      .control,
    50,
  )
  assert.equal(
    campaign('alliance', 'pressure').play.territories.find((t) => t.district === 'Harbor Quarter')
      .control,
    25,
  )
})
test('council requires a unique available capo, costs $300, saves and reduces takebacks', () => {
  let s = hired()
  s = { ...s, cash: 600, play: { ...s.play, contacts: [{ id: 'joey', grade: 1 }] } }
  const invest = { type: 'harborInvest', member: 'joey', district: 'Little Italy' }
  assert.equal(harborAction(s, invest), s)
  s = { ...s, play: { ...s.play, contacts: [{ id: 'joey', grade: 2 }] } }
  s = harborAction(s, invest)
  assert.equal(s.cash, 300)
  assert.equal(s.play.territories[0].control, 25)
  assert.equal(harborAction(s, invest), s)
  assert.equal(harborAction(s, { ...invest, district: 'Eastside' }), s)
  s = { ...s, play: { ...s.play, territoryMs: 1 } }
  s = tickPlay(s, 1000)
  assert.equal(s.play.territories[0].control, 15)
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(s))).harbor, s.harbor)
})
test('legacy and malformed saves are safe; retirement resets story, not legacy home', () => {
  assert.equal(restoreState({ cash: 777 }).cash, 777)
  assert.equal(restoreState({ cash: 777 }).harbor.chapter, 0)
  const h = restoreHarbor({
    chapter: Infinity,
    step: 99,
    support: 'fake',
    walked: NaN,
    driven: -1,
    investments: ['Fake', 'Eastside', 'Eastside'],
    council: {},
    ending: 'alliance',
  })
  assert.equal(h.chapter, 0)
  assert.equal(h.walked, 0)
  assert.equal(h.ending, null)
  assert.deepEqual(h.investments, ['Eastside'])
  let s = campaign('alliance')
  s = { ...s, lifetimeEarnings: 1e12, dynasty: { ...s.dynasty, estate: 3 } }
  s = retireEmpire(s)
  assert.equal(s.harbor.chapter, 0)
  assert.equal(s.dynasty.estate, 3)
})
test('traffic shares working lamps, stops before red intersections, moves on green, and clamps long frames', () => {
  assert.equal(trafficSignal(0), 'green')
  assert.equal(trafficSignal(10), 'amber')
  assert.equal(trafficSignal(12), 'red')
  assert.equal(trafficSignal(24), 'green')
  assert.equal(trafficPosition(-12.9, false, 0.1, 15, 3), -13)
  assert.equal(trafficPosition(-13, false, 0.1, 15, 3), -13)
  assert.ok(trafficPosition(-13, false, 0.1, 0, 3) < -13)
  assert.equal(trafficPosition(-23, true, 0.1, 15, 3), -23)
  assert.equal(trafficPosition(0, false, 100, 0, 3), -0.30000000000000004)
})

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
  profitMultiplier,
} = require('../lib/game/engine.ts')
const {
  initialDynasty,
  restoreDynasty,
  dynastyAction,
  rankIndex,
  RANKS,
  ESTATES,
  RECRUITS,
  defense,
  tickDynasty,
} = require('../lib/game/dynasty.ts')
const { CITY_BUILDINGS, CITY_OBSTACLES } = require('../lib/game/city.ts')
const rich = () => ({ ...createInitialState(), cash: 1e7 })

test('family ranks start at associate and progress through made man, capo, don and godfather', () => {
  let s = createInitialState()
  assert.equal(rankIndex(s), 0)
  RANKS.forEach((r, i) => assert.equal(rankIndex({ ...s, dynasty: { ...s.dynasty, xp: r.xp } }), i))
  assert.equal(rankIndex({ ...s, lifetimeEarnings: 2500 }), 1)
})
test('residences require sequential wallet purchases, no duplicate top upgrade, and preserve vault cash', () => {
  let s = rich(),
    cash = s.cash
  assert.equal(s.dynasty.estate, -1)
  assert.equal(dynastyAction(createInitialState(), { type: 'estateUpgrade' }).dynasty.estate, -1)
  for (let i = 0; i < ESTATES.length; i++) {
    s = dynastyAction(s, { type: 'estateUpgrade' })
    cash -= ESTATES[i].cost
    assert.equal(s.cash, cash)
    assert.equal(s.dynasty.estate, i)
    assert.equal(s.safeHouse.balance, 0)
  }
  assert.equal(dynastyAction(s, { type: 'estateUpgrade' }), s)
  const restored = restoreState(JSON.parse(JSON.stringify(s)))
  assert.deepEqual(restored.dynasty, s.dynasty)
  assert.equal(retireEmpire({ ...s, lifetimeEarnings: 1e12 }).dynasty.estate, 4)
})
test('old safe houses migrate without confiscating progression; fresh players start with no home', () => {
  const s = rich()
  delete s.dynasty
  assert.equal(restoreState(s).dynasty.estate, 2)
  delete s.safeHouse
  assert.equal(restoreState(s).dynasty.estate, -1)
  assert.equal(initialDynasty().estate, -1)
  const malformed = restoreDynasty({
    estate: Infinity,
    heat: NaN,
    members: [{ id: 'fake' }],
    missions: [{ memberId: 'fake' }],
    hostility: {},
    log: [4, 'ok'],
  })
  assert.equal(malformed.estate, -1)
  assert.deepEqual(malformed.members, [])
  assert.deepEqual(malformed.missions, [])
  assert.deepEqual(malformed.log, ['ok'])
})
test('named recruits are unique hires, earn collections, guard and cannot be assigned while away', () => {
  let s = rich()
  s = dynastyAction(s, { type: 'meetHire', id: 'joey' })
  assert.equal(s.cash, 1e7 - 60)
  assert.equal(dynastyAction(s, { type: 'meetHire', id: 'joey' }), s)
  assert.equal(dynastyAction(s, { type: 'meetHire', id: 'fake' }), s)
  assert.equal(
    dynastyAction(createInitialState(), { type: 'meetHire', id: 'joey' }).dynasty.members.length,
    0,
  )
  const after = tickDynasty(s, 30000)
  assert.equal(after.cash, s.cash + 12)
  s = dynastyAction(s, { type: 'duty', id: 'joey', duty: 'guard' })
  assert.equal(defense(s), 3)
  assert.equal(tickDynasty(s, 30000).cash, s.cash)
})
test('hit missions enforce rank, cost, heat and truce guards and settle only once', () => {
  let s = dynastyAction(rich(), { type: 'meetHire', id: 'frank' })
  assert.equal(dynastyAction(s, { type: 'sendHit', id: 'frank', family: 'moretti' }), s)
  s = { ...s, dynasty: { ...s.dynasty, xp: 100 } }
  const start = dynastyAction(s, { type: 'sendHit', id: 'frank', family: 'moretti' })
  assert.equal(start.cash, s.cash - 40)
  assert.equal(start.dynasty.heat, 30)
  assert.equal(start.dynasty.missions.length, 1)
  assert.equal(dynastyAction(start, { type: 'sendHit', id: 'frank', family: 'moretti' }), start)
  assert.equal(dynastyAction(start, { type: 'duty', id: 'frank', duty: 'guard' }), start)
  const resumed = restoreState(JSON.parse(JSON.stringify(start)))
  const done = tickDynasty(resumed, 30000)
  assert.equal(done.dynasty.hits, 1)
  assert.equal(done.dynasty.missions.length, 0)
  assert.equal(done.city.families.moretti.influence, 30)
  assert.equal(done.cash, start.cash + 100)
  assert.equal(tickDynasty(done, 1).cash, done.cash)
  const hot = { ...s, dynasty: { ...s.dynasty, heat: 80 } }
  assert.equal(dynastyAction(hot, { type: 'sendHit', id: 'frank', family: 'moretti' }), hot)
  const truce = {
    ...s,
    city: {
      ...s.city,
      families: { ...s.city.families, moretti: { ...s.city.families.moretti, truceMs: 30000 } },
    },
  }
  assert.equal(dynastyAction(truce, { type: 'sendHit', id: 'frank', family: 'moretti' }), truce)
})
test('outmatched hits injure the operative temporarily and never give victory rewards', () => {
  let s = dynastyAction(rich(), { type: 'meetHire', id: 'joey' })
  s = { ...s, dynasty: { ...s.dynasty, xp: 100 } }
  const start = dynastyAction(s, { type: 'sendHit', id: 'joey', family: 'doyle' })
  const done = tickDynasty(start, 30000)
  assert.equal(done.dynasty.hits, 0)
  assert.equal(done.dynasty.members[0].recoveryMs, 60000)
  assert.equal(done.cash, start.cash)
})
test('hostile NPC families retaliate; guards and truces prevent losses, vault is protected', () => {
  let s = rich()
  s = {
    ...s,
    safeHouse: { ...s.safeHouse, balance: 777 },
    dynasty: { ...s.dynasty, hostility: ['moretti'], raidMs: 1 },
  }
  const attacked = tickDynasty(s, 1)
  assert.ok(attacked.cash < s.cash)
  assert.equal(attacked.dynasty.disruptionMs, 30000)
  assert.equal(profitMultiplier(attacked, 'hustle'), 0.8)
  assert.equal(tickDynasty(attacked, 30000).dynasty.disruptionMs, 0)
  assert.equal(attacked.safeHouse.balance, 777)
  assert.equal(attacked.dynasty.raids, 1)
  let guarded = dynastyAction(s, { type: 'meetHire', id: 'rosa' })
  assert.equal(tickDynasty(guarded, 1).cash, guarded.cash)
  const peace = {
    ...s,
    city: {
      ...s.city,
      families: { ...s.city.families, moretti: { ...s.city.families.moretti, truceMs: 1000 } },
    },
  }
  assert.equal(tickDynasty(peace, 1).cash, peace.cash)
  assert.equal(tickDynasty(rich(), 60000).dynasty.raids, 0)
})
test('heat leads to visible timed custody, finite fines, bail or free release; shelter and lawyer reduce heat', () => {
  let s = rich()
  s = { ...s, dynasty: { ...s.dynasty, heat: 100, arrestMs: 1000 } }
  const caught = tickDynasty(s, 1000)
  assert.equal(caught.dynasty.jailMs, 30000)
  assert.equal(caught.cash, s.cash - 150)
  assert.equal(dynastyAction(caught, { type: 'meetHire', id: 'joey' }), caught)
  const bailed = dynastyAction(caught, { type: 'bail' })
  assert.equal(bailed.cash, caught.cash - 200)
  assert.equal(bailed.dynasty.jailMs, 0)
  assert.equal(tick(caught, 30000).dynasty.jailMs, 0)
  const shelter = tickDynasty({ ...s, dynasty: { ...s.dynasty, shelter: true } }, 10000)
  assert.equal(shelter.dynasty.jailMs, 0)
  assert.ok(shelter.dynasty.heat < 100)
  const paid = dynastyAction(s, { type: 'payLawyer' })
  assert.equal(paid.cash, s.cash - 100)
  assert.equal(paid.dynasty.heat, 55)
  const broke = { ...s, cash: 20 }
  assert.equal(tickDynasty(broke, 1000).cash, 0)
})
test('Garden Heights adds twelve accessible homes including apartment towers; recruit positions are outside buildings', () => {
  const homes = CITY_BUILDINGS.filter((b) => b.district === 'Garden Heights' && b.kind === 'home')
  assert.equal(homes.length, 12)
  assert.ok(homes.filter((b) => b.name.includes('Apartments')).length >= 5)
  assert.ok(homes.some((b) => b.height >= 25))
  for (const r of RECRUITS)
    assert.ok(
      !CITY_OBSTACLES.some(
        (o) =>
          r.position[0] > o.minX &&
          r.position[0] < o.maxX &&
          r.position[2] > o.minZ &&
          r.position[2] < o.maxZ,
      ),
    )
})

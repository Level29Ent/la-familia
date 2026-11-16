const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => {
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    filename,
  )
}
const {
  CITY_BUILDINGS,
  CITY_NAVIGATION,
  CITY_OBSTACLES,
  INTERIOR_NAVIGATION,
  outsideBuilding,
  FAMILIES,
  patrolPosition,
} = require('../lib/game/city.ts')
const { focusedTarget, moveWithin } = require('../lib/game/navigation.ts')
const { createInitialState, restoreState, tick, retireEmpire } = require('../lib/game/engine.ts')
const {
  initialCity,
  restoreCity,
  crewPower,
  opposition,
  cityAction,
  tickCity,
} = require('../lib/game/rivals.ts')
const { driveCar, carExit } = require('../lib/game/good-life.ts')
const inside = (p, o) => p.x > o.minX && p.x < o.maxX && p.z > o.minZ && p.z < o.maxZ

test('fifteen blocks contain 60 non-overlapping, enterable buildings including homes, businesses and family clubs', () => {
  assert.equal(CITY_BUILDINGS.length, 60)
  assert.equal(new Set(CITY_BUILDINGS.map((b) => b.id)).size, 60)
  assert.equal(CITY_BUILDINGS.filter((b) => b.kind === 'home').length, 30)
  assert.equal(CITY_BUILDINGS.filter((b) => b.kind === 'business').length, 26)
  assert.equal(CITY_BUILDINGS.filter((b) => b.kind === 'headquarters').length, 3)
  for (const b of CITY_BUILDINGS) {
    const nav = outsideBuilding(b.id),
      p = { x: nav.start[0], z: nav.start[2] }
    assert.ok(!CITY_OBSTACLES.some((o) => inside(p, o)), `${b.name}: return spawn is clear`)
    assert.equal(focusedTarget(p, nav.yaw, nav), b.id, `${b.name}: door is interactable after travel/exit`)
    for (const other of CITY_BUILDINGS.filter((o) => o.id !== b.id)) {
      assert.ok(
        Math.abs(b.position[0] - other.position[0]) >= 10 || Math.abs(b.position[2] - other.position[2]) >= 9,
      )
    }
  }
  for (const f of FAMILIES) assert.equal(CITY_BUILDINGS.find((b) => b.family === f.id).district, f.district)
})

test('every entrance is reachable on foot through the connected city street grid', () => {
  const nav = CITY_NAVIGATION,
    q = [{ x: nav.start[0], z: nav.start[2] }],
    seen = new Set([`${q[0].x},${q[0].z}`])
  for (let i = 0; i < q.length; i++) {
    const p = q[i]
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = moveWithin(p, dx, dz, nav),
        key = `${n.x},${n.z}`
      if (!seen.has(key)) {
        seen.add(key)
        q.push(n)
      }
    }
  }
  for (const b of CITY_BUILDINGS) {
    assert.ok(
      q.some((p) => Math.hypot(p.x - b.door[0], p.z - b.door[1]) < 2),
      `${b.name}: walking route`,
    )
  }
})

test('interior center aisle reaches exit and furniture blocks movement', () => {
  const nav = INTERIOR_NAVIGATION
  const p = moveWithin({ x: 0, z: 4.5 }, 0, 1.5, nav)
  assert.equal(focusedTarget(p, Math.PI, nav), 'exit')
  assert.equal(moveWithin({ x: -2.9, z: 0 }, -0.2, 0, nav).x, -2.9)
})

test('old saves gain city state without losing cash, businesses, vault or character', () => {
  const fresh = createInitialState(),
    old = { ...fresh, cash: 123, city: undefined }
  const migrated = restoreState(old)
  assert.equal(migrated.cash, 123)
  assert.deepEqual(migrated.city, initialCity())
  assert.deepEqual(migrated.businesses, fresh.businesses)
  assert.deepEqual(migrated.safeHouse, fresh.safeHouse)
  const city = restoreCity({
    crew: Infinity,
    stamina: -2,
    families: { moretti: { influence: NaN, truceMs: Infinity, cooldownMs: -99 } },
  })
  assert.equal(city.crew, 1)
  assert.equal(city.stamina, 0)
  assert.equal(city.families.moretti.influence, 60)
})

test('recruiting spends cash, strength decides confrontations, and cooldown prevents duplicate rewards', () => {
  let state = createInitialState()
  assert.equal(cityAction(state, { type: 'recruit' }), state)
  const loss = cityAction(state, { type: 'rival', id: 'moretti', move: 'challenge' })
  assert.equal(loss.cash, 0)
  assert.equal(loss.city.stamina, 75)
  assert.equal(loss.city.victories, 0)
  state = { ...state, cash: 1000 }
  for (let i = 0; i < 3; i++) state = cityAction(state, { type: 'recruit' })
  assert.equal(state.city.crew, 4)
  assert.equal(state.cash, 1000 - 15 - 60 - 135)
  assert.ok(crewPower(state) >= opposition(state, 'moretti'))
  const win = cityAction(state, { type: 'rival', id: 'moretti', move: 'challenge' })
  assert.equal(win.cash, state.cash + 60)
  assert.equal(win.city.families.moretti.influence, 40)
  assert.equal(win.city.victories, 1)
  assert.equal(cityAction(win, { type: 'rival', id: 'moretti', move: 'challenge' }), win)
  const exhausted = { ...state, city: { ...state.city, stamina: 24 } }
  assert.equal(cityAction(exhausted, { type: 'rival', id: 'moretti', move: 'challenge' }), exhausted)
  assert.equal(cityAction(state, { type: 'rival', id: 'unknown', move: 'challenge' }), state)
})

test('rivals rebuild influence, paid truces stop recovery, rest restores stamina, and save round trips persist wars', () => {
  let state = { ...createInitialState(), cash: 100 }
  const truce = cityAction(state, { type: 'rival', id: 'moretti', move: 'truce' })
  assert.equal(truce.cash, 70)
  assert.equal(cityAction(truce, { type: 'rival', id: 'moretti', move: 'truce' }), truce)
  assert.equal(cityAction(truce, { type: 'rival', id: 'moretti', move: 'challenge' }), truce)
  const advanced = tick(truce, 60000)
  assert.equal(advanced.city.families.moretti.influence, 60)
  assert.equal(advanced.city.families.volkov.influence, 65)
  assert.equal(advanced.city.families.moretti.truceMs, 60000)
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(advanced))).city, advanced.city)
  const tired = { ...state, city: { ...state.city, stamina: 20 } }
  assert.equal(cityAction(tired, { type: 'rest' }).city.stamina, 100)
  assert.equal(tickCity(tired.city, 10000).stamina, 22)
  const retired = retireEmpire({ ...advanced, lifetimeEarnings: 1e12 })
  assert.deepEqual(retired.city, initialCity())
})

test('patrols move on sidewalks without crossing building footprints', () => {
  for (let npc = 0; npc < 12; npc++) {
    assert.notDeepEqual(patrolPosition(npc, 0), patrolPosition(npc, 8))
    for (let t = 0; t < 100; t++) {
      const [x, z] = patrolPosition(npc, t)
      assert.ok(!CITY_OBSTACLES.some((o) => inside({ x, z }, o)))
    }
  }
})

test('cars cannot pass through city buildings and exits avoid their footprints', () => {
  const o = CITY_OBSTACLES[0]
  const car = { x: (o.minX + o.maxX) / 2, z: o.maxZ + 1.1, yaw: Math.PI, speed: 16 }
  const blocked = driveCar(car, 1, 0, false, 0.05, CITY_NAVIGATION.bounds, CITY_OBSTACLES)
  assert.equal(blocked.speed, 0)
  assert.equal(blocked.z, car.z)
  const exit = carExit(
    { x: o.minX - 0.6, z: (o.minZ + o.maxZ) / 2, yaw: 0, speed: 0 },
    CITY_NAVIGATION.bounds,
    CITY_OBSTACLES,
  )
  assert.ok(!CITY_OBSTACLES.some((o) => inside(exit, o)))
})

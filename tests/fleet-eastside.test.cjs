const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
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
  retireEmpire,
  empireAction,
  tick,
} = require('../lib/game/engine.ts')
const {
  VEHICLES,
  restoreFleet,
  fleetAction,
  activeVehicle,
  PARKED_VEHICLES,
} = require('../lib/game/vehicles.ts')
const { CITY_BUILDINGS, CITY_OBSTACLES } = require('../lib/game/city.ts')
const { EASTSIDE_BUSINESSES } = require('../lib/game/config.ts')
const { driveCar, PARKED_CARS } = require('../lib/game/good-life.ts')

test('Eastside adds 12 addresses without moving the original district anchors', () => {
  assert.deepEqual(CITY_BUILDINGS.find((b) => b.id === 'hustle').position, [-26, 0, 8])
  assert.deepEqual(CITY_BUILDINGS.find((b) => b.id === 'safehouse').position, [-10, 0, 8])
  const east = CITY_BUILDINGS.filter((b) => b.district === 'Eastside')
  assert.equal(east.length, 12)
  assert.equal(east.filter((b) => b.kind === 'home').length, 4)
  assert.ok(east.every((b) => b.position[0] >= 82))
  assert.ok(EASTSIDE_BUSINESSES.every((b) => east.some((e) => e.id === b.id)))
})
test('each new business can generate income and has an old-save default', () => {
  const old = createInitialState()
  for (const b of EASTSIDE_BUSINESSES) delete old.businesses[b.id]
  const migrated = restoreState(old)
  for (const b of EASTSIDE_BUSINESSES) {
    assert.equal(migrated.businesses[b.id].owned, 0)
    const state = { ...createInitialState() }
    state.businesses[b.id] = { owned: 1, managed: false, running: true, progress: 0 }
    assert.equal(tick(state, b.cycleSeconds * 1000).cash, b.baseRevenue)
  }
})
test('fleet purchases debit exactly once and selection requires ownership', () => {
  const empty = createInitialState()
  assert.equal(fleetAction(empty, { type: 'vehicleBuy', id: 'taxi' }), empty)
  assert.equal(fleetAction(empty, { type: 'vehicleSelect', id: 'roadster' }), empty)
  assert.equal(fleetAction(empty, { type: 'vehicleBuy', id: 'invalid' }), empty)
  let state = { ...empty, cash: 50000 }
  for (const v of VEHICLES) {
    const before = state.cash
    state = fleetAction(state, { type: 'vehicleBuy', id: v.id })
    assert.equal(state.cash, before - v.cost)
    assert.equal(activeVehicle(state).id, v.id)
    assert.equal(fleetAction(state, { type: 'vehicleBuy', id: v.id }), state)
  }
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(state))).fleet, state.fleet)
  state = fleetAction(state, { type: 'vehicleSelect', id: 'taxi' })
  assert.equal(activeVehicle(state).id, 'taxi')
  assert.equal(retireEmpire({ ...state, lifetimeEarnings: 1e12 }).fleet.selected, null)
})
test('legacy sedan perk remains drivable and garage does not duplicate the asset reward', () => {
  let state = empireAction({ ...createInitialState(), cash: 50000 }, { type: 'asset', id: 'sedan' })
  assert.equal(activeVehicle(state).id, 'sedan')
  assert.equal(fleetAction(state, { type: 'vehicleBuy', id: 'sedan' }), state)
  assert.equal(restoreState({ ...state, fleet: undefined }).fleet.selected, 'sedan')
  assert.deepEqual(restoreFleet({ owned: ['invalid', 'taxi', 'taxi', 'sedan'], selected: 'invalid' }, []), {
    owned: ['taxi'],
    selected: 'taxi',
  })
})
test('vehicle handling gives distinct speeds with braking and building collision for every model', () => {
  const bounds = { minX: -1000, maxX: 1000, minZ: -1000, maxZ: 1000 }
  const speeds = []
  for (const v of VEHICLES) {
    let car = { x: -200, z: 0, yaw: Math.PI, speed: 0 }
    for (let i = 0; i < 300; i++) car = driveCar(car, 1, 0, false, 0.05, bounds, [], v)
    assert.ok(car.speed <= v.speed)
    assert.ok(car.speed > 0)
    speeds.push(car.speed)
    assert.ok(driveCar(car, 0, 0, true, 0.05, bounds, [], v).speed < car.speed)
    const o = CITY_OBSTACLES[36]
    const edge = { x: (o.minX + o.maxX) / 2, z: o.maxZ + 1.1, yaw: Math.PI, speed: v.speed }
    assert.equal(driveCar(edge, 1, 0, false, 0.05, bounds, CITY_OBSTACLES, v).speed, 0)
  }
  assert.equal(new Set(speeds).size, 5)
})
test('all parked vehicle collision footprints agree with their rendered centers', () => {
  assert.equal(PARKED_CARS.length, 6)
  PARKED_VEHICLES.forEach((v, i) => {
    const o = PARKED_CARS[i]
    assert.equal((o.minX + o.maxX) / 2, v.x)
    assert.equal((o.minZ + o.maxZ) / 2, v.z)
    assert.ok(!CITY_OBSTACLES.some((b) => v.x > b.minX && v.x < b.maxX && v.z > b.minZ && v.z < b.maxZ))
  })
})

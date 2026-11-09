// Focused reproduction checks for the empire expansion; no browser or test dependency needed.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8')
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  )
}
const { BUSINESSES, ASSETS, OPERATIONS } = require('../lib/game/config.ts')
const {
  createInitialState,
  restoreState,
  empireAction,
  tick,
  profitMultiplier,
  computeOfflineEarnings,
} = require('../lib/game/engine.ts')
assert.equal(BUSINESSES.length, 14)
assert.equal(new Set(BUSINESSES.map((b) => b.id)).size, 14)
let state = createInitialState()
assert.equal(Object.keys(state.businesses).length, 14)
assert.equal(BUSINESSES.at(-1).id, 'cityhall')
const old = {
  cash: 1234,
  businesses: {
    hustle: { owned: 25, managed: true, running: true, progress: 20 },
  },
  upgrades: ['hustle-t1'],
}
const restored = restoreState(old)
assert.equal(restored.cash, 1234)
assert.equal(restored.businesses.hustle.owned, 25)
assert.equal(restored.businesses.hotel.owned, 0)
assert.deepEqual(restored.assets, [])
assert.equal(restored.operation, null)
assert.equal(profitMultiplier(restored, 'hustle'), 3)
assert.equal(empireAction(state, { type: 'asset', id: 'watch' }), state)
assert.equal(empireAction(state, { type: 'objective', id: 'first-take' }), state)
state = { ...state, cash: 100000, runEarnings: 10 }
state = empireAction(state, { type: 'objective', id: 'first-take' })
assert.equal(state.cash, 100025)
assert.equal(empireAction(state, { type: 'objective', id: 'first-take' }), state)
for (const asset of ASSETS.slice(0, 3)) state = empireAction(state, { type: 'asset', id: asset.id })
assert.equal(state.cash, 100025 - 250 - 2500 - 25000)
assert.ok(Math.abs(profitMultiplier(state, 'hustle') - 1.15 * 1.2 * 1.25) < 1e-10)
assert.equal(empireAction(state, { type: 'asset', id: 'watch' }), state)
assert.equal(empireAction(state, { type: 'operation', id: 'catering' }), state)
const cash = state.cash
state = empireAction(state, { type: 'operation', id: 'delivery' })
assert.equal(state.cash, cash - 10)
assert.equal(empireAction(state, { type: 'operation', id: 'delivery' }), state)
state = tick(state, 19900)
assert.equal(state.operation.remainingMs, 100)
assert.equal(state.operationsCompleted, 0)
state = tick(state, 100)
assert.equal(state.operation, null)
assert.equal(state.cash, cash + 20)
assert.equal(state.operationsCompleted, 1)
assert.equal(tick(state, 10000).cash, state.cash)
for (const op of OPERATIONS) {
  let run = createInitialState()
  run.cash = op.cost
  run.businesses[op.required].owned = 1
  run = empireAction(run, { type: 'operation', id: op.id })
  const resumed = restoreState(JSON.parse(JSON.stringify(run)))
  run = tick(resumed, op.seconds * 1000)
  assert.equal(run.cash, op.reward)
  assert.equal(run.operationsCompleted, 1)
}
const offline = {
  ...restored,
  assets: ['watch'],
  lastSaved: Date.now() - 60000,
}
assert.ok(
  computeOfflineEarnings(offline, offline.lastSaved + 60000).earnings >
    computeOfflineEarnings({ ...offline, assets: [] }, offline.lastSaved + 60000).earnings,
)
assert.deepEqual(createInitialState(10, 1e9, 1).assets, [])
console.log(
  'PASS: 14 properties; old-save migration; spending and stacked bonuses; objective guards; operation requirements, timing, save/resume, and single payouts; offline bonus; prestige reset.',
)

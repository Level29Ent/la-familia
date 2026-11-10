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

const {
  initialDecor,
  decorAction,
  restoreDecor,
  DECOR_ITEMS,
  DECOR_CATEGORIES,
} = require('../lib/game/decor.ts')
const { vaultAction, VAULT_TIERS } = require('../lib/game/safe-house.ts')
const { retireEmpire } = require('../lib/game/engine.ts')
let bank = createInitialState()
assert.deepEqual(restoreState(old).safeHouse, { balance: 0, tier: 0, decor: initialDecor() })
bank = { ...bank, cash: 1500, runEarnings: 1500, lifetimeEarnings: 1500 }
for (const amount of [0, -10, NaN, Infinity, 2000]) {
  assert.equal(vaultAction(bank, { type: 'vault', direction: 'deposit', amount }), bank)
}
bank = vaultAction(bank, { type: 'vault', direction: 'deposit', amount: 100 })
assert.equal(bank.cash, 1400)
assert.equal(bank.safeHouse.balance, 100)
assert.equal(bank.runEarnings, 1500)
assert.equal(bank.lifetimeEarnings, 1500)
bank = vaultAction(bank, { type: 'vault', direction: 'deposit', amount: 'all' })
assert.equal(bank.safeHouse.balance, 1000)
assert.equal(bank.cash, 500)
assert.equal(vaultAction(bank, { type: 'vault', direction: 'deposit', amount: 1 }), bank)
assert.equal(vaultAction(bank, { type: 'vault', direction: 'withdraw', amount: 1001 }), bank)
bank = vaultAction(bank, { type: 'vault', direction: 'withdraw', amount: 50.5 })
assert.equal(bank.cash, 550.5)
assert.equal(bank.safeHouse.balance, 949.5)
bank = vaultAction(bank, { type: 'vault', direction: 'withdraw', amount: 'all' })
assert.equal(bank.cash, 1500)
assert.equal(bank.safeHouse.balance, 0)
assert.equal(vaultAction(bank, { type: 'vaultUpgrade' }), bank)
bank = { ...bank, cash: 10000000 }
for (let tier = 1; tier < VAULT_TIERS.length; tier++) {
  const before = bank.cash
  bank = vaultAction(bank, { type: 'vaultUpgrade' })
  assert.equal(bank.cash, before - VAULT_TIERS[tier].cost)
  assert.equal(bank.safeHouse.tier, tier)
}
assert.equal(vaultAction(bank, { type: 'vaultUpgrade' }), bank)
bank = vaultAction(bank, { type: 'vault', direction: 'deposit', amount: 100 })
const persisted = restoreState(JSON.parse(JSON.stringify(bank)))
assert.deepEqual(persisted.safeHouse, bank.safeHouse)
assert.equal(persisted.cash, bank.cash)
assert.deepEqual(restoreState({ safeHouse: { tier: Infinity, balance: NaN } }).safeHouse, {
  tier: 0,
  balance: 0,
  decor: initialDecor(),
})
assert.deepEqual(restoreState({ safeHouse: { tier: -10, balance: -100 } }).safeHouse, {
  tier: 0,
  balance: 0,
  decor: initialDecor(),
})
const heir = retireEmpire({ ...bank, lifetimeEarnings: 1e9 })
assert.equal(heir.cash, 0)
assert.deepEqual(heir.safeHouse, bank.safeHouse)
assert.equal(heir.respect, 10)
assert.equal(heir.lifetimeEarnings, 1e9)
assert.equal(heir.heists, 1)
assert.deepEqual(createInitialState().safeHouse, { balance: 0, tier: 0, decor: initialDecor() })
console.log(
  'PASS: vault deposit/withdraw conservation; invalid and insufficient transfers; capacity and max tier; upgrade spending; old-save migration and round trip; retirement inheritance and hard-reset defaults.',
)

const { ROOM_NAVIGATION, moveWithin, focusedTarget } = require('../lib/game/navigation.ts')
const room = ROOM_NAVIGATION
let walker = { x: room.start[0], z: room.start[2] }
assert.equal(focusedTarget(walker, 0, room), null)
for (let i = 0; i < 55; i++) walker = moveWithin(walker, 0, -0.15, room)
assert.equal(focusedTarget(walker, 0, room), 'vault')
for (let i = 0; i < 50; i++) walker = moveWithin(walker, 0, -0.15, room)
assert.ok(walker.z >= -4.8, 'vault blocks movement through its steel front')
assert.equal(focusedTarget(walker, Math.PI, room), null)
let sofa = { x: 0, z: 0 }
for (let i = 0; i < 100; i++) sofa = moveWithin(sofa, -0.1, 0, room)
assert.ok(sofa.x >= -1.3, 'coffee table blocks movement')
let wall = { x: 0, z: -3.5 }
for (let i = 0; i < 100; i++) wall = moveWithin(wall, 0.15, 0, room)
assert.equal(wall.x, room.bounds.maxX)
let desk = { x: 3.8, z: 4.5 }
for (let i = 0; i < 100; i++) desk = moveWithin(desk, 0, -0.1, room)
assert.ok(desk.z >= 3.2, 'desk blocks movement')
const doorway = { x: 0, z: 5.8 }
assert.equal(focusedTarget(doorway, Math.PI, room), 'exit')
assert.equal(focusedTarget(doorway, 0, room), null)
assert.equal(focusedTarget({ x: 0, z: 6.7 }, Math.PI, room), 'exit')
const slid = moveWithin({ x: -1.25, z: 0 }, -0.1, 0.1, room)
assert.equal(slid.x, -1.25)
assert.equal(slid.z, 0.1)
console.log(
  'PASS: walkable room path from entry to vault; facing/range interactions; walls, coffee table, desk and vault collision; wall sliding; exit target and zero-distance focus.',
)

let home = createInitialState()
assert.equal(decorAction(home, { type: 'decor', id: 'walls-burgundy' }), home)
assert.equal(decorAction(home, { type: 'decor', id: 'unknown' }), home)
home = { ...home, cash: 10000, runEarnings: 123, lifetimeEarnings: 1e9 }
home.safeHouse.balance = 321
const beforeShop = home.cash
home = decorAction(home, { type: 'decor', id: 'walls-burgundy' })
assert.equal(home.cash, beforeShop - 75)
assert.equal(home.safeHouse.decor.equipped.walls, 'walls-burgundy')
assert.equal(home.safeHouse.balance, 321)
assert.equal(home.runEarnings, 123)
assert.equal(home.lifetimeEarnings, 1e9)
assert.equal(decorAction(home, { type: 'decor', id: 'walls-burgundy' }), home)
home = decorAction(home, { type: 'decor', id: 'walls-classic' })
assert.equal(home.cash, beforeShop - 75)
home = decorAction(home, { type: 'decor', id: 'walls-burgundy' })
assert.equal(home.cash, beforeShop - 75)
for (const category of DECOR_CATEGORIES) {
  const item = DECOR_ITEMS.find((i) => i.category === category && i.cost > 0)
  home = decorAction(home, { type: 'decor', id: item.id })
  assert.equal(home.safeHouse.decor.equipped[category], item.id)
}
const reloadHome = restoreState(JSON.parse(JSON.stringify(home)))
assert.deepEqual(reloadHome.safeHouse, home.safeHouse)
assert.deepEqual(retireEmpire(home).safeHouse.decor, home.safeHouse.decor)
assert.deepEqual(restoreState({ safeHouse: { tier: 1, balance: 500 } }).safeHouse, {
  tier: 1,
  balance: 500,
  decor: initialDecor(),
})
assert.deepEqual(
  restoreDecor({
    owned: ['missing', 'walls-burgundy', 'walls-burgundy'],
    equipped: { walls: 'sofa-emerald', sofa: 'sofa-ivory' },
  }).equipped,
  initialDecor().equipped,
)
assert.equal(
  restoreDecor({ owned: ['missing', 'walls-burgundy', 'walls-burgundy'] }).owned.filter(
    (id) => id === 'walls-burgundy',
  ).length,
  1,
)
assert.deepEqual(createInitialState().safeHouse.decor, initialDecor())
console.log(
  'PASS: decor purchase debits wallet once, preserves vault and income, free re-equipping, one equipped per category, unknown/unaffordable guards, old-save migration, reload, retirement inheritance, reset defaults and ownership validation.',
)

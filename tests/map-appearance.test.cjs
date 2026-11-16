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
const { mapPoint, nearestAddress, mapBuildings } = require('../lib/game/map.ts')
const { CITY_BUILDINGS, CITY_BOUNDS } = require('../lib/game/city.ts')
const { npcAppearance, appearanceSeed } = require('../lib/game/npc-appearance.ts')
const { CHARACTER_OPTIONS, restoreCharacter } = require('../lib/game/character.ts')

test('map coordinates follow the live world position and clamp at the map edge', () => {
  assert.deepEqual(mapPoint({ x: 12, z: -40 }), { x: 12, y: 40 })
  assert.deepEqual(mapPoint({ x: 999, z: -999 }), { x: CITY_BOUNDS.maxX, y: -CITY_BOUNDS.minZ })
  for (const b of CITY_BUILDINGS) assert.equal(nearestAddress({ x: b.door[0], z: b.door[1] }).id, b.id)
})
test('map search and filters cover every district, business, home and special entrance', () => {
  assert.equal(mapBuildings('all', '').length, 60)
  assert.equal(mapBuildings('business', '').length, 26)
  assert.equal(mapBuildings('home', '').length, 30)
  assert.equal(mapBuildings('headquarters', '').length, 3)
  assert.equal(mapBuildings('safehouse', '').length, 1)
  assert.equal(mapBuildings('all', ' garden heights ').length, 12)
  assert.equal(mapBuildings('business', 'JAZZ')[0].id, 'jazz')
  assert.equal(mapBuildings('home', 'JAZZ').length, 0)
  assert.equal(mapBuildings('all', 'not a real place').length, 0)
})
test('crowd appearances are stable and use valid skin, wardrobe and facial options', () => {
  const appearances = Array.from({ length: 80 }, (_, i) => npcAppearance(i))
  assert.equal(new Set(appearances.map((a) => a.skin)).size, 6)
  assert.equal(new Set(appearances.map((a) => a.gender)).size, 2)
  assert.equal(new Set(appearances.map((a) => a.hair)).size, 8)
  for (let i = 0; i < appearances.length; i++) {
    const a = appearances[i]
    assert.deepEqual(a, npcAppearance(i))
    for (const [key, options] of Object.entries(CHARACTER_OPTIONS))
      assert.ok(Number.isInteger(a[key]) && a[key] >= 0 && a[key] < options.length, key)
    assert.deepEqual(restoreCharacter(a), a)
    assert.ok(!('power' in a) && !('cost' in a) && !('role' in a))
  }
  assert.equal(appearanceSeed('joey'), appearanceSeed('joey'))
  assert.notEqual(appearanceSeed('joey'), appearanceSeed('ada'))
})

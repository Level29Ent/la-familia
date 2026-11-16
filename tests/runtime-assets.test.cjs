const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToString } = require('react-dom/server')

function load(relativePath, env = {}, mocks = {}, sourceOverride) {
  const source = sourceOverride ?? fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const exports = {}
  vm.runInNewContext(compiled, {
    exports,
    process: { env },
    require: (name) => mocks[name] || require(name),
  })
  return exports
}

for (const basePath of ['', '/la-familia']) {
  test(`public game assets resolve under ${basePath || 'the site root'}`, () => {
    const { assetPath } = load('lib/asset-path.ts', { NEXT_PUBLIC_BASE_PATH: basePath })
    for (const asset of [
      '/fonts/Geist-Regular.ttf', '/images/city-skyline.png', '/images/the-don.png',
      '/icon.svg', '/apple-icon.png', '/icon-light-32x32.png', '/icon-dark-32x32.png',
      '/icon-192.png', '/icon-512.png',
    ]) {
      assert.equal(assetPath(asset), basePath + asset)
      assert.ok(fs.existsSync(path.join(__dirname, '../public', asset)))
    }
    const { default: manifest } = load('app/manifest.ts', {}, { '@/lib/asset-path': { assetPath } })
    assert.equal(manifest().start_url, basePath + '/')
    assert.equal(manifest().scope, basePath + '/')
    assert.ok(manifest().icons.every((icon) => icon.src.startsWith(basePath + '/icon-')))
  })
}

test('a pending 3D font does not suspend the playable world', () => {
  const pendingFont = new Promise(() => {})
  const { WorldText } = load('components/world/world-text.tsx', {}, {
    '@react-three/drei': { Text: () => { throw pendingFont } },
    '@/lib/asset-path': { assetPath: (p) => p },
  })
  // Without the label's local Suspense boundary renderToString throws here.
  const html = renderToString(React.createElement('main', null,
    React.createElement('div', { id: 'playable-world' }, 'City and player'),
    React.createElement(WorldText, null, 'Storefront'),
  ))
  assert.match(html, /id="playable-world">City and player/)
  assert.doesNotMatch(html, /Loading the city/)
})

test('world labels all use the non-blocking, deployment-aware font component', () => {
  for (const file of ['building.tsx', 'safe-house-scene.tsx', 'good-life-displays.tsx']) {
    const source = fs.readFileSync(path.join(__dirname, '../components/world', file), 'utf8')
    assert.match(source, /<WorldText/)
    assert.doesNotMatch(source, /<Text\b|font=["']\/fonts/)
  }
})


test('Next publishes its final base path to client asset URLs', () => {
  // CI may already have replaced the property with the actual Pages path.
  const { default: config } = load('next.config.mjs')
  assert.equal(typeof config.basePath, 'string')
  assert.equal(config.env.NEXT_PUBLIC_BASE_PATH, config.basePath)
})

test('Pages-style config injection keeps client assets on the injected path', () => {
  const source = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8')
  for (const basePath of ['', '/la-familia']) {
    const injected = source.replace(/basePath: [^\n]+/, `basePath: ${JSON.stringify(basePath)},`)
    assert.notEqual(injected.indexOf(`basePath: ${JSON.stringify(basePath)},`), -1)
    const { default: config } = load('next.config.mjs', {
      NEXT_PUBLIC_BASE_PATH: '/must-not-override-pages',
    }, {}, injected)
    assert.equal(config.basePath, basePath)
    assert.equal(config.env.NEXT_PUBLIC_BASE_PATH, basePath)
  }
})

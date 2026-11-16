// Validate the actual exported document, not just source strings.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
async function checkExport() {
const { default: config } = await import('../next.config.mjs')
const basePath = config.basePath || ''
const html = fs.readFileSync('out/index.html', 'utf8')
const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
function checkAsset(url) {
  assert.ok(url.startsWith(basePath + '/'), `Asset escaped deployment path: ${url}`)
  const file = url.slice(basePath.length).split('?')[0]
  assert.ok(fs.existsSync(path.join('out', file)), `Missing exported asset: ${url}`)
}
for (const url of urls.filter((url) => url.startsWith('/'))) checkAsset(url)
assert.ok(urls.includes(basePath + '/images/city-skyline.png'))
assert.ok(urls.includes(basePath + '/icon.svg'))
assert.ok(urls.includes(basePath + '/manifest.webmanifest'))
const manifest = JSON.parse(fs.readFileSync('out/manifest.webmanifest', 'utf8'))
assert.equal(manifest.start_url, basePath + '/')
assert.equal(manifest.scope, basePath + '/')
for (const icon of manifest.icons) checkAsset(icon.src)
checkAsset(basePath + '/fonts/Geist-Regular.ttf')
checkAsset(basePath + '/images/the-don.png')
console.log(`PASS: exported chunks, images, icons, manifest and font resolve under ${basePath || '/'}`)
}
checkExport().catch((error) => { console.error(error); process.exitCode = 1 })

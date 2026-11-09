const SUFFIXES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'Ud',
  'Dd',
  'Td',
]

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '∞'
  if (value < 1000) return value < 10 ? value.toFixed(value % 1 === 0 ? 0 : 2) : Math.floor(value).toString()
  const tier = Math.min(Math.floor(Math.log10(value) / 3), SUFFIXES.length - 1)
  const scaled = value / Math.pow(1000, tier)
  return `${scaled.toFixed(scaled >= 100 ? 1 : 2)}${SUFFIXES[tier]}`
}

export function formatMoney(value: number) {
  return `$${formatNumber(value)}`
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`
  return `${s}s`
}

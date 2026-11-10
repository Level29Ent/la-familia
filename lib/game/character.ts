export const CHARACTER_OPTIONS = {
  gender: ['Man', 'Woman'],
  skin: ['#f1d2b6', '#ddb18c', '#bc8764', '#925e40', '#68432f', '#442d25'],
  hairColor: [
    '#201a18',
    '#51362b',
    '#a06a38',
    '#d7b46b',
    '#943f2c',
    '#aaa8a0',
    '#cf956e',
    '#e3d8c7',
    '#36214a',
  ],
  eyes: ['#664a31', '#387b80', '#4f6c37', '#626a88', '#7b8b9b', '#ad8741'],
  jacket: ['#252a35', '#5e3439', '#344c42', '#b8a98c', '#1e3e66', '#62534c', '#744e7b', '#ebe0ca', '#1c6568'],
  trousers: ['#242834', '#52473b', '#a39379', '#293c50', '#634c68', '#182321'],
  shirt: ['#eee4cf', '#8196ae', '#312d34', '#c6ac87'],
  tie: ['#893d41', '#b49c55', '#213d53', '#32574d'],
  shoes: ['#221b19', '#653f2e', '#383b45'],
  hair: [
    'Side part',
    'Cropped',
    'Long swept',
    'Bald',
    'Classic bob',
    'High bun',
    'Ponytail',
    'Shoulder waves',
  ],
  facialHair: ['Clean shaven', 'Mustache', 'Beard'],
  outfit: ['Tailored suit', 'Waistcoat', 'Rolled sleeves', 'Skirt suit', 'Evening dress', 'Long coat'],
  hat: ['No hat', 'Fedora', 'Flat cap', 'Cloche hat', 'Beret'],
  glasses: ['None', 'Round frames', 'Dark glasses', 'Cat-eye frames'],
  earrings: ['None', 'Pearl studs', 'Gold hoops'],
  necklace: ['None', 'Pearl necklace', 'Gold pendant'],
  lipstick: ['Natural', 'Rose', 'Ruby', 'Plum'],
  neckwear: ['Tie', 'Open collar', 'Bow tie'],
} as const
export type CharacterChoice = keyof typeof CHARACTER_OPTIONS
export type CharacterConfig = Record<CharacterChoice, number> & {
  name: string
  height: number
  build: number
  face: number
  nose: number
  shoulders: number
  hips: number
  chest: number
  jaw: number
}
export const DEFAULT_CHARACTER: CharacterConfig = {
  name: 'The Boss',
  gender: 0,
  earrings: 0,
  necklace: 0,
  lipstick: 0,
  neckwear: 0,
  skin: 2,
  hairColor: 0,
  eyes: 0,
  jacket: 0,
  trousers: 0,
  shirt: 0,
  tie: 0,
  shoes: 0,
  hair: 0,
  facialHair: 0,
  outfit: 0,
  hat: 1,
  glasses: 0,
  height: 1,
  build: 1,
  face: 1,
  nose: 1,
  jaw: 1,
  shoulders: 1,
  hips: 1,
  chest: 1,
}
export function restoreCharacter(saved?: Partial<CharacterConfig>): CharacterConfig {
  const result = { ...DEFAULT_CHARACTER }
  if (typeof saved?.name === 'string') result.name = saved.name.trim().slice(0, 24) || DEFAULT_CHARACTER.name
  for (const key of Object.keys(CHARACTER_OPTIONS) as CharacterChoice[]) {
    const value = saved?.[key]
    if (Number.isInteger(value) && value! >= 0 && value! < CHARACTER_OPTIONS[key].length) result[key] = value!
  }
  for (const key of ['height', 'build', 'face', 'nose', 'jaw', 'shoulders', 'hips', 'chest'] as const) {
    const value = saved?.[key]
    if (typeof value === 'number' && Number.isFinite(value)) result[key] = Math.max(0.8, Math.min(1.2, value))
  }
  return result
}
export function cameraDistance(distance: number, wheelDelta: number) {
  return Math.max(1.8, Math.min(6, distance + wheelDelta * 0.003))
}

// Explicit presets change the draft only; all wardrobe options remain available to everyone.
export function characterPreset(gender: number): CharacterConfig {
  if (gender !== 1) return { ...DEFAULT_CHARACTER }
  return {
    ...DEFAULT_CHARACTER,
    gender: 1,
    name: 'The Boss',
    shoulders: 0.92,
    hips: 1.08,
    jaw: 0.9,
    hair: 4,
    hat: 0,
    facialHair: 0,
    outfit: 3,
    neckwear: 1,
    earrings: 1,
  }
}
export function characterShape(config: CharacterConfig) {
  const woman = config.gender === 1
  return {
    shoulders: config.shoulders * (woman ? 0.92 : 1),
    hips: config.hips * (woman ? 1.08 : 1),
    jaw: config.jaw * (woman ? 0.9 : 1),
    waist: woman ? 0.82 : 1,
  }
}

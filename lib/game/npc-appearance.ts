import { DEFAULT_CHARACTER, type CharacterConfig } from './character'
// Appearance is independent of faction, job, power and hire cost. No racial stat modifiers.
export function npcAppearance(index: number): CharacterConfig {
  const n = Math.abs(Math.floor(index))
  return {
    ...DEFAULT_CHARACTER,
    skin: n % 6,
    gender: Math.floor(n / 3) % 2,
    hair: n % 8,
    hairColor: Math.floor(n / 2) % 8,
    eyes: n % 6,
    jacket: n % 9,
    trousers: Math.floor(n / 2) % 6,
    shirt: n % 4,
    tie: n % 4,
    hat: n % 4 === 0 ? 1 : 0,
    outfit: n % 6,
    facialHair: Math.floor(n / 3) % 2 === 0 ? n % 3 : 0,
    glasses: n % 7 === 0 ? 1 : 0,
    height: 0.9 + (n % 5) * 0.04,
    build: 0.9 + ((n * 3) % 5) * 0.04,
    face: 0.9 + ((n * 7) % 5) * 0.04,
    nose: 0.9 + ((n * 2) % 5) * 0.04,
    jaw: 0.9 + ((n * 4) % 5) * 0.04,
    shoulders: 0.94 + (n % 4) * 0.04,
    hips: 0.94 + ((n + 2) % 4) * 0.04,
    neckwear: n % 3,
  }
}
export function appearanceSeed(id: string) {
  return [...id].reduce((n, c) => n + c.charCodeAt(0), 0)
}

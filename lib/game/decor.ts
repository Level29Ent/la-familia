import type { GameState } from './engine'

export const DECOR_CATEGORIES = ['walls', 'sofa', 'rug', 'lighting', 'decoration'] as const
export type DecorCategory = (typeof DECOR_CATEGORIES)[number]
export const CATEGORY_LABELS: Record<DecorCategory, string> = {
  walls: 'Wall colors',
  sofa: 'Leather furniture',
  rug: 'Carpets',
  lighting: 'Mood lighting',
  decoration: 'Room accents',
}
export type DecorItem = {
  id: string
  category: DecorCategory
  name: string
  description: string
  cost: number
  color: string
}
export const DECOR_ITEMS: DecorItem[] = [
  {
    id: 'walls-classic',
    category: 'walls',
    name: 'Classic Teal',
    description: 'The original Bellini residence finish.',
    cost: 0,
    color: '#263f3d',
  },
  {
    id: 'walls-burgundy',
    category: 'walls',
    name: 'Burgundy Club',
    description: 'Rich wine-red walls for a private club feel.',
    cost: 75,
    color: '#622e38',
  },
  {
    id: 'walls-midnight',
    category: 'walls',
    name: 'Midnight Blue',
    description: 'Deep blue walls with a cool city-night character.',
    cost: 350,
    color: '#253b61',
  },
  {
    id: 'sofa-classic',
    category: 'sofa',
    name: 'Tobacco Leather',
    description: 'The family’s original leather lounge.',
    cost: 0,
    color: '#64342b',
  },
  {
    id: 'sofa-emerald',
    category: 'sofa',
    name: 'Emerald Leather',
    description: 'Green upholstery across the sofa and its arms.',
    cost: 150,
    color: '#24604b',
  },
  {
    id: 'sofa-ivory',
    category: 'sofa',
    name: 'Ivory Leather',
    description: 'A bright cream statement piece.',
    cost: 800,
    color: '#c9bca0',
  },
  {
    id: 'rug-classic',
    category: 'rug',
    name: 'Family Red Runner',
    description: 'The familiar red route to your vault.',
    cost: 0,
    color: '#74343b',
  },
  {
    id: 'rug-royal',
    category: 'rug',
    name: 'Royal Blue Runner',
    description: 'Royal blue bordered in brass.',
    cost: 100,
    color: '#294f8b',
  },
  {
    id: 'rug-gold',
    category: 'rug',
    name: 'Golden Runner',
    description: 'A warm golden carpet for the boss.',
    cost: 600,
    color: '#b18734',
  },
  {
    id: 'light-classic',
    category: 'lighting',
    name: 'Warm Brass',
    description: 'The original amber evening glow.',
    cost: 0,
    color: '#ffd79b',
  },
  {
    id: 'light-moon',
    category: 'lighting',
    name: 'Moonlight Lounge',
    description: 'Cool blue overhead and floor lighting.',
    cost: 200,
    color: '#9acbff',
  },
  {
    id: 'light-rose',
    category: 'lighting',
    name: 'Rose Hour',
    description: 'Soft pink lighting for late-night meetings.',
    cost: 500,
    color: '#ff9dbc',
  },
  {
    id: 'accent-none',
    category: 'decoration',
    name: 'Understated',
    description: 'Keep the back wall clear.',
    cost: 0,
    color: '#263f3d',
  },
  {
    id: 'accent-art',
    category: 'decoration',
    name: 'Art Deco Triptych',
    description: 'Three gold-framed geometric artworks beside the vault.',
    cost: 250,
    color: '#d4b46d',
  },
  {
    id: 'accent-clock',
    category: 'decoration',
    name: 'The Don’s Wall Clock',
    description: 'A brass clock mounted beside the vault.',
    cost: 1200,
    color: '#d8c28c',
  },
]
export type DecorState = { owned: string[]; equipped: Record<DecorCategory, string> }
export function initialDecor(): DecorState {
  const defaults = DECOR_ITEMS.filter((item) => item.cost === 0)
  return {
    owned: defaults.map((item) => item.id),
    equipped: Object.fromEntries(defaults.map((item) => [item.category, item.id])) as Record<
      DecorCategory,
      string
    >,
  }
}
export type DecorAction = { type: 'decor'; id: string }
export function decorAction(state: GameState, action: DecorAction): GameState {
  const item = DECOR_ITEMS.find((entry) => entry.id === action.id)
  if (!item) return state
  const decor = state.safeHouse.decor
  const owned = decor.owned.includes(item.id)
  if (!owned && state.cash < item.cost) return state
  if (owned && decor.equipped[item.category] === item.id) return state
  return {
    ...state,
    cash: state.cash - (owned ? 0 : item.cost),
    safeHouse: {
      ...state.safeHouse,
      decor: {
        owned: owned ? decor.owned : [...decor.owned, item.id],
        equipped: { ...decor.equipped, [item.category]: item.id },
      },
    },
  }
}
export function restoreDecor(saved?: Partial<DecorState>): DecorState {
  const defaults = initialDecor()
  const owned = [
    ...new Set([
      ...defaults.owned,
      ...(Array.isArray(saved?.owned)
        ? saved.owned.filter((id) => DECOR_ITEMS.some((item) => item.id === id))
        : []),
    ]),
  ]
  const equipped = { ...defaults.equipped }
  for (const category of DECOR_CATEGORIES) {
    const id = saved?.equipped?.[category]
    if (owned.includes(id ?? '') && DECOR_ITEMS.some((item) => item.id === id && item.category === category))
      equipped[category] = id!
  }
  return { owned, equipped }
}
export function decorItem(decor: DecorState, category: DecorCategory) {
  return DECOR_ITEMS.find((item) => item.id === decor.equipped[category])!
}

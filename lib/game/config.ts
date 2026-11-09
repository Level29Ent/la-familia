export type BusinessConfig = {
  id: string
  name: string
  description: string
  icon: string
  baseCost: number
  costGrowth: number
  baseRevenue: number
  cycleSeconds: number
  managerCost: number
  managerName: string
  managerTitle: string
}

export const BUSINESSES: BusinessConfig[] = [
  {
    id: 'hustle',
    name: 'Street Hustle',
    description: 'Shell games and back-alley dice.',
    icon: 'dice',
    baseCost: 4,
    costGrowth: 1.07,
    baseRevenue: 1,
    cycleSeconds: 0.6,
    managerCost: 1_000,
    managerName: 'Lucky Sal',
    managerTitle: 'Runs the corners',
  },
  {
    id: 'numbers',
    name: 'Numbers Racket',
    description: 'Illegal lottery in every barbershop.',
    icon: 'ticket',
    baseCost: 60,
    costGrowth: 1.15,
    baseRevenue: 60,
    cycleSeconds: 3,
    managerCost: 15_000,
    managerName: 'Benny "Abacus" Moretti',
    managerTitle: 'Never misses a digit',
  },
  {
    id: 'speakeasy',
    name: 'Speakeasy',
    description: 'Bathtub gin behind a password door.',
    icon: 'wine',
    baseCost: 720,
    costGrowth: 1.14,
    baseRevenue: 540,
    cycleSeconds: 6,
    managerCost: 100_000,
    managerName: 'Velma Dusk',
    managerTitle: 'Knows every regular',
  },
  {
    id: 'protection',
    name: 'Protection Racket',
    description: 'Nice shop. Shame if something happened.',
    icon: 'shield',
    baseCost: 8_640,
    costGrowth: 1.13,
    baseRevenue: 4_320,
    cycleSeconds: 12,
    managerCost: 500_000,
    managerName: 'Tony Two-Knuckles',
    managerTitle: 'Very persuasive',
  },
  {
    id: 'chopshop',
    name: 'Chop Shop',
    description: 'Hot cars in, spare parts out.',
    icon: 'car',
    baseCost: 103_680,
    costGrowth: 1.12,
    baseRevenue: 51_840,
    cycleSeconds: 24,
    managerCost: 1_200_000,
    managerName: 'Greasy Gino',
    managerTitle: 'Fastest wrench in town',
  },
  {
    id: 'casino',
    name: 'Underground Casino',
    description: 'The house always wins. You are the house.',
    icon: 'spade',
    baseCost: 1_244_160,
    costGrowth: 1.11,
    baseRevenue: 622_080,
    cycleSeconds: 96,
    managerCost: 10_000_000,
    managerName: 'Dealer Dominic',
    managerTitle: 'Stacked decks only',
  },
  {
    id: 'docks',
    name: 'Dockyard Smuggling',
    description: 'Crates that never pass inspection.',
    icon: 'ship',
    baseCost: 14_929_920,
    costGrowth: 1.1,
    baseRevenue: 7_464_960,
    cycleSeconds: 384,
    managerCost: 111_111_111,
    managerName: 'Captain Rizzo',
    managerTitle: 'Owns the harbormaster',
  },
  {
    id: 'nightclub',
    name: 'Nightclub Empire',
    description: 'Jazz, champagne, and laundered cash.',
    icon: 'music',
    baseCost: 179_159_040,
    costGrowth: 1.09,
    baseRevenue: 89_579_520,
    cycleSeconds: 1_536,
    managerCost: 555_555_555,
    managerName: 'Madame Lucia',
    managerTitle: 'Queen of the night',
  },
  {
    id: 'cityhall',
    name: 'City Hall',
    description: 'Why break the law when you can write it?',
    icon: 'landmark',
    baseCost: 2_149_908_480,
    costGrowth: 1.08,
    baseRevenue: 1_074_954_240,
    cycleSeconds: 6_144,
    managerCost: 10_000_000_000,
    managerName: 'Mayor Bellini',
    managerTitle: 'Fully on the payroll',
  },
]

export const MILESTONES = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

export type UpgradeConfig = {
  id: string
  name: string
  description: string
  cost: number
  target: string | 'all'
  multiplier: number
}

const TIER_NAMES = ['Hired Muscle', 'Crooked Cops', 'Union Connections', 'Federal Friends']
const TIER_COST_FACTORS = [1_000, 250_000, 100_000_000, 50_000_000_000]

const businessUpgrades: UpgradeConfig[] = TIER_NAMES.flatMap((tierName, tier) =>
  BUSINESSES.map((b) => ({
    id: `${b.id}-t${tier + 1}`,
    name: tierName,
    description: `${b.name} profits x3`,
    cost: b.baseCost * TIER_COST_FACTORS[tier],
    target: b.id,
    multiplier: 3,
  })),
)

const globalUpgrades: UpgradeConfig[] = [
  { id: 'all-1', name: 'Family Ledger', description: 'All profits x3', cost: 5e9, target: 'all', multiplier: 3 },
  { id: 'all-2', name: 'Offshore Accounts', description: 'All profits x3', cost: 2.5e12, target: 'all', multiplier: 3 },
  { id: 'all-3', name: 'The Commission', description: 'All profits x5', cost: 1e15, target: 'all', multiplier: 5 },
  { id: 'all-4', name: 'Untouchable', description: 'All profits x7', cost: 1e18, target: 'all', multiplier: 7 },
]

export const UPGRADES: UpgradeConfig[] = [...businessUpgrades, ...globalUpgrades].sort(
  (a, b) => a.cost - b.cost,
)

export const RESPECT_BONUS_PER_POINT = 0.02
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24
export const SAVE_KEY = 'la-famiglia-save-v1'

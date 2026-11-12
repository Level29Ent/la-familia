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

// Additional neighborhood properties, available in both the street and ledger.
BUSINESSES.push(
  {
    id: 'bakery',
    name: 'Family Bakery',
    description: 'Fresh bread. A respectable family front.',
    icon: 'bread',
    baseCost: 180,
    costGrowth: 1.12,
    baseRevenue: 120,
    cycleSeconds: 4,
    managerCost: 1200,
    managerName: 'Rosa Bellini',
    managerTitle: 'Keeps the ovens warm',
  },
  {
    id: 'tailor',
    name: 'Tailor Shop',
    description: 'Sharp suits and discreet backroom deals.',
    icon: 'scissors',
    baseCost: 2400,
    costGrowth: 1.12,
    baseRevenue: 1600,
    cycleSeconds: 8,
    managerCost: 18000,
    managerName: 'Silk Sofia',
    managerTitle: 'Dresses the whole family',
  },
  {
    id: 'pawn',
    name: 'Pawn Exchange',
    description: 'Turn forgotten treasures into steady cash.',
    icon: 'gem',
    baseCost: 30000,
    costGrowth: 1.12,
    baseRevenue: 20000,
    cycleSeconds: 18,
    managerCost: 180000,
    managerName: 'Pearl Russo',
    managerTitle: 'Knows what everything is worth',
  },
  {
    id: 'cinema',
    name: 'Grand Picture House',
    description: 'A silver-screen palace with a private balcony.',
    icon: 'film',
    baseCost: 360000,
    costGrowth: 1.12,
    baseRevenue: 240000,
    cycleSeconds: 48,
    managerCost: 2400000,
    managerName: 'Frankie Frames',
    managerTitle: 'Always a full house',
  },
  {
    id: 'hotel',
    name: 'The Bellini Hotel',
    description: 'Luxury suites above the city lights.',
    icon: 'hotel',
    baseCost: 4200000,
    costGrowth: 1.12,
    baseRevenue: 2800000,
    cycleSeconds: 180,
    managerCost: 30000000,
    managerName: 'Isabella Keys',
    managerTitle: 'Hospitality with influence',
  },
)
BUSINESSES.sort((a, b) => a.baseCost - b.baseCost)

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
  {
    id: 'all-1',
    name: 'Family Ledger',
    description: 'All profits x3',
    cost: 5e9,
    target: 'all',
    multiplier: 3,
  },
  {
    id: 'all-2',
    name: 'Offshore Accounts',
    description: 'All profits x3',
    cost: 2.5e12,
    target: 'all',
    multiplier: 3,
  },
  {
    id: 'all-3',
    name: 'The Commission',
    description: 'All profits x5',
    cost: 1e15,
    target: 'all',
    multiplier: 5,
  },
  {
    id: 'all-4',
    name: 'Untouchable',
    description: 'All profits x7',
    cost: 1e18,
    target: 'all',
    multiplier: 7,
  },
]

export const UPGRADES: UpgradeConfig[] = [...businessUpgrades, ...globalUpgrades].sort(
  (a, b) => a.cost - b.cost,
)

export const RESPECT_BONUS_PER_POINT = 0.02
export const OFFLINE_CAP_SECONDS = 60 * 60 * 24
export const SAVE_KEY = 'la-famiglia-save-v1'

export const ASSETS = [
  {
    id: 'watch',
    name: 'Gold Pocket Watch',
    description: 'Make every meeting count.',
    cost: 250,
    multiplier: 1.15,
    icon: 'watch',
  },
  {
    id: 'wardrobe',
    name: 'Bespoke Wardrobe',
    description: 'Dress like the boss you are.',
    cost: 2500,
    multiplier: 1.2,
    icon: 'scissors',
  },
  {
    id: 'sedan',
    name: 'Armored Sedan',
    description: 'Your own midnight-blue car on the street.',
    cost: 25000,
    multiplier: 1.25,
    icon: 'car',
  },
  {
    id: 'penthouse',
    name: 'Skyline Penthouse',
    description: 'A room above the competition.',
    cost: 250000,
    multiplier: 1.3,
    icon: 'hotel',
  },
  {
    id: 'art',
    name: 'Private Art Collection',
    description: 'Old masters. New influence.',
    cost: 2500000,
    multiplier: 1.4,
    icon: 'gem',
  },
  {
    id: 'yacht',
    name: 'The Family Yacht',
    description: 'Let the harbor know your name.',
    cost: 25000000,
    multiplier: 1.5,
    icon: 'ship',
  },
] as const

export const OPERATIONS = [
  {
    id: 'delivery',
    name: 'Midnight Delivery',
    description: 'Invest in a quick neighborhood delivery. Guaranteed return.',
    cost: 10,
    reward: 30,
    seconds: 20,
    required: 'hustle',
  },
  {
    id: 'catering',
    name: 'Private Banquet',
    description: 'Supply a private party from the family bakery.',
    cost: 150,
    reward: 450,
    seconds: 45,
    required: 'bakery',
  },
  {
    id: 'premiere',
    name: 'Opening Night',
    description: 'Put on a sold-out gala at the picture house.',
    cost: 10000,
    reward: 30000,
    seconds: 90,
    required: 'cinema',
  },
  { id: 'tailored', name: 'Commission Gala', description: 'Dress the guests for a private city gala.', cost: 1000, reward: 3200, seconds: 60, required: 'tailor' },
  { id: 'restoration', name: 'Vintage Restoration', description: 'Restore a classic motorcar for a collector.', cost: 50000, reward: 160000, seconds: 120, required: 'chopshop' },
  { id: 'summit', name: 'Hotel Summit', description: 'Host an exclusive weekend of family negotiations.', cost: 500000, reward: 1750000, seconds: 180, required: 'hotel' },
  { id: 'harbor', name: 'Harbor Charter', description: 'Organize a premium cargo charter through your docks.', cost: 2000000, reward: 7000000, seconds: 240, required: 'docks' },

] as const

export const OBJECTIVES = [
  {
    id: 'first-take',
    name: 'Your First Take',
    description: 'Earn $10 in this empire.',
    goal: 10,
    metric: 'earnings',
    reward: 25,
  },
  {
    id: 'neighbors',
    name: 'Neighborhood Roots',
    description: 'Own 3 different businesses.',
    goal: 3,
    metric: 'businesses',
    reward: 300,
  },
  {
    id: 'delivery-boss',
    name: 'Special Delivery',
    description: 'Complete 3 operations.',
    goal: 3,
    metric: 'operations',
    reward: 1000,
  },
  {
    id: 'delegation',
    name: 'Learn to Delegate',
    description: 'Hire your first capo.',
    goal: 1,
    metric: 'managers',
    reward: 1500,
  },
  {
    id: 'collector',
    name: 'A Taste for Luxury',
    description: 'Purchase 2 lifestyle assets.',
    goal: 2,
    metric: 'assets',
    reward: 5000,
  },
  {
    id: 'district',
    name: 'District Boss',
    description: 'Own 7 different businesses.',
    goal: 7,
    metric: 'businesses',
    reward: 50000,
  },
  { id: 'ten-contracts', name: 'A Reliable Family', description: 'Complete 10 operations.', goal: 10, metric: 'operations', reward: 12000 },
  { id: 'team-five', name: 'Trusted Inner Circle', description: 'Hire 5 capos.', goal: 5, metric: 'managers', reward: 100000 },
  { id: 'millionaire', name: 'The First Million', description: 'Earn $1 million in this empire.', goal: 1000000, metric: 'earnings', reward: 150000 },
  { id: 'city-owner', name: 'Every Corner', description: 'Own 10 different businesses.', goal: 10, metric: 'businesses', reward: 1000000 },
  { id: 'good-life', name: 'Nothing But the Best', description: 'Purchase all 6 Good Life assets.', goal: 6, metric: 'assets', reward: 10000000 },
  { id: 'veteran', name: 'Family Institution', description: 'Complete 50 operations.', goal: 50, metric: 'operations', reward: 5000000 },

] as const

import type { GameState } from './engine'

export const VAULT_TIERS = [
  { name: 'Steel Lockbox', capacity: 1000, cost: 0 },
  { name: 'Reinforced Vault', capacity: 25000, cost: 2500 },
  { name: 'Family Treasury', capacity: 1000000, cost: 50000 },
  { name: 'Private Reserve', capacity: 100000000, cost: 2500000 },
] as const

export type SafeHouseState = { balance: number; tier: number }
export type VaultAction =
  | { type: 'vault'; direction: 'deposit' | 'withdraw'; amount: number | 'all' }
  | { type: 'vaultUpgrade' }

export function vaultAction(state: GameState, action: VaultAction): GameState {
  const vault = state.safeHouse
  const tier = VAULT_TIERS[vault.tier]
  if (action.type === 'vaultUpgrade') {
    const next = VAULT_TIERS[vault.tier + 1]
    if (!next || state.cash < next.cost) return state
    return { ...state, cash: state.cash - next.cost, safeHouse: { ...vault, tier: vault.tier + 1 } }
  }
  const available =
    action.direction === 'deposit' ? Math.min(state.cash, tier.capacity - vault.balance) : vault.balance
  const amount = action.amount === 'all' ? available : action.amount
  if (!Number.isFinite(amount) || amount <= 0 || amount > available) return state
  const delta = action.direction === 'deposit' ? amount : -amount
  // A transfer is not income: never change earnings, Respect, or objective progress.
  return { ...state, cash: state.cash - delta, safeHouse: { ...vault, balance: vault.balance + delta } }
}

export function restoreSafeHouse(saved?: Partial<SafeHouseState>): SafeHouseState {
  const tier = Number.isFinite(saved?.tier)
    ? Math.max(0, Math.min(VAULT_TIERS.length - 1, Math.floor(saved!.tier!)))
    : 0
  const balance = Number.isFinite(saved?.balance)
    ? Math.max(0, Math.min(VAULT_TIERS[tier].capacity, saved!.balance!))
    : 0
  return { tier, balance }
}

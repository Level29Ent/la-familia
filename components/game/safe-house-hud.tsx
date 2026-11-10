'use client'

import { House, LogOut, LockKeyhole } from 'lucide-react'
import { formatMoney } from '@/lib/game/format'
import { VAULT_TIERS } from '@/lib/game/safe-house'
import { useGame } from './game-provider'
import { TouchControls } from './touch-controls'

export function SafeHouseHud({
  focusedId,
  onVault,
  onExit,
}: {
  focusedId: string | null
  onVault: () => void
  onExit: () => void
}) {
  const { state } = useGame()
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="rounded-xl border border-primary/30 bg-background/85 p-3 backdrop-blur-md">
          <p className="flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
            <House className="size-4" /> Inside your safe house
          </p>
          <h1 className="mt-1 font-serif text-2xl">The Bellini Residence</h1>
          <p className="text-xs text-muted-foreground">
            Wallet {formatMoney(state.cash)} · Vault {formatMoney(state.safeHouse.balance)}
          </p>
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={onVault}
            className="rounded-full border border-primary/30 bg-background/85 px-4 py-2 text-sm text-primary"
          >
            <LockKeyhole className="mr-1 inline size-4" /> Manage vault
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-border bg-background/85 px-4 py-2 text-sm"
          >
            <LogOut className="mr-1 inline size-4" /> Exit to street
          </button>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 ring-2 ring-black/40"
      />
      <div className="flex flex-col items-center gap-3">
        {focusedId === 'vault' ? (
          <button
            type="button"
            onClick={onVault}
            className="pointer-events-auto rounded-xl border border-primary/40 bg-background/90 p-4 text-primary"
          >
            <strong>E · Open the family vault</strong>
            <span className="mt-1 block text-xs text-muted-foreground">
              {VAULT_TIERS[state.safeHouse.tier].name} · Deposit, withdraw, and upgrade
            </span>
          </button>
        ) : focusedId === 'exit' ? (
          <button
            type="button"
            onClick={onExit}
            className="pointer-events-auto rounded-xl border border-primary/40 bg-background/90 p-4 text-primary"
          >
            E · Return to Little Italy
          </button>
        ) : (
          <p className="rounded-xl bg-background/85 px-4 py-2 text-center text-xs text-muted-foreground">
            Walk along the rug to the vault. The exit is behind you.
          </p>
        )}
        <p className="rounded-lg bg-background/80 px-3 py-1 text-center text-xs text-muted-foreground">
          WASD / arrows to walk · Drag to look · H to leave · Esc frees mouse
        </p>
        <TouchControls />
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, House, LockKeyhole, ShieldCheck, X } from 'lucide-react'
import { formatMoney } from '@/lib/game/format'
import { VAULT_TIERS } from '@/lib/game/safe-house'
import { useGame } from './game-provider'

const buttonClass =
  'rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40'

export function SafeHouse({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [amount, setAmount] = useState('')
  const [notice, setNotice] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const vault = state.safeHouse
  const tier = VAULT_TIERS[vault.tier]
  const next = VAULT_TIERS[vault.tier + 1]
  const numeric = Number(amount)
  const valid = amount.trim() !== '' && Number.isFinite(numeric) && numeric > 0
  const room = tier.capacity - vault.balance

  useEffect(() => {
    const el = dialog.current!
    el.showModal()
    return () => el.close()
  }, [])

  const transfer = (direction: 'deposit' | 'withdraw', all = false) => {
    const value = all ? (direction === 'deposit' ? Math.min(state.cash, room) : vault.balance) : numeric
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      (direction === 'deposit' ? value > state.cash || value > room : value > vault.balance)
    )
      return
    dispatch({ type: 'vault', direction, amount: all ? 'all' : value })
    setNotice(
      `${formatMoney(value)} ${direction === 'deposit' ? 'stored in the vault' : 'returned to your wallet'}.`,
    )
    setAmount('')
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      aria-labelledby="safe-house-title"
      className="fixed inset-0 m-auto max-h-[94dvh] w-[min(560px,calc(100%_-_24px))] overflow-y-auto rounded-2xl border border-primary/25 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/80"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-primary uppercase">
            <House className="size-3" /> The Bellini residence
          </p>
          <h1 id="safe-house-title" className="font-serif text-2xl font-bold">
            Vault management
          </h1>
        </div>
        <button
          autoFocus
          type="button"
          onClick={onClose}
          className={buttonClass}
          aria-label="Close vault management"
        >
          <X className="inline size-4" /> <span className="hidden sm:inline">Back to the room</span>
        </button>
      </header>
      <div className="grid">
        <section aria-labelledby="vault-heading" className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <LockKeyhole className="size-7 text-primary" />
            <div>
              <h2 id="vault-heading" className="font-serif text-2xl">
                The Family Vault
              </h2>
              <p className="text-xs text-muted-foreground">
                {tier.name} · Level {vault.tier + 1}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Stored cash</p>
            <p className="mt-1 font-serif text-4xl text-primary tabular-nums">{formatMoney(vault.balance)}</p>
            <progress
              aria-label="Vault capacity used"
              max={tier.capacity}
              value={vault.balance}
              className="mt-3 h-2 w-full accent-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMoney(vault.balance)} / {formatMoney(tier.capacity)} capacity · {formatMoney(room)} free
            </p>
          </div>
          <p className="text-sm">
            Wallet: <strong className="text-primary tabular-nums">{formatMoney(state.cash)}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <label htmlFor="vault-amount" className="text-sm font-semibold">
              Transfer amount
            </label>
            <input
              id="vault-amount"
              type="number"
              min="0.01"
              step="any"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setNotice('')
              }}
              placeholder="Enter cash amount"
              className="w-full rounded-lg border border-border bg-card px-3 py-3 text-base outline-none focus:border-primary"
              aria-describedby="vault-help"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={!valid || numeric > state.cash || numeric > room}
                onClick={() => transfer('deposit')}
              >
                <ArrowDownToLine className="mr-1 inline size-4" /> Deposit
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={!valid || numeric > vault.balance}
                onClick={() => transfer('withdraw')}
              >
                <ArrowUpFromLine className="mr-1 inline size-4" /> Withdraw
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={state.cash <= 0 || room <= 0}
                onClick={() => transfer('deposit', true)}
              >
                Deposit all that fits
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={vault.balance <= 0}
                onClick={() => transfer('withdraw', true)}
              >
                Withdraw all
              </button>
            </div>
            <p id="vault-help" className="text-xs leading-relaxed text-muted-foreground">
              Stored cash appears as banded banknote stacks inside the vault. Stored cash cannot be spent
              until withdrawn. No interest or transfer fees. Vault cash and upgrades survive retirement, but a
              hard reset erases them. Saved on this device with your empire.
            </p>
            <p role="status" className="min-h-5 text-sm text-primary">
              {notice}
            </p>
          </div>
          <div className="mt-auto rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" /> {next ? next.name : 'Maximum security'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {next
                ? `Expand storage to ${formatMoney(next.capacity)}. Paid from your wallet.`
                : 'Your family has the largest vault available.'}
            </p>
            {next && (
              <button
                type="button"
                className={`${buttonClass} mt-3 w-full`}
                disabled={state.cash < next.cost}
                onClick={() => {
                  dispatch({ type: 'vaultUpgrade' })
                  setNotice(`Vault upgraded to ${next.name}.`)
                }}
              >
                Upgrade vault · {formatMoney(next.cost)}
              </button>
            )}
          </div>
        </section>
      </div>
    </dialog>
  )
}

'use client'

import type { ReactNode } from 'react'
import { BUSINESSES } from '@/lib/game/config'
import {
  costFor,
  cycleTime,
  nextMilestone,
  resolveBuyAmount,
  revenuePerCycle,
  type BuyAmount,
} from '@/lib/game/engine'
import { formatDuration, formatMoney } from '@/lib/game/format'
import { cn } from '@/lib/utils'
import { BusinessIcon } from './business-icon'
import { useGame } from './game-provider'

function ActionButton({
  hotkey,
  label,
  detail,
  disabled,
  onClick,
  tone = 'primary',
}: {
  hotkey: string
  label: string
  detail?: ReactNode
  disabled?: boolean
  onClick: () => void
  tone?: 'primary' | 'accent' | 'muted'
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
        tone === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/85',
        tone === 'accent' && 'bg-accent text-accent-foreground hover:bg-accent/85',
        tone === 'muted' && 'bg-secondary text-secondary-foreground',
      )}
    >
      <kbd className="flex size-6 shrink-0 items-center justify-center rounded border border-current/30 font-sans text-xs font-bold">
        {hotkey}
      </kbd>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-xs font-semibold uppercase">{label}</span>
        {detail && <span className="truncate text-sm font-bold tabular-nums">{detail}</span>}
      </span>
    </button>
  )
}

export function FocusCard({
  focusedId,
  buyAmount,
  onOpenSafeHouse,
}: {
  focusedId: string | null
  buyAmount: BuyAmount
  onOpenSafeHouse: () => void
}) {
  const { state, dispatch } = useGame()
  const config = BUSINESSES.find((b) => b.id === focusedId)

  if (focusedId === 'safehouse') {
    return (
      <section
        aria-label="Family Safe House"
        className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-primary/30 bg-card/95 p-4 backdrop-blur-md"
      >
        <h2 className="font-serif text-xl text-primary">Family Safe House</h2>
        <p className="text-sm text-muted-foreground">
          Your private retreat · Vault: {formatMoney(state.safeHouse.balance)}
        </p>
        <ActionButton
          hotkey="E"
          label="Enter safe house"
          detail="Visit your vault"
          onClick={onOpenSafeHouse}
        />
      </section>
    )
  }
  if (!config) {
    return (
      <p className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
        Walk up to a storefront to do business
      </p>
    )
  }

  const b = state.businesses[config.id]
  const qty = resolveBuyAmount(config, b.owned, state.cash, buyAmount)
  const cost = costFor(config, b.owned, qty)

  if (b.owned === 0) {
    return (
      <section
        aria-label={`${config.name}, for sale`}
        className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <BusinessIcon icon={config.icon} className="size-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-xl font-bold text-foreground">{config.name}</h2>
            <p className="truncate text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <ActionButton
          hotkey="F"
          label="Acquire property"
          detail={formatMoney(costFor(config, 0, 1))}
          disabled={state.cash < costFor(config, 0, 1)}
          onClick={() => dispatch({ type: 'buy', id: config.id, amount: 1 })}
        />
      </section>
    )
  }

  const cycle = cycleTime(config, b.owned)
  const active = b.running || b.managed
  const isFast = cycle < 250
  const pct = active ? (isFast ? 100 : Math.min(100, (b.progress / cycle) * 100)) : 0
  const next = nextMilestone(b.owned)

  return (
    <section
      aria-label={config.name}
      className="pointer-events-auto flex w-full max-w-xl flex-col gap-3 rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/15 text-primary">
          <BusinessIcon icon={config.icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-serif text-xl font-bold text-foreground">{config.name}</h2>
          <p className="text-xs text-muted-foreground tabular-nums">
            {b.owned} owned{next ? ` · speed x2 at ${next}` : ''}
            {b.managed ? ` · ${config.managerName} on duty` : ''}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground tabular-nums">
          {formatDuration(active ? cycle - b.progress : cycle)}
        </span>
      </div>

      <div className="relative h-8 overflow-hidden rounded-lg border border-border bg-muted">
        <div
          className={cn('h-full bg-primary/80', isFast && active && 'animate-pulse')}
          style={{ width: `${pct}%`, transition: pct === 0 ? 'none' : 'width 100ms linear' }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
          {formatMoney(revenuePerCycle(state, config))} per run
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {b.managed ? (
          <ActionButton
            hotkey="E"
            label="Capo collecting"
            detail="Automatic"
            disabled
            onClick={() => {}}
            tone="muted"
          />
        ) : (
          <ActionButton
            hotkey="E"
            label={b.running ? 'Collecting...' : 'Collect'}
            detail={b.running ? formatDuration(cycle - b.progress) : 'Ready'}
            disabled={b.running}
            onClick={() => dispatch({ type: 'run', id: config.id })}
          />
        )}
        <ActionButton
          hotkey="F"
          label={`Buy x${qty}`}
          detail={formatMoney(cost)}
          disabled={state.cash < cost}
          onClick={() => dispatch({ type: 'buy', id: config.id, amount: buyAmount })}
        />
        {!b.managed && (
          <ActionButton
            hotkey="Q"
            label="Hire capo"
            detail={formatMoney(config.managerCost)}
            disabled={state.cash < config.managerCost}
            onClick={() => dispatch({ type: 'hire', id: config.id })}
            tone="accent"
          />
        )}
      </div>
    </section>
  )
}

'use client'

import { Lock, UserCheck } from 'lucide-react'
import type { BusinessConfig } from '@/lib/game/config'
import {
  costFor,
  cycleTime,
  nextMilestone,
  previousMilestone,
  resolveBuyAmount,
  revenuePerCycle,
  type BuyAmount,
} from '@/lib/game/engine'
import { formatDuration, formatMoney } from '@/lib/game/format'
import { cn } from '@/lib/utils'
import { BusinessIcon } from './business-icon'
import { useGame } from './game-provider'

export function BusinessCard({ config, buyAmount }: { config: BusinessConfig; buyAmount: BuyAmount }) {
  const { state, dispatch } = useGame()
  const b = state.businesses[config.id]
  const owned = b.owned
  const qty = resolveBuyAmount(config, owned, state.cash, buyAmount)
  const cost = costFor(config, owned, qty)
  const affordable = state.cash >= (owned === 0 ? costFor(config, 0, 1) : cost)

  if (owned === 0) {
    return (
      <article className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-card/40 p-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
          <Lock className="size-6" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="font-serif text-lg font-semibold text-foreground">{config.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{config.description}</p>
        </div>
        <button
          type="button"
          disabled={!affordable}
          onClick={() => dispatch({ type: 'buy', id: config.id, amount: 1 })}
          className="flex shrink-0 flex-col items-center rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <span className="text-xs font-medium uppercase">Acquire</span>
          <span className="text-sm font-bold tabular-nums">{formatMoney(costFor(config, 0, 1))}</span>
        </button>
      </article>
    )
  }

  const cycle = cycleTime(config, owned)
  const isFast = cycle < 250
  const active = b.running || b.managed
  const pct = active ? (isFast ? 100 : Math.min(100, (b.progress / cycle) * 100)) : 0
  const remaining = active ? cycle - b.progress : cycle
  const next = nextMilestone(owned)
  const prev = previousMilestone(owned)
  const milestonePct = next ? ((owned - prev) / (next - prev)) * 100 : 100

  return (
    <article className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex shrink-0 flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => dispatch({ type: 'run', id: config.id })}
          disabled={active}
          aria-label={b.managed ? `${config.name} is run by ${config.managerName}` : `Run ${config.name}`}
          className={cn(
            'relative flex size-16 items-center justify-center rounded-full border-2 transition-transform',
            active
              ? 'border-primary bg-primary/15 text-primary'
              : 'animate-pulse border-primary bg-primary text-primary-foreground hover:scale-105 active:scale-95',
          )}
        >
          <BusinessIcon icon={config.icon} className="size-7" />
          {b.managed && (
            <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <UserCheck className="size-3.5" aria-hidden="true" />
            </span>
          )}
        </button>
        <div className="flex w-16 flex-col items-center gap-1">
          <span className="text-xs font-semibold text-foreground tabular-nums">{owned}</span>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label={next ? `Progress to ${next} owned` : 'All milestones reached'}
            aria-valuenow={Math.round(milestonePct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-accent" style={{ width: `${milestonePct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-serif text-lg font-semibold text-foreground">{config.name}</h3>
          {next && <span className="shrink-0 text-xs text-muted-foreground">Next speed x2 at {next}</span>}
        </div>

        <div className="relative h-9 overflow-hidden rounded-lg border border-border bg-muted">
          <div
            className={cn('h-full bg-primary/80', isFast && active && 'animate-pulse')}
            style={{ width: `${pct}%`, transition: pct === 0 ? 'none' : 'width 100ms linear' }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground tabular-nums [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]">
            {formatMoney(revenuePerCycle(state, config))}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!affordable}
            onClick={() => dispatch({ type: 'buy', id: config.id, amount: buyAmount })}
            className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-primary px-3 py-1.5 text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <span className="text-xs font-semibold uppercase">Buy x{qty}</span>
            <span className="text-sm font-bold tabular-nums">{formatMoney(cost)}</span>
          </button>
          <div className="flex w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm text-muted-foreground tabular-nums">
            {formatDuration(remaining)}
          </div>
        </div>
      </div>
    </article>
  )
}

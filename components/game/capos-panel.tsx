'use client'

import { Check } from 'lucide-react'
import { BUSINESSES } from '@/lib/game/config'
import { formatMoney } from '@/lib/game/format'
import { BusinessIcon } from './business-icon'
import { useGame } from './game-provider'

export function CaposPanel() {
  const { state, dispatch } = useGame()

  return (
    <section aria-labelledby="capos-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="capos-heading" className="font-serif text-2xl font-bold text-foreground">
          Capos
        </h2>
        <p className="text-sm text-muted-foreground">
          A capo runs a racket around the clock, even while you&apos;re away.
        </p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BUSINESSES.map((config) => {
          const b = state.businesses[config.id]
          const affordable = state.cash >= config.managerCost && b.owned > 0
          return (
            <li key={config.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                  <BusinessIcon icon={config.icon} className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-base font-semibold text-foreground">{config.managerName}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {config.managerTitle} &middot; {config.name}
                  </p>
                </div>
              </div>
              {b.managed ? (
                <div className="flex items-center justify-center gap-1.5 rounded-lg bg-accent/15 py-2 text-sm font-semibold text-accent">
                  <Check className="size-4" aria-hidden="true" />
                  On the payroll
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'hire', id: config.id })}
                  className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                  <span className="text-xs font-semibold uppercase">{b.owned === 0 ? 'Own racket first' : 'Hire'}</span>
                  <span className="text-sm font-bold tabular-nums">{formatMoney(config.managerCost)}</span>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

'use client'

import { Sparkles } from 'lucide-react'
import { BUSINESSES, UPGRADES } from '@/lib/game/config'
import { formatMoney } from '@/lib/game/format'
import { BusinessIcon } from './business-icon'
import { useGame } from './game-provider'

export function UpgradesPanel() {
  const { state, dispatch } = useGame()
  const available = UPGRADES.filter((u) => !state.upgrades.includes(u.id)).slice(0, 12)

  return (
    <section aria-labelledby="upgrades-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="upgrades-heading" className="font-serif text-2xl font-bold text-foreground">
            Upgrades
          </h2>
          <p className="text-sm text-muted-foreground">Grease the right palms to multiply profits.</p>
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {state.upgrades.length} / {UPGRADES.length} owned
        </p>
      </div>

      {available.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          You own the whole town. Nothing left to buy.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {available.map((up) => {
            const business = BUSINESSES.find((b) => b.id === up.target)
            const affordable = state.cash >= up.cost
            return (
              <li key={up.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                    {business ? (
                      <BusinessIcon icon={business.icon} className="size-5" />
                    ) : (
                      <Sparkles className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-base font-semibold text-foreground">{up.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{up.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => dispatch({ type: 'upgrade', id: up.id })}
                  className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                  <span className="text-xs font-semibold uppercase">Buy</span>
                  <span className="text-sm font-bold tabular-nums">{formatMoney(up.cost)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

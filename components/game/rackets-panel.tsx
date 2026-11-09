'use client'

import { useState } from 'react'
import { BUSINESSES } from '@/lib/game/config'
import type { BuyAmount } from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { BusinessCard } from './business-card'
import { useGame } from './game-provider'

const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

export function RacketsPanel() {
  const { state } = useGame()
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1)

  const firstLockedIndex = BUSINESSES.findIndex((b) => state.businesses[b.id].owned === 0)
  const visible = firstLockedIndex === -1 ? BUSINESSES : BUSINESSES.slice(0, firstLockedIndex + 2)

  return (
    <section aria-labelledby="rackets-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="rackets-heading" className="font-serif text-2xl font-bold text-foreground">
            Rackets
          </h2>
          <p className="text-sm text-muted-foreground">Tap a racket to collect. Hire capos to automate.</p>
        </div>
        <div role="radiogroup" aria-label="Buy amount" className="flex rounded-lg border border-border bg-card p-1">
          {AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              role="radio"
              aria-checked={buyAmount === amount}
              onClick={() => setBuyAmount(amount)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-semibold uppercase transition-colors',
                buyAmount === amount ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {amount === 'max' ? 'Max' : `x${amount}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {visible.map((config) => (
          <BusinessCard key={config.id} config={config} buyAmount={buyAmount} />
        ))}
      </div>
    </section>
  )
}

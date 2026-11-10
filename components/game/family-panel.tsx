'use client'

import Image from 'next/image'
import { useState } from 'react'
import { RESPECT_BONUS_PER_POINT } from '@/lib/game/config'
import { claimableRespect, totalIncomePerSecond } from '@/lib/game/engine'
import { formatDuration, formatMoney, formatNumber } from '@/lib/game/format'
import { useGame } from './game-provider'

export function FamilyPanel() {
  const { state, dispatch } = useGame()
  const [confirmReset, setConfirmReset] = useState(false)
  const gain = claimableRespect(state)
  const bonusPct = Math.round(RESPECT_BONUS_PER_POINT * 100)

  const stats = [
    { label: 'Earned this run', value: formatMoney(state.runEarnings) },
    { label: 'Lifetime earnings', value: formatMoney(state.lifetimeEarnings) },
    { label: 'Income per second', value: formatMoney(totalIncomePerSecond(state)) },
    { label: 'Times retired', value: formatNumber(state.heists) },
    { label: 'Current run', value: formatDuration(Date.now() - state.startedAt) },
    { label: 'Upgrades owned', value: formatNumber(state.upgrades.length) },
  ]

  return (
    <section aria-labelledby="family-heading" className="flex flex-col gap-6">
      <div>
        <h2 id="family-heading" className="font-serif text-2xl font-bold text-foreground">
          The Family
        </h2>
        <p className="text-sm text-muted-foreground">Pass the empire to your heir and come back stronger.</p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card md:flex-row">
        <div className="relative aspect-square w-full md:w-72 md:shrink-0">
          <Image
            src="/images/the-don.png"
            alt="Portrait of the Don in shadow"
            fill
            sizes="(min-width: 768px) 18rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between gap-6 p-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-xl font-semibold text-foreground">Retire &amp; Pass the Torch</h3>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              Sell off every racket, capo, upgrade, and luxury asset. Objectives and active operations also
              reset. Your safe house, vault upgrades, and stored cash stay in the family. In return your
              family gains Respect, and each point permanently boosts all profits by {bonusPct}%. Respect is
              earned from lifetime earnings.
            </p>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">Current Respect</p>
                <p className="font-serif text-3xl font-bold text-foreground tabular-nums">
                  {formatNumber(state.respect)}
                </p>
              </div>
              <div>
                <p className="text-xs tracking-widest text-muted-foreground uppercase">On retirement</p>
                <p className="font-serif text-3xl font-bold text-accent tabular-nums">
                  +{formatNumber(gain)}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={gain <= 0}
            onClick={() => dispatch({ type: 'prestige' })}
            className="rounded-lg bg-accent px-4 py-3 font-semibold text-accent-foreground transition-colors hover:bg-accent/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {gain > 0 ? `Retire for +${formatNumber(gain)} Respect` : 'Earn more before retiring'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-foreground">Ledger</h3>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-serif text-xl font-semibold text-foreground tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        {confirmReset ? (
          <>
            <span className="text-sm text-muted-foreground">Erase everything, including Respect?</span>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'hardReset' })
                setConfirmReset(false)
              }}
              className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              Yes, wipe it
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            Hard reset save
          </button>
        )}
      </div>
    </section>
  )
}

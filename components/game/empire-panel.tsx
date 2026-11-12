'use client'

import { ASSET_LOCATIONS } from '@/lib/game/good-life'
import { ASSETS, BUSINESSES, OBJECTIVES, OPERATIONS } from '@/lib/game/config'
import { objectiveProgress } from '@/lib/game/engine'
import { formatMoney } from '@/lib/game/format'
import { BusinessIcon } from './business-icon'
import { useGame } from './game-provider'

const buttonClass =
  'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/85 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed'

export function EmpirePanel() {
  const { state, dispatch } = useGame()
  const active = OPERATIONS.find((o) => o.id === state.operation?.id)

  return (
    <section className="flex flex-col gap-8" aria-labelledby="empire-heading">
      <header>
        <p className="text-xs tracking-[0.25em] text-primary uppercase">Beyond the storefront</p>
        <h2 id="empire-heading" className="font-serif text-3xl font-bold">
          Build your legacy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Invest in operations, finish objectives, and live like the boss. Purchases and objectives reset when
          you retire.
        </p>
      </header>
      <section aria-labelledby="operations-heading" className="flex flex-col gap-3">
        <h3 id="operations-heading" className="font-serif text-xl">
          Family operations
        </h3>
        <p className="text-sm text-muted-foreground">
          Seven family contracts, from neighborhood deliveries to harbor charters. One operation at a time. Timers run while the game is open; returns arrive automatically.
        </p>
        {active && state.operation && (
          <div role="status" className="rounded-xl border border-primary/40 bg-primary/10 p-4">
            <p className="font-semibold text-primary">
              {active.name} · {Math.ceil(state.operation.remainingMs / 1000)}s remaining
            </p>
            <progress
              className="mt-2 h-2 w-full accent-[var(--primary)]"
              aria-label="Operation progress"
              max={active.seconds * 1000}
              value={active.seconds * 1000 - state.operation.remainingMs}
            />
          </div>
        )}
        <div className="grid gap-3 xl:grid-cols-3">
          {OPERATIONS.map((op) => {
            const unlocked = state.businesses[op.required].owned > 0
            return (
              <article
                key={op.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <h4 className="font-serif text-lg text-primary">{op.name}</h4>
                <p className="flex-1 text-sm text-muted-foreground">{op.description}</p>
                <p className="text-xs text-muted-foreground">
                  {op.seconds}s · Invest {formatMoney(op.cost)} → receive {formatMoney(op.reward)}
                </p>
                <button
                  className={buttonClass}
                  disabled={!unlocked || !!state.operation || state.cash < op.cost}
                  onClick={() => dispatch({ type: 'operation', id: op.id })}
                >
                  {!unlocked
                    ? `Acquire ${BUSINESSES.find((b) => b.id === op.required)?.name ?? 'the property'} first`
                    : state.operation?.id === op.id
                      ? 'In progress'
                      : `Start ${op.name}`}
                </button>
              </article>
            )
          })}
        </div>
      </section>
      <section aria-labelledby="objectives-heading" className="flex flex-col gap-3">
        <h3 id="objectives-heading" className="font-serif text-xl">
          The boss&apos;s agenda
        </h3>
        <div className="grid gap-3 xl:grid-cols-2">
          {OBJECTIVES.map((goal) => {
            const progress = Math.min(goal.goal, objectiveProgress(state, goal.metric))
            const claimed = state.objectives.includes(goal.id)
            return (
              <article
                key={goal.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{goal.name}</h4>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                  <progress
                    className="mt-2 h-1.5 w-full accent-[var(--primary)]"
                    aria-label={goal.name}
                    value={progress}
                    max={goal.goal}
                  />
                </div>
                <button
                  className={buttonClass}
                  disabled={claimed || progress < goal.goal}
                  onClick={() => dispatch({ type: 'objective', id: goal.id })}
                >
                  {claimed ? 'Claimed' : `Claim ${formatMoney(goal.reward)}`}
                </button>
              </article>
            )
          })}
        </div>
      </section>
      <section aria-labelledby="assets-heading" className="flex flex-col gap-3">
        <h3 id="assets-heading" className="font-serif text-xl">
          The good life
        </h3>
        <p className="text-sm text-muted-foreground">
          One of each. Purchases appear in your world as described below. Profit bonuses multiply together and
          apply to every business, including offline income.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ASSETS.map((asset) => {
            const owned = state.assets.includes(asset.id)
            return (
              <article
                key={asset.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <BusinessIcon icon={asset.icon} className="size-7 text-primary" />
                <h4 className="font-serif text-lg">{asset.name}</h4>
                <p className="flex-1 text-sm text-muted-foreground">{asset.description}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{ASSET_LOCATIONS[asset.id]}</p>
                <p className="text-sm text-primary">All profits ×{asset.multiplier}</p>
                <button
                  className={buttonClass}
                  disabled={owned || state.cash < asset.cost}
                  onClick={() => dispatch({ type: 'asset', id: asset.id })}
                >
                  {owned ? 'Owned' : `Buy ${formatMoney(asset.cost)}`}
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </section>
  )
}

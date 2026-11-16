'use client'

import { FAMILIES } from '@/lib/game/city'
import { crewPower, opposition, recruitCost } from '@/lib/game/rivals'
import { formatMoney } from '@/lib/game/format'
import { useGame } from './game-provider'

export function RivalPanel({ familyId }: { familyId?: string }) {
  const { state, dispatch } = useGame()
  const power = crewPower(state),
    cost = recruitCost(state)
  return (
    <section aria-label="Rival family operations" className="flex flex-col gap-3">
      <p className="text-sm text-primary">
        Your crew: {state.city.crew} associates · Power {power} · Stamina {Math.floor(state.city.stamina)}/100 · Wallet {formatMoney(state.cash)}
      </p>
      <button
        type="button"
        disabled={state.cash < cost || state.city.crew >= 50}
        onClick={() => dispatch({ type: 'recruit' })}
        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
      >
        Recruit associate · {formatMoney(cost)}
      </button>
      {FAMILIES.filter((f) => !familyId || f.id === familyId).map((family) => {
        const rival = state.city.families[family.id],
          enemy = opposition(state, family.id)
        return (
          <article key={family.id} className="rounded-xl border border-border bg-background/90 p-3">
            <h3 className="font-serif text-lg" style={{ color: family.color }}>
              {family.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {family.district} · Influence {rival.influence}/100 · Opposing power {enemy}
            </p>
            <div className="my-2 h-1.5 rounded bg-muted">
              <div
                className="h-full rounded"
                style={{ width: `${rival.influence}%`, background: family.color }}
              />
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              {rival.influence === 0
                ? 'Your family controls this territory until they recover.'
                : power >= enemy
                  ? 'Your crew can win this confrontation.'
                  : 'Outmatched: recruit associates or hire business managers first.'}{' '}
              Rivals recover 5 influence per minute unless a truce is active.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={
                  rival.cooldownMs > 0 ||
                  rival.truceMs > 0 ||
                  state.city.stamina < 25 ||
                  rival.influence === 0
                }
                onClick={() => dispatch({ type: 'rival', id: family.id, move: 'challenge' })}
                className="rounded border border-primary/50 px-3 py-2 text-xs text-primary disabled:opacity-40"
              >
                {rival.cooldownMs > 0
                  ? `Regroup ${Math.ceil(rival.cooldownMs / 1000)}s`
                  : `Challenge · 25 stamina · ${formatMoney(family.reward)} if won`}
              </button>
              <button
                type="button"
                disabled={rival.truceMs > 0 || state.cash < family.reward / 2}
                onClick={() => dispatch({ type: 'rival', id: family.id, move: 'truce' })}
                className="rounded border border-border px-3 py-2 text-xs disabled:opacity-40"
              >
                {rival.truceMs > 0
                  ? `Truce ${Math.ceil(rival.truceMs / 1000)}s`
                  : `Negotiate truce · ${formatMoney(family.reward / 2)}`}
              </button>
            </div>
          </article>
        )
      })}
      <p role="status" className="text-xs text-muted-foreground">
        {state.city.message}
      </p>
    </section>
  )
}

'use client'

import { VEHICLES, restoreFleet } from '@/lib/game/vehicles'
import { formatMoney } from '@/lib/game/format'
import { useGame } from './game-provider'

export function FleetPanel() {
  const { state, dispatch } = useGame()
  const fleet = restoreFleet(state.fleet, state.assets)
  return (
    <section
      aria-label="City garage"
      className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-3"
    >
      <h2 className="font-serif text-xl text-primary">Family motor pool</h2>
      <p className="text-xs text-muted-foreground">
        Wallet {formatMoney(state.cash)} · Buy and select a vehicle here or at Eastside Motor Works. Close the
        atlas, then use Drive vehicle. Switching returns your vehicle to the central motor-pool space. W/S
        drive, A/D steer, Space brakes. Vehicles do not change business income; the original sedan perk is
        preserved.
      </p>
      {VEHICLES.map((v) => {
        const owned = fleet.owned.includes(v.id),
          selected = fleet.selected === v.id
        return (
          <article
            key={v.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div>
              <h3 className="text-sm font-semibold" style={{ color: v.color }}>
                {v.name}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Top speed {v.speed} · Acceleration {v.acceleration} · {v.kind}
              </p>
            </div>
            <button
              type="button"
              disabled={selected || (!owned && state.cash < v.cost)}
              onClick={() => dispatch({ type: owned ? 'vehicleSelect' : 'vehicleBuy', id: v.id })}
              className="rounded border border-primary/40 px-3 py-2 text-xs text-primary disabled:opacity-40"
            >
              {selected
                ? `${v.name} selected`
                : owned
                  ? `Select ${v.name}`
                  : `Buy ${v.name} · ${formatMoney(v.cost)}`}
            </button>
          </article>
        )
      })}
    </section>
  )
}

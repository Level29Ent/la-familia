'use client'

import type { CityBuilding } from '@/lib/game/city'
import type { BuyAmount } from '@/lib/game/engine'
import { formatMoney } from '@/lib/game/format'
import { FocusCard } from './focus-card'
import { FleetPanel } from './fleet-panel'
import { RivalPanel } from './rival-panel'
import { TouchControls } from './touch-controls'
import { ActivityPanel, RentalPanel, ScheduleRest } from './city-play-panel'
import { useGame } from './game-provider'

export function InteriorHud({
  building,
  focusedId,
  buyAmount,
  onExit,
  onMap,
  onTravel,
}: {
  building: CityBuilding
  focusedId: string | null
  buyAmount: BuyAmount
  onTravel: (id: string) => void
  onMap: () => void
  onExit: () => void
}) {
  const { state, dispatch } = useGame()
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-5">
      <header className="pointer-events-auto flex items-start justify-between gap-3">
        <div className="rounded-xl border border-border bg-background/90 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {building.district} · {building.kind}
          </p>
          <h1 className="font-serif text-xl text-primary">{building.name}</h1>
          <p className="text-xs text-muted-foreground">Wallet {formatMoney(state.cash)}</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border border-primary/40 bg-background/95 px-4 py-3 text-sm text-primary"
        >
          Exit building · E at door / Esc
        </button>
      </header>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onMap}
          className="pointer-events-auto self-start rounded-lg border border-border bg-background/90 p-2 text-xs text-primary"
        >
          Map menu · Tab / G
        </button>
        <section
          className="pointer-events-auto max-h-[42dvh] w-full max-w-lg self-end overflow-y-auto rounded-xl border border-border bg-background/95 p-3"
          aria-label="Interior activities"
        >
          <ActivityPanel location={building.id} onTravel={onTravel} />
          {building.kind === 'home' && (
            <>
              <RentalPanel id={building.id} />
              <ScheduleRest />
            </>
          )}
          {building.kind === 'business' ? (
            <>
              <FocusCard focusedId={building.id} buyAmount={buyAmount} onOpenSafeHouse={() => {}} />
              {building.id === 'garage' && <FleetPanel />}
            </>
          ) : building.kind === 'headquarters' ? (
            <RivalPanel familyId={building.family} />
          ) : (
            <div>
              <h2 className="font-serif text-lg text-primary">A place to call home</h2>
              <p className="my-2 text-sm text-muted-foreground">
                A furnished residence with a lounge, bed and resident. Rest here to recover your crew before
                meeting the rival families.
              </p>
              <p className="text-sm">Crew stamina {Math.floor(state.city.stamina)}/100</p>
              <button
                type="button"
                disabled={state.city.stamina >= 100}
                onClick={() => dispatch({ type: 'rest' })}
                className="mt-2 rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-40"
              >
                Rest at home
              </button>
            </div>
          )}
        </section>
        <p className="self-center rounded-full bg-background/90 px-4 py-2 text-xs text-primary">
          {focusedId === 'exit'
            ? 'E · Return to the city'
            : 'WASD / arrows: walk · R: collect · F: buy · Q: hire · Esc: leave'}
        </p>
        <TouchControls />
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { CITY_BUILDINGS } from '@/lib/game/city'
import { StreetMap } from './street-map'
import { mapBuildings, nearestAddress, type MapPosition, type MapFilter } from '@/lib/game/map'
import { DynastyPanel } from './dynasty-panel'
import { FleetPanel } from './fleet-panel'
import { GuidePanel, TerritoryPanel, ActivityDirectory } from './city-play-panel'
import { useGame } from './game-provider'
import { ChallengesPanel } from './challenges-panel'
import { ApartmentsPanel } from './apartments-panel'
import { HarborPanel } from './harbor-panel'
import { RivalPanel } from './rival-panel'

export function CityMap({
  initialSection,
  currentInterior,
  currentBuildingId,
  currentSuiteId,
  onSuiteTour,
  destination,
  onDestination,
  selectedNpc,
  position,
  onTravel,
  onClose,
}: {
  initialSection?: string
  currentSuiteId?: string | null
  onSuiteTour: (id: string) => void
  currentBuildingId?: string
  currentInterior?: string
  destination?: string | null
  onDestination: (id: string | null) => void
  selectedNpc?: string | null
  position: MapPosition
  onTravel: (id: string) => void
  onClose: () => void
}) {
  const { state, dispatch } = useGame()
  const [tab, setTab] = useState(selectedNpc ? 'family' : (initialSection ?? 'map'))
  const [filter, setFilter] = useState<MapFilter>('all')
  const [search, setSearch] = useState('')
  const matches = mapBuildings(filter, search)
  const nearest = nearestAddress(position)
  const target = CITY_BUILDINGS.find((b) => b.id === destination)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current!
    el.showModal()
    return () => el.close()
  }, [])
  useEffect(() => {
    if (selectedNpc) document.getElementById(`recruit-${selectedNpc}`)?.scrollIntoView({ block: 'center' })
  }, [selectedNpc])
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      aria-labelledby="city-map-title"
      className="m-auto max-h-[94dvh] w-[min(1100px,96vw)] overflow-y-auto rounded-2xl border border-primary/30 bg-background p-5 text-foreground backdrop:bg-black/80"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background py-2">
        <div>
          <h2 id="city-map-title" className="font-serif text-2xl text-primary">
            City atlas & rival families
          </h2>
          <p className="text-xs text-muted-foreground">
            16 blocks · 64 enterable buildings · 30 businesses · 30 homes · 3 rival clubs
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded border border-border px-3 py-2">
          Close city map
        </button>
      </header>
      <nav
        aria-label="City menu sections"
        className="sticky top-20 z-10 flex gap-2 overflow-x-auto bg-background py-2"
      >
        {[
          ['map', 'Map'],
          ['harbor', 'Harbor story'],
          ['challenges', 'Challenges'],
          ['apartments', 'Apartments'],
          ['family', 'Family & law'],
          ['garage', 'Garage'],
          ['territory', 'Territory'],
          ['guide', 'Goals & settings'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-lg border px-4 py-2 text-sm ${tab === id ? 'border-primary text-primary' : 'border-border'}`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_0.8fr]">
        {tab === 'challenges' && <ChallengesPanel location={currentBuildingId} onTravel={onTravel} />}
        {tab === 'apartments' && <ApartmentsPanel buildingId={currentBuildingId} currentSuiteId={currentSuiteId} onTour={onSuiteTour} />}
        {tab === 'harbor' && <HarborPanel location={currentBuildingId} onTravel={onTravel} />}
        {tab === 'map' && (
          <section className="md:col-span-2">
            <p role="status" className="mb-3 text-sm text-primary">
              You are here: {currentInterior ? `Inside ${currentInterior} · ` : ''}
              {nearest.district} · near {nearest.name} · X {position.x.toFixed(1)}, Z {position.z.toFixed(1)}
            </p>
            <div className="h-[40dvh] min-h-48">
              <StreetMap
                position={position}
                destination={destination}
                onSelect={onDestination}
                territories={state.play.territories}
                visibleIds={matches.map((b) => b.id)}
              />
            </div>
            <p className="my-2 text-xs text-muted-foreground">
              Gold arrow: you · Green: businesses · Tan: homes · Gold building: safe house · Family colors:
              rival clubs. North is up. Dashed line is a bearing, not a collision-free route.
            </p>
            {target && (
              <section
                aria-label="Tracked destination"
                className="my-3 rounded border border-primary/40 p-3 text-sm"
              >
                <strong>{target.name}</strong> ·{' '}
                {Math.round(Math.hypot(position.x - target.door[0], position.z - target.door[1]))}m away ·{' '}
                {target.district}
                <button type="button" className="ml-3 underline" onClick={() => onDestination(null)}>
                  Clear destination
                </button>
              </section>
            )}
            <div className="my-3 flex flex-wrap gap-2">
              <input
                aria-label="Search city destinations"
                placeholder="Search name or district"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 rounded border border-border bg-card p-2"
              />
              <select
                aria-label="Map building filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as MapFilter)}
                className="rounded border border-border bg-card p-2"
              >
                {[
                  ['all', 'All places'],
                  ['business', 'Businesses'],
                  ['home', 'Homes'],
                  ['headquarters', 'Rival clubs'],
                  ['safehouse', 'Safe house'],
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              {matches.length} destinations · Walk anywhere along the streets, track a bearing, or travel to
              an entrance.
            </p>
            {!matches.length && (
              <p className="my-3 text-sm text-muted-foreground">
                No matching destinations. Try another name or district.
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {matches.map((b) => (
                <article
                  key={b.id}
                  id={`destination-${b.id}`}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <h3 className="text-sm text-primary">{b.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {b.district} · {b.kind}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onDestination(b.id)}
                      className="rounded border border-primary/30 px-2 py-1 text-xs"
                    >
                      Track {b.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onTravel(b.id)}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      Travel to {b.name}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === 'family' && (
          <div className="md:col-span-2">
            <DynastyPanel selectedNpc={selectedNpc} />
            <RivalPanel />
          </div>
        )}
        {tab === 'territory' && (
          <div className="md:col-span-2">
            <TerritoryPanel />
          </div>
        )}
        {tab === 'guide' && (
          <div className="md:col-span-2">
            <GuidePanel onTravel={onTravel} />
            <ActivityDirectory onTravel={onTravel} />
            <label className="mt-4 block text-sm">
              Graphics quality
              <select
                aria-label="Graphics quality"
                value={state.play.quality}
                onChange={(e) => dispatch({ type: 'quality', value: e.target.value as 'balanced' | 'low' })}
                className="ml-2 rounded border border-border bg-card p-2"
              >
                <option value="balanced">Balanced</option>
                <option value="low">Low · reduced crowd detail and resolution</option>
              </select>
            </label>
            <section aria-label="Activity journal" className="mt-4 text-sm">
              <h2 className="text-primary">City activity journal</h2>
              {state.play.events.map((e, i) => (
                <p key={i} className="my-2 text-xs text-muted-foreground">
                  {e}
                </p>
              ))}
            </section>
          </div>
        )}
        {tab === 'garage' && (
          <div className="md:col-span-2">
            <FleetPanel />
          </div>
        )}
      </div>
    </dialog>
  )
}

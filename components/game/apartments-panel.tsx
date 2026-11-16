'use client'

import { useState } from 'react'
import {
  APARTMENT_BUILDINGS,
  SUITES,
  TENANTS,
  suiteRent,
  renovationCost,
  repairCost,
  type SuiteState,
} from '@/lib/game/apartments'
import { formatMoney } from '@/lib/game/format'
import { useGame } from './game-provider'

const button =
  'rounded-lg border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40'
export function ApartmentsPanel({
  buildingId,
  currentSuiteId,
  onTour,
}: {
  buildingId?: string
  currentSuiteId?: string | null
  onTour: (id: string) => void
}) {
  const { state, dispatch } = useGame()
  const [selected, setSelected] = useState(
    APARTMENT_BUILDINGS.some((b) => b.id === buildingId) ? buildingId! : APARTMENT_BUILDINGS[0].id,
  )
  const [onlyOwned, setOnlyOwned] = useState(false)
  const owned = state.apartments.suites
  const building = APARTMENT_BUILDINGS.find((b) => b.id === selected)!
  const occupied = owned.filter((s) => s.tenant).length
  const potential = owned.reduce(
    (n, s) => n + (s.tenant && s.condition >= 30 && !s.repairMs ? suiteRent(s) : 0),
    0,
  )
  return (
    <section className="space-y-5 md:col-span-2" aria-labelledby="apartments-title">
      <header className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-background p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Bellini Property Company</p>
        <h3 id="apartments-title" className="mt-2 font-serif text-3xl">
          Suites & leases
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Buy the door. Choose the tenant. Build the neighborhood.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ['Owned suites', owned.length],
            ['Occupied', `${occupied}/${owned.length}`],
            ['Current rent / min', formatMoney(potential)],
            ['Wallet', formatMoney(state.cash)],
          ].map(([label, value]) => (
            <div className="rounded-lg bg-background/70 p-3" key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-lg text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </header>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Each lease lasts five active-play minutes, paid every minute. Choose reliable residents,
        low-wear families or higher-paying executives. Below 30 condition, rent stops; new leases
        need 60. Repairs take 15 active seconds and pause rent, not the lease. Renovate vacant
        suites to unlock better tenants and furniture. No suite income accrues offline or in
        custody. Existing residence deeds are preserved separately.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-sm" htmlFor="apartment-building">
          Apartment building
          <select
            id="apartment-building"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-card p-3"
          >
            {APARTMENT_BUILDINGS.map((b) => (
              <option value={b.id} key={b.id}>
                {b.name} · {b.district}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded border border-border p-3 text-sm">
          <input
            type="checkbox"
            checked={onlyOwned}
            onChange={(e) => setOnlyOwned(e.target.checked)}
          />
          Portfolio only
        </label>
      </div>
      <p className="text-sm text-primary">
        {onlyOwned ? 'Your complete citywide portfolio' : `${building.name} · ${building.district}`}
      </p>
      <div className="grid gap-4 lg:grid-cols-3">
        {SUITES.filter((c) =>
          onlyOwned ? owned.some((s) => s.id === c.id) : c.buildingId === selected,
        ).map((config) => {
          const s = owned.find((s) => s.id === config.id)
          const b = APARTMENT_BUILDINGS.find((b) => b.id === config.buildingId)!
          const preview: SuiteState = s ?? {
            id: config.id,
            level: 0,
            condition: 100,
            tenant: null,
            leaseMs: 0,
            repairMs: 0,
            rentMs: 60000,
            earned: 0,
            visited: false,
          }
          return (
            <article
              key={config.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div
                aria-hidden="true"
                className="relative h-28 overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${config.color}, #252e32)` }}
              >
                <div className="absolute left-5 top-4 h-14 w-12 border-4 border-amber-100/40 bg-sky-200/30 shadow-[16px_0_0_-5px_rgba(255,255,255,0.1)]" />
                <div className="absolute bottom-4 right-5 h-8 w-24 rounded-t-xl border-b-8 border-amber-950/50 bg-amber-100/60" />
                <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[10px] uppercase tracking-wider text-white">
                  {s
                    ? s.repairMs
                      ? 'Repairs underway'
                      : s.tenant
                        ? 'Leased'
                        : 'Vacant · owned'
                    : 'For sale'}
                </span>
                <span className="absolute bottom-3 left-4 font-serif text-xl text-white">
                  {config.number}
                </span>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {b.name}
                  </p>
                  <h4 className="font-serif text-xl">{config.name}</h4>
                  <p className="text-xs text-primary">
                    {['Original finish', 'Renovated finish', 'Luxury finish'][preview.level]} · Base{' '}
                    {formatMoney(config.rent)}/min
                  </p>
                </div>
                <button className={`${button} w-full`} onClick={() => onTour(config.id)}>
                  Tour suite {config.number} in 3D
                </button>
                {!s ? (
                  <button
                    className={`${button} w-full bg-primary/10`}
                    disabled={state.cash < config.price}
                    onClick={() => dispatch({ type: 'suiteBuy', id: config.id })}
                  >
                    Buy deed · {formatMoney(config.price)}
                  </button>
                ) : (
                  <>
                    <div>
                      <label htmlFor={`condition-${config.id}`} className="text-xs">
                        Condition · {Math.floor(s.condition)}%
                      </label>
                      <meter
                        id={`condition-${config.id}`}
                        min={0}
                        max={100}
                        low={30}
                        high={60}
                        optimum={100}
                        value={s.condition}
                        className="mt-1 block h-3 w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Collected {formatMoney(s.earned)} · Renovation {s.level}/2
                    </p>
                    {s.tenant ? (
                      <div
                        className="rounded border border-primary/20 bg-primary/5 p-3 text-sm"
                        role="status"
                      >
                        <strong>{TENANTS.find((t) => t.id === s.tenant)?.name}</strong>
                        <p>
                          {formatMoney(suiteRent(s))}/min · Lease {Math.ceil(s.leaseMs / 1000)}s
                          left
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {s.repairMs
                            ? `Repairs: ${Math.ceil(s.repairMs / 1000)}s · rent paused`
                            : s.condition < 30
                              ? 'Rent suspended: repair this suite.'
                              : `Next rent in ${Math.ceil(s.rentMs / 1000)}s`}
                        </p>
                      </div>
                    ) : (
                      <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm">Choose a five-minute lease</legend>
                        {TENANTS.map((t) => (
                          <button
                            key={t.id}
                            title={t.description}
                            className={`${button} w-full text-left`}
                            disabled={!!s.repairMs || s.condition < 60 || s.level < t.level}
                            onClick={() => dispatch({ type: 'suiteLease', id: s.id, tenant: t.id })}
                          >
                            <span className="block">
                              {t.name} · {formatMoney(suiteRent(s, t.id))}/min
                            </span>
                            <span className="mt-1 block text-[10px] text-muted-foreground">
                              {t.description}
                            </span>
                          </button>
                        ))}
                      </fieldset>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={button}
                        disabled={
                          !!s.tenant ||
                          !!s.repairMs ||
                          s.level >= 2 ||
                          state.cash < renovationCost(s)
                        }
                        onClick={() => dispatch({ type: 'suiteRenovate', id: s.id })}
                      >
                        {s.level === 2
                          ? 'Luxury complete'
                          : `Renovate · ${formatMoney(renovationCost(s))}`}
                      </button>
                      <button
                        className={button}
                        disabled={!!s.repairMs || s.condition >= 100 || state.cash < repairCost(s)}
                        onClick={() => dispatch({ type: 'suiteRepair', id: s.id })}
                      >
                        Repair · {formatMoney(repairCost(s))}
                      </button>
                    </div>
                    {s.tenant && !s.visited && s.condition <= 85 && (
                      <div className="rounded border border-amber-500/30 p-3 text-xs">
                        <p className="mb-2 text-amber-200">
                          Tenant request: drafty windows. Visit the suite and fit new seals for $10:
                          +15 condition, once per lease.
                        </p>
                        {currentSuiteId === s.id ? (
                          <button
                            className={button}
                            disabled={state.cash < 10 || !!s.repairMs}
                            onClick={() =>
                              dispatch({ type: 'suiteVisit', id: s.id, location: b.id })
                            }
                          >
                            Help tenant · $10
                          </button>
                        ) : (
                          <button className={button} onClick={() => onTour(s.id)}>
                            Visit tenant
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>
      {onlyOwned && !owned.length && (
        <p className="rounded-lg border border-border p-5 text-sm">
          No suites yet. Turn off Portfolio only to browse your first deed, starting at $450.
        </p>
      )}
      <section aria-label="Property journal" className="rounded-xl border border-border p-4">
        <h4 className="mb-3 font-serif text-xl">The property ledger</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {state.apartments.log.map((message, i) => (
            <li key={`${i}-${message}`}>{message}</li>
          ))}
        </ul>
      </section>
    </section>
  )
}

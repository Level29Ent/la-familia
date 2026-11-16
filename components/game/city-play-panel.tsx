'use client'

import { useGame } from './game-provider'
import { CITY_BUILDINGS } from '@/lib/game/city'
import {
  JOBS,
  GUIDE,
  guideReady,
  cityTime,
  jobOpen,
  territoryEnemy,
  territoryStrength,
  territoryOwner,
  contactFor,
  rentalCost,
} from '@/lib/game/city-play'
import { activeVehicle } from '@/lib/game/vehicles'
import { RECRUITS } from '@/lib/game/dynasty'
const button =
  'rounded-lg border border-primary/40 bg-background px-3 py-2 text-xs text-primary disabled:opacity-40'

export function GuidePanel({
  onTravel,
  compact = false,
}: {
  onTravel: (id: string) => void
  compact?: boolean
}) {
  const { state, dispatch } = useGame(),
    p = state.play,
    g = GUIDE.find((g) => !p.guide.includes(g.id))
  return (
    <section
      aria-label="First fifteen minutes"
      className="rounded-xl border border-primary/30 bg-background/95 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-primary">
          {g ? 'First Fifteen Minutes' : 'Opening chapter complete'}
        </h2>
        <button
          type="button"
          className="text-[10px] underline"
          onClick={() => dispatch({ type: 'guideToggle' })}
        >
          {p.guideHidden ? 'Show goals' : 'Hide goals'}
        </button>
      </div>
      {!p.guideHidden && (
        <>
          <p className="mt-2 text-xs text-primary">
            {g
              ? `${p.guide.length + 1}/${GUIDE.length} · ${g.title}`
              : 'You have income, a home, a crew and a foothold in the city.'}
          </p>
          {g && (
            <>
              <p className="my-2 text-xs text-muted-foreground">{g.hint}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button} onClick={() => onTravel(g.target)}>
                  Go to goal
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={!guideReady(state, g.id)}
                  onClick={() => dispatch({ type: 'guideClaim', id: g.id })}
                >
                  Claim goal · ${g.reward}
                </button>
              </div>
            </>
          )}
          {!compact && (
            <ol className="mt-3 text-xs text-muted-foreground">
              {GUIDE.map((g) => (
                <li key={g.id}>
                  {p.guide.includes(g.id) ? '✓' : '○'} {g.title} · ${g.reward}
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  )
}
export function ActivityPanel({ location, onTravel }: { location: string; onTravel?: (id: string) => void }) {
  const { state, dispatch } = useGame(),
    p = state.play,
    job = p.job,
    j = JOBS.find((j) => j.id === job?.id)
  const steps =
    j?.id === 'repair'
      ? ['Inspect engine', 'Fit replacement part', 'Test repaired engine']
      : ['Arrange set list', 'Check stage', 'Open evening show']
  return (
    <section aria-label="Local business activities" className="my-3 rounded-xl border border-primary/30 p-3">
      <h2 className="font-serif text-lg text-primary">Hands-on city work</h2>
      <p className="mb-2 text-xs text-muted-foreground">
        City time {cityTime(p).label} · Activity schedules affect side jobs only; businesses stay enterable
        and core income always works.
      </p>
      {job && j ? (
        <div className="rounded border border-border p-2">
          <strong className="text-sm text-primary">{j.title}</strong>
          <p className="my-2 text-xs">
            {j.description} {j.id === 'taxi' ? `Driven ${Math.floor(job.meters)}/30m required. ` : ''}
            {job.remainingMs
              ? `Preparation ${Math.ceil(job.remainingMs / 1000)}s`
              : `Ready at ${CITY_BUILDINGS.find((b) => b.id === j.destination)?.name}`}
          </p>
          <button
            type="button"
            className={button}
            disabled={!!job.remainingMs || location !== j.destination || (j.id === 'taxi' && job.meters < 30)}
            onClick={() => dispatch({ type: 'jobStep', location })}
          >
            {j.id === 'repair' || j.id === 'club' ? steps[job.step] : 'Complete delivery / fare / round'} · +$
            {j.reward}
          </button>
          {onTravel && (
            <button type="button" className={button} onClick={() => onTravel(j.destination)}>
              Travel to activity destination
            </button>
          )}
          <button
            type="button"
            className="ml-2 text-xs underline"
            onClick={() => dispatch({ type: 'cancelJob' })}
          >
            Cancel activity
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {JOBS.filter((j) => j.location === location).map((j) => (
            <article key={j.id}>
              <h3 className="text-sm text-primary">
                {j.title} · ${j.reward}
              </h3>
              <p className="my-1 text-xs text-muted-foreground">
                {j.description} {j.seconds}s prep · ${j.cost} materials · Hours {j.open}:00–{j.close}:00
                {j.id === 'taxi' ? ' · Select an owned Yellow Cab first.' : ''}
              </p>
              <button
                type="button"
                className={button}
                disabled={
                  !jobOpen(j.id, p) ||
                  !!p.jobCooldownMs ||
                  state.cash < j.cost ||
                  (j.id === 'taxi' && activeVehicle(state)?.id !== 'taxi')
                }
                onClick={() => dispatch({ type: 'startJob', id: j.id, location })}
              >
                {jobOpen(j.id, p) ? 'Start activity' : 'Closed for side jobs'} ·{' '}
                {p.jobCooldownMs ? `${Math.ceil(p.jobCooldownMs / 1000)}s cooldown` : j.title}
              </button>
            </article>
          ))}
          {!JOBS.some((j) => j.location === location) && (
            <p className="text-xs text-muted-foreground">
              Side jobs are available at Orchard Grocers, Yellow Cab Depot, Eastside Motor Works, Rosa
              Apartments and Blue Note Jazz Club.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
export function TerritoryPanel() {
  const { state, dispatch } = useGame()
  return (
    <section aria-label="Territory control" className="space-y-3">
      <h2 className="font-serif text-2xl text-primary">The five-district struggle</h2>
      <p className="text-sm">
        Family strength {territoryStrength(state)} · Stamina {Math.floor(state.city.stamina)}/100
      </p>
      <p className="text-xs text-muted-foreground">
        Contest costs $35, 15 stamina, +10 heat. Winning adds 25 influence. At 75+ you earn $40 per active
        minute per district. Rivals reclaim 15 influence every two active minutes; each guarding NPC prevents
        5. Truces stop reclaiming. No businesses or saves are deleted.
      </p>
      {state.play.territories.map((t) => (
        <article key={t.district} className="rounded-xl border border-border bg-card p-3">
          <h3 className="font-serif text-xl text-primary">
            {t.district} · {territoryOwner(t.control)}
          </h3>
          <p className="my-2 text-xs">
            Bellini {t.control}% · Enemy strength {territoryEnemy(state, t.district)} ·{' '}
            {territoryStrength(state) >= territoryEnemy(state, t.district) ? 'Favored to win' : 'Outmatched'}
          </p>
          <div className="mb-2 h-2 rounded bg-red-900">
            <div className="h-full rounded bg-amber-400" style={{ width: `${t.control}%` }} />
          </div>
          <button
            type="button"
            className={button}
            disabled={state.cash < 35 || state.city.stamina < 15 || t.control === 100}
            onClick={() => dispatch({ type: 'territory', district: t.district })}
          >
            Contest {t.district}
          </button>
        </article>
      ))}
    </section>
  )
}
export function ContactPanel({ id }: { id: string }) {
  const { state, dispatch } = useGame(),
    c = contactFor(state, id),
    r = RECRUITS.find((r) => r.id === id)!,
    hired = state.dynasty.members.some((m) => m.id === id)
  return (
    <section aria-label={`${r.name} conversations`} className="my-2 rounded border border-border p-2">
      <p className="text-xs text-primary">
        {['Associate', 'Made Man', 'Capo'][c.grade]} · Loyalty {c.loyalty}/100 · Member XP {c.xp}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {[
          ['respect', 'Show respect'],
          ['business', 'Ask about personal work'],
          ['threaten', 'Intimidate'],
        ].map(([choice, label]) => (
          <button
            key={choice}
            type="button"
            className={button}
            disabled={!!c.talkMs}
            onClick={() =>
              dispatch({ type: 'talk', id, choice: choice as 'respect' | 'business' | 'threaten' })
            }
          >
            {label}
          </button>
        ))}
      </div>
      <p className="my-2 text-[11px] text-muted-foreground">
        Conversations every 30 active seconds. Respect builds loyalty; threats reduce it. Finish a city
        activity for a personal task. Promotions require hiring, 60 loyalty, 50/150 member XP and $150/$600.
        Promoted members add guard and mission power.
      </p>
      {c.quest && !c.contract && (
        <button
          type="button"
          className={button}
          disabled={state.play.completed <= c.taskStart}
          onClick={() => dispatch({ type: 'contactQuest', id })}
        >
          Complete personal task · $50
        </button>
      )}
      {hired && c.grade < 2 && (
        <button
          type="button"
          className={button}
          disabled={
            c.loyalty < 60 || c.xp < (c.grade === 0 ? 50 : 150) || state.cash < (c.grade === 0 ? 150 : 600)
          }
          onClick={() => dispatch({ type: 'promoteMember', id })}
        >
          Promote {r.name} to {c.grade === 0 ? 'Made Man' : 'Capo'}
        </button>
      )}
    </section>
  )
}
export function RentalPanel({ id }: { id: string }) {
  const { state, dispatch } = useGame(),
    owned = state.play.rents.includes(id)
  return (
    <section aria-label="Rental ownership" className="my-3 rounded border border-primary/30 p-3">
      <h3 className="text-sm text-primary">{owned ? 'Your rental property' : 'Invest in this residence'}</h3>
      <p className="my-2 text-xs text-muted-foreground">
        Owning the residence pays $25 per active minute. Furnishings and access are unchanged; it does not
        replace your family safe house.
      </p>
      <button
        type="button"
        className={button}
        disabled={owned || state.cash < rentalCost(id)}
        onClick={() => dispatch({ type: 'buyRental', id })}
      >
        {owned ? 'Rent collection active' : `Buy rental · $${rentalCost(id)}`}
      </button>
    </section>
  )
}

export function ScheduleRest() {
  const { state, dispatch } = useGame()
  return (
    <section aria-label="Wait for city schedule" className="my-2 text-xs">
      <p className="mb-2 text-muted-foreground">
        Wait changes the city clock only. It does not pay rent or resolve active missions.
      </p>
      {[6, 18].map((hour) => (
        <button
          key={hour}
          type="button"
          className={button}
          disabled={!state.dynasty.shelter}
          onClick={() => dispatch({ type: 'waitTime', hour: hour as 6 | 18 })}
        >
          Wait until {hour === 6 ? 'morning' : 'evening'}
        </button>
      ))}
    </section>
  )
}

export function ActivityDirectory({ onTravel }: { onTravel: (id: string) => void }) {
  const { state } = useGame()
  return (
    <section aria-label="City activity directory" className="my-4 space-y-3">
      <h2 className="font-serif text-xl text-primary">Work around the city · {cityTime(state.play).label}</h2>
      {JOBS.map((j) => (
        <article key={j.id} className="rounded border border-border p-3">
          <h3 className="text-sm text-primary">
            {j.title} · ${j.reward} · {jobOpen(j.id, state.play) ? 'Open' : 'Closed'}
          </h3>
          <p className="my-2 text-xs text-muted-foreground">
            {j.description} Book at {CITY_BUILDINGS.find((b) => b.id === j.location)?.name}. Core business
            income and entry never close.
          </p>
          <button type="button" className={button} onClick={() => onTravel(j.location)}>
            Go to {j.title}
          </button>
          {state.play.job?.id === j.id && (
            <button type="button" className={button} onClick={() => onTravel(j.destination)}>
              Go to current destination
            </button>
          )}
        </article>
      ))}
    </section>
  )
}

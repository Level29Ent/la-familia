'use client'

import { CHALLENGES } from '@/lib/game/challenges'
import { CITY_BUILDINGS } from '@/lib/game/city'
import { useGame } from './game-provider'

const button =
  'rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed'
export function ChallengesPanel({
  location,
  onTravel,
}: {
  location?: string
  onTravel: (id: string) => void
}) {
  const { state, dispatch } = useGame()
  const c = state.challenges,
    run = c.run,
    current = CHALLENGES.find((c) => c.id === run?.id)
  const target =
    current && run ? CITY_BUILDINGS.find((b) => b.id === current.stops[run.checkpoint]) : null
  return (
    <section className="space-y-5 md:col-span-2" aria-labelledby="challenges-title">
      <header className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-background p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          City Express dispatch board
        </p>
        <h3 id="challenges-title" className="mt-2 font-serif text-3xl">
          Make your name
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Replayable routes. Real movement. Beat your best time.
        </p>
        <p className="mt-3 text-sm text-primary">
          {c.completed} routes completed · No entry fees or failure fines
        </p>
      </header>
      <p className="text-sm text-muted-foreground">
        Choose a route, enter each destination and confirm the checkpoint. Walk or drive the
        required distance between stops; atlas travel does not count. Timers run while menus are
        open, pause in custody, and do not advance offline. Gold: finish within 40% of the limit
        (+50% reward). Silver: within 70% (+25%). Bronze: finish before time expires. Each win gives
        35 family XP.
      </p>
      {run && current && target && (
        <article
          className="rounded-xl border border-primary/50 bg-card p-5"
          aria-label="Active route challenge"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary">Active dispatch</p>
              <h4 className="font-serif text-2xl">{current.title}</h4>
            </div>
            <p
              role="timer"
              aria-label="Challenge time remaining"
              className="font-mono text-2xl text-primary"
            >
              {Math.ceil(run.remainingMs / 1000)}s
            </p>
          </div>
          <progress
            aria-label="Route checkpoints"
            className="my-4 h-2 w-full accent-[var(--primary)]"
            max={current.stops.length}
            value={run.checkpoint}
          />
          <p className="text-sm">
            Stop {run.checkpoint + 1}/{current.stops.length}: <strong>{target.name}</strong>
          </p>
          <p className="my-3 text-sm text-muted-foreground">
            {run.checkpoint
              ? `Travelled ${Math.floor(run.meters)}/${current.meters}m on this leg`
              : 'Enter the starting shop to pick up the order.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {location === target.id ? (
              <button
                className={button}
                disabled={run.checkpoint > 0 && run.meters < current.meters}
                onClick={() =>
                  dispatch({
                    type: 'challengeCheck',
                    id: current.id,
                    checkpoint: run.checkpoint,
                    location,
                  })
                }
              >
                {run.checkpoint === current.stops.length - 1
                  ? 'Complete dispatch'
                  : 'Confirm checkpoint'}
              </button>
            ) : (
              <button className={button} onClick={() => onTravel(target.id)}>
                Travel to {target.name}
              </button>
            )}
            <button
              className="px-2 text-xs underline"
              onClick={() => dispatch({ type: 'challengeCancel' })}
            >
              Cancel route
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Travel leaves you outside. Enter, then open Challenges from the city menu or interior
            activities. Walk the required meters before confirming the next stop.
          </p>
        </article>
      )}
      <div className="grid gap-4 lg:grid-cols-3">
        {CHALLENGES.map((config) => {
          const record = c.records.find((r) => r.id === config.id)
          return (
            <article key={config.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-primary">
                {config.stops.length} stops · {config.seconds}s limit
              </p>
              <h4 className="mt-2 font-serif text-xl">{config.title}</h4>
              <p className="my-3 text-sm text-muted-foreground">{config.description}</p>
              <p className="text-sm text-primary">
                ${config.reward} base · Gold ${config.reward + Math.floor(config.reward / 2)}
              </p>
              <p className="my-3 text-xs text-muted-foreground">
                {record
                  ? `${record.wins} wins · Best ${Math.ceil(record.bestMs / 1000)}s`
                  : 'No record yet. Your first run starts a legacy.'}
              </p>
              <button
                className={button}
                disabled={!!run || !!c.cooldownMs}
                onClick={() => dispatch({ type: 'challengeStart', id: config.id })}
              >
                {c.cooldownMs
                  ? `Dispatch reopens in ${Math.ceil(c.cooldownMs / 1000)}s`
                  : run
                    ? 'Finish the active route first'
                    : 'Start free challenge'}
              </button>
            </article>
          )
        })}
      </div>
      <section className="rounded-xl border border-border p-4" aria-label="Dispatch journal">
        <h4 className="mb-3 font-serif text-xl">Dispatch journal</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {c.log.map((text, i) => (
            <li key={`${i}-${text}`}>{text}</li>
          ))}
        </ul>
      </section>
    </section>
  )
}

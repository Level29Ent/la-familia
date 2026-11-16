'use client'

import { useState } from 'react'
import { HARBOR_MISSIONS, harborReady } from '@/lib/game/harbor'
import { CITY_BUILDINGS } from '@/lib/game/city'
import { DISTRICTS } from '@/lib/game/city-play'
import { RECRUITS } from '@/lib/game/dynasty'
import { useGame } from './game-provider'

const button =
  'rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed'
export function HarborPanel({
  location,
  onTravel,
}: {
  location?: string
  onTravel: (id: string) => void
}) {
  const { state, dispatch } = useGame()
  const h = state.harbor,
    mission = HARBOR_MISSIONS[h.chapter]
  const target = mission && CITY_BUILDINGS.find((b) => b.id === mission.locations[h.step])
  const [councilMember, setCouncilMember] = useState('')
  const capos = state.dynasty.members.filter(
    (m) =>
      !m.recoveryMs &&
      !state.dynasty.missions.some((job) => job.memberId === m.id) &&
      state.play.contacts.some((c) => c.id === m.id && c.grade >= 2) &&
      !h.council.includes(m.id),
  )
  const atTarget = !!target && location === target.id
  const canFinish =
    !(h.chapter === 2 && h.step === 1 && !harborReady(state)) &&
    !(
      h.chapter === 1 &&
      (!h.support ||
        !state.dynasty.members.some((m) => m.id === h.support && !m.recoveryMs) ||
        state.dynasty.missions.some((m) => m.memberId === h.support))
    )
  const step = (choice?: string) =>
    target &&
    dispatch({
      type: 'harborStep',
      chapter: h.chapter,
      step: h.step,
      location: location ?? '',
      choice,
    })
  return (
    <section className="flex flex-col gap-6 md:col-span-2" aria-labelledby="harbor-title">
      <header className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/15 to-background p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          A Bellini family story · {Math.min(5, h.chapter + 1)} / 5
        </p>
        <h3 id="harbor-title" className="mt-2 font-serif text-3xl">
          Trouble at the Harbor
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Not another waiting timer. Visit the city, work with your crew, and decide who gets a
          future on the waterfront.
        </p>
        <progress
          className="mt-4 h-2 w-full accent-[var(--primary)]"
          aria-label="Harbor story completion"
          max={10}
          value={h.chapter * 2 + h.step}
        />
      </header>
      {mission && target ? (
        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-primary">
            Chapter {h.chapter + 1} · ${mission.reward} completion reward
          </p>
          <h4 className="mt-2 font-serif text-2xl">{mission.title}</h4>
          <p className="my-3 text-sm leading-relaxed text-muted-foreground">{mission.briefing}</p>
          <ol className="mb-4 space-y-2 text-sm">
            {mission.steps.map((text, i) => (
              <li
                key={text}
                className={
                  i < h.step
                    ? 'text-muted-foreground line-through'
                    : i === h.step
                      ? 'text-primary'
                      : 'text-muted-foreground'
                }
              >
                {i < h.step ? '✓' : `${i + 1}.`} {text}
              </li>
            ))}
          </ol>
          {h.chapter === 1 && (
            <div className="my-4">
              <label htmlFor="harbor-support" className="mb-2 block text-sm">
                Crew support (existing duties continue)
              </label>
              <select
                id="harbor-support"
                value={h.support ?? ''}
                disabled={h.step !== 0}
                onChange={(e) => dispatch({ type: 'harborSupport', id: e.target.value })}
                className="w-full rounded border border-border bg-background p-3"
              >
                <option value="">Select a hired, available associate</option>
                {state.dynasty.members
                  .filter(
                    (m) =>
                      !m.recoveryMs && !state.dynasty.missions.some((job) => job.memberId === m.id),
                  )
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {RECRUITS.find((r) => r.id === m.id)?.name}
                    </option>
                  ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Collector: +$75 · Guard: −15 heat · Hitman: +75 family XP. Hire Joey for $60 in
                Family & law. Support must remain available at both stops.
              </p>
            </div>
          )}
          {h.chapter === 2 && h.step === 1 && (
            <p role="status" className="my-3 text-sm text-primary">
              On foot {Math.floor(h.walked)}/90m · Driving {Math.floor(h.driven)}/60m · Either route
              completes the travel requirement.
            </p>
          )}
          <p className="mb-3 text-sm">
            {atTarget
              ? `Inside ${target.name}`
              : `Next stop: enter ${target.name} · ${target.district}`}
          </p>
          {!atTarget ? (
            <button className={button} onClick={() => onTravel(target.id)}>
              Travel to {target.name}
            </button>
          ) : h.chapter === 3 && h.step === 0 ? (
            <div className="flex flex-wrap gap-3">
              <button className={button} onClick={() => step('community')}>
                Back the workers · +15 contact loyalty
              </button>
              <button className={button} onClick={() => step('pressure')}>
                Demand a cut · +$200, −10 loyalty, +15 heat
              </button>
            </div>
          ) : h.chapter === 4 && h.step === 0 ? (
            <div className="flex flex-wrap gap-3">
              <button className={button} onClick={() => step('alliance')}>
                Sign alliance · permanent Doyle peace
              </button>
              <button className={button} onClick={() => step('takeover')}>
                Take the harbor · 100 control, +20 heat at finale
              </button>
            </div>
          ) : (
            <button className={button} disabled={!canFinish} onClick={() => step()}>
              {mission.steps[h.step]}
            </button>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Travel places you outside. Enter the building, then reopen Harbor story to interact.
            Choices and progress save automatically on this browser.
          </p>
        </article>
      ) : (
        <article className="rounded-xl border border-primary/40 p-5" role="status">
          <h4 className="font-serif text-2xl">
            {h.ending === 'alliance' ? 'A harbor shared' : 'The Bellini waterfront'}
          </h4>
          <p className="mt-3 text-sm">
            {h.ending === 'alliance'
              ? 'Doyle will no longer raid your family or reclaim Harbor Quarter. Challenges, hits and territory attacks against your ally are disabled for this empire.'
              : 'You claimed Harbor Quarter. Doyle will rebuild influence and can retaliate: assign guards to defend your new territory.'}
          </p>
          <p className="mt-2 text-sm text-primary">
            {h.workers === 'community'
              ? 'The dock workers remember that you stood beside them.'
              : 'The dock workers remember your demands.'}
          </p>
        </article>
      )}
      <section className="rounded-xl border border-border p-5" aria-labelledby="council-title">
        <h4 id="council-title" className="font-serif text-xl">
          The family council
        </h4>
        <p className="my-3 text-sm text-muted-foreground">
          Promote a hired contact to Capo in Family & law. Each available capo can sponsor one $300
          neighborhood investment: +25 district influence and 5 less influence lost per rival
          takeback. Market stalls and family banners appear in that neighborhood. Once per district,
          per empire.
        </p>
        <label htmlFor="council-member" className="block text-sm">
          Sponsoring capo
        </label>
        <select
          id="council-member"
          value={councilMember}
          onChange={(e) => setCouncilMember(e.target.value)}
          className="my-3 w-full rounded border border-border bg-card p-3"
        >
          <option value="">Select an available capo</option>
          {capos.map((m) => (
            <option key={m.id} value={m.id}>
              {RECRUITS.find((r) => r.id === m.id)?.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {DISTRICTS.map((d) => (
            <button
              className={button}
              key={d}
              disabled={
                h.investments.includes(d) ||
                state.cash < 300 ||
                !capos.some((c) => c.id === councilMember)
              }
              onClick={() => dispatch({ type: 'harborInvest', district: d, member: councilMember })}
            >
              {h.investments.includes(d) ? '✓ ' : '$300 · '}
              {d}
            </button>
          ))}
        </div>
      </section>
      <section aria-label="Harbor journal">
        <h4 className="mb-2 font-serif text-xl">The waterfront journal</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {h.log.map((entry, i) => (
            <li key={`${i}-${entry}`}>{entry}</li>
          ))}
        </ul>
      </section>
    </section>
  )
}

'use client'

import { useState } from 'react'
import {
  RANKS,
  ESTATES,
  RECRUITS,
  rankIndex,
  rankScore,
  defense,
  missionPower,
  missionEnemy,
} from '@/lib/game/dynasty'
import { FAMILIES } from '@/lib/game/city'
import { formatMoney } from '@/lib/game/format'
import { ContactPanel } from './city-play-panel'
import { useGame } from './game-provider'
const button = 'rounded-lg border border-primary/40 px-3 py-2 text-xs text-primary disabled:opacity-40'

export function EstatePanel() {
  const { state, dispatch } = useGame(),
    d = state.dynasty
  const next = ESTATES[d.estate + 1]
  return (
    <section
      aria-label="Residence progression"
      className="mb-4 rounded-xl border border-primary/30 bg-background/95 p-3"
    >
      <h2 className="font-serif text-xl text-primary">{ESTATES[d.estate]?.name ?? 'No safe house owned'}</h2>
      <p className="my-2 text-xs text-muted-foreground">
        Wallet {formatMoney(state.cash)} · Home security {ESTATES[d.estate]?.security ?? 0}. Each purchase
        changes the exterior, interior materials and furnishings. Vault and decor unlock with your first home.
      </p>
      <ol className="mb-3 flex flex-wrap gap-2">
        {ESTATES.map((e, i) => (
          <li
            key={e.name}
            className={`rounded border p-2 text-[11px] ${i <= d.estate ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
          >
            {i <= d.estate ? '✓ ' : ''}
            {e.name} · {formatMoney(e.cost)}
          </li>
        ))}
      </ol>
      {next ? (
        <button
          type="button"
          className={button}
          disabled={state.cash < next.cost || !!d.jailMs}
          onClick={() => dispatch({ type: 'estateUpgrade' })}
        >
          {d.estate < 0 ? 'Buy' : 'Upgrade to'} {next.name} · {formatMoney(next.cost)}
        </button>
      ) : (
        <p className="text-sm text-primary">Estate complete · The family has arrived.</p>
      )}
    </section>
  )
}

export function DynastyPanel({ selectedNpc }: { selectedNpc?: string | null }) {
  const { state, dispatch } = useGame(),
    d = state.dynasty
  const [family, setFamily] = useState('moretti')
  const rank = rankIndex(state),
    next = RANKS[rank + 1]
  return (
    <section
      aria-label="Family hierarchy and operations"
      className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/30 bg-card p-3"
    >
      <h2 className="font-serif text-2xl" style={{ color: RANKS[rank].color }}>
        {RANKS[rank].name}
      </h2>
      <p className="text-xs text-muted-foreground">
        {rankScore(state)} rank XP · {next ? `${next.xp} required for ${next.name}` : 'Highest family rank'} ·
        XP comes from earnings, hiring, home upgrades and missions.
      </p>
      <div className="flex flex-wrap gap-1">
        {RANKS.map((r, i) => (
          <span
            key={r.name}
            className={`rounded border px-2 py-1 text-[10px] ${i <= rank ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
          >
            {r.name}
          </span>
        ))}
      </div>
      <EstatePanel />
      {d.disruptionMs > 0 && (
        <p role="status" className="text-sm text-red-300">
          Rival disruption: business income −20% · {Math.ceil(d.disruptionMs / 1000)}s remaining
        </p>
      )}
      <section aria-label="Law and heat" className="rounded border border-border p-3">
        <h3 className="text-sm text-primary">
          Police heat {Math.ceil(d.heat)}/100 · Defense {defense(state)}
        </h3>
        <div className="my-2 h-2 rounded bg-muted">
          <div className="h-full rounded bg-red-500" style={{ width: `${d.heat}%` }} />
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Collecting adds 2 heat; confrontations add 20; hits add 30. At 60+ heat, police arrest you after 30
          exposed seconds. Hiding inside reduces heat faster. Arrest: up to $150 fine and 30 seconds in
          custody; vault protected. Hostile families retaliate every 90 active seconds unless under truce.
        </p>
        <button
          type="button"
          className={button}
          disabled={!d.heat || state.cash < 100 || !!d.jailMs}
          onClick={() => dispatch({ type: 'payLawyer' })}
        >
          Hire lawyer · $100 · −45 heat
        </button>
      </section>
      <label className="text-sm text-primary">
        Mission target
        <select
          aria-label="Hit mission target"
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="mt-1 w-full rounded border border-border bg-background p-2"
        >
          {FAMILIES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} · opposing power {missionEnemy(state, f.id)}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">
        Meet named NPCs on the sidewalks or hire from this directory. Collectors earn every 30 active seconds;
        guards stop retaliation; hitmen excel at missions. Hits cost $40, take 30 seconds, require Made Man
        rank, and provoke retaliation. Disclosed power determines success; failure causes recovery, not
        permanent death.
      </p>
      {RECRUITS.map((r) => {
        const m = d.members.find((m) => m.id === r.id),
          mission = d.missions.find((o) => o.memberId === r.id),
          busy = !!mission || !!m?.recoveryMs
        return (
          <article
            key={r.id}
            id={`recruit-${r.id}`}
            className={`rounded-lg border p-3 ${selectedNpc === r.id ? 'border-primary bg-primary/10' : 'border-border'}`}
          >
            <h3 className="font-serif text-lg text-primary">
              {r.name}
              {m ? ' · Family member' : ''}
            </h3>
            <p className="my-1 text-xs text-muted-foreground">
              {r.role} · power {r.power} · collector payout ${r.wage || 5}/30s · sidewalk ({r.position[0]},{' '}
              {r.position[2]})
            </p>
            <ContactPanel id={r.id}/>
            {!m ? (
              <button
                type="button"
                className={button}
                disabled={state.cash < r.cost || !!d.jailMs}
                onClick={() => dispatch({ type: 'meetHire', id: r.id })}
              >
                Hire {r.name} · {formatMoney(r.cost)}
              </button>
            ) : (
              <>
                <label className="text-xs">
                  Assignment
                  <select
                    aria-label={`${r.name} assignment`}
                    value={m.duty}
                    disabled={busy || !!d.jailMs}
                    onChange={(e) =>
                      dispatch({
                        type: 'duty',
                        id: r.id,
                        duty: e.target.value as 'idle' | 'guard' | 'collect',
                      })
                    }
                    className="mx-2 rounded border border-border bg-background p-2"
                  >
                    <option value="idle">Stand by</option>
                    <option value="collect">Collect income</option>
                    <option value="guard">Guard family</option>
                  </select>
                </label>
                <p className="my-2 text-xs text-muted-foreground">
                  {mission
                    ? `On hit against ${mission.familyId} · ${Math.ceil(mission.remainingMs / 1000)}s remaining`
                    : m.recoveryMs
                      ? `Recovering ${Math.ceil(m.recoveryMs / 1000)}s`
                      : `Mission power ${missionPower(state, r.id)} vs ${missionEnemy(state, family)} · ${missionPower(state, r.id) >= missionEnemy(state, family) ? 'Favored to win' : 'Outmatched'}`}
                </p>
                <button
                  type="button"
                  className={button}
                  disabled={
                    busy ||
                    rank < 1 ||
                    state.cash < 40 ||
                    d.heat >= 80 ||
                    !!d.jailMs ||
                    state.city.families[family].truceMs > 0 ||
                    state.city.families[family].influence === 0
                  }
                  onClick={() => dispatch({ type: 'sendHit', id: r.id, family })}
                >
                  Send {r.name} on hit · $40
                </button>
              </>
            )}
          </article>
        )
      })}
      <section aria-label="Family event journal">
        <h3 className="text-sm text-primary">
          City journal · {d.hits} successful hits · {d.raids} rival attacks
        </h3>
        <ol className="mt-2 flex flex-col gap-2 text-xs text-muted-foreground">
          {d.log.map((s, i) => (
            <li key={`${i}-${s}`}>{s}</li>
          ))}
        </ol>
      </section>
    </section>
  )
}

export function CustodyNotice() {
  const { state, dispatch } = useGame(),
    d = state.dynasty
  if (!d.jailMs) return null
  return (
    <section
      role="alertdialog"
      aria-modal="true"
      aria-label="Police custody"
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="max-w-md rounded-xl border border-red-400 bg-background p-6">
        <h2 className="font-serif text-2xl text-primary">Police custody</h2>
        <p className="my-3 text-sm">
          {Math.ceil(d.jailMs / 1000)} seconds remaining. Work, driving and new orders are suspended. Your
          vault savings are safe.
        </p>
        <button
          type="button"
          className={button}
          disabled={state.cash < 200}
          onClick={() => dispatch({ type: 'bail' })}
        >
          Pay bail · $200
        </button>
        <p className="mt-3 text-xs text-muted-foreground">Or wait for release at no additional cost.</p>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { Briefcase, Crown, Sparkles, TrendingUp, Users, X, type LucideIcon } from 'lucide-react'
import { BUSINESSES, OBJECTIVES, UPGRADES } from '@/lib/game/config'
import { claimableRespect, objectiveProgress, type GameState } from '@/lib/game/engine'
import { cn } from '@/lib/utils'
import { EmpirePanel } from './empire-panel'
import { CaposPanel } from './capos-panel'
import { FamilyPanel } from './family-panel'
import { useGame } from './game-provider'
import { RacketsPanel } from './rackets-panel'
import { UpgradesPanel } from './upgrades-panel'

type Tab = 'rackets' | 'capos' | 'upgrades' | 'family' | 'empire'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'empire', label: 'Empire', icon: Sparkles },
  { id: 'rackets', label: 'Rackets', icon: Briefcase },
  { id: 'capos', label: 'Capos', icon: Users },
  { id: 'upgrades', label: 'Upgrades', icon: TrendingUp },
  { id: 'family', label: 'The Family', icon: Crown },
]

export function ledgerBadges(state: GameState): Record<Tab, number> {
  return {
    empire: OBJECTIVES.filter(
      (o) => !state.objectives.includes(o.id) && objectiveProgress(state, o.metric) >= o.goal,
    ).length,
    rackets: 0,
    capos: BUSINESSES.filter(
      (b) =>
        !state.businesses[b.id].managed && state.businesses[b.id].owned > 0 && state.cash >= b.managerCost,
    ).length,
    upgrades: UPGRADES.filter((u) => !state.upgrades.includes(u.id) && state.cash >= u.cost).length,
    family: claimableRespect(state) > 0 ? 1 : 0,
  }
}

export function LedgerOverlay({ onClose }: { onClose: () => void }) {
  const { state } = useGame()
  const [tab, setTab] = useState<Tab>('empire')
  const badges = ledgerBadges(state)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ledger-title"
      className="absolute inset-0 z-30 overflow-y-auto bg-background/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <h1 id="ledger-title" className="font-serif text-3xl font-bold text-foreground">
            The Ledger
          </h1>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-card"
          >
            <X className="size-4" aria-hidden="true" />
            Back to the street
            <kbd className="rounded border border-border px-1.5 font-sans text-xs text-muted-foreground">
              M
            </kbd>
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <nav aria-label="Ledger sections" className="lg:w-52 lg:shrink-0">
            <ul className="flex gap-2 overflow-x-auto lg:flex-col">
              {TABS.map(({ id, label, icon: Icon }) => (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setTab(id)}
                    aria-current={tab === id ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
                      tab === id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-card hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{label}</span>
                    {badges[id] > 0 && (
                      <span
                        className={cn(
                          'ml-auto flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold tabular-nums',
                          tab === id
                            ? 'bg-primary-foreground text-primary'
                            : 'bg-accent text-accent-foreground',
                        )}
                      >
                        {id === 'family' ? (
                          <>
                            <span aria-hidden="true">!</span>
                            <span className="sr-only">, Respect ready to claim</span>
                          </>
                        ) : (
                          <>
                            {badges[id]}
                            <span className="sr-only"> available</span>
                          </>
                        )}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            {tab === 'empire' && <EmpirePanel />}
            {tab === 'rackets' && <RacketsPanel />}
            {tab === 'capos' && <CaposPanel />}
            {tab === 'upgrades' && <UpgradesPanel />}
            {tab === 'family' && <FamilyPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}

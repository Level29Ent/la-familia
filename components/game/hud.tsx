'use client'

import { BookOpen, UserRound, House, Crown, TrendingUp } from 'lucide-react'
import { objectiveProgress, respectMultiplier, totalIncomePerSecond, type BuyAmount } from '@/lib/game/engine'
import { formatMoney, formatNumber } from '@/lib/game/format'
import { cn } from '@/lib/utils'
import { FocusCard } from './focus-card'
import { useGame } from './game-provider'
import { MusicPlayer } from './music-player'
import { OBJECTIVES, BUSINESSES } from '@/lib/game/config'
import { TouchControls } from './touch-controls'

const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

export function Hud({
  focusedId,
  buyAmount,
  onBuyAmountChange,
  onOpenLedger,
  onOpenSafeHouse,
  onCharacter,
  alerts,
}: {
  focusedId: string | null
  buyAmount: BuyAmount
  onBuyAmountChange: (amount: BuyAmount) => void
  onOpenLedger: () => void
  onOpenSafeHouse: () => void
  onCharacter: () => void
  alerts: number
}) {
  const { state } = useGame()

  const objective = OBJECTIVES.find((o) => !state.objectives.includes(o.id))
  const properties = BUSINESSES.filter((b) => state.businesses[b.id].owned > 0).length

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-background/70 px-4 py-3 backdrop-blur-md">
          <p className="font-serif text-sm font-semibold tracking-wide text-muted-foreground">La Famiglia</p>
          <p className="font-serif text-3xl font-bold text-primary tabular-nums md:text-4xl">
            {formatMoney(state.cash)}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm tabular-nums">
            <span className="flex items-center gap-1.5 text-foreground">
              <TrendingUp className="size-4 text-primary" aria-hidden="true" />
              {formatMoney(totalIncomePerSecond(state))}
              <span className="text-muted-foreground">/sec</span>
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <Crown className="size-4 text-accent" aria-hidden="true" />
              {formatNumber(state.respect)}
              <span className="text-muted-foreground">x{formatNumber(respectMultiplier(state.respect))}</span>
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onOpenLedger}
            className="flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-semibold text-foreground backdrop-blur-md hover:bg-card"
          >
            <BookOpen className="size-4 text-primary" aria-hidden="true" />
            Ledger
            <kbd className="rounded border border-border px-1.5 font-sans text-xs text-muted-foreground">
              M
            </kbd>
            {alerts > 0 && (
              <span className="flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground tabular-nums">
                {alerts}
                <span className="sr-only"> items available</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSafeHouse}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-4 py-2 text-sm font-semibold text-primary backdrop-blur-md hover:bg-card"
          >
            <House className="size-4" aria-hidden="true" /> Safe house{' '}
            <kbd className="rounded border border-border px-1 text-xs">H</kbd>
          </button>
          <button
            type="button"
            onClick={onCharacter}
            className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-xs text-primary"
          >
            <UserRound className="size-4" /> Character · C
          </button>
          <MusicPlayer />
          <div
            role="radiogroup"
            aria-label="Buy amount"
            className="flex rounded-full border border-border bg-background/70 p-1 backdrop-blur-md"
          >
            {AMOUNTS.map((amount, i) => (
              <button
                key={amount}
                type="button"
                role="radio"
                aria-checked={buyAmount === amount}
                onClick={() => onBuyAmountChange(amount)}
                title={`Key ${i + 1}`}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors',
                  buyAmount === amount
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {amount === 'max' ? 'Max' : `x${amount}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenLedger}
        className="pointer-events-auto absolute top-56 left-4 max-w-[55%] rounded-xl border border-primary/20 bg-background/80 p-2 text-left backdrop-blur-md md:top-56 md:p-3 md:left-6"
      >
        <p className="hidden text-[10px] tracking-[0.18em] text-primary uppercase md:block">
          Little Italy · {properties}/{BUSINESSES.length} properties
        </p>
        <p className="text-xs text-foreground md:mt-1">{objective ? objective.name : 'The city is yours'}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {objective
            ? `${Math.min(objective.goal, Math.floor(objectiveProgress(state, objective.metric)))}/${objective.goal} · Open Empire →`
            : 'All objectives complete'}
        </p>
      </button>

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/80 ring-2 ring-background/60"
      />

      <div className="flex flex-col items-center gap-3">
        <div aria-live="polite" className="flex w-full justify-center">
          <FocusCard focusedId={focusedId} buyAmount={buyAmount} onOpenSafeHouse={onOpenSafeHouse} />
        </div>
        <p className="hidden text-xs text-muted-foreground md:block">
          WASD to walk · Shift to sprint · Drag to orbit · Scroll to zoom · Esc to free the mouse
        </p>
        <TouchControls />
      </div>
    </div>
  )
}

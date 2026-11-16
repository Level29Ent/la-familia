'use client'

import { Car, BookOpen, UserRound, House, Crown, TrendingUp } from 'lucide-react'
import { respectMultiplier, totalIncomePerSecond, type BuyAmount } from '@/lib/game/engine'
import { formatMoney, formatNumber } from '@/lib/game/format'
import { cn } from '@/lib/utils'
import { FocusCard } from './focus-card'
import { useGame } from './game-provider'
import { MusicPlayer } from './music-player'
import { TouchControls } from './touch-controls'
import { GUIDE } from '@/lib/game/city-play'
import { ClockBadge } from './city-feedback'
import { RANKS, rankIndex } from '@/lib/game/dynasty'
import { activeVehicle } from '@/lib/game/vehicles'
import { CitySound } from './city-sound'
import { HARBOR_MISSIONS } from '@/lib/game/harbor'
import { CITY_BUILDINGS } from '@/lib/game/city'

const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

export function Hud({
  focusedId,
  onEnterBuilding,
  onOpenMap,
  onOpenHarbor,
  onOpenGoals,
  driving,
  onDrive,
  buyAmount,
  onBuyAmountChange,
  onOpenLedger,
  onOpenSafeHouse,
  onCharacter,
  alerts,
}: {
  onEnterBuilding: (id: string) => void
  onOpenGoals: () => void
  onOpenHarbor: () => void
  onOpenMap: () => void
  focusedId: string | null
  driving: boolean
  onDrive: () => void
  buyAmount: BuyAmount
  onBuyAmountChange: (amount: BuyAmount) => void
  onOpenLedger: () => void
  onOpenSafeHouse: () => void
  onCharacter: () => void
  alerts: number
}) {
  const { state } = useGame()

  const vehicle = activeVehicle(state)
  const building = CITY_BUILDINGS.find((b) => b.id === focusedId)
  const goal = GUIDE.find((g) => !state.play.guide.includes(g.id))

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-background/70 px-4 py-3 backdrop-blur-md">
          <p className="font-serif text-sm font-semibold tracking-wide text-muted-foreground">
            La Familia · {RANKS[rankIndex(state)].name}
          </p>
          <p className="font-serif text-3xl font-bold text-primary tabular-nums md:text-4xl">
            {formatMoney(state.cash)}
          </p>
          <p className="text-[11px] text-primary">
            {RANKS[rankIndex(state)].name} · Heat {Math.ceil(state.dynasty.heat)}/100
            {state.dynasty.heat >= 60
              ? ` · Arrest in ${Math.ceil(state.dynasty.arrestMs / 1000)}s outside`
              : ''}
          </p>
          <ClockBadge />
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
          {vehicle && (
            <button
              type="button"
              onClick={onDrive}
              className="flex items-center gap-2 rounded-full border border-primary/40 bg-background/90 px-3 py-2 text-xs text-primary"
            >
              <Car className="size-4" />
              {driving ? 'Park & exit · E' : `Drive ${vehicle?.name}`}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenMap}
            className="rounded-full border border-primary/40 bg-background/90 px-4 py-2 text-sm text-primary"
          >
            City map & families · G
          </button>
          <button type="button" onClick={onOpenHarbor} className="max-w-48 rounded-xl border border-primary/40 bg-background/95 p-2 text-left text-xs text-primary">
            <span className="block uppercase tracking-wider">Harbor story · {Math.min(5, state.harbor.chapter + 1)}/5</span>
            <span className="mt-1 block text-foreground">{HARBOR_MISSIONS[state.harbor.chapter]?.steps[state.harbor.step] ?? 'Family council'}</span>
          </button>
          <MusicPlayer />
          <CitySound />
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
        aria-label="Open opening goals and settings"
        onClick={onOpenGoals}
        className="pointer-events-auto absolute top-80 left-4 max-w-[45%] rounded-xl border border-primary/20 bg-background/90 p-2 text-left md:left-6"
      >
        <p className="text-[10px] uppercase text-primary">First Fifteen Minutes</p>
        <p className="my-1 text-xs">{goal ? goal.title : 'Opening complete'}</p>
        <p className="text-[10px] text-muted-foreground">{state.play.guide.length}/5 · Goals & settings →</p>
      </button>

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/80 ring-2 ring-background/60"
      />

      <div className="flex flex-col items-center gap-3">
        <div aria-live="polite" className="flex w-full justify-center">
          {driving ? (
            <section className="pointer-events-auto w-full max-w-md rounded-xl border border-primary/30 bg-background/95 p-3 text-center">
              <h2 className="font-serif text-lg text-primary">{vehicle?.name} · Driving</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                W/S or ↑/↓ accelerate / reverse · A/D or ←/→ steer · Space brakes
              </p>
              <button
                type="button"
                onClick={onDrive}
                className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Park & exit vehicle · E
              </button>
            </section>
          ) : focusedId === 'sedan' ? (
            <button
              type="button"
              onClick={onDrive}
              className="pointer-events-auto rounded-xl border border-primary/30 bg-background/95 p-4 text-primary"
            >
              E · Enter your {vehicle?.name}
            </button>
          ) : (
            <div className="pointer-events-auto flex w-full max-w-xl flex-col gap-2">
              {building && (
                <button
                  type="button"
                  onClick={() => onEnterBuilding(building.id)}
                  className="rounded-xl border border-primary/40 bg-background/95 px-4 py-3 text-primary"
                >
                  E · Enter {building.name}
                  <span className="ml-2 text-xs text-muted-foreground">{building.district}</span>
                </button>
              )}
              {(!building || building.kind === 'business' || building.kind === 'safehouse') && (
                <FocusCard focusedId={focusedId} buyAmount={buyAmount} onOpenSafeHouse={onOpenSafeHouse} />
              )}
            </div>
          )}
        </div>
        <p className="hidden text-xs text-muted-foreground md:block">
          G city map · E enter · R collect · WASD walk · Shift sprint · Drag to orbit · Scroll to zoom · Esc
          to free the mouse
        </p>
        <TouchControls driving={driving} />
      </div>
    </div>
  )
}

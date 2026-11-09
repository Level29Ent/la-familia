'use client'

import dynamic from 'next/dynamic'
import { useEffect, useEffectEvent, useState } from 'react'
import type { BuyAmount } from '@/lib/game/engine'
import { GameProvider, useGame } from './game-provider'
import { Hud } from './hud'
import { LedgerOverlay, ledgerBadges } from './ledger-overlay'
import { OfflineDialog } from './offline-dialog'
import { StartOverlay } from './start-overlay'

const CityScene = dynamic(() => import('@/components/world/city-scene').then((m) => m.CityScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
      Loading the city...
    </div>
  ),
})

const BUY_KEYS: Record<string, BuyAmount> = { Digit1: 1, Digit2: 10, Digit3: 100, Digit4: 'max' }

function World() {
  const { state, dispatch, offlineReport } = useGame()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1)

  const badges = ledgerBadges(state)
  const alerts = badges.capos + badges.upgrades + badges.family + badges.empire
  const playing = started && !ledgerOpen && !offlineReport

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!started || offlineReport || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
    if (e.code === 'KeyM') {
      setLedgerOpen((open) => !open)
      return
    }
    if (ledgerOpen) {
      if (e.code === 'Escape') setLedgerOpen(false)
      return
    }
    if (e.code in BUY_KEYS) {
      setBuyAmount(BUY_KEYS[e.code])
      return
    }
    if (!focusedId) return
    if (e.code === 'KeyE') dispatch({ type: 'run', id: focusedId })
    else if (e.code === 'KeyF') {
      const owned = state.businesses[focusedId].owned
      dispatch({ type: 'buy', id: focusedId, amount: owned === 0 ? 1 : buyAmount })
    } else if (e.code === 'KeyQ') dispatch({ type: 'hire', id: focusedId })
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background select-none">
      <CityScene state={state} focusedId={focusedId} movementEnabled={playing} onFocusChange={setFocusedId} />
      {started && (
        <Hud
          focusedId={focusedId}
          buyAmount={buyAmount}
          onBuyAmountChange={setBuyAmount}
          onOpenLedger={() => setLedgerOpen(true)}
          alerts={alerts}
        />
      )}
      {!started && <StartOverlay onStart={() => setStarted(true)} />}
      {ledgerOpen && <LedgerOverlay onClose={() => setLedgerOpen(false)} />}
      <OfflineDialog />
    </main>
  )
}

export function GameShell() {
  return (
    <GameProvider>
      <World />
    </GameProvider>
  )
}

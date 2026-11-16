'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { BuyAmount } from '@/lib/game/engine'
import { GameProvider, useGame } from './game-provider'
import { Hud } from './hud'
import { LedgerOverlay, ledgerBadges } from './ledger-overlay'
import { OfflineDialog } from './offline-dialog'
import { CharacterCreator } from './character-creator'
import { DecorShop } from './decor-shop'
import { SafeHouseHud } from './safe-house-hud'
import { SafeHouse } from './safe-house'
import { StartOverlay } from './start-overlay'
import { SceneBoundary } from './scene-boundary'
import { CITY_BUILDINGS, CITY_NAVIGATION, outsideBuilding, type CityBuilding } from '@/lib/game/city'
import { CityMap } from './city-map'
import { InteriorHud } from './interior-hud'

const CityScene = dynamic(() => import('@/components/world/city-scene').then((m) => m.CityScene), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
      Loading the city...
    </div>
  ),
})

const SafeHouseScene = dynamic(
  () => import('@/components/world/safe-house-scene').then((m) => m.SafeHouseScene),
  {
    ssr: false,
    loading: () => (
      <p className="absolute inset-0 flex items-center justify-center">Entering your safe house...</p>
    ),
  },
)

const BuildingInterior = dynamic(
  () => import('@/components/world/building-interior').then((m) => m.BuildingInterior),
  {
    ssr: false,
    loading: () => (
      <p className="absolute inset-0 flex items-center justify-center">Entering the building...</p>
    ),
  },
)

const BUY_KEYS: Record<string, BuyAmount> = { Digit1: 1, Digit2: 10, Digit3: 100, Digit4: 'max' }

function World() {
  const { state, dispatch, offlineReport } = useGame()
  const [driving, setDriving] = useState(false)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [safeHouseOpen, setSafeHouseOpen] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [vaultVisited, setVaultVisited] = useState(false)
  const [interior, setInterior] = useState<CityBuilding | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [cityNavigation, setCityNavigation] = useState(CITY_NAVIGATION)
  const [visit, setVisit] = useState(0)
  const streetPosition = useRef({ x: CITY_NAVIGATION.start[0], z: CITY_NAVIGATION.start[2] })
  const meetFamily = useCallback(() => setMapOpen(true), [])
  const reportPosition = useCallback((p: { x: number; z: number }) => {
    streetPosition.current = p
  }, [])
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1)

  const badges = ledgerBadges(state)
  const alerts = badges.capos + badges.upgrades + badges.family + badges.empire
  const playing =
    started && !mapOpen && !ledgerOpen && !vaultOpen && !shopOpen && !creatorOpen && !offlineReport
  const enterHouse = () => {
    setDriving(false)
    setFocusedId(null)
    setLedgerOpen(false)
    setInterior(null)
    setSafeHouseOpen(true)
  }
  const exitHouse = () => {
    setFocusedId(null)
    setVaultOpen(false)
    setShopOpen(false)
    setSafeHouseOpen(false)
    setCityNavigation(outsideBuilding('safehouse'))
    setVisit((n) => n + 1)
  }
  const openVault = () => {
    setVaultVisited(true)
    setVaultOpen(true)
  }

  const enterBuilding = (id: string) => {
    const building = CITY_BUILDINGS.find((b) => b.id === id)
    if (!building) return
    if (id === 'safehouse') {
      enterHouse()
      return
    }
    setDriving(false)
    setFocusedId(null)
    setInterior(building)
  }
  const leaveBuilding = () => {
    if (interior) setCityNavigation(outsideBuilding(interior.id))
    setFocusedId(null)
    setInterior(null)
    setVisit((n) => n + 1)
  }
  const travel = (id: string) => {
    const navigation = outsideBuilding(id)
    setCityNavigation(navigation)
    streetPosition.current = { x: navigation.start[0], z: navigation.start[2] }
    setFocusedId(null)
    setDriving(false)
    setMapOpen(false)
    setVisit((n) => n + 1)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!started || offlineReport || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
    if (
      e.target instanceof HTMLElement &&
      e.target.closest('input, textarea, select, [contenteditable=true]')
    )
      return
    if (creatorOpen) return
    if (mapOpen) {
      if (e.code === 'Escape' || e.code === 'KeyG') setMapOpen(false)
      return
    }
    if (shopOpen) {
      if (e.code === 'Escape') setShopOpen(false)
      return
    }
    if (vaultOpen) {
      if (e.code === 'Escape') setVaultOpen(false)
      return
    }
    if (e.code === 'KeyC') {
      setCreatorOpen(true)
      return
    }
    if (safeHouseOpen) {
      if (e.code === 'KeyH') exitHouse()
      if (e.code === 'KeyE' && focusedId === 'vault') openVault()
      if (e.code === 'KeyE' && focusedId === 'exit') exitHouse()
      return
    }
    if (interior) {
      if (e.code === 'Escape' || (e.code === 'KeyE' && focusedId === 'exit')) leaveBuilding()
      if (interior.kind === 'business') {
        if (e.code === 'KeyR') dispatch({ type: 'run', id: interior.id })
        if (e.code === 'KeyF')
          dispatch({
            type: 'buy',
            id: interior.id,
            amount: state.businesses[interior.id].owned ? buyAmount : 1,
          })
        if (e.code === 'KeyQ') dispatch({ type: 'hire', id: interior.id })
      }
      return
    }
    if (e.code === 'KeyG' && !ledgerOpen) {
      setMapOpen(true)
      return
    }
    if (e.code === 'KeyH') {
      enterHouse()
      return
    }
    if (e.code === 'KeyM') {
      setLedgerOpen((open) => !open)
      return
    }
    if (ledgerOpen) {
      if (e.code === 'Escape') setLedgerOpen(false)
      return
    }
    if (driving) {
      if (e.code === 'KeyE') setDriving(false)
      return
    }
    if (focusedId === 'sedan') {
      if (e.code === 'KeyE' && state.assets.includes('sedan')) setDriving(true)
      return
    }
    if (e.code in BUY_KEYS) {
      setBuyAmount(BUY_KEYS[e.code])
      return
    }
    if (!focusedId) return
    if (focusedId === 'safehouse') {
      if (e.code === 'KeyE') enterHouse()
      return
    }
    if (e.code === 'KeyE') {
      enterBuilding(focusedId)
      return
    }
    if (!state.businesses[focusedId]) return
    if (e.code === 'KeyR') dispatch({ type: 'run', id: focusedId })
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

  useEffect(() => {
    if (!state.assets.includes('sedan')) setDriving(false)
  }, [state.assets])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background select-none">
      <SceneBoundary key={safeHouseOpen ? 'house' : (interior?.id ?? `city-${visit}`)}>
        {safeHouseOpen ? (
          <SafeHouseScene
            assets={state.assets}
            safeHouse={state.safeHouse}
            character={state.character}
            decor={state.safeHouse.decor}
            enabled={playing}
            vaultOpen={vaultVisited}
            onFocusChange={setFocusedId}
          />
        ) : interior ? (
          <BuildingInterior
            building={interior}
            character={state.character}
            enabled={playing}
            onFocusChange={setFocusedId}
          />
        ) : (
          <CityScene
            state={state}
            driving={driving && state.assets.includes('sedan')}
            navigationOverride={cityNavigation}
            onPositionChange={reportPosition}
            onFamilyEncounter={meetFamily}
            focusedId={focusedId}
            movementEnabled={playing}
            onFocusChange={setFocusedId}
          />
        )}
      </SceneBoundary>
      {started && !safeHouseOpen && !interior && (
        <Hud
          focusedId={focusedId}
          onEnterBuilding={enterBuilding}
          onOpenMap={() => setMapOpen(true)}
          driving={driving}
          onDrive={() => {
            if (state.assets.includes('sedan')) {
              setDriving((value) => !value)
              setFocusedId(null)
            }
          }}
          buyAmount={buyAmount}
          onBuyAmountChange={setBuyAmount}
          onOpenLedger={() => setLedgerOpen(true)}
          onOpenSafeHouse={enterHouse}
          onCharacter={() => setCreatorOpen(true)}
          alerts={alerts}
        />
      )}
      {!started && <StartOverlay onStart={() => setStarted(true)} onCharacter={() => setCreatorOpen(true)} />}
      {interior && (
        <InteriorHud building={interior} focusedId={focusedId} buyAmount={buyAmount} onExit={leaveBuilding} />
      )}
      {mapOpen && (
        <CityMap position={streetPosition.current} onTravel={travel} onClose={() => setMapOpen(false)} />
      )}
      {ledgerOpen && <LedgerOverlay onClose={() => setLedgerOpen(false)} />}
      {safeHouseOpen && (
        <SafeHouseHud
          focusedId={focusedId}
          onCharacter={() => setCreatorOpen(true)}
          onVault={openVault}
          onShop={() => setShopOpen(true)}
          onExit={exitHouse}
        />
      )}
      {vaultOpen && <SafeHouse onClose={() => setVaultOpen(false)} />}
      {shopOpen && <DecorShop onClose={() => setShopOpen(false)} />}
      {creatorOpen && <CharacterCreator onClose={() => setCreatorOpen(false)} />}
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

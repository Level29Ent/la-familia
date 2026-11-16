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
import { activeVehicle } from '@/lib/game/vehicles'
import type { MapPosition } from '@/lib/game/map'
import { GuidePanel } from './city-play-panel'
import { CityFeedback } from './city-feedback'
import { MiniMap } from './street-map'
import { CustodyNotice } from './dynasty-panel'
import { SUITES } from '@/lib/game/apartments'
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
  const [transitioning, setTransitioning] = useState(false)
  const [driving, setDriving] = useState(false)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [safeHouseOpen, setSafeHouseOpen] = useState(false)
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [vaultOpen, setVaultOpen] = useState(false)
  const [vaultVisited, setVaultVisited] = useState(false)
  const [activeSuite, setActiveSuite] = useState<string | null>(null)
  const [interior, setInterior] = useState<CityBuilding | null>(null)
  const [menuSection, setMenuSection] = useState('map')
  const [destination, setDestination] = useState<string | null>(null)
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [cityNavigation, setCityNavigation] = useState(CITY_NAVIGATION)
  const [visit, setVisit] = useState(0)
  const streetPosition = useRef<MapPosition>({
    x: CITY_NAVIGATION.start[0],
    z: CITY_NAVIGATION.start[2],
    yaw: 0,
  })
  const meetFamily = useCallback(() => {
    setMenuSection('map')
    setSelectedNpc(null)
    setDriving(false)
    setMapOpen(true)
  }, [])
  const meetNpc = useCallback((id: string) => {
    setSelectedNpc(id)
    setDriving(false)
    setMapOpen(true)
  }, [])
  const drivingNow = useRef(false)
  drivingNow.current = driving
  const lastDrive = useRef<{ x: number; z: number } | null>(null)
  const lastHarborPosition = useRef<MapPosition | null>(null)
  const reportPosition = useCallback((p: MapPosition) => {
    if (drivingNow.current && lastDrive.current) {
      const meters = Math.hypot(p.x - lastDrive.current.x, p.z - lastDrive.current.z)
      if (meters > 0 && meters <= 8) dispatch({ type: 'driveMeters', meters })
    }
    lastDrive.current = drivingNow.current ? { x: p.x, z: p.z } : null
    if (lastHarborPosition.current) {
      const meters = Math.hypot(p.x - lastHarborPosition.current.x, p.z - lastHarborPosition.current.z)
      if (meters > 0 && meters <= 8) dispatch({ type: 'harborMove', meters, driving: drivingNow.current })
    }
    lastHarborPosition.current = p
    streetPosition.current = p
  }, [])
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1)

  useEffect(() => {
    lastHarborPosition.current = null
    lastDrive.current = null
    setTransitioning(true)
    const id = setTimeout(() => setTransitioning(false), 300)
    return () => clearTimeout(id)
  }, [driving])
  const vehicle = activeVehicle(state)
  const badges = ledgerBadges(state)
  const alerts = badges.capos + badges.upgrades + badges.family + badges.empire
  const playing =
    started &&
    !state.dynasty.jailMs &&
    !mapOpen &&
    !ledgerOpen &&
    !vaultOpen &&
    !shopOpen &&
    !creatorOpen &&
    !offlineReport
  const enterHouse = () => {
    setActiveSuite(null)
    lastHarborPosition.current = null
    const nav = outsideBuilding('safehouse')
    streetPosition.current = { x: nav.start[0], z: nav.start[2], yaw: nav.yaw }
    setDriving(false)
    setFocusedId(null)
    setLedgerOpen(false)
    setInterior(null)
    setSafeHouseOpen(true)
  }
  const exitHouse = () => {
    lastHarborPosition.current = null
    setFocusedId(null)
    setVaultOpen(false)
    setShopOpen(false)
    setSafeHouseOpen(false)
    const nav = outsideBuilding('safehouse')
    streetPosition.current = { x: nav.start[0], z: nav.start[2], yaw: nav.yaw }
    setCityNavigation(nav)
    setVisit((n) => n + 1)
  }
  const openVault = () => {
    if (state.dynasty.estate < 0) return
    setVaultVisited(true)
    setVaultOpen(true)
  }

  const enterBuilding = (id: string) => {
    lastHarborPosition.current = null
    setActiveSuite(null)
    const building = CITY_BUILDINGS.find((b) => b.id === id)
    if (!building) return
    if (id === 'safehouse') {
      enterHouse()
      return
    }
    setDriving(false)
    setFocusedId(null)
    streetPosition.current = { x: building.door[0], z: building.door[1], yaw: building.rotationY }
    setInterior(building)
  }
  const leaveBuilding = () => {
    setActiveSuite(null)
    lastHarborPosition.current = null
    if (interior) {
      const nav = outsideBuilding(interior.id)
      streetPosition.current = { x: nav.start[0], z: nav.start[2], yaw: nav.yaw }
      setCityNavigation(nav)
    }
    setFocusedId(null)
    setInterior(null)
    setVisit((n) => n + 1)
  }
  const tourSuite = (id: string) => {
    const suite = SUITES.find(s => s.id === id)
    if (!suite) return
    setSafeHouseOpen(false)
    setMapOpen(false)
    enterBuilding(suite.buildingId)
    setActiveSuite(id)
  }
  const travel = (id: string) => {
    setActiveSuite(null)
    lastHarborPosition.current = null
    lastDrive.current = null
    setSafeHouseOpen(false)
    setInterior(null)
    setVaultOpen(false)
    setShopOpen(false)
    const navigation = outsideBuilding(id)
    setCityNavigation(navigation)
    streetPosition.current = { x: navigation.start[0], z: navigation.start[2], yaw: navigation.yaw }
    setFocusedId(null)
    setDriving(false)
    setMapOpen(false)
    setVisit((n) => n + 1)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (!started || state.dynasty.jailMs || offlineReport || e.repeat || e.metaKey || e.ctrlKey || e.altKey)
      return
    if (
      e.target instanceof HTMLElement &&
      e.target.closest('input, textarea, select, [contenteditable=true]')
    )
      return
    if (creatorOpen) return
    if (mapOpen) {
      if (e.code === 'Escape' || e.code === 'KeyG') {
        e.preventDefault()
        setMapOpen(false)
      }
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
    if ((e.code === 'KeyG' || e.code === 'Tab') && !ledgerOpen) {
      e.preventDefault()
      setMenuSection('map')
      setSelectedNpc(null)
      setDriving(false)
      setMapOpen(true)
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
      if (e.code === 'KeyE' && !!vehicle) setDriving(true)
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
    if (!state.dynasty.jailMs) return
    setMapOpen(false)
    setVaultOpen(false)
    setShopOpen(false)
    setCreatorOpen(false)
    setLedgerOpen(false)
    setDriving(false)
  }, [!!state.dynasty.jailMs])

  useEffect(() => {
    dispatch({ type: 'shelter', inside: safeHouseOpen || !!interior })
  }, [safeHouseOpen, interior?.id])

  useEffect(() => {
    if (!vehicle) setDriving(false)
  }, [vehicle?.id])

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background select-none">
      <SceneBoundary key={safeHouseOpen ? 'house' : (interior?.id ?? `city-${visit}`)}>
        {safeHouseOpen && state.dynasty.estate < 0 ? (
          <BuildingInterior
            building={CITY_BUILDINGS.find((b) => b.id === 'safehouse')!}
            character={state.character}
            enabled={playing}
            onFocusChange={setFocusedId}
          />
        ) : safeHouseOpen ? (
          <SafeHouseScene
            assets={state.assets}
            estateTier={state.dynasty.estate}
            safeHouse={state.safeHouse}
            character={state.character}
            decor={state.safeHouse.decor}
            enabled={playing}
            vaultOpen={vaultVisited}
            onFocusChange={setFocusedId}
          />
        ) : interior ? (
          <BuildingInterior
            suiteId={activeSuite ?? undefined}
            suite={state.apartments.suites.find(s => s.id === activeSuite)}
            building={interior}
            character={state.character}
            enabled={playing}
            onFocusChange={setFocusedId}
          />
        ) : (
          <CityScene
            state={state}
            driving={driving && !!vehicle}
            navigationOverride={cityNavigation}
            onPositionChange={reportPosition}
            onNpcEncounter={meetNpc}
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
          onOpenHarbor={() => { setMenuSection('harbor'); setSelectedNpc(null); setDriving(false); setMapOpen(true) }}
          onOpenMap={() => {
            setMenuSection('map')
            setSelectedNpc(null)
            setDriving(false)
            setMapOpen(true)
          }}
          driving={driving}
          onDrive={() => {
            if (!!vehicle) {
              setDriving((value) => !value)
              setFocusedId(null)
            }
          }}
          buyAmount={buyAmount}
          onBuyAmountChange={setBuyAmount}
          onOpenGoals={() => {
            setMenuSection('guide')
            setSelectedNpc(null)
            setDriving(false)
            setMapOpen(true)
          }}
          onOpenLedger={() => setLedgerOpen(true)}
          onOpenSafeHouse={enterHouse}
          onCharacter={() => setCreatorOpen(true)}
          alerts={alerts}
        />
      )}
      {started && !safeHouseOpen && !interior && (
        <MiniMap
          position={streetPosition.current}
          destination={destination}
          onOpen={() => {
            setMenuSection('map')
            setSelectedNpc(null)
            setDriving(false)
            setMapOpen(true)
          }}
        />
      )}
      {started && !safeHouseOpen && !interior && (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-10 hidden max-w-[250px] lg:block">
          <GuidePanel onTravel={travel} compact />
        </div>
      )}
      {started && <CityFeedback />}
      {started && transitioning && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 animate-pulse bg-black/20"
        />
      )}
      {!started && <StartOverlay onStart={() => setStarted(true)} onCharacter={() => setCreatorOpen(true)} />}
      {interior && (
        <InteriorHud
          onOpenHarbor={() => { setMenuSection('harbor'); setSelectedNpc(null); setMapOpen(true) }}
          currentSuiteId={activeSuite}
          onApartments={() => { setMenuSection('apartments'); setSelectedNpc(null); setMapOpen(true) }}
          building={interior}
          focusedId={focusedId}
          buyAmount={buyAmount}
          onTravel={travel}
          onMap={() => {
            setMenuSection('map')
            setSelectedNpc(null)
            setMapOpen(true)
          }}
          onExit={leaveBuilding}
        />
      )}
      {mapOpen && (
        <CityMap
          currentSuiteId={activeSuite}
          onSuiteTour={tourSuite}
          currentBuildingId={safeHouseOpen ? 'safehouse' : interior?.id}
          initialSection={menuSection}
          currentInterior={safeHouseOpen ? 'Family Safe House' : interior?.name}
          destination={destination}
          onDestination={setDestination}
          selectedNpc={selectedNpc}
          position={streetPosition.current}
          onTravel={travel}
          onClose={() => setMapOpen(false)}
        />
      )}
      {ledgerOpen && <LedgerOverlay onClose={() => setLedgerOpen(false)} />}
      {safeHouseOpen && (
        <SafeHouseHud
          focusedId={focusedId}
          onCharacter={() => setCreatorOpen(true)}
          onVault={openVault}
          onShop={() => setShopOpen(true)}
          onMap={() => {
            setMenuSection('map')
            setSelectedNpc(null)
            setMapOpen(true)
          }}
          onExit={exitHouse}
        />
      )}
      {vaultOpen && <SafeHouse onClose={() => setVaultOpen(false)} />}
      {shopOpen && <DecorShop onClose={() => setShopOpen(false)} />}
      {creatorOpen && <CharacterCreator onClose={() => setCreatorOpen(false)} />}
      <OfflineDialog />
      <CustodyNotice />
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

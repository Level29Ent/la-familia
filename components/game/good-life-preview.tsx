'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { input } from '@/lib/game/input'
import { SEDAN_START } from '@/lib/game/good-life'
import { ROOM_NAVIGATION, type Navigation } from '@/lib/game/navigation'
import { STREET_NAVIGATION } from '@/components/world/layout'
import { ASSETS } from '@/lib/game/config'
import { createInitialState } from '@/lib/game/engine'

const CityScene = dynamic(() => import('@/components/world/city-scene').then((module) => module.CityScene), {
  ssr: false,
})
const SafeHouseScene = dynamic(
  () => import('@/components/world/safe-house-scene').then((module) => module.SafeHouseScene),
  { ssr: false },
)
const button = 'rounded-lg border border-primary/40 bg-background/90 px-3 py-2 text-sm text-primary'

// Isolated preview fixture. It deliberately never mounts GameProvider or touches localStorage.
export function GoodLifePreview() {
  const [pose, setPose] = useState({ ...SEDAN_START })
  const [held, setHeld] = useState<string[]>([])
  useEffect(() => {
    for (const key of held) input.keys.add(key)
    return () => {
      for (const key of held) input.keys.delete(key)
    }
  }, [held])
  const [room, setRoom] = useState(false)
  const [view, setView] = useState('entry')
  const [owned, setOwned] = useState(true)
  const [driving, setDriving] = useState(false)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const state = useMemo(
    () => ({ ...createInitialState(), assets: owned ? ASSETS.map((asset) => asset.id) : [] }),
    [owned],
  )
  const navigation = useMemo<Navigation>(() => {
    if (room)
      return {
        ...ROOM_NAVIGATION,
        start: view === 'wardrobe' ? [-3.7, 1.7, 5.8] : view === 'desk' ? [1, 1.7, 4.8] : [0, 1.7, 3.2],
        yaw: view === 'wardrobe' ? 0.8 : view === 'desk' ? -0.8 : 0,
      }
    return {
      ...STREET_NAVIGATION,
      start:
        view === 'yacht' ? [4, 1.7, -92] : view === 'penthouse' ? [0, 1.7, -35] : STREET_NAVIGATION.start,
      yaw: view === 'yacht' ? -Math.PI / 2 : view === 'penthouse' ? Math.PI / 2 : 0,
    }
  }, [room, view])
  return (
    <main className="relative h-dvh overflow-hidden bg-background">
      {room ? (
        <SafeHouseScene
          navigationOverride={navigation}
          assets={state.assets}
          safeHouse={state.safeHouse}
          character={state.character}
          decor={state.safeHouse.decor}
          enabled
          vaultOpen
          onFocusChange={setFocusedId}
        />
      ) : (
        <CityScene
          onVehicleUpdate={setPose}
          navigationOverride={navigation}
          state={state}
          driving={driving && owned}
          movementEnabled
          focusedId={focusedId}
          onFocusChange={setFocusedId}
        />
      )}
      <section className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <header className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl bg-background/90 p-3">
          <h1 className="mr-3 font-serif text-lg text-primary">Preview-only Good Life fixture</h1>
          <button
            className={button}
            onClick={() => {
              setRoom((value) => !value)
              setDriving(false)
            }}
          >
            {room ? 'View street' : 'View safe house'}
          </button>
          <button
            className={button}
            onClick={() => {
              setOwned((value) => !value)
              setDriving(false)
            }}
          >
            {owned ? 'Remove test perks' : 'Own all test perks'}
          </button>
          {!room && owned && (
            <button className={button} onClick={() => setDriving((value) => !value)}>
              {driving ? 'Park & exit test sedan' : 'Drive test sedan'}
            </button>
          )}
          <select
            aria-label="Fixture inspection view"
            value={view}
            onChange={(event) => {
              setView(event.target.value)
              setDriving(false)
            }}
            className={button}
          >
            <option value="entry">Entry / paintings</option>
            <option value="wardrobe">Wardrobe</option>
            <option value="desk">Desk displays</option>
            <option value="penthouse">Penthouse tower</option>
            <option value="yacht">Waterfront yacht</option>
          </select>
          <p className="w-full text-xs text-muted-foreground">
            No save data or real purchases. WASD / arrows move; car: W/S accelerate/reverse, A/D steer, Space
            brake. Drag to look.
          </p>
        </header>
        {!room && driving && (
          <fieldset className="pointer-events-auto flex flex-wrap gap-3 self-start rounded-lg bg-background/90 p-3 text-sm text-primary">
            <legend>Hold test driving inputs</legend>
            {[
              ['KeyW', 'Accelerate'],
              ['KeyS', 'Reverse'],
              ['KeyA', 'Steer left'],
              ['KeyD', 'Steer right'],
              ['Space', 'Brake'],
            ].map(([key, label]) => (
              <label key={key} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={held.includes(key)}
                  onChange={(event) =>
                    setHeld((keys) =>
                      event.target.checked ? [...keys, key] : keys.filter((item) => item !== key),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        <p className="self-start rounded-lg bg-background/90 p-3 text-sm text-primary">
          {room ? 'Safe house' : driving ? 'Driving test sedan' : 'Street'} ·{' '}
          {owned ? 'All 6 perks owned' : 'No perks owned'} · Focus: {focusedId ?? 'none'} · Car x{' '}
          {pose.x.toFixed(2)}, z {pose.z.toFixed(2)}, speed {pose.speed.toFixed(2)}
        </p>
      </section>
    </main>
  )
}

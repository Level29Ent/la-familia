'use client'

import { InspectionCamera, type InspectionView } from './inspection-camera'

import type { CarPose } from '@/lib/game/good-life'
import type { Navigation } from '@/lib/game/navigation'
import { GoodLifeLandmarks } from './good-life-displays'
import { Canvas } from '@react-three/fiber'
import { SceneUnavailable } from '@/components/game/scene-boundary'
import type { GameState } from '@/lib/game/engine'
import { Building, type BuildingStatus } from './building'
import { STREET_NAVIGATION, STREET_RETURN_NAVIGATION } from './layout'
import { PlayerControls } from './player-controls'
import { CityStreets } from './city-streets'
import { RivalCrews } from './rival-crews'
import { activeVehicle } from '@/lib/game/vehicles'
import { CITY_BUILDINGS, FAMILIES } from '@/lib/game/city'

const CITY_STYLES = Object.fromEntries(
  CITY_BUILDINGS.map((building) => [
    building.id,
    {
      wall: building.color,
      trim: '#283536',
      neon: FAMILIES.find((f) => f.id === building.family)?.color ?? '#f5c451',
      height: building.height,
      width: building.width,
      depth: building.depth,
    },
  ]),
)

function statusFor(state: GameState, id: string): BuildingStatus {
  const b = state.businesses[id]
  if (b.owned === 0) return 'locked'
  if (b.managed) return 'managed'
  return b.running ? 'running' : 'ready'
}

function litLevelFor(owned: number) {
  if (owned === 0) return 0
  return Math.min(0.95, 0.25 + Math.log10(owned + 1) * 0.3)
}

export function CityScene({
  state,
  driving = false,
  navigationOverride,
  inspectionView,
  onVehicleUpdate,
  returning = false,
  onPositionChange,
  onFamilyEncounter,
  focusedId,
  movementEnabled,
  onFocusChange,
}: {
  state: GameState
  driving?: boolean
  navigationOverride?: Navigation
  inspectionView?: InspectionView
  onVehicleUpdate?: (pose: CarPose) => void
  returning?: boolean
  onPositionChange?: (position: { x: number; z: number }) => void
  onFamilyEncounter?: () => void
  focusedId: string | null
  movementEnabled: boolean
  onFocusChange: (id: string | null) => void
}) {
  return (
    <Canvas
      frameloop={movementEnabled ? 'always' : 'demand'}
      fallback={<SceneUnavailable />}
      className="absolute inset-0 touch-none"
      dpr={[1, 1.5]}
      camera={{ fov: 70, near: 0.1, far: 260 }}
      gl={{ antialias: true }}
      aria-label="3D city street. Walk up to a storefront to manage that racket."
    >
      <color attach="background" args={['#a7cce5']} />
      <fog attach="fog" args={['#b8d0dd', 65, 220]} />
      <ambientLight intensity={1.3} color="#fff4df" />
      <hemisphereLight args={['#d5ecff', '#a2947a', 1.65]} />
      <directionalLight position={[40, 60, -70]} intensity={2.6} color="#fff1d0" />
      <directionalLight position={[-35, 25, 40]} intensity={0.65} color="#c4e1ff" />

      <CityStreets />
      <RivalCrews active={movementEnabled} onEncounter={onFamilyEncounter} />
      <GoodLifeLandmarks city assets={state.assets} endZ={STREET_NAVIGATION.bounds.minZ} />

      {CITY_BUILDINGS.map((building, i) => {
        const business = state.businesses[building.id]
        return (
          <Building
            key={building.id}
            placement={building}
            style={CITY_STYLES[building.id]}
            name={
              building.id === 'home-14' && state.assets.includes('penthouse')
                ? 'Bellini Penthouse'
                : building.name
            }
            status={business ? statusFor(state, building.id) : 'ready'}
            litLevel={business ? litLevelFor(business.owned) : 0.6}
            focused={focusedId === building.id}
            seed={i + 1}
          />
        )
      })}

      <PlayerControls
        key={activeVehicle(state)?.id ?? 'walking'}
        vehicle={activeVehicle(state)}
        onPositionChange={onPositionChange}
        onVehicleUpdate={onVehicleUpdate}
        assets={state.assets}
        driving={driving}
        character={state.character}
        navigation={navigationOverride ?? (returning ? STREET_RETURN_NAVIGATION : STREET_NAVIGATION)}
        enabled={movementEnabled}
        onFocusChange={onFocusChange}
      />
      {inspectionView && <InspectionCamera view={inspectionView} />}
    </Canvas>
  )
}

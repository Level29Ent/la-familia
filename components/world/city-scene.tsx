'use client'

import { InspectionCamera, type InspectionView } from './inspection-camera'

import type { CarPose } from '@/lib/game/good-life'
import type { Navigation } from '@/lib/game/navigation'
import { GoodLifeLandmarks } from './good-life-displays'
import { Canvas } from '@react-three/fiber'
import { BUSINESSES } from '@/lib/game/config'
import type { GameState } from '@/lib/game/engine'
import { Building, type BuildingStatus } from './building'
import {
  BUILDING_STYLES,
  PLACEMENTS,
  SAFE_HOUSE_PLACEMENT,
  SAFE_HOUSE_STYLE,
  STREET_NAVIGATION,
  STREET_RETURN_NAVIGATION,
} from './layout'
import { PlayerControls } from './player-controls'
import { Street } from './street'

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
  focusedId: string | null
  movementEnabled: boolean
  onFocusChange: (id: string | null) => void
}) {
  return (
    <Canvas
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

      <Street />
      <GoodLifeLandmarks assets={state.assets} endZ={STREET_NAVIGATION.bounds.minZ} />

      {PLACEMENTS.map((placement, i) => {
        const config = BUSINESSES.find((b) => b.id === placement.id)!
        return (
          <Building
            key={placement.id}
            placement={placement}
            style={BUILDING_STYLES[placement.id]}
            name={config.name}
            status={statusFor(state, placement.id)}
            litLevel={litLevelFor(state.businesses[placement.id].owned)}
            focused={focusedId === placement.id}
            seed={i + 1}
          />
        )
      })}

      <Building
        placement={SAFE_HOUSE_PLACEMENT}
        style={SAFE_HOUSE_STYLE}
        name="Family Safe House"
        status="managed"
        litLevel={0.9}
        focused={focusedId === 'safehouse'}
        seed={42}
      />
      <PlayerControls
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

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
import { ESTATES } from '@/lib/game/dynasty'
import { EstateDetails } from './estate-details'
import { NeighborhoodLife } from './neighborhood-life'
import { LivingCity, StreetLifeDetails } from './living-city'
import { cityTime } from '@/lib/game/city-play'
import { WorldText } from './world-text'
import { CityAtmosphere } from './city-atmosphere'
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

const ESTATE_STYLES = [
  { wall: '#646257', trim: '#3e3f38', neon: '#cbb385', height: 7, width: 10, depth: 9 },
  ...ESTATES.map((e, i) => ({
    wall: e.wall,
    trim: e.trim,
    neon: e.trim,
    height: 8 + i * 3,
    width: 10,
    depth: 9,
  })),
]

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
  onNpcEncounter,
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
  onNpcEncounter?: (id: string) => void
  focusedId: string | null
  movementEnabled: boolean
  onFocusChange: (id: string | null) => void
}) {
  const time = cityTime(state.play),
    low = state.play.quality === 'low'
  return (
    <Canvas
      frameloop={movementEnabled ? 'always' : 'demand'}
      fallback={<SceneUnavailable />}
      className="absolute inset-0 touch-none"
      dpr={low ? 1 : [1, 1.5]}
      camera={{ fov: 70, near: 0.1, far: 260 }}
      gl={{ antialias: true }}
      aria-label="3D city street. Walk up to a storefront to manage that racket."
    >
      <CityAtmosphere hour={time.hour} />
      <mesh position={[90, time.night ? 65 : 80, -170]}>
        <sphereGeometry args={[5, 16, 12]} />
        <meshBasicMaterial color={time.night ? '#dae3f0' : '#fff1b6'} fog={false} />
      </mesh>
      {state.play.territories.map((t, i) => (
        <group key={t.district} position={[i < 3 ? -32 : i === 3 ? 76 : 112, 0, i < 3 ? 22 - i * 36 : 22]}>
          <mesh position={[0, 2.3, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 4.6, 6]} />
            <meshStandardMaterial color="#6d736e" />
          </mesh>
          <mesh position={[1, 3.6, 0]}>
            <boxGeometry args={[2, 0.9, 0.06]} />
            <meshStandardMaterial
              color={t.control >= 75 ? '#bb9a4b' : t.control > 0 ? '#846847' : '#713e43'}
            />
          </mesh>
          <WorldText position={[1, 3.6, 0.05]} fontSize={0.2} color="#f0dfb0">
            {t.control >= 75 ? 'BELLINI' : t.control > 0 ? 'CONTESTED' : 'RIVAL TURF'}
          </WorldText>
        </group>
      ))}
      <CityStreets />
      <StreetLifeDetails />
      <NeighborhoodLife state={state} active={movementEnabled} />
      <LivingCity
        contacts={state.play.contacts}
        night={time.night}
        low={low}
        active={movementEnabled}
        dynasty={state.dynasty}
        onMeet={onNpcEncounter}
      />
      <RivalCrews active={movementEnabled} onEncounter={onFamilyEncounter} />
      <GoodLifeLandmarks city assets={state.assets} endZ={STREET_NAVIGATION.bounds.minZ} />

      {CITY_BUILDINGS.map((building, i) => {
        const business = state.businesses[building.id]
        return (
          <group key={building.id}>
            <Building
              key={building.id}
              placement={building}
              style={
                building.id === 'safehouse'
                  ? ESTATE_STYLES[state.dynasty.estate + 1]
                  : CITY_STYLES[building.id]
              }
              name={
                building.id === 'safehouse'
                  ? (ESTATES[state.dynasty.estate]?.name ?? 'Abandoned Property')
                  : building.id === 'home-14' && state.assets.includes('penthouse')
                    ? 'Bellini Penthouse'
                    : building.name
              }
              status={business ? statusFor(state, building.id) : 'ready'}
              litLevel={time.night ? 0.9 : business ? litLevelFor(business.owned) : 0.6}
              focused={focusedId === building.id}
              seed={i + 1}
            />
            {building.id === 'safehouse' && (
              <group position={building.position} rotation={[0, building.rotationY, 0]}>
                <EstateDetails tier={state.dynasty.estate} exterior />
              </group>
            )}
          </group>
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

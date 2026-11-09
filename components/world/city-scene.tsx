'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { BUSINESSES } from '@/lib/game/config'
import type { GameState } from '@/lib/game/engine'
import { Building, type BuildingStatus } from './building'
import { BUILDING_STYLES, PLACEMENTS } from './layout'
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
  focusedId,
  movementEnabled,
  onFocusChange,
}: {
  state: GameState
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
      <color attach="background" args={['#0b0f19']} />
      <fog attach="fog" args={['#0b0f19', 28, 145]} />
      <ambientLight intensity={0.65} color="#8d9bb8" />
      <hemisphereLight args={['#627a9f', '#22180e', 0.8]} />
      <directionalLight position={[40, 60, -100]} intensity={0.35} color="#c9c3e6" />
      <Stars radius={150} depth={40} count={2500} factor={4} fade speed={0.4} />

      <Street sedanOwned={state.assets.includes('sedan')} />

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

      <PlayerControls enabled={movementEnabled} onFocusChange={onFocusChange} />
    </Canvas>
  )
}

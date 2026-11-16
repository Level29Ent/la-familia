'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { GameState } from '@/lib/game/engine'
import { CITY_BUILDINGS } from '@/lib/game/city'
import { HARBOR_MISSIONS } from '@/lib/game/harbor'
import { npcAppearance } from '@/lib/game/npc-appearance'
import { NpcHuman } from './npc-human'
import { WorldText } from './world-text'

const looks = [npcAppearance(71), npcAppearance(72)]
export function NeighborhoodLife({ state, active }: { state: GameState; active: boolean }) {
  const objective = HARBOR_MISSIONS[state.harbor.chapter]
  const target =
    objective && CITY_BUILDINGS.find((b) => b.id === objective.locations[state.harbor.step])
  const marker = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (marker.current && active)
      marker.current.position.y = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.15
  })
  return (
    <group>
      {target && (
        <group position={[target.door[0], 0, target.door[1]]}>
          <group ref={marker}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <ringGeometry args={[0.8, 1, 24]} />
              <meshBasicMaterial color="#f0cf78" transparent opacity={0.8} />
            </mesh>
            <WorldText position={[0, 3.5, 0]} fontSize={0.24} color="#ffe1a0">
              HARBOR STORY
            </WorldText>
          </group>
        </group>
      )}
      {state.play.territories.map((t, i) => {
        const improved = state.harbor.investments.includes(t.district)
        const controlled = t.control >= 75
        if (!improved && !controlled) return null
        const x = i < 3 ? -20 : i === 3 ? 88 : 124,
          z = i < 3 ? 23 - i * 36 : 23
        return (
          <group key={t.district} position={[x, 0, z]}>
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[3.2, 0.2, 1.3]} />
              <meshStandardMaterial color="#795538" />
            </mesh>
            {[-1.4, 1.4].map((dx) => (
              <mesh key={dx} position={[dx, 1.5, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 3, 6]} />
                <meshStandardMaterial color="#b4986a" />
              </mesh>
            ))}
            <mesh position={[0, 3, 0]}>
              <boxGeometry args={[3.6, 0.15, 1.8]} />
              <meshStandardMaterial color={controlled ? '#a58540' : '#4d8069'} />
            </mesh>
            <WorldText position={[0, 2.55, 0.85]} fontSize={0.19} color="#fff0c7">
              {improved ? 'NEIGHBORHOOD MARKET' : 'BELLINI QUARTER'}
            </WorldText>
            {[-0.9, 0, 0.9].map((dx, n) => (
              <mesh key={dx} position={[dx, 1.35, 0]}>
                <boxGeometry args={[0.6, 0.3, 0.6]} />
                <meshStandardMaterial color={['#ad6550', '#93a362', '#d5ae61'][n]} />
              </mesh>
            ))}
            <group position={[0, 0, -1.1]}>
              <NpcHuman config={looks[0]} />
            </group>
            <group position={[2.5, 0, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
              <NpcHuman config={looks[1]} />
            </group>
          </group>
        )
      })}
    </group>
  )
}

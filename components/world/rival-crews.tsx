'use client'

import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { FAMILIES, patrolPosition } from '@/lib/game/city'
import { WorldText } from './world-text'

function Patrol({
  index,
  active,
  onEncounter,
}: {
  index: number
  active: boolean
  onEncounter?: () => void
}) {
  const ref = useRef<Group>(null)
  const family = FAMILIES[Math.floor(index / 4)]
  const start = patrolPosition(index, 0)
  useFrame(({ clock }) => {
    if (!ref.current || !active) return
    const [x, z] = patrolPosition(index, clock.elapsedTime)
    const [nx] = patrolPosition(index, clock.elapsedTime + 0.1)
    ref.current.position.set(x, Math.sin(clock.elapsedTime * 6 + index) * 0.025, z)
    ref.current.rotation.y = nx > x ? Math.PI / 2 : -Math.PI / 2
  })
  return (
    <group
      onClick={(event) => {
        event.stopPropagation()
        if (active) onEncounter?.()
      }}
      ref={ref}
      position={[start[0], 0, start[1]]}
    >
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.52, 0.8, 0.32]} />
        <meshStandardMaterial color={family.color} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.22, 10, 8]} />
        <meshStandardMaterial color="#c49a77" />
      </mesh>
      <mesh position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 10]} />
        <meshStandardMaterial color="#25282e" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.16, 0.38, 0]}>
            <boxGeometry args={[0.18, 0.76, 0.22]} />
            <meshStandardMaterial color="#30333b" />
          </mesh>
          <mesh position={[side * 0.37, 1.06, 0]}>
            <boxGeometry args={[0.16, 0.65, 0.22]} />
            <meshStandardMaterial color={family.color} />
          </mesh>
        </group>
      ))}
      <WorldText position={[0, 2.35, 0]} fontSize={0.2} color={family.color}>
        {family.name}
      </WorldText>
    </group>
  )
}
export const RivalCrews = memo(function RivalCrews({
  active,
  onEncounter,
}: {
  active: boolean
  onEncounter?: () => void
}) {
  return (
    <group>
      {Array.from({ length: 12 }, (_, index) => (
        <Patrol key={index} index={index} active={active} onEncounter={onEncounter} />
      ))}
    </group>
  )
})

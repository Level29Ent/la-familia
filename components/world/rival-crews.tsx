'use client'

import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { FAMILIES, patrolPosition } from '@/lib/game/city'
import { NpcHuman } from './npc-human'
import { npcAppearance } from '@/lib/game/npc-appearance'
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
  const motion = useRef({ moving: active, sprint: false })
  motion.current.moving = active
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
      <NpcHuman config={npcAppearance(index + 50)} motion={motion} accent={family.color} />
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

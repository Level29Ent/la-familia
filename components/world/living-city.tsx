'use client'

import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshBasicMaterial } from 'three'
import { trafficPosition, trafficSignal } from '@/lib/game/city-life'
import { RECRUITS, type DynastyState } from '@/lib/game/dynasty'
import { AVENUES } from '@/lib/game/city'
import { VintageCar } from './vintage-car'
import { NpcHuman } from './npc-human'
import type { Contact } from '@/lib/game/city-play'
import { npcAppearance } from '@/lib/game/npc-appearance'
import { WorldText } from './world-text'

const CITIZEN_LOOKS = Array.from({ length: 24 }, (_, i) => npcAppearance(i))
const RECRUIT_LOOKS = RECRUITS.map((r, i) => ({
  ...npcAppearance(i + 30),
  gender: ['lucia', 'maria', 'ada', 'rosa'].includes(r.id) ? 1 : 0,
}))

const Citizen = memo(function Citizen({ index, active, heat }: { index: number; active: boolean; heat: number }) {
  const motion = useRef({ moving: active, sprint: false })
  motion.current.moving = active
  const ref = useRef<Group>(null),
    row = Math.floor(index / 8),
    x = -32 + (index % 8) * 24,
    z = 23 - row * 36
  const elapsed = useRef(index * 3)
  useFrame((_, dt) => {
    if (!ref.current || !active) return
    elapsed.current += Math.min(dt, 0.1) * (heat >= 60 ? 1.6 : 0.65)
    const t = elapsed.current % 16
    const walking = t < 6 || (t >= 8 && t < 14)
    motion.current.moving = walking
    motion.current.sprint = heat >= 60
    ref.current.position.x = x + (t < 6 ? t : t < 8 ? 6 : t < 14 ? 14 - t : 0)
    ref.current.rotation.y = t < 8 ? Math.PI / 2 : -Math.PI / 2
  })
  return (
    <group ref={ref} position={[x, 0, z]}>
      <NpcHuman config={CITIZEN_LOOKS[index]} motion={motion} />
    </group>
  )
})
const Traffic = memo(function Traffic({
  index,
  active,
  heat,
}: {
  index: number
  active: boolean
  heat: number
}) {
  const ref = useRef<Group>(null),
    x = AVENUES[index] + (index % 2 ? 2 : -2),
    reverse = index % 2 === 1
  useFrame(({ clock }, dt) => {
    if (ref.current && active) ref.current.position.z = trafficPosition(ref.current.position.z, reverse, dt, clock.elapsedTime, heat >= 60 && index === 0 ? 6 : 3)
  })
  return (
    <group ref={ref} position={[x, 0.15, 21 - index * 15]} rotation={[0, reverse ? 0 : Math.PI, 0]}>
      <VintageCar
        position={[0, 0, 0]}
        color={index === 0 ? '#263846' : index % 2 ? '#ddbb46' : '#6c8476'}
        kind={index === 2 ? 'van' : index % 2 ? 'taxi' : 'sedan'}
      />
      {index === 0 && (
        <group>
          <mesh position={[0, 1.85, 0]}>
            <boxGeometry args={[0.8, 0.12, 0.2]} />
            <meshBasicMaterial color={heat >= 60 ? '#e86458' : '#7e9fd0'} />
          </mesh>
          <WorldText position={[0, 2.4, 0]} fontSize={0.22} color="#c2d8ed">
            POLICE PATROL
          </WorldText>
        </group>
      )}
    </group>
  )
})
export const LivingCity = memo(function LivingCity({
  active,
  night = false,
  low = false,
  dynasty,
  contacts = [],
  onMeet,
}: {
  active: boolean
  night?: boolean
  low?: boolean
  contacts?: Contact[]
  dynasty: DynastyState
  onMeet?: (id: string) => void
}) {
  return (
    <group>
      {Array.from({ length: low ? 8 : night ? 12 : 24 }, (_, index) => (
        <Citizen key={index} index={index} active={active} heat={dynasty.heat} />
      ))}
      {Array.from({ length: night ? 6 : low ? 3 : 5 }, (_, index) => (
        <Traffic key={index} index={index} active={active} heat={dynasty.heat} />
      ))}
      {RECRUITS.map((r, index) => {
        const hired = dynasty.members.some((m) => m.id === r.id),
          away = dynasty.missions.some((m) => m.memberId === r.id)
        if (away) return null
        return (
          <group
            key={r.id}
            position={[...r.position] as [number, number, number]}
            onClick={(e) => {
              e.stopPropagation()
              if (active) onMeet?.(r.id)
            }}
          >
            <mesh position={[0, 1.05, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 2.1, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <NpcHuman config={RECRUIT_LOOKS[index]} accent={hired ? '#e4c76a' : undefined} />
            <WorldText position={[0, 2.8, 0]} fontSize={0.24} color={hired ? '#edcf76' : '#c7e3bb'}>
              {r.name}
            </WorldText>
            <WorldText position={[0, 2.5, 0]} fontSize={0.18} color="#f0dfb7">
              {hired
                ? `${['ASSOCIATE', 'MADE MAN', 'CAPO'][contacts.find((c) => c.id === r.id)?.grade ?? 0]} · ${dynasty.members.find((m) => m.id === r.id)?.duty.toUpperCase()}`
                : `HIRE ${r.role.toUpperCase()} · $${r.cost}`}
            </WorldText>
            <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.55, 0.65, 20]} />
              <meshBasicMaterial color={hired ? '#e0b75b' : '#a3ce90'} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
})

function SignalLamp({ color, phase, y }: { color: string; phase: 'green' | 'amber' | 'red'; y: number }) {
  const material = useRef<MeshBasicMaterial>(null)
  useFrame(({ clock }) => { if (material.current) material.current.opacity = trafficSignal(clock.elapsedTime) === phase ? 1 : 0.15 })
  return <mesh position={[0, y, 0.25]}><circleGeometry args={[0.14, 10]} /><meshBasicMaterial ref={material} color={color} transparent /></mesh>
}

export const StreetLifeDetails = memo(function StreetLifeDetails() {
  return (
    <group>
      {AVENUES.flatMap((x) =>
        [-18, -54, -90].map((z) => (
          <group key={`${x}-${z}`} position={[x + 6.5, 0, z + 7]}>
            <mesh position={[0, 2.5, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 5, 6]} />
              <meshStandardMaterial color="#313c3c" />
            </mesh>
            <mesh position={[0, 4.5, 0]}>
              <boxGeometry args={[0.5, 1.4, 0.45]} />
              <meshStandardMaterial color="#292d31" />
            </mesh>
            <SignalLamp color="#f15d50" phase="red" y={4.9} />
            <SignalLamp color="#f2cc57" phase="amber" y={4.5} />
            <SignalLamp color="#87e8a1" phase="green" y={4.1} />
            <mesh position={[1, 0.4, 0]}>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color="#53736b" />
            </mesh>
            <mesh position={[-0.8, 0.5, 0]}>
              <cylinderGeometry args={[0.13, 0.2, 1, 8]} />
              <meshStandardMaterial color="#a34b3c" />
            </mesh>
          </group>
        )),
      )}
      {[-12, 24, 60, 96, 132].map((x) => (
        <group key={x} position={[x, 0, 23]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 0.15, 0.55]} />
            <meshStandardMaterial color="#886541" />
          </mesh>
          <mesh position={[0, 0.85, 0.2]}>
            <boxGeometry args={[2, 0.65, 0.12]} />
            <meshStandardMaterial color="#886541" />
          </mesh>
        </group>
      ))}
      {[-8, 28, 64, 100, 136].map((x) => (
        <group key={`tree-${x}`} position={[x, 0, 23.8]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.8, 0.8, 1.8]} />
            <meshStandardMaterial color="#a19179" />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.1, 0.18, 2.6, 7]} />
            <meshStandardMaterial color="#69533b" />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[1.25, 9, 7]} />
            <meshStandardMaterial color="#6d8e64" />
          </mesh>
        </group>
      ))}
    </group>
  )
})

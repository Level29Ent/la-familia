'use client'

import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { RECRUITS, type DynastyState } from '@/lib/game/dynasty'
import { AVENUES } from '@/lib/game/city'
import { VintageCar } from './vintage-car'
import { WorldText } from './world-text'

function Citizen({ index, active }: { index: number; active: boolean }) {
  const ref = useRef<Group>(null),
    row = Math.floor(index / 8),
    x = -32 + (index % 8) * 24,
    z = 23 - row * 36
  useFrame(({ clock }) => {
    if (ref.current && active) {
      const t = (clock.elapsedTime * 0.65 + index * 3) % 12
      ref.current.position.x = x + (t < 6 ? t : 12 - t)
      ref.current.rotation.y = t < 6 ? Math.PI / 2 : -Math.PI / 2
    }
  })
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[0.42, 0.8, 0.3]} />
        <meshStandardMaterial color={['#8a6e5d', '#6d8793', '#a48e6c', '#71765b'][index % 4]} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#c49776" />
      </mesh>
      {[-0.13, 0.13].map((side) => (
        <mesh key={side} position={[side, 0.4, 0]}>
          <boxGeometry args={[0.16, 0.8, 0.2]} />
          <meshStandardMaterial color="#44434a" />
        </mesh>
      ))}
    </group>
  )
}
function Traffic({ index, active, heat }: { index: number; active: boolean; heat: number }) {
  const ref = useRef<Group>(null),
    x = AVENUES[index] + (index % 2 ? 2 : -2),
    reverse = index % 2 === 1
  useFrame(({ clock }) => {
    if (ref.current && active) {
      const t = (clock.elapsedTime * (heat >= 60 ? 6 : 3) + index * 19) % 112
      ref.current.position.z = reverse ? -91 + t : 21 - t
    }
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
}
export const LivingCity = memo(function LivingCity({
  active,
  dynasty,
  onMeet,
}: {
  active: boolean
  dynasty: DynastyState
  onMeet?: (id: string) => void
}) {
  return (
    <group>
      {Array.from({ length: 24 }, (_, index) => (
        <Citizen key={index} index={index} active={active} />
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <Traffic key={index} index={index} active={active} heat={dynasty.heat} />
      ))}
      {RECRUITS.map((r) => {
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
            <mesh position={[0, 1.15, 0]}>
              <boxGeometry args={[0.55, 1, 0.35]} />
              <meshStandardMaterial
                color={
                  hired
                    ? '#d0b068'
                    : r.role === 'hitman'
                      ? '#584456'
                      : r.role === 'guard'
                        ? '#3c5e69'
                        : '#657f59'
                }
              />
            </mesh>
            <mesh position={[0, 1.9, 0]}>
              <sphereGeometry args={[0.23, 10, 8]} />
              <meshStandardMaterial color="#cca47b" />
            </mesh>
            <mesh position={[0, 2.15, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.1, 10]} />
              <meshStandardMaterial color="#303332" />
            </mesh>
            {[-0.17, 0.17].map((x) => (
              <mesh key={x} position={[x, 0.45, 0]}>
                <boxGeometry args={[0.2, 0.9, 0.25]} />
                <meshStandardMaterial color="#31353b" />
              </mesh>
            ))}
            <WorldText position={[0, 2.8, 0]} fontSize={0.24} color={hired ? '#edcf76' : '#c7e3bb'}>
              {r.name}
            </WorldText>
            <WorldText position={[0, 2.5, 0]} fontSize={0.18} color="#f0dfb7">
              {hired
                ? `FAMILY · ${dynasty.members.find((m) => m.id === r.id)?.duty.toUpperCase()}`
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
            {[
              ['#b94b43', 4.9],
              ['#d2b54c', 4.5],
              ['#7cbd8e', 4.1],
            ].map(([color, y]) => (
              <mesh key={color} position={[0, Number(y), 0.25]}>
                <circleGeometry args={[0.14, 10]} />
                <meshBasicMaterial color={String(color)} />
              </mesh>
            ))}
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

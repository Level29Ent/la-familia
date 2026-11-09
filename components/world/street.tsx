'use client'

import { useMemo } from 'react'
import { PLACEMENTS, STREET_HALF_WIDTH } from './layout'

const END_Z = PLACEMENTS[PLACEMENTS.length - 1].door[1]
const STREET_LENGTH = Math.abs(END_Z) + 44
const STREET_CENTER_Z = (END_Z + 20) / 2
const LAMP_ZS = Array.from({ length: Math.ceil(STREET_LENGTH / 18) }, (_, i) => 8 - i * 18)

function hash(n: number) {
  const x = Math.sin(n * 91.7 + 17.3) * 43758.5453
  return x - Math.floor(x)
}

export function Street({ sedanOwned }: { sedanOwned: boolean }) {
  const dashes = useMemo(() => {
    const zs: number[] = []
    for (let z = 14; z > PLACEMENTS[PLACEMENTS.length - 1].door[1]; z -= 4) zs.push(z)
    return zs
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, STREET_CENTER_Z]}>
        <planeGeometry args={[240, STREET_LENGTH + 100]} />
        <meshStandardMaterial color="#141210" roughness={0.28} metalness={0.45} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (STREET_HALF_WIDTH - 0.8), 0.08, STREET_CENTER_Z]}>
          <boxGeometry args={[1.6, 0.16, STREET_LENGTH]} />
          <meshStandardMaterial color="#2b2825" roughness={0.95} />
        </mesh>
      ))}

      {dashes.map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[0.18, 1.8]} />
          <meshStandardMaterial color="#8a7a52" roughness={0.9} />
        </mesh>
      ))}

      {LAMP_ZS.flatMap((z) =>
        [-1, 1].map((side) => (
          <StreetLamp key={`${side}-${z}`} position={[side * (STREET_HALF_WIDTH - 1.1), 0, z - side * 3.5]} />
        )),
      )}

      {/* Soft neon pools suggest rain-slick pavement without costly real-time reflections. */}
      {PLACEMENTS.slice(0, -1).map((p, i) => (
        <mesh key={p.id} position={[p.door[0] * 0.65, 0.018, p.door[1]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.2, 32]} />
          <meshBasicMaterial
            color={i % 2 ? '#c34f71' : '#c99646'}
            transparent
            opacity={0.055}
            depthWrite={false}
          />
        </mesh>
      ))}
      {[-3, -35, -73].map((z, i) => (
        <VintageCar key={z} position={[4.4, 0.18, z]} color={i % 2 ? '#572e36' : '#24383c'} />
      ))}
      {sedanOwned && <VintageCar position={[-4.3, 0.18, 7]} color="#213f68" />}
      <Skyline />
    </group>
  )
}

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 5, 8]} />
        <meshStandardMaterial color="#1f1d1b" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 5.15, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#ffd89a" emissive="#ffc46b" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 4.9, 0]} color="#ffb867" intensity={18} distance={16} decay={1.6} />
    </group>
  )
}

function Skyline() {
  const towers = useMemo(() => {
    const list: {
      x: number
      z: number
      w: number
      h: number
      d: number
      lit: boolean
    }[] = []
    for (let i = 0; i < 36; i++) {
      const side = i % 2 === 0 ? -1 : 1
      const x = side * (26 + hash(i) * 22)
      const z = 20 - (i / 36) * 120
      list.push({
        x,
        z,
        w: 6 + hash(i + 3) * 8,
        h: 18 + hash(i + 7) * 45,
        d: 6 + hash(i + 11) * 8,
        lit: hash(i + 13) > 0.5,
      })
    }
    for (let i = 0; i < 10; i++) {
      list.push({
        x: -45 + i * 10,
        z: -100 - hash(i + 40) * 20,
        w: 8,
        h: 30 + hash(i + 50) * 50,
        d: 8,
        lit: hash(i + 60) > 0.4,
      })
    }
    return list
  }, [])

  return (
    <group>
      {towers.map((t, i) => (
        <mesh key={i} position={[t.x, t.h / 2, t.z]}>
          <boxGeometry args={[t.w, t.h, t.d]} />
          <meshStandardMaterial
            color="#16151a"
            emissive={t.lit ? '#3a2a14' : '#000000'}
            emissiveIntensity={t.lit ? 0.5 : 0}
            roughness={1}
          />
        </mesh>
      ))}
      <mesh position={[50, 75, -150]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#f3e6c4" fog={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

function VintageCar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.65, 0.7, 3.7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.18, -0.25]}>
        <boxGeometry args={[1.4, 0.8, 1.9]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.24, 0.72]}>
        <planeGeometry args={[1.15, 0.5]} />
        <meshStandardMaterial color="#7499ad" metalness={0.65} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.6, 1.88]}>
        <boxGeometry args={[0.8, 0.55, 0.08]} />
        <meshStandardMaterial color="#a8a8a0" metalness={0.9} roughness={0.2} />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${side}-${z}`} position={[side * 0.82, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.18, 16]} />
            <meshStandardMaterial color="#101217" roughness={0.9} />
          </mesh>
        )),
      )}
      {[-0.63, 0.63].map((x) => (
        <mesh key={x} position={[x, 0.73, 1.9]}>
          <sphereGeometry args={[0.15, 12, 8]} />
          <meshStandardMaterial color="#ffe9b5" emissive="#ffe9b5" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

'use client'

import { useMemo } from 'react'
import { PLACEMENTS, STREET_HALF_WIDTH } from './layout'

const STREET_LENGTH = 110
const STREET_CENTER_Z = -40
const LAMP_ZS = [6, -8, -22, -36, -50]

function hash(n: number) {
  const x = Math.sin(n * 91.7 + 17.3) * 43758.5453
  return x - Math.floor(x)
}

export function Street() {
  const dashes = useMemo(() => {
    const zs: number[] = []
    for (let z = 14; z > PLACEMENTS[PLACEMENTS.length - 1].door[1]; z -= 4) zs.push(z)
    return zs
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, STREET_CENTER_Z]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#141210" roughness={0.55} metalness={0.25} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (STREET_HALF_WIDTH - 0.8), 0.08, STREET_CENTER_Z + 10]}>
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
        [-1, 1].map((side) => <StreetLamp key={`${side}-${z}`} position={[side * (STREET_HALF_WIDTH - 1.1), 0, z - side * 3.5]} />),
      )}

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
    const list: { x: number; z: number; w: number; h: number; d: number; lit: boolean }[] = []
    for (let i = 0; i < 36; i++) {
      const side = i % 2 === 0 ? -1 : 1
      const x = side * (26 + hash(i) * 22)
      const z = 20 - (i / 36) * 120
      list.push({ x, z, w: 6 + hash(i + 3) * 8, h: 18 + hash(i + 7) * 45, d: 6 + hash(i + 11) * 8, lit: hash(i + 13) > 0.5 })
    }
    for (let i = 0; i < 10; i++) {
      list.push({ x: -45 + i * 10, z: -100 - hash(i + 40) * 20, w: 8, h: 30 + hash(i + 50) * 50, d: 8, lit: hash(i + 60) > 0.4 })
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

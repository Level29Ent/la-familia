'use client'

import { memo } from 'react'
import type { VehicleKind } from '@/lib/game/vehicles'

export const VehicleDetails = memo(function VehicleDetails({
  kind,
  color,
}: {
  kind: VehicleKind
  color: string
}) {
  const tall = kind === 'van' || kind === 'pickup',
    roof = kind === 'roadster'
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[-1.1, 1.1].map((z) => (
            <group key={z} position={[side * 0.93, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
              <mesh>
                <cylinderGeometry args={[0.25, 0.25, 0.025, 16]} />
                <meshStandardMaterial color="#c4c3b8" metalness={0.8} roughness={0.23} />
              </mesh>
              <mesh position={[0, side < 0 ? 0.02 : -0.02, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.03, 12]} />
                <meshStandardMaterial color="#5a6060" metalness={0.7} />
              </mesh>
            </group>
          ))}
          <mesh position={[side * 0.86, 0.7, -0.1]}>
            <boxGeometry args={[0.04, 0.05, 2.7]} />
            <meshStandardMaterial color="#c8c4ae" metalness={0.8} />
          </mesh>
          <mesh position={[side * 0.84, 0.9, 0.2]}>
            <boxGeometry args={[0.07, 0.05, 0.25]} />
            <meshStandardMaterial color="#d0caba" metalness={0.8} />
          </mesh>
          {!roof && (
            <mesh position={[side * 0.71, 1.25, tall ? 0.45 : -0.25]}>
              <boxGeometry args={[0.02, 0.4, tall ? 0.5 : 1.35]} />
              <meshStandardMaterial color="#7b9ba8" metalness={0.3} roughness={0.2} />
            </mesh>
          )}
          <mesh position={[side * 0.94, 1.02, 0.7]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color={color} metalness={0.6} />
          </mesh>
          <mesh position={[side * 0.58, 0.7, -1.88]}>
            <boxGeometry args={[0.2, 0.14, 0.035]} />
            <meshStandardMaterial color="#ae4038" emissive="#6d2521" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[side * 0.82, 0.4, 0]}>
            <boxGeometry args={[0.16, 0.08, 1.7]} />
            <meshStandardMaterial color="#30383a" />
          </mesh>
        </group>
      ))}
      {[-1.97, 1.97].map((z) => (
        <mesh key={z} position={[0, 0.36, z]}>
          <boxGeometry args={[1.8, 0.1, 0.12]} />
          <meshStandardMaterial color="#c7c8be" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      {[-0.28, -0.14, 0, 0.14, 0.28].map((x) => (
        <mesh key={x} position={[x, 0.6, 1.93]}>
          <boxGeometry args={[0.025, 0.42, 0.025]} />
          <meshStandardMaterial color="#383f40" metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.38, -1.96]}>
        <boxGeometry args={[0.5, 0.16, 0.025]} />
        <meshStandardMaterial color="#ddd5b8" />
      </mesh>
      <mesh position={[0, 0.23, -1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#707674" metalness={0.8} />
      </mesh>
    </group>
  )
})

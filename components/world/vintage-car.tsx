'use client'

import { VehicleDetails } from './vehicle-details'
import type { VehicleKind } from '@/lib/game/vehicles'

export function VintageCar({
  position,
  color,
  kind = 'sedan',
}: {
  position: [number, number, number]
  color: string
  kind?: VehicleKind
}) {
  const pickup = kind === 'pickup',
    van = kind === 'van',
    roadster = kind === 'roadster'
  const height = roadster ? 0.48 : 0.7
  return (
    <group position={position}>
      <VehicleDetails kind={kind} color={color}/>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.65, height, 3.7]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
      </mesh>
      {van ? (
        <group>
          <mesh position={[0, 1.38, -0.7]}>
            <boxGeometry args={[1.6, 1.55, 2.25]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.4, 0.65]}>
            <boxGeometry args={[1.4, 0.9, 0.8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.45, 1.06]}>
            <planeGeometry args={[1.15, 0.5]} />
            <meshStandardMaterial color="#7499ad" />
          </mesh>
        </group>
      ) : pickup ? (
        <group>
          <mesh position={[0, 1.2, 0.5]}>
            <boxGeometry args={[1.4, 0.9, 1.3]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 1.3, 1.16]}>
            <planeGeometry args={[1.15, 0.5]} />
            <meshStandardMaterial color="#7499ad" />
          </mesh>
          <mesh position={[0, 0.97, -1]}>
            <boxGeometry args={[1.3, 0.08, 1.35]} />
            <meshStandardMaterial color="#564733" />
          </mesh>
          {[-0.75, 0.75].map((x) => (
            <mesh key={x} position={[x, 1.15, -1]}>
              <boxGeometry args={[0.15, 0.45, 1.5]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
          <mesh position={[0, 1.15, -1.72]}>
            <boxGeometry args={[1.6, 0.45, 0.15]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ) : roadster ? (
        <group>
          <mesh position={[0, 1.14, 0.65]} rotation={[-0.2, 0, 0]}>
            <boxGeometry args={[1.4, 0.62, 0.07]} />
            <meshStandardMaterial color="#8db3be" transparent opacity={0.6} />
          </mesh>
          {[-0.38, 0.38].map((x) => (
            <mesh key={x} position={[x, 1.05, -0.3]}>
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshStandardMaterial color="#5f3531" />
            </mesh>
          ))}
        </group>
      ) : (
        <group>
          <mesh position={[0, 1.18, -0.25]}>
            <boxGeometry args={[1.4, 0.8, 1.9]} />
            <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.24, 0.72]}>
            <planeGeometry args={[1.15, 0.5]} />
            <meshStandardMaterial color="#7499ad" metalness={0.65} roughness={0.15} />
          </mesh>
        </group>
      )}
      {kind === 'taxi' && (
        <group>
          <mesh position={[0, 1.71, -0.1]}>
            <boxGeometry args={[0.65, 0.25, 0.35]} />
            <meshStandardMaterial color="#f5df85" />
          </mesh>
          {[-0.84, 0.84].map((x) => (
            <mesh key={x} position={[x, 0.84, 0]}>
              <boxGeometry args={[0.02, 0.15, 2.6]} />
              <meshStandardMaterial color="#25272a" />
            </mesh>
          ))}
        </group>
      )}
      <mesh position={[0, 0.6, 1.88]}>
        <boxGeometry args={[0.8, 0.5, 0.08]} />
        <meshStandardMaterial color="#a8a8a0" metalness={0.9} roughness={0.2} />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${side}-${z}`} position={[side * 0.82, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.18, 12]} />
            <meshStandardMaterial color="#101217" roughness={0.9} />
          </mesh>
        )),
      )}
      {[-0.63, 0.63].map((x) => (
        <mesh key={x} position={[x, 0.73, 1.9]}>
          <sphereGeometry args={[0.15, 10, 6]} />
          <meshStandardMaterial color="#ffe9b5" emissive="#ffe9b5" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

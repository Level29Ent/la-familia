'use client'

import { memo } from 'react'
import { WorldText } from './world-text'

export const ArchitecturalDetails = memo(function ArchitecturalDetails({
  width,
  height,
  depth,
  trim,
  seed,
}: {
  width: number
  height: number
  depth: number
  trim: string
  seed: number
}) {
  const front = depth / 2
  return (
    <group>
      {/* Window frames and reveals add depth without blocking an entrance. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * (width / 2 - 0.25), height / 2, front + 0.07]}>
            <boxGeometry args={[0.25, height, 0.16]} />
            <meshStandardMaterial color={trim} />
          </mesh>
          <mesh position={[side * 0.98, 1.4, front + 0.12]}>
            <boxGeometry args={[0.14, 2.9, 0.16]} />
            <meshStandardMaterial color="#a48c65" metalness={0.3} />
          </mesh>
          <mesh position={[side * 2.9, 1.8, front + 0.09]}>
            <boxGeometry args={[2.3, 0.08, 0.1]} />
            <meshStandardMaterial color={trim} />
          </mesh>
          <mesh position={[side * 2.9, 1.8, front + 0.09]}>
            <boxGeometry args={[0.08, 2, 0.1]} />
            <meshStandardMaterial color={trim} />
          </mesh>
          {Array.from({ length: Math.min(5, Math.floor((height - 5) / 3)) }, (_, i) => (
            <group
              key={i}
              position={[side * (width / 2 + 0.02), 6.5 + i * 3, 0]}
              rotation={[0, (side * Math.PI) / 2, 0]}
            >
              <mesh>
                <planeGeometry args={[1.1, 1.6]} />
                <meshStandardMaterial color="#607579" metalness={0.25} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <boxGeometry args={[0.05, 1.65, 0.05]} />
                <meshStandardMaterial color={trim} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 2.87, front + 0.13]}>
        <boxGeometry args={[2.15, 0.15, 0.2]} />
        <meshStandardMaterial color="#a48c65" />
      </mesh>
      <mesh position={[0.65, 1.35, front + 0.16]}>
        <boxGeometry args={[0.08, 0.27, 0.08]} />
        <meshStandardMaterial color="#d2bc85" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, height - 0.25, front + 0.13]}>
        <boxGeometry args={[width + 0.2, 0.18, 0.26]} />
        <meshStandardMaterial color="#b9a47e" />
      </mesh>
      <mesh position={[1.7, 2.2, front + 0.12]}>
        <boxGeometry args={[0.65, 0.38, 0.06]} />
        <meshStandardMaterial color="#293b3a" />
      </mesh>
      <WorldText position={[1.7, 2.2, front + 0.17]} fontSize={0.19} color="#e6d2a3">
        {String(100 + seed * 7)}
      </WorldText>
    </group>
  )
})
export const InteriorFinishes = memo(function InteriorFinishes({ theme }: { theme: string }) {
  const tile = theme === 'workshop' || theme === 'shop'
  return (
    <group>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[-7 + i, 0.012, 0]}>
          <boxGeometry args={[0.018, 0.012, 14]} />
          <meshStandardMaterial color={tile ? '#a9aea2' : '#564334'} />
        </mesh>
      ))}
      {tile &&
        Array.from({ length: 15 }, (_, i) => (
          <mesh key={`tile-${i}`} position={[0, 0.014, -7 + i]}>
            <boxGeometry args={[14, 0.012, 0.018]} />
            <meshStandardMaterial color="#a9aea2" />
          </mesh>
        ))}
      {[-6.85, 6.85].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.4, 0]}>
            <boxGeometry args={[0.1, 0.8, 14]} />
            <meshStandardMaterial color="#535e52" />
          </mesh>
          <mesh position={[x, 0.85, 0]}>
            <boxGeometry args={[0.12, 0.06, 14]} />
            <meshStandardMaterial color="#bba878" />
          </mesh>
          <group position={[x, 2.9, -1.4]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[2, 1.8]} />
              <meshStandardMaterial color="#b4c8ce" emissive="#647e86" emissiveIntensity={0.18} />
            </mesh>
            <mesh position={[0, 0, 0.025]}>
              <boxGeometry args={[0.08, 1.9, 0.06]} />
              <meshStandardMaterial color="#d1bd92" />
            </mesh>
          </group>
        </group>
      ))}
      {[-3, 3].map((x) => (
        <group key={x} position={[x, 4.5, -2]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
            <meshStandardMaterial color="#5a5b54" />
          </mesh>
          <mesh position={[0, -0.35, 0]}>
            <coneGeometry args={[0.4, 0.28, 16]} />
            <meshStandardMaterial color="#b8a57a" metalness={0.5} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshBasicMaterial color="#fff1bf" />
          </mesh>
        </group>
      ))}
      <group position={[-6.4, 1, -5.8]}>
        <mesh>
          <cylinderGeometry args={[0.24, 0.19, 0.5, 10]} />
          <meshStandardMaterial color="#a98a62" />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshStandardMaterial color="#647a52" />
        </mesh>
      </group>
    </group>
  )
})

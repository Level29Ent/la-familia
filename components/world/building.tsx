'use client'

import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { BuildingStyle, Placement } from './layout'

export type BuildingStatus = 'locked' | 'ready' | 'running' | 'managed'

const FONT = '/fonts/Geist-Regular.ttf'

const litWindow = new THREE.MeshStandardMaterial({ color: '#2a2016', emissive: '#ffc46b', emissiveIntensity: 1.4 })
const darkWindow = new THREE.MeshStandardMaterial({ color: '#0f1215', roughness: 0.3, metalness: 0.6 })
const boardedWindow = new THREE.MeshStandardMaterial({ color: '#3a2d22', roughness: 1 })

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

type Props = {
  placement: Placement
  style: BuildingStyle
  name: string
  status: BuildingStatus
  litLevel: number
  focused: boolean
  seed: number
}

function BuildingImpl({ placement, style, name, status, litLevel, focused, seed }: Props) {
  const { width, height, depth, wall, trim, neon } = style
  const front = depth / 2
  const locked = status === 'locked'
  const isCityHall = placement.id === 'cityhall'
  const lampRef = useRef<THREE.MeshStandardMaterial>(null)

  const windows = useMemo(() => {
    const cols = Math.max(3, Math.floor(width / 2.4))
    const rows = Math.max(1, Math.floor((height - 5.5) / 2.6))
    const list: { x: number; y: number; i: number }[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * (width / cols)
        list.push({ x, y: 6.2 + r * 2.6, i: r * cols + c })
      }
    }
    return list
  }, [width, height])

  useFrame(({ clock }) => {
    const mat = lampRef.current
    if (!mat) return
    if (status === 'ready') mat.emissiveIntensity = 1.5 + Math.sin(clock.elapsedTime * 6) * 1.2
    else if (status === 'running') mat.emissiveIntensity = 0.8
    else if (status === 'managed') mat.emissiveIntensity = 1.6
    else mat.emissiveIntensity = 0.05
  })

  const lampColor = status === 'managed' ? '#7ee0a1' : status === 'running' ? '#ff9b4d' : '#ffd36b'

  return (
    <group position={placement.position} rotation={[0, placement.rotationY, 0]}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={locked ? '#26221f' : wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, height + 0.25, 0]}>
        <boxGeometry args={[width + 0.4, 0.5, depth + 0.4]} />
        <meshStandardMaterial color={trim} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.6, front + 0.1]}>
        <boxGeometry args={[width + 0.2, 0.3, 0.3]} />
        <meshStandardMaterial color={trim} />
      </mesh>

      {windows.map((w) => (
        <mesh
          key={w.i}
          position={[w.x, w.y, front + 0.02]}
          material={locked ? boardedWindow : hash(seed * 31 + w.i) < litLevel ? litWindow : darkWindow}
        >
          <planeGeometry args={[1.1, 1.5]} />
        </mesh>
      ))}

      {isCityHall &&
        [-6, -3.6, -1.2, 1.2, 3.6, 6].map((x) => (
          <mesh key={x} position={[x, 2.6, front + 0.8]}>
            <cylinderGeometry args={[0.35, 0.4, 5.2, 12]} />
            <meshStandardMaterial color="#9a9488" roughness={0.8} />
          </mesh>
        ))}

      <mesh position={[0, 1.4, front + 0.03]}>
        <planeGeometry args={[1.8, 2.8]} />
        <meshStandardMaterial color={locked ? '#2b2016' : '#1a120c'} roughness={0.7} />
      </mesh>
      {[-3, 3].map((x) => (
        <mesh key={x} position={[x * (width / 10), 1.8, front + 0.03]}>
          <planeGeometry args={[2.2, 2]} />
          <meshStandardMaterial
            color={locked ? '#3a2d22' : '#24180e'}
            emissive={locked ? '#000000' : '#ffb35c'}
            emissiveIntensity={locked ? 0 : 0.35}
          />
        </mesh>
      ))}

      <mesh position={[1.3, 2.9, front + 0.15]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial ref={lampRef} color={lampColor} emissive={lampColor} toneMapped={false} />
      </mesh>

      <mesh position={[0, 5.6, front + 0.25]}>
        <boxGeometry args={[Math.min(width - 1, name.length * 0.42 + 1.2), 1.1, 0.15]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.6} />
      </mesh>
      <Text
        font={FONT}
        position={[0, 5.6, front + 0.34]}
        fontSize={0.62}
        maxWidth={width - 1.4}
        anchorX="center"
        anchorY="middle"
        color={locked ? '#6b625a' : neon}
        letterSpacing={0.04}
      >
        {name.toUpperCase()}
      </Text>

      {locked && (
        <group position={[0, 3.3, front + 0.12]}>
          <mesh>
            <boxGeometry args={[2.6, 0.8, 0.08]} />
            <meshStandardMaterial color="#d9c9a3" roughness={0.9} />
          </mesh>
          <Text font={FONT} position={[0, 0, 0.06]} fontSize={0.36} color="#7a1f1a" anchorX="center" anchorY="middle">
            FOR SALE
          </Text>
        </group>
      )}

      {status === 'managed' && <Capo position={[-1.6, 0, front + 1.1]} />}

      {focused && (
        <mesh position={[0, 0.02, front + 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.5, 48]} />
          <meshBasicMaterial color={neon} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function Capo({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.32, 0.9, 6, 12]} />
        <meshStandardMaterial color="#1c1b22" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#c8a27e" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.04, 20]} />
        <meshStandardMaterial color="#111014" />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.24, 20]} />
        <meshStandardMaterial color="#111014" />
      </mesh>
      <mesh position={[0, 1.94, 0]}>
        <cylinderGeometry args={[0.265, 0.265, 0.06, 20]} />
        <meshStandardMaterial color="#7a1f1a" />
      </mesh>
    </group>
  )
}

export const Building = memo(BuildingImpl)

'use client'

import { useSurfaceTexture } from './surface-texture'
import { ArchitecturalDetails } from './architectural-details'
import { CharacterModel } from './character-model'
import { npcAppearance } from '@/lib/game/npc-appearance'
import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WorldText } from './world-text'
import * as THREE from 'three'
import type { BuildingStyle, Placement } from './layout'

export type BuildingStatus = 'locked' | 'ready' | 'running' | 'managed'

const litWindow = new THREE.MeshStandardMaterial({
  color: '#2a2016',
  emissive: '#ffc46b',
  emissiveIntensity: 1.4,
})
const darkWindow = new THREE.MeshStandardMaterial({
  color: '#0f1215',
  roughness: 0.3,
  metalness: 0.6,
})
const boardedWindow = new THREE.MeshStandardMaterial({
  color: '#3a2d22',
  roughness: 1,
})

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
  const surface=useSurfaceTexture('brick',width/3,height/3)
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
      <ArchitecturalDetails width={width} height={height} depth={depth} trim={trim} seed={seed}/>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial map={surface} color={wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, height + 0.25, 0]}>
        <boxGeometry args={[width + 0.4, 0.5, depth + 0.4]} />
        <meshStandardMaterial color={trim} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.6, front + 0.1]}>
        <boxGeometry args={[width + 0.2, 0.3, 0.3]} />
        <meshStandardMaterial color={trim} />
      </mesh>

      {/* Art-deco cornices, striped shop awnings, and brass window sills. */}
      {[height - 0.7, 4.9].map((y) => (
        <mesh key={y} position={[0, y, front + 0.18]}>
          <boxGeometry args={[width + 0.3, 0.16, 0.38]} />
          <meshStandardMaterial color="#a48a62" metalness={0.45} roughness={0.5} />
        </mesh>
      ))}
      {!isCityHall &&
        [-1, 0, 1].map((section) => (
          <group key={section} position={[section * (width / 3), 3.8, front + 0.55]} rotation={[0.22, 0, 0]}>
            <mesh>
              <boxGeometry args={[width / 3 - 0.03, 0.12, 1.25]} />
              <meshStandardMaterial color={section === 0 ? '#c6b797' : trim} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.15, 0.6]}>
              <boxGeometry args={[width / 3 - 0.03, 0.35, 0.08]} />
              <meshStandardMaterial color={section === 0 ? '#c6b797' : trim} />
            </mesh>
          </group>
        ))}
      <mesh position={[width / 2 - 0.4, height / 2, front + 0.12]}>
        <cylinderGeometry args={[0.07, 0.07, height, 6]} />
        <meshStandardMaterial color="#655d52" metalness={0.7} roughness={0.6} />
      </mesh>
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => (
        <mesh key={`course-${i}`} position={[0, 1 + i * 2, front + 0.015]}>
          <boxGeometry args={[width, 0.025, 0.025]} />
          <meshStandardMaterial color={trim} />
        </mesh>
      ))}
      {height >= 25 && (
        <group position={[width / 4, height + 1.5, -1]}>
          <mesh>
            <cylinderGeometry args={[0.9, 0.9, 2.3, 10]} />
            <meshStandardMaterial color="#705741" />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <coneGeometry args={[1.15, 0.6, 10]} />
            <meshStandardMaterial color="#3f4748" />
          </mesh>
        </group>
      )}
      {height >= 25 &&
        [8, 13, 18].map((y) => (
          <group key={y} position={[0, y, front + 0.5]}>
            <mesh>
              <boxGeometry args={[width - 1, 0.15, 0.7]} />
              <meshStandardMaterial color={trim} />
            </mesh>
            <mesh position={[0, 0.5, 0.3]}>
              <boxGeometry args={[width - 1, 0.08, 0.08]} />
              <meshStandardMaterial color="#8b9590" />
            </mesh>
          </group>
        ))}
      {windows.map((w) => (
        <mesh key={`sill-${w.i}`} position={[w.x, w.y - 0.8, front + 0.14]}>
          <boxGeometry args={[1.4, 0.12, 0.3]} />
          <meshStandardMaterial color={trim} />
        </mesh>
      ))}
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
          <mesh key={x} position={[(x * width) / 18, 2.6, front + 0.3]}>
            <cylinderGeometry args={[(0.35 * width) / 18, (0.4 * width) / 18, 5.2, 12]} />
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
      <WorldText
        position={[0, 5.6, front + 0.34]}
        fontSize={0.62}
        maxWidth={width - 1.4}
        anchorX="center"
        anchorY="middle"
        color={locked ? '#b8a591' : neon}
        letterSpacing={0.04}
      >
        {name.toUpperCase()}
      </WorldText>

      {locked && (
        <group position={[0, 3.3, front + 0.12]}>
          <mesh>
            <boxGeometry args={[2.6, 0.8, 0.08]} />
            <meshStandardMaterial color="#d9c9a3" roughness={0.9} />
          </mesh>
          <WorldText
            position={[0, 0, 0.06]}
            fontSize={0.36}
            color="#7a1f1a"
            anchorX="center"
            anchorY="middle"
          >
            FOR SALE
          </WorldText>
        </group>
      )}

      {status === 'managed' && <Capo position={[-1.6, 0, front + 1.1]} seed={seed} />}

      {focused && (
        <mesh position={[0, 0.02, front + 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.5, 48]} />
          <meshBasicMaterial color={neon} transparent opacity={0.7} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

function Capo({ position, seed }: { position: [number, number, number]; seed: number }) {
  return (
    <group position={position}>
      <CharacterModel
        config={npcAppearance(seed+70)}
      />
    </group>
  )
}

export const Building = memo(BuildingImpl)

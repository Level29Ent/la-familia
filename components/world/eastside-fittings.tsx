'use client'

import { VintageCar } from './vintage-car'
import { WorldText } from './world-text'

// Displays stay inside the existing side-furniture collision zones; the central aisle stays clear.
export function EastsideFittings({ id }: { id: string }) {
  if (id === 'garage' || id === 'taxidepot')
    return (
      <group position={[4.7, 0.15, -1]}>
        <VintageCar
          position={[0, 0, 0]}
          color={id === 'garage' ? '#a63e3b' : '#e4b438'}
          kind={id === 'garage' ? 'roadster' : 'taxi'}
        />
        <WorldText position={[0, 2.6, -1.5]} fontSize={0.3} color="#ffe4ac">
          {id === 'garage' ? 'SERVICE & FAMILY MOTOR POOL' : 'CAB DISPATCH'}
        </WorldText>
      </group>
    )
  if (id === 'florist')
    return (
      <group>
        {[-2.5, -0.5, 1.5].map((z, i) => (
          <group key={z} position={[4.8, 0, z]}>
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.4, 0.25, 0.9, 8]} />
              <meshStandardMaterial color="#ac7454" />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 1.5, 6]} />
              <meshStandardMaterial color="#496b42" />
            </mesh>
            {[-0.3, 0, 0.3].map((x) => (
              <mesh key={x} position={[x, 1.9 - Math.abs(x), 0]}>
                <sphereGeometry args={[0.27, 8, 6]} />
                <meshStandardMaterial color={['#d67b96', '#e8bc6c', '#b98ecc'][i]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    )
  if (id === 'fishmarket' || id === 'grocer')
    return (
      <group>
        {[-2.5, -0.5, 1.5].map((z) => (
          <group key={z} position={[4.8, 0, z]}>
            <mesh position={[0, 0.65, 0]}>
              <boxGeometry args={[2, 1.3, 1.4]} />
              <meshStandardMaterial color="#718a88" />
            </mesh>
            {[-0.5, 0, 0.5].map((x, i) => (
              <mesh
                key={x}
                position={[x, 1.35, 0]}
                scale={id === 'fishmarket' ? [0.16, 0.1, 0.5] : [0.22, 0.22, 0.22]}
              >
                <sphereGeometry args={[1, 8, 6]} />
                <meshStandardMaterial
                  color={id === 'fishmarket' ? '#b8c8ca' : ['#bc5547', '#8fa45c', '#e2af5c'][i]}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    )
  if (id === 'warehouse')
    return (
      <group>
        {[-2, 0, 2].flatMap((z) =>
          [0.6, 1.8].map((y) => (
            <mesh key={`${z}-${y}`} position={[4.8, y, z]}>
              <boxGeometry args={[2, 1.15, 1.7]} />
              <meshStandardMaterial color="#a28555" />
            </mesh>
          )),
        )}
      </group>
    )
  if (id === 'jazz' || id === 'radio')
    return (
      <group position={[4.7, 0, -1]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[2.5, 0.4, 4]} />
          <meshStandardMaterial color="#433d4b" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 2.6, 8]} />
          <meshStandardMaterial color="#c6b88d" />
        </mesh>
        <mesh position={[0, 2.85, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#bbb4a5" />
        </mesh>
        <mesh position={[0, 1, -1.4]}>
          <boxGeometry args={[2, 1.3, 0.6]} />
          <meshStandardMaterial color={id === 'jazz' ? '#28252a' : '#677f78'} />
        </mesh>
        <WorldText position={[0, 3.3, -1.5]} fontSize={0.35} color="#edce88">
          {id === 'jazz' ? 'LIVE JAZZ' : 'ON AIR · WBLN'}
        </WorldText>
      </group>
    )
  return null
}

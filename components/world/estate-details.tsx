'use client'

import { WorldText } from './world-text'
import { ESTATES } from '@/lib/game/dynasty'

export function EstateDetails({ tier, exterior = false }: { tier: number; exterior?: boolean }) {
  const e = ESTATES[tier]
  if (exterior)
    return (
      <group>
        {tier < 0 || tier === 0 ? (
          <group>
            {[-2.6, 2.6].map((x) => (
              <group key={x} position={[x, 1.8, 4.6]} rotation={[0, 0, 0.2]}>
                {[-0.5, 0.5].map((y) => (
                  <mesh key={y} position={[0, y, 0]}>
                    <boxGeometry args={[2.6, 0.25, 0.12]} />
                    <meshStandardMaterial color="#8d704d" />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        ) : (
          <group>
            {[-4.5, 4.5].map((x) => (
              <group key={x}>
                <mesh position={[x, 1.7, 4.8]}>
                  <cylinderGeometry args={[0.18, 0.25, 3.4, 10]} />
                  <meshStandardMaterial color={e.trim} />
                </mesh>
                <mesh position={[x, 0.4, 6]}>
                  <boxGeometry args={[0.7, 0.8, 0.7]} />
                  <meshStandardMaterial color="#809263" />
                </mesh>
              </group>
            ))}
            <mesh position={[0, 3.6, 4.8]}>
              <boxGeometry args={[9.5, 0.25, 1.1]} />
              <meshStandardMaterial color={e.trim} />
            </mesh>
          </group>
        )}
        {tier >= 3 && (
          <group>
            {[-3, 0, 3].map((x) => (
              <mesh key={x} position={[x, 6, 4.55]}>
                <boxGeometry args={[0.15, 2, 0.15]} />
                <meshStandardMaterial color={e.trim} />
              </mesh>
            ))}
            <mesh position={[0, 5, 4.8]}>
              <boxGeometry args={[9, 0.12, 0.15]} />
              <meshStandardMaterial color={e.trim} />
            </mesh>
          </group>
        )}
        <WorldText position={[0, 8, 4.65]} fontSize={0.32} color={e?.trim ?? '#c9b18a'}>
          {e?.name ?? 'FOR SALE · $250'}
        </WorldText>
      </group>
    )
  return (
    <group>
      {tier === 0 ? (
        <group>
          <mesh position={[-4.7, 1.3, 0]}>
            <boxGeometry args={[0.2, 0.7, 2.5]} />
            <meshStandardMaterial color="#7a6a54" />
          </mesh>
          {[-2, 0, 2].map((z) => (
            <mesh key={z} position={[5, 0.15, z]}>
              <boxGeometry args={[1.3, 0.3, 0.8]} />
              <meshStandardMaterial color="#927957" />
            </mesh>
          ))}
        </group>
      ) : null}
      {tier >= 1 && (
        <WorldText position={[0, 3.7, -6.7]} fontSize={0.38} color={e.trim}>
          {e.name}
        </WorldText>
      )}
      {tier >= 2 &&
        [-4.2, 4.2].map((x) => (
          <mesh key={x} position={[x, 2.9, -6.75]}>
            <boxGeometry args={[1.6, 1.4, 0.08]} />
            <meshStandardMaterial color="#a8975c" metalness={0.5} />
          </mesh>
        ))}
      {tier >= 3 &&
        [-4.6, 4.6].map((x) => (
          <group key={x}>
            <mesh position={[x, 2.4, -5.8]}>
              <cylinderGeometry args={[0.25, 0.3, 4.8, 12]} />
              <meshStandardMaterial color="#e6dcc1" />
            </mesh>
            <mesh position={[x, 3.4, 0]}>
              <sphereGeometry args={[0.3, 10, 8]} />
              <meshStandardMaterial color="#e9d48b" emissive="#b58e38" emissiveIntensity={0.4} />
            </mesh>
          </group>
        ))}
      {tier === 4 && (
        <group position={[0, 4.25, 0]}>
          {[-0.8, 0, 0.8].map((x) => (
            <mesh key={x} position={[x, -Math.abs(x) * 0.3, 0]}>
              <sphereGeometry args={[0.16, 10, 8]} />
              <meshStandardMaterial color="#fae6a4" emissive="#e0bb5c" emissiveIntensity={0.8} />
            </mesh>
          ))}
          <mesh>
            <torusGeometry args={[0.85, 0.05, 6, 24]} />
            <meshStandardMaterial color="#e3bb56" metalness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  )
}

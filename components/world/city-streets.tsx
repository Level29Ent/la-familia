'use client'

import { memo } from 'react'
import { AVENUES, CROSS_STREETS } from '@/lib/game/city'
import { PARKED_VEHICLES } from '@/lib/game/vehicles'
import { VintageCar } from './vintage-car'
import { WorldText } from './world-text'

export const CityStreets = memo(function CityStreets() {
  return (
    <group>
      <mesh position={[54, -0.2, -36]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[210, 138]} />
        <meshStandardMaterial color="#89877b" />
      </mesh>
      {AVENUES.map((x) => (
        <group key={x}>
          <mesh position={[x, -0.02, -36]}>
            <boxGeometry args={[10, 0.12, 138]} />
            <meshStandardMaterial color="#41474b" />
          </mesh>
          {Array.from({ length: 18 }, (_, i) => (
            <mesh key={i} position={[x, 0.05, 24 - i * 7]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.18, 2.6]} />
              <meshBasicMaterial color="#e1c981" />
            </mesh>
          ))}
        </group>
      ))}
      {CROSS_STREETS.map((z, row) => (
        <group key={z}>
          <mesh position={[54, 0, z]}>
            <boxGeometry args={[210, 0.12, 10]} />
            <meshStandardMaterial color="#41474b" />
          </mesh>
          {AVENUES.map((x) => (
            <group key={x} position={[x, 0, z]}>
              {[-1, 1].map((side) => (
                <group key={side}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <mesh key={i} position={[-3.8 + i * 1.5, 0.08, side * 6]} rotation={[-Math.PI / 2, 0, 0]}>
                      <planeGeometry args={[0.75, 2]} />
                      <meshBasicMaterial color="#d9d4be" />
                    </mesh>
                  ))}
                </group>
              ))}
              <group position={[6.3, 0, 6.3]}>
                <mesh position={[0, 2.4, 0]}>
                  <cylinderGeometry args={[0.08, 0.12, 4.8, 6]} />
                  <meshStandardMaterial color="#334448" />
                </mesh>
                <mesh position={[0, 4.8, 0]}>
                  <sphereGeometry args={[0.25, 8, 8]} />
                  <meshBasicMaterial color="#ffe5af" />
                </mesh>
                <mesh position={[0, 3, 0]}>
                  <boxGeometry args={[3.6, 0.6, 0.1]} />
                  <meshStandardMaterial color="#264b3e" />
                </mesh>
                <WorldText position={[0, 3, 0.08]} fontSize={0.26} color="#f0e2b7">
                  {['Mulberry St', 'Union St', 'Canal St', 'Harbor St'][row]}
                </WorldText>
              </group>
            </group>
          ))}
        </group>
      ))}
      {PARKED_VEHICLES.map(({ x, z, kind, color }, i) => (
        <VintageCar key={i} position={[x, 0.15, z]} color={color} kind={kind} />
      ))}
      {/* Low-rise boundary landscaping, not fake inaccessible building shells. */}
      {Array.from({ length: 16 }, (_, i) => (
        <group key={i} position={[-46, 0, 22 - i * 8]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 2.4, 6]} />
            <meshStandardMaterial color="#57432e" />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <sphereGeometry args={[1.5, 8, 6]} />
            <meshStandardMaterial color="#517557" />
          </mesh>
        </group>
      ))}
      <mesh position={[54, -0.12, -106]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[210, 12]} />
        <meshStandardMaterial color="#468095" metalness={0.3} roughness={0.3} />
      </mesh>
    </group>
  )
})

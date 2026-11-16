'use client'

import {
  APARTMENT_BUILDINGS,
  SUITES,
  SUITE_TYPES,
  type ApartmentState,
  type SuiteState,
} from '@/lib/game/apartments'
import { WorldText } from './world-text'

type Point = [number, number, number]
function Box({
  at,
  size,
  color,
  metal = false,
}: {
  at: Point
  size: Point
  color: string
  metal?: boolean
}) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={metal ? 0.3 : 0.8}
        metalness={metal ? 0.6 : 0}
      />
    </mesh>
  )
}
function Plant({ at }: { at: Point }) {
  return (
    <group position={at}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.18, 0.6, 10]} />
        <meshStandardMaterial color="#b58962" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color="#6b9271" />
      </mesh>
    </group>
  )
}
export function SuiteFittings({ id, suite }: { id: string; suite?: SuiteState }) {
  const config = SUITES.find((c) => c.id === id)!
  const level = suite?.level ?? 0,
    color = SUITE_TYPES[config.type].color
  return (
    <group>
      {/* Furniture stays inside the existing blocked side/rear zones; center aisle is clear. */}
      <Box at={[-4.7, 0.5, -0.8]} size={[2.5, 1, 3.4]} color={color} />
      <Box at={[-5.8, 1.05, -0.8]} size={[0.3, 1.3, 3.5]} color={color} />
      {[-2.25, 0.6].map((z) => (
        <Box
          key={z}
          at={[-4.7, 0.9, z]}
          size={[2.4, 0.65, 0.25]}
          color={level === 2 ? '#dac9a5' : color}
        />
      ))}
      <Box at={[4.8, 0.45, -1]} size={[2.4, 0.8, 4]} color={level === 2 ? '#a18b5a' : '#4b3a2e'} />
      <Box at={[4.8, 0.95, -1]} size={[2.3, 0.25, 3.8]} color={level > 0 ? '#e9dfc8' : '#aeaa95'} />
      <Box at={[4.8, 1.15, -0.5]} size={[2.35, 0.15, 2.7]} color={color} />
      <Box at={[4.8, 1.2, -2.1]} size={[1.8, 0.2, 0.7]} color="#f2e8d9" />
      <Box at={[4.8, 1, -3]} size={[2.6, 1.8, 0.2]} color={level === 2 ? '#bca06b' : '#5e584c'} />
      <Box at={[0, 0.035, 2.3]} size={[2.65, 0.02, 5.6]} color={color} />
      {[-0.9, 0.9].map((x) => (
        <Box key={x} at={[x, 0.05, 2.3]} size={[0.04, 0.02, 5.2]} color="#e5d6ab" />
      ))}
      {/* Framed view and curtains above the rear kitchen. */}
      <Box at={[0, 3.2, -6.8]} size={[3.8, 2.3, 0.12]} color="#d1b889" />
      <Box at={[0, 3.2, -6.7]} size={[3.5, 2, 0.08]} color="#86aab7" />
      {[-1.3, -0.6, 0.3, 1.15].map((x, i) => (
        <Box
          key={x}
          at={[x, 2.7 + i * 0.1, -6.6]}
          size={[0.5, 0.9 + i * 0.2, 0.06]}
          color={i % 2 ? '#556c7b' : '#485b68'}
        />
      ))}
      <Box at={[0, 3.2, -6.5]} size={[0.06, 2, 0.05]} color="#eadac0" />
      {[-2.1, 2.1].map((x) => (
        <Box key={x} at={[x, 3.2, -6.5]} size={[0.5, 2.6, 0.12]} color={color} />
      ))}
      <WorldText position={[-4.7, 2.8, -4.8]} fontSize={0.25} color="#f6e4bb">
        {suite?.tenant ? 'WELCOME HOME' : 'YOUR NEXT CHAPTER'}
      </WorldText>
      {level > 0 && (
        <group>
          <Plant at={[-5.6, 0, -3.8]} />
          <Plant at={[5.7, 0, 1.4]} />
          <Box at={[-4.6, 2.9, -5]} size={[2.4, 1.5, 0.12]} color="#b9a16c" />
          <Box at={[-4.6, 2.9, -4.9]} size={[2.1, 1.2, 0.04]} color={color} />
          <mesh position={[-4.6, 2.9, -4.85]}>
            <circleGeometry args={[0.4, 20]} />
            <meshStandardMaterial color="#e2ca8d" />
          </mesh>
          <Box at={[4.7, 2.7, -5]} size={[2.7, 0.12, 0.65]} color="#b9a16c" />
          {[-0.8, -0.4, 0, 0.5].map((x, i) => (
            <Box
              key={x}
              at={[4.7 + x, 3, -5]}
              size={[0.22, 0.5 + (i % 2) * 0.2, 0.4]}
              color={['#8e5c50', '#7c9682', '#bca675', '#7c849b'][i]}
            />
          ))}
        </group>
      )}
      {level === 2 && (
        <group>
          <mesh position={[0, 4.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.7, 0.05, 8, 24]} />
            <meshStandardMaterial color="#d5b778" metalness={0.7} roughness={0.25} />
          </mesh>
          {[-0.6, 0.6].map((x) => (
            <mesh key={x} position={[x, 4.15, 0]}>
              <sphereGeometry args={[0.2, 10, 8]} />
              <meshStandardMaterial color="#fff0c2" emissive="#f5bf64" emissiveIntensity={0.6} />
            </mesh>
          ))}
          <Box at={[0, 1.53, -4]} size={[4.9, 0.05, 1.4]} color="#e4dfd0" />
        </group>
      )}
      {!!suite?.repairMs && (
        <WorldText position={[0, 2.7, -3.8]} fontSize={0.25} color="#f5cc70">
          MAINTENANCE IN PROGRESS
        </WorldText>
      )}
      {suite && suite.condition < 60 && (
        <group>
          {[-4.9, 4.9].map((x) => (
            <Box key={x} at={[x, 0.02, 1.6]} size={[0.6, 0.02, 0.5]} color="#9a8c71" />
          ))}
        </group>
      )}
    </group>
  )
}
export function ApartmentFrontages({ apartments }: { apartments: ApartmentState }) {
  return (
    <group>
      {APARTMENT_BUILDINGS.map((b) => {
        const suites = apartments.suites.filter(
          (s) => SUITES.find((c) => c.id === s.id)?.buildingId === b.id,
        )
        if (!suites.length) return null
        const leased = suites.filter((s) => s.tenant).length
        return (
          <group key={b.id} position={b.position} rotation={[0, b.rotationY, 0]}>
            <Box at={[3.5, 2.3, 4.7]} size={[2.2, 1.2, 0.15]} color="#293d38" />
            <WorldText position={[3.5, 2.5, 4.8]} fontSize={0.18} color="#f0d491">
              BELLINI SUITES
            </WorldText>
            <WorldText
              position={[3.5, 2.1, 4.8]}
              fontSize={0.17}
              color="#d9e6ce"
            >{`${leased}/3 LEASED`}</WorldText>
            <Plant at={[-3.7, 0, 4.9]} />
            <Plant at={[3.7, 0, 4.9]} />
            {suites.map((s) => {
              const c = SUITES.find((c) => c.id === s.id)!,
                y = 4 + c.type * 2.4
              return (
                <group key={s.id} position={[0, y, 4.7]}>
                  <mesh>
                    <boxGeometry args={[2.7, 1.8, 0.1]} />
                    <meshStandardMaterial
                      color={s.tenant ? '#eac87f' : '#6b8890'}
                      emissive={s.tenant ? '#c38b35' : '#19282c'}
                      emissiveIntensity={s.tenant ? 0.4 : 0.05}
                    />
                  </mesh>
                  <Box at={[0, 0, 0.1]} size={[0.08, 1.8, 0.08]} color="#504a3e" />
                  {s.level > 0 && (
                    <group>
                      <Box at={[0, -1, 0.5]} size={[3.2, 0.15, 1]} color="#b1a28a" />
                      <Box at={[0, -0.45, 0.95]} size={[3.2, 0.08, 0.08]} color="#373e3d" />
                      {[-1.4, -0.7, 0, 0.7, 1.4].map((x) => (
                        <Box
                          key={x}
                          at={[x, -0.7, 0.95]}
                          size={[0.05, 0.5, 0.05]}
                          color="#373e3d"
                        />
                      ))}
                    </group>
                  )}
                </group>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

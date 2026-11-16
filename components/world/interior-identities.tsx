'use client'

import { memo } from 'react'
import { WorldText } from './world-text'
import type { CityBuilding } from '@/lib/game/city'
function Box({
  at,
  size,
  color,
}: {
  at: [number, number, number]
  size: [number, number, number]
  color: string
}) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}
export const InteriorIdentity = memo(function InteriorIdentity({ building }: { building: CityBuilding }) {
  const b = building,
    id = b.id,
    apartment = /Apartments|Towers/.test(b.name)
  // Displays occupy side-furniture zones, not the shared central walkable aisle.
  return (
    <group>
      {b.kind === 'home' && apartment && (
        <group position={[-4.8, 1.8, -4]}>
          <Box at={[0, 0, 0]} size={[2.4, 1.8, 0.25]} color="#645c4b" />
          {Array.from({ length: 12 }, (_, i) => (
            <Box
              key={i}
              at={[((i % 3) - 1) * 0.7, 0.65 - Math.floor(i / 3) * 0.43, 0.2]}
              size={[0.58, 0.32, 0.1]}
              color="#b8a67c"
            />
          ))}
          <WorldText position={[0, 1.2, 0.2]} fontSize={0.22} color="#efddac">
            RESIDENT MAIL · SHARED LOBBY
          </WorldText>
        </group>
      )}
      {b.kind === 'home' && !apartment && (
        <group position={[6.75, 2.6, -2]} rotation={[0,-Math.PI/2,0]}>
          <Box at={[0, 0, 0]} size={[1.8, 1.2, 0.15]} color="#c5a665" />
          <Box at={[0, 0, 0.09]} size={[1.6, 1, 0.05]} color="#6e8673" />
          <WorldText position={[0, -0.9, 0.2]} fontSize={0.19} color="#f0dba6">
            HOME & FAMILY
          </WorldText>
        </group>
      )}
      {/bakery|diner/.test(id) && (
        <group position={[-4.7, 0, -1]}>
          {[-2, 0, 2].map((z) => (
            <group key={z}>
              <Box at={[0, 0.9, z]} size={[2.2, 0.15, 1.2]} color="#c5b89a" />
              {[-0.6, 0, 0.6].map((x) => (
                <mesh key={x} position={[x, 1.1, z]} scale={[0.25, 0.12, 0.17]}>
                  <sphereGeometry args={[1, 10, 8]} />
                  <meshStandardMaterial color="#c89b51" />
                </mesh>
              ))}
            </group>
          ))}
          <WorldText position={[0, 2.3, -2]} fontSize={0.23} color="#ecd4a7">
            FRESH BREAD · COFFEE
          </WorldText>
        </group>
      )}
      {/casino|numbers/.test(id) && (
        <group position={[4.7, 0, -1]}>
          <Box at={[0, 0.9, 0]} size={[2.2, 0.2, 3.2]} color="#39614b" />
          {[-0.6, 0, 0.6].map((x) => (
            <Box key={x} at={[x, 1.02, 0]} size={[0.2, 0.04, 0.3]} color="#e5ddc2" />
          ))}
          <WorldText position={[0, 2.2, -1.2]} fontSize={0.24} color="#edd18a">
            PRIVATE TABLES
          </WorldText>
        </group>
      )}
      {/tailor/.test(id) && (
        <group position={[-4.8, 0, -1]}>
          <Box at={[0, 1.8, 0]} size={[2.5, 0.07, 0.07]} color="#c4b17e" />
          {[-0.8, 0, 0.8].map((x, i) => (
            <group key={x}>
              <Box at={[x, 1.2, 0]} size={[0.55, 0.9, 0.15]} color={['#3a4a5f', '#7d5956', '#8a927c'][i]} />
              <Box at={[x, 1.7, 0]} size={[0.7, 0.08, 0.08]} color="#b7a475" />
            </group>
          ))}
        </group>
      )}
      {/cinema/.test(id) && (
        <group position={[4.7, 1.9, -2]}>
          <Box at={[0, 0, 0]} size={[2, 2.4, 0.12]} color="#ae9255" />
          <Box at={[0, 0, 0.08]} size={[1.8, 2.2, 0.05]} color="#473f58" />
          <WorldText position={[0, 0.4, 0.15]} fontSize={0.3} color="#f0dcb5">
            TONIGHT
          </WorldText>
          <WorldText position={[0, -0.2, 0.15]} fontSize={0.2} color="#f0dcb5">
            THE SILVER CITY
          </WorldText>
        </group>
      )}
      {b.theme === 'office' && (
        <group position={[-4.8, 0, -2]}>
          {[-0.7, 0.7].map((x) => (
            <group key={x}>
              <Box at={[x, 1.1, 0]} size={[0.9, 2.2, 0.8]} color="#687675" />
              {[0.4, 1.1, 1.8].map((y) => (
                <Box key={y} at={[x, y, 0.43]} size={[0.3, 0.05, 0.08]} color="#c2b28d" />
              ))}
            </group>
          ))}
        </group>
      )}
      {/pharmacy/.test(id) && (
        <WorldText position={[4.8, 2.5, -2]} fontSize={0.28} color="#d5ead6">
          APOTHECARY · REMEDIES
        </WorldText>
      )}
    </group>
  )
})

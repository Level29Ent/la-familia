'use client'

import { WorldText } from './world-text'
import { MARKET_BUSINESSES } from '@/lib/game/config'
import { CITY_BUILDINGS } from '@/lib/game/city'
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
export function MarketFittings({ id }: { id: string }) {
  return (
    <group>
      {id === 'coffeehouse' && (
        <group position={[-4.7, 0, -1]}>
          <Box at={[0, 0.9, 0]} size={[2.4, 1.8, 3.5]} color="#685345" />
          <Box at={[0, 1.85, 0]} size={[2.5, 0.15, 3.7]} color="#c9b28a" />
          <Box at={[0, 2.3, -0.8]} size={[1.6, 0.8, 0.9]} color="#a8b6af" />
          {[-0.5, 0.5].map((x) => (
            <mesh key={x} position={[x, 2.2, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.18, 12]} />
              <meshStandardMaterial color="#343e3c" />
            </mesh>
          ))}
          {[-0.7, 0, 0.7].map((x) => (
            <group key={x} position={[x, 2.05, 1]}>
              <mesh>
                <cylinderGeometry args={[0.16, 0.12, 0.25, 10]} />
                <meshStandardMaterial color="#f1e4c6" />
              </mesh>
              <mesh position={[0.17, 0, 0]}>
                <torusGeometry args={[0.08, 0.025, 6, 10]} />
                <meshStandardMaterial color="#f1e4c6" />
              </mesh>
            </group>
          ))}
          <WorldText position={[0, 3.1, 0]} fontSize={0.25} color="#efd7a5">
            ESPRESSO · EVERYONE HAS A STORY
          </WorldText>
        </group>
      )}
      {id === 'barbershop' && (
        <group position={[4.7, 0, -1]}>
          <Box at={[0, 0.55, 0]} size={[1.6, 0.7, 1.8]} color="#633f38" />
          <Box at={[0, 1.25, -0.7]} size={[1.6, 1.4, 0.3]} color="#633f38" />
          {[-0.9, 0.9].map((x) => (
            <Box key={x} at={[x, 1, 0]} size={[0.2, 0.2, 1.7]} color="#b6aa90" />
          ))}
          <Box at={[0, 2.6, -3.8]} size={[2.3, 2.3, 0.15]} color="#ba9a61" />
          <Box at={[0, 2.6, -3.68]} size={[2, 2, 0.08]} color="#a7c2c6" />
          <WorldText position={[0, 4.1, -3.6]} fontSize={0.25} color="#f5dbab">
            CROWN & COMB · EST. 1931
          </WorldText>
        </group>
      )}
      {id === 'furniture' && (
        <group>
          <Box at={[-4.7, 0.7, 0]} size={[2.3, 1.4, 3.4]} color="#a58c6b" />
          <Box at={[-5.8, 1.4, 0]} size={[0.25, 1.4, 3.4]} color="#927554" />
          <Box at={[4.7, 1.1, -1]} size={[2.5, 2.2, 1.1]} color="#715540" />
          {[0.4, 1.1, 1.8].map((y) => (
            <group key={y}>
              <Box at={[4.7, y, -0.4]} size={[2.2, 0.5, 0.08]} color="#9c7b53" />
              <Box at={[4.7, y, -0.32]} size={[0.5, 0.06, 0.1]} color="#c7af7d" />
            </group>
          ))}
          <WorldText position={[4.7, 3, -1]} fontSize={0.25} color="#f5dbab">
            RESTORE · REPAIR · REIMAGINE
          </WorldText>
        </group>
      )}
      {id === 'courieroffice' && (
        <group position={[4.8, 0, -1]}>
          <Box at={[0, 1.7, -2]} size={[2.5, 3.4, 0.2]} color="#3c555b" />
          {Array.from({ length: 9 }, (_, i) => (
            <group key={i} position={[((i % 3) - 1) * 0.75, 0.5 + Math.floor(i / 3) * 0.9, 0]}>
              <Box at={[0, 0, 0]} size={[0.65, 0.6, 1]} color={i % 2 ? '#b89566' : '#d0b78b'} />
              <Box at={[0, 0, 0.51]} size={[0.3, 0.15, 0.02]} color="#f3dfbc" />
            </group>
          ))}
          <WorldText position={[0, 3.8, -1.8]} fontSize={0.25} color="#f5dbab">
            CITY EXPRESS · SPECIAL DELIVERY
          </WorldText>
        </group>
      )}
    </group>
  )
}
export function GardenMarketFronts() {
  return (
    <group>
      {MARKET_BUSINESSES.map((business, i) => {
        const b = CITY_BUILDINGS.find((b) => b.id === business.id)!
        return (
          <group key={b.id} position={b.position} rotation={[0, b.rotationY, 0]}>
            <Box
              at={[0, 3.4, 5.1]}
              size={[6, 0.18, 1.5]}
              color={['#658b74', '#9f6359', '#aa986c', '#607c9d'][i]}
            />
            {[-2.7, 2.7].map((x) => (
              <Box key={x} at={[x, 1.7, 5.6]} size={[0.07, 3.4, 0.07]} color="#b6a17c" />
            ))}
            <WorldText position={[0, 2.9, 5.9]} fontSize={0.22} color="#ffe7b0">
              {['COFFEE & COMMUNITY', 'A FRESH START', 'MADE TO LAST', 'THE CITY NEVER STOPS'][i]}
            </WorldText>
          </group>
        )
      })}
    </group>
  )
}

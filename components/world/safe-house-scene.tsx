'use client'

import { useMemo } from 'react'
import { goodLifeRoomNavigation } from '@/lib/game/good-life'
import { GoodLifeRoom } from './good-life-displays'
import { Canvas } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { cashBundleCount, VAULT_TIERS, type SafeHouseState } from '@/lib/game/safe-house'
import type { CharacterConfig } from '@/lib/game/character'
import { decorItem, type DecorState } from '@/lib/game/decor'
import { ROOM_NAVIGATION } from '@/lib/game/navigation'
import { PlayerControls } from './player-controls'

type Point = [number, number, number]
function Box({ at, size, color, metal = false }: { at: Point; size: Point; color: string; metal?: boolean }) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metal ? 0.65 : 0.05} roughness={metal ? 0.3 : 0.8} />
    </mesh>
  )
}
function Label({ at, children, size = 0.22 }: { at: Point; children: string; size?: number }) {
  return (
    <Text font="/fonts/Geist-Regular.ttf" position={at} fontSize={size} color="#e8cf98" anchorX="center">
      {children}
    </Text>
  )
}

export function SafeHouseScene({
  decor,
  assets,
  safeHouse,
  character,
  enabled,
  vaultOpen,
  onFocusChange,
}: {
  decor: DecorState
  assets: string[]
  safeHouse: SafeHouseState
  character: CharacterConfig
  enabled: boolean
  vaultOpen: boolean
  onFocusChange: (id: string | null) => void
}) {
  const wardrobeOwned = assets.includes('wardrobe')
  const navigation = useMemo(
    () => goodLifeRoomNavigation(wardrobeOwned ? ['wardrobe'] : [], ROOM_NAVIGATION),
    [wardrobeOwned],
  )
  const wall = decorItem(decor, 'walls').color
  const sofa = decorItem(decor, 'sofa').color
  const rug = decorItem(decor, 'rug').color
  const light = decorItem(decor, 'lighting').color
  const bundleCount = cashBundleCount(safeHouse.balance, VAULT_TIERS[safeHouse.tier].capacity)
  const accent = decor.equipped.decoration
  return (
    <Canvas
      className="absolute inset-0 touch-none"
      dpr={[1, 1.5]}
      camera={{ fov: 70, near: 0.1, far: 50 }}
      aria-label="Walkable 3D safe house lounge with a vault and street exit"
    >
      <color attach="background" args={['#19252b']} />
      <ambientLight intensity={1.25} color="#d2d8df" />
      <hemisphereLight args={['#ffe3b0', '#493323', 1.2]} />
      <pointLight position={[0, 4.2, 0]} color={light} intensity={38} distance={18} />
      <pointLight position={[-5, 2.4, -3]} color={light} intensity={15} distance={9} />
      <Box at={[0, -0.12, 0]} size={[14, 0.2, 14]} color="#604736" />
      {Array.from({ length: 15 }, (_, i) => (
        <Box key={i} at={[-7 + i, 0, 0]} size={[0.025, 0.015, 14]} color="#302b27" />
      ))}
      <Box at={[0, 4.8, 0]} size={[14, 0.2, 14]} color="#242c2c" />
      <Box at={[0, 2.4, -7]} size={[14, 4.8, 0.2]} color={wall} />
      <Box at={[-7, 2.4, 0]} size={[0.2, 4.8, 14]} color={wall} />
      <Box at={[7, 2.4, 0]} size={[0.2, 4.8, 14]} color={wall} />
      <Box at={[0, 2.4, 7]} size={[14, 4.8, 0.2]} color={wall} />
      {[-6.8, 6.8].map((x) => (
        <group key={x}>
          <Box at={[x, 0.5, 0]} size={[0.12, 1, 14]} color="#29302a" />
          <Box at={[x, 1.05, 0]} size={[0.15, 0.07, 14]} color="#aa8c52" metal />
          <Box at={[x, 4.4, 0]} size={[0.15, 0.12, 14]} color="#aa8c52" metal />
        </group>
      ))}
      {[-6.8, 6.8].map((z) => (
        <group key={z}>
          <Box at={[0, 0.5, z]} size={[14, 1, 0.12]} color="#29302a" />
          <Box at={[0, 1.05, z]} size={[14, 0.07, 0.15]} color="#aa8c52" metal />
          <Box at={[0, 4.4, z]} size={[14, 0.12, 0.15]} color="#aa8c52" metal />
        </group>
      ))}
      {/* A rug marks the clear central route from the entry door to the vault. */}
      <Box at={[0, 0.015, 0]} size={[2.3, 0.025, 10]} color={rug} />
      {[-1.05, 1.05].map((x) => (
        <Box key={x} at={[x, 0.035, 0]} size={[0.035, 0.01, 9.8]} color="#b79760" />
      ))}
      {/* Leather lounge and coffee table, aligned with navigation collision bounds. */}
      <Box at={[-5.2, 0.5, 0]} size={[1.8, 0.6, 3.6]} color={sofa} />
      <Box at={[-6.1, 1, 0]} size={[0.35, 1.1, 3.6]} color={sofa} />
      {[-1.7, 1.7].map((z) => (
        <Box key={z} at={[-5.2, 0.9, z]} size={[1.9, 0.45, 0.3]} color={sofa} />
      ))}
      <Box at={[-2.4, 0.6, 0]} size={[1.4, 0.16, 2.2]} color="#362921" />
      {[-2.9, -1.9].flatMap((x) =>
        [-0.8, 0.8].map((z) => (
          <Box key={`${x}-${z}`} at={[x, 0.3, z]} size={[0.08, 0.6, 0.08]} color="#b2955d" metal />
        )),
      )}
      <Box at={[-2.4, 0.72, 0]} size={[0.55, 0.08, 0.7]} color="#c3a575" />
      {/* Writing desk, lamp, and family portrait. */}
      <Box at={[3.8, 1.1, 2]} size={[3.1, 0.18, 1.5]} color="#50362b" />
      {[-1.2, 1.2].flatMap((x) =>
        [-0.5, 0.5].map((z) => (
          <Box key={`${x}-${z}`} at={[3.8 + x, 0.55, 2 + z]} size={[0.12, 1.1, 0.12]} color="#a18552" metal />
        )),
      )}
      <Box at={[4.7, 1.45, 2]} size={[0.06, 0.7, 0.06]} color="#c7a459" metal />
      <mesh position={[4.7, 1.85, 2]}>
        <coneGeometry args={[0.35, 0.35, 24]} />
        <meshStandardMaterial color="#e2c792" emissive="#b07c36" emissiveIntensity={0.35} />
      </mesh>
      <group position={[6.85, 2.6, -2]} rotation={[0, -Math.PI / 2, 0]}>
        <Box at={[0, 0, 0]} size={[3.2, 2.5, 0.1]} color="#b29661" metal />
        <Box at={[0, 0, 0.07]} size={[3, 2.3, 0.05]} color="#0d2235" />
        {[-1, -0.3, 0.4, 1].map((x, i) => (
          <Box key={x} at={[x, -0.5 + (i % 2) * 0.2, 0.11]} size={[0.5, 1.2, 0.04]} color="#435468" />
        ))}
        <Box at={[0, 0, 0.14]} size={[0.07, 2.4, 0.05]} color="#baa16e" />
        <Box at={[0, 0, 0.14]} size={[3.1, 0.07, 0.05]} color="#baa16e" />
      </group>
      <group position={[-5, 0, -3.8]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 2.4, 12]} />
          <meshStandardMaterial color="#b8985b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 2.5, 0]}>
          <coneGeometry args={[0.55, 0.6, 24]} />
          <meshStandardMaterial color="#ead0a0" emissive="#c89754" emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* Vault front with a hinged steel door and banded banknote stacks behind it. */}
      <group position={[0, 0, -6]}>
        <Box at={[0, 1.65, -0.55]} size={[3.5, 3.3, 0.3]} color="#171e22" metal />
        {[-1.65, 1.65].map((x) => (
          <Box key={x} at={[x, 1.65, 0]} size={[0.2, 3.3, 1.4]} color="#171e22" metal />
        ))}
        {[0.1, 3.2].map((y) => (
          <Box key={y} at={[0, y, 0]} size={[3.5, 0.2, 1.4]} color="#171e22" metal />
        ))}
        <Box at={[0, 1.65, 0.3]} size={[3.1, 2.95, 0.1]} color="#070e12" />
        {Array.from({ length: bundleCount }, (_, i) => {
          const x = ((i % 3) - 1) * 0.85
          const y = 0.45 + Math.floor(i / 3) * 0.22
          return (
            <group key={i} position={[x, y, 0.53]}>
              <Box at={[0, 0, 0]} size={[0.7, 0.17, 0.34]} color="#c1c9a5" />
              {[-0.055, 0, 0.055].map((line) => (
                <Box key={line} at={[0, line, 0.173]} size={[0.68, 0.008, 0.006]} color="#697c5c" />
              ))}
              <Box at={[0, 0.09, 0]} size={[0.66, 0.015, 0.3]} color="#4f785c" />
              <Box at={[0, 0.105, 0]} size={[0.16, 0.02, 0.35]} color="#e8ddbd" />
              <Box at={[0, 0, 0.18]} size={[0.16, 0.18, 0.025]} color="#e8ddbd" />
            </group>
          )
        })}
        <group position={[-1.55, 0, 0.85]} rotation={[0, vaultOpen ? -Math.PI * 0.65 : 0, 0]}>
          <Box at={[1.55, 1.65, 0]} size={[3.05, 2.9, 0.2]} color="#4b5e62" metal />
          <mesh position={[1.55, 1.65, 0.18]}>
            <torusGeometry args={[0.5, 0.06, 8, 32]} />
            <meshStandardMaterial color="#c6c4ae" metalness={0.8} />
          </mesh>
          <Box at={[1.55, 1.65, 0.18]} size={[1, 0.06, 0.06]} color="#c6c4ae" metal />
          <Box at={[1.55, 1.65, 0.18]} size={[0.06, 1, 0.06]} color="#c6c4ae" metal />
          <Label at={[1.55, 2.7, 0.14]} size={0.16}>
            BELLINI PRIVATE RESERVE
          </Label>
        </group>
      </group>
      <Label at={[0, 3.8, -5.2]} size={0.3}>
        THE FAMILY VAULT
      </Label>
      <group position={[0, 0, 6.8]} rotation={[0, Math.PI, 0]}>
        <Box at={[0, 1.45, 0]} size={[1.8, 2.9, 0.12]} color="#60402d" />
        <Box at={[0.6, 1.4, 0.12]} size={[0.1, 0.25, 0.1]} color="#cdb472" metal />
        <Label at={[0, 3.2, 0.1]}>EXIT TO LITTLE ITALY</Label>
      </group>
      {accent === 'accent-art' && (
        <group position={[-4.4, 2.7, -6.75]}>
          {[-0.85, 0, 0.85].map((x, i) => (
            <group key={x} position={[x, 0, 0]}>
              <Box at={[0, 0, 0]} size={[0.72, 1.5, 0.12]} color="#cfb16e" metal />
              <Box at={[0, 0, 0.08]} size={[0.59, 1.36, 0.04]} color={i % 2 ? '#285c60' : '#712f46'} />
              <mesh position={[0, 0, 0.12]} rotation={[0, 0, Math.PI / 4]}>
                <planeGeometry args={[0.32, 0.65]} />
                <meshStandardMaterial color="#e2c383" metalness={0.5} />
              </mesh>
            </group>
          ))}
        </group>
      )}
      {accent === 'accent-clock' && (
        <group position={[-4.4, 2.8, -6.7]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.16, 48]} />
            <meshStandardMaterial color="#c6a65d" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <circleGeometry args={[0.68, 48]} />
            <meshStandardMaterial color="#ede1ba" />
          </mesh>
          <Box at={[0, 0.2, 0.13]} size={[0.035, 0.42, 0.03]} color="#222b2e" />
          <Box at={[0.18, 0, 0.13]} size={[0.4, 0.035, 0.03]} color="#222b2e" />
          <Label at={[0, -1.15, 0.1]} size={0.18}>
            THE DON'S TIME
          </Label>
        </group>
      )}
      <GoodLifeRoom assets={assets} />
      <PlayerControls
        assets={assets.filter((id) => id !== 'sedan')}
        character={character}
        enabled={enabled}
        navigation={navigation}
        onFocusChange={onFocusChange}
      />
    </Canvas>
  )
}

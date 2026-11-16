'use client'

import { memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneUnavailable } from '@/components/game/scene-boundary'
import { INTERIOR_NAVIGATION, type CityBuilding } from '@/lib/game/city'
import type { CharacterConfig } from '@/lib/game/character'
import { npcAppearance, appearanceSeed } from '@/lib/game/npc-appearance'
import { PlayerControls } from './player-controls'
import { CharacterModel } from './character-model'
import { useSurfaceTexture } from './surface-texture'
import { InteriorIdentity } from './interior-identities'
import { InteriorFinishes } from './architectural-details'
import { EastsideFittings } from './eastside-fittings'
import { WorldText } from './world-text'

type Point = [number, number, number]
function Box({ at, size, color }: { at: Point; size: Point; color: string }) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}
function Shelf({ x }: { x: number }) {
  return (
    <group position={[x, 0, -1]}>
      <Box at={[0, 1.5, 0]} size={[2.2, 3, 0.8]} color="#493d33" />
      {[0.8, 1.6, 2.4].map((y) => (
        <group key={y}>
          <Box at={[0, y, 0.5]} size={[2.3, 0.08, 1]} color="#c0a378" />
          {[-0.7, 0, 0.7].map((z, i) => (
            <Box
              key={z}
              at={[z, y + 0.25, 0.4]}
              size={[0.4, 0.45, 0.4]}
              color={['#a4b99d', '#d8b178', '#997378'][i]}
            />
          ))}
        </group>
      ))}
    </group>
  )
}
export const BuildingInterior = memo(function BuildingInterior({
  building,
  character,
  enabled,
  onFocusChange,
}: {
  building: CityBuilding
  character: CharacterConfig
  enabled: boolean
  onFocusChange: (id: string | null) => void
}) {
  const floorTexture = useSurfaceTexture(
    building.theme === 'home' || building.theme === 'bar' ? 'wood' : 'tile',
    3,
    3,
  )
  const home = building.theme === 'home',
    bar = building.theme === 'bar',
    workshop = building.theme === 'workshop'
  return (
    <Canvas
      frameloop={enabled ? 'always' : 'demand'}
      className="absolute inset-0 touch-none"
      fallback={<SceneUnavailable />}
      dpr={[1, 1.5]}
      camera={{ fov: 70, near: 0.1, far: 60 }}
      aria-label={`Walkable interior of ${building.name}`}
    >
      <InteriorFinishes theme={building.theme} />
      <InteriorIdentity building={building} />
      <color attach="background" args={['#4c5756']} />
      <ambientLight intensity={1.8} />
      <hemisphereLight args={['#fff1cf', '#766657', 1.8]} />
      <pointLight position={[0, 4.5, 0]} intensity={35} distance={20} color="#ffdfb0" />
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[14, 0.2, 14]} />
        <meshStandardMaterial map={floorTexture} color={workshop ? '#77796f' : '#866a50'} roughness={0.7} />
      </mesh>
      <Box at={[0, 4.9, 0]} size={[14, 0.2, 14]} color="#e0d0b0" />
      <Box at={[0, 2.4, -7]} size={[14, 4.8, 0.2]} color={building.color} />
      {[-7, 7].map((x) => (
        <Box key={x} at={[x, 2.4, 0]} size={[0.2, 4.8, 14]} color={building.color} />
      ))}
      {[-4.2, 4.2].map((x) => (
        <Box key={x} at={[x, 2.4, 7]} size={[5.6, 4.8, 0.2]} color={building.color} />
      ))}
      <Box at={[0, 4.3, 7]} size={[2.8, 1.1, 0.2]} color={building.color} />
      <mesh position={[0, 1.7, 6.98]}>
        <planeGeometry args={[2.8, 3.4]} />
        <meshBasicMaterial color="#9fc4d0" />
      </mesh>
      <WorldText position={[0, 3.7, 6.8]} rotation={[0, Math.PI, 0]} fontSize={0.4} color="#fff1c7">
        EXIT · E
      </WorldText>
      <Box at={[0, 0.015, 2.4]} size={[2.8, 0.03, 6]} color={home ? '#8b4042' : '#4e625b'} />
      <WorldText position={[0, 3.8, -6.8]} fontSize={0.44} maxWidth={11} color="#fff0c0">
        {building.name}
      </WorldText>
      <WorldText position={[0, 3.05, -6.8]} fontSize={0.24} color="#eedfc8">
        {building.kind === 'headquarters'
          ? 'FAMILY COUNCIL · NEGOTIATE OR CHALLENGE'
          : home
            ? 'WELCOME HOME · REST AND RECOVER'
            : 'OPEN FOR BUSINESS · SPEAK TO THE PROPRIETOR'}
      </WorldText>
      {building.kind === 'safehouse' ? (
        <group>
          <Box at={[-4.7, 0.15, 0]} size={[2, 0.3, 3]} color="#7e7461" />
          <Box at={[4.7, 0.5, -1]} size={[1.5, 1, 1.5]} color="#88775c" />
          <WorldText position={[0, 2.8, -6.7]} fontSize={0.32} color="#efd49e">
            ABANDONED · FOR SALE · $250
          </WorldText>
        </group>
      ) : home ? (
        <group>
          <Box at={[-4.7, 0.6, -0.8]} size={[2.4, 1.2, 3.4]} color="#657a6f" />
          <Box at={[-5.8, 1.2, -0.8]} size={[0.3, 1.4, 3.5]} color="#44554c" />
          <Box at={[4.8, 0.45, -1]} size={[2.4, 0.8, 4]} color="#4b3a2e" />
          <Box at={[4.8, 0.95, -1]} size={[2.3, 0.25, 3.8]} color="#d5c39e" />
          <Box at={[4.8, 1.2, -2.1]} size={[1.8, 0.2, 0.7]} color="#e9e3d3" />
        </group>
      ) : (
        <group>
          {!/bakery|diner|tailor/.test(building.id)&&building.theme!=='office'&&<Shelf x={-4.8} />}
          {['garage', 'taxidepot', 'florist', 'fishmarket', 'grocer', 'warehouse', 'jazz', 'radio'].includes(
            building.id,
          ) ? (
            <EastsideFittings id={building.id} />
          ) : /casino|numbers|cinema/.test(building.id) ? null : bar ? (
            <group>
              {[-2, 0, 2].map((z) => (
                <mesh key={z} position={[4.7, 0.6, z]}>
                  <cylinderGeometry args={[0.65, 0.4, 1.2, 12]} />
                  <meshStandardMaterial color="#674845" />
                </mesh>
              ))}
            </group>
          ) : workshop ? (
            <group>
              {[-2, 0, 2].map((z) => (
                <group key={z}>
                  <Box at={[4.8, 0.8, z]} size={[2.3, 1.6, 1.6]} color="#4b6267" />
                  <mesh position={[4.8, 1.65, z]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.4, 0.12, 8, 12]} />
                    <meshStandardMaterial color="#283236" />
                  </mesh>
                </group>
              ))}
            </group>
          ) : (
            <Shelf x={4.8} />
          )}
        </group>
      )}
      <Box at={[0, 0.7, -4]} size={[4.7, 1.4, 1.2]} color={bar ? '#6b4432' : '#5f5040'} />
      <Box at={[0, 1.45, -4]} size={[4.9, 0.12, 1.4]} color="#c3a776" />
      {building.kind === 'headquarters' && (
        <WorldText
          position={[0, 2.5, -5.5]}
          fontSize={0.28}
          color="#e1bc76"
        >{`Don ${building.family === 'moretti' ? 'Moretti' : building.family === 'volkov' ? 'Volkov' : 'Doyle'}`}</WorldText>
      )}
      <group position={[0, 0, -5.5]}>
        <CharacterModel config={npcAppearance(appearanceSeed(building.id))} />
      </group>
      <PlayerControls
        enabled={enabled}
        navigation={INTERIOR_NAVIGATION}
        character={character}
        onFocusChange={onFocusChange}
      />
    </Canvas>
  )
})

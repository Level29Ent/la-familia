'use client'

import { Text } from '@react-three/drei'

type Point = [number, number, number]
function Box({ at, size, color, metal = false }: { at: Point; size: Point; color: string; metal?: boolean }) {
  return (
    <mesh position={at}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={metal ? 0.65 : 0.05} roughness={metal ? 0.3 : 0.8} />
    </mesh>
  )
}
function Label({ at, children, size = 0.18 }: { at: Point; children: string; size?: number }) {
  return (
    <Text font="/fonts/Geist-Regular.ttf" position={at} fontSize={size} color="#f4d99c" anchorX="center">
      {children}
    </Text>
  )
}
function Painting({ at, variant = 0 }: { at: Point; variant?: number }) {
  return (
    <group position={at}>
      <Box at={[0, 0, 0]} size={[1.5, 1.25, 0.12]} color="#c6a366" metal />
      <Box at={[0, 0, 0.08]} size={[1.32, 1.07, 0.04]} color={variant % 2 ? '#426372' : '#7d5660'} />
      <mesh position={[0.34, 0.24, 0.12]}>
        <circleGeometry args={[0.15, 24]} />
        <meshStandardMaterial color="#e5cf92" />
      </mesh>
      <mesh position={[-0.16, -0.18, 0.13]}>
        <circleGeometry args={[0.48, 3]} />
        <meshStandardMaterial color={variant % 2 ? '#315440' : '#384c65'} />
      </mesh>
      <Box at={[0, -0.38, 0.16]} size={[1.28, 0.22, 0.03]} color="#1c3440" />
    </group>
  )
}
function Watch() {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 32]} />
        <meshStandardMaterial color="#d8b458" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[0.13, 32]} />
        <meshStandardMaterial color="#eee4c5" />
      </mesh>
      <Box at={[0, 0.04, 0.045]} size={[0.012, 0.1, 0.01]} color="#282723" />
      <Box at={[0.03, 0, 0.045]} size={[0.08, 0.012, 0.01]} color="#282723" />
    </group>
  )
}
function Yacht({ miniature = false }: { miniature?: boolean }) {
  return (
    <group scale={miniature ? 0.12 : 1}>
      <mesh position={[0, 0.65, 0]} scale={[1.5, 0.65, 5]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshStandardMaterial color="#e8dfc6" roughness={0.45} />
      </mesh>
      <Box at={[0, 1.15, 0]} size={[2.4, 0.15, 7.5]} color="#a48151" />
      <Box at={[0, 1.7, -0.4]} size={[1.9, 1, 3]} color="#e9e1cf" />
      <Box at={[0, 1.8, 1.12]} size={[1.65, 0.45, 0.05]} color="#294758" />
      <Box at={[0, 2.28, -0.4]} size={[2.2, 0.15, 3.4]} color="#f3e7cc" />
      <Box at={[0, 2.9, -1]} size={[0.08, 1.2, 0.08]} color="#cfb479" metal />
      <Box at={[0.35, 3.25, -1]} size={[0.65, 0.35, 0.04]} color="#6a2637" />
      {[-1.1, 1.1].map((x) => (
        <Box key={x} at={[x, 1.5, 0]} size={[0.04, 0.65, 6.8]} color="#c5c2b3" metal />
      ))}
    </group>
  )
}

export function GoodLifeRoom({ assets }: { assets: string[] }) {
  return (
    <group>
      {assets.includes('watch') && (
        <group position={[3.1, 1.28, 2.1]}>
          <Box at={[0, -0.04, 0]} size={[0.65, 0.08, 0.5]} color="#3d2830" />
          <Watch />
          <Label at={[0, 0.32, 0.1]} size={0.1}>
            GOLD POCKET WATCH
          </Label>
        </group>
      )}
      {assets.includes('wardrobe') && (
        <group position={[-6.4, 0, 4.4]} rotation={[0, Math.PI / 2, 0]}>
          <Box at={[0, 1.2, 0]} size={[2.8, 2.4, 0.4]} color="#453229" />
          <Box at={[0, 1.25, 0.25]} size={[2.5, 2.1, 0.06]} color="#201c20" />
          {[-0.8, 0, 0.8].map((x, i) => (
            <group key={x} position={[x, 1.5, 0.4]}>
              <Box at={[0, 0, 0]} size={[0.55, 0.8, 0.2]} color={['#2e3e52', '#776b55', '#4c2737'][i]} />
              <Box at={[0, 0.08, 0.12]} size={[0.1, 0.5, 0.03]} color="#e3dbc7" />
              <Box at={[0, -0.6, 0]} size={[0.35, 0.2, 0.35]} color="#37251e" />
            </group>
          ))}
          <Label at={[0, 2.65, 0.4]}>BESPOKE WARDROBE</Label>
        </group>
      )}
      {assets.includes('art') && (
        <>
          <Painting at={[3.7, 2.6, -6.75]} />
          <Painting at={[5.5, 2.6, -6.75]} variant={1} />
          <Label at={[4.6, 1.75, -6.57]} size={0.15}>
            THE BELLINI COLLECTION
          </Label>
        </>
      )}
      {assets.includes('penthouse') && (
        <group position={[-6.7, 2.9, 4.5]} rotation={[0, Math.PI / 2, 0]}>
          <Box at={[0, 0, 0]} size={[1.25, 0.8, 0.1]} color="#c6a366" metal />
          <Box at={[0, 0, 0.07]} size={[1.1, 0.65, 0.03]} color="#ded2af" />
          <Label at={[0, 0.1, 0.1]} size={0.09}>
            SKYLINE PENTHOUSE
          </Label>
          <Label at={[0, -0.1, 0.1]} size={0.08}>
            DEED · THE BELLINI FAMILY
          </Label>
        </group>
      )}
      {assets.includes('yacht') && (
        <group position={[4, 1.24, 2]}>
          <Yacht miniature />
          <Label at={[0, 0.65, 0.2]} size={0.1}>
            THE FAMILY YACHT
          </Label>
        </group>
      )}
    </group>
  )
}

export function GoodLifeLandmarks({ assets, endZ }: { assets: string[]; endZ: number }) {
  return (
    <group>
      {assets.includes('penthouse') && (
        <group position={[-24, 0, -35]}>
          <Box at={[0, 15, 0]} size={[12, 30, 12]} color="#354253" />
          <Box at={[0, 31, 0]} size={[10, 2, 10]} color="#b7ab8c" />
          <Box at={[0, 34, 0]} size={[8, 5, 8]} color="#7e6d51" />
          {[-3, 0, 3].map((x) => (
            <Box key={x} at={[x, 34, 4.05]} size={[1.8, 2.6, 0.1]} color="#ecd298" />
          ))}
          <Label at={[0, 38, 6]} size={0.75}>
            BELLINI PENTHOUSE
          </Label>
          <pointLight position={[0, 35, 6]} intensity={60} distance={28} color="#ffd68e" />
        </group>
      )}
      {assets.includes('yacht') && (
        <group position={[20, 0, endZ + 3]}>
          <Box at={[0, -0.15, 0]} size={[25, 0.2, 16]} color="#122d40" />
          <Box at={[0, 0.12, 7]} size={[12, 0.2, 3]} color="#654b31" />
          <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <Yacht />
          </group>
          <Label at={[0, 4.5, 7]} size={0.65}>
            THE FAMILY YACHT · PRIVATE MOORING
          </Label>
        </group>
      )}
    </group>
  )
}

'use client'

import { memo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { CHARACTER_OPTIONS as COLORS, characterShape, type CharacterConfig } from '@/lib/game/character'

type Point = [number, number, number]
function Form({ at, size, color }: { at: Point; size: Point; color: string }) {
  return (
    <mesh position={at} scale={size}>
      <sphereGeometry args={[1, 12, 9]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  )
}
function Cloth({
  at,
  top,
  bottom,
  length,
  color,
}: {
  at: Point
  top: number
  bottom: number
  length: number
  color: string
}) {
  return (
    <mesh position={at} scale={[1, 1, 0.72]}>
      <cylinderGeometry args={[top, bottom, length, 10]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}
// A dedicated mid-detail human for crowds: faces and articulated limbs, not box mannequins.
// Distance culling limits draw calls; the player/customizer retain the detailed CharacterModel.
export const NpcHuman = memo(function NpcHuman({
  config,
  motion,
  accent,
}: {
  config: CharacterConfig
  motion?: RefObject<{ moving: boolean; sprint: boolean }>
  accent?: string
}) {
  const root = useRef<Group>(null),
    leftLeg = useRef<Group>(null),
    rightLeg = useRef<Group>(null),
    leftArm = useRef<Group>(null),
    rightArm = useRef<Group>(null),
    phase = useRef(0),
    point = useRef(new Vector3())
  const skin = COLORS.skin[config.skin],
    hair = COLORS.hairColor[config.hairColor],
    jacket = COLORS.jacket[config.jacket],
    shirt = COLORS.shirt[config.shirt],
    pants = COLORS.trousers[config.trousers],
    shape = characterShape(config),
    skirt = config.outfit === 3 || config.outfit === 4
  useFrame(({ camera }, dt) => {
    if (!root.current) return
    root.current.getWorldPosition(point.current)
    root.current.visible = camera.position.distanceToSquared(point.current) < 65 * 65
    if (!root.current.visible) return
    phase.current += Math.min(dt, 0.05) * 7
    const swing = motion?.current.moving ? Math.sin(phase.current) * 0.4 : 0
    for (const [ref, amount] of [
      [leftLeg, swing],
      [rightLeg, -swing],
      [leftArm, -swing * 0.7],
      [rightArm, swing * 0.7],
    ] as const)
      if (ref.current) ref.current.rotation.x += (amount - ref.current.rotation.x) * (1 - Math.exp(-dt * 12))
  })
  return (
    <group ref={root} scale={[config.build, config.height, 1]} userData={{ human: true, skin: config.skin }}>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#101514" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} ref={side < 0 ? leftLeg : rightLeg} position={[side * 0.12 * shape.hips, 0.9, 0]}>
          <Cloth at={[0, -0.25, 0]} top={0.11} bottom={0.09} length={0.5} color={skirt ? skin : pants} />
          <Cloth at={[0, -0.64, 0]} top={0.09} bottom={0.07} length={0.34} color={skirt ? skin : pants} />
          <Form at={[0, -0.83, 0.07]} size={[0.105, 0.07, 0.18]} color={COLORS.shoes[config.shoes]} />
        </group>
      ))}
      <mesh position={[0, 1.17, 0]} scale={[1, 1, 0.65]}>
        <cylinderGeometry args={[0.25 * shape.shoulders, 0.21 * shape.hips, 0.58, 12]} />
        <meshStandardMaterial color={config.outfit === 2 ? shirt : jacket} />
      </mesh>
      {skirt && <Cloth at={[0, 0.8, 0]} top={0.23} bottom={0.32} length={0.5} color={jacket} />}
      <mesh position={[0, 1.29, 0.165]}>
        <planeGeometry args={[0.13, 0.32]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.11, 1.32, 0.17]} rotation={[0, 0, side * 0.4]}>
            <planeGeometry args={[0.09, 0.28]} />
            <meshStandardMaterial color={jacket} />
          </mesh>
          <group ref={side < 0 ? leftArm : rightArm} position={[side * 0.29 * shape.shoulders, 1.4, 0]}>
            <Cloth
              at={[0, -0.17, 0]}
              top={0.085}
              bottom={0.07}
              length={0.35}
              color={config.outfit === 2 ? shirt : jacket}
            />
            <Form
              at={[0, -0.43, 0.01]}
              size={[0.065, 0.15, 0.065]}
              color={config.outfit === 2 ? skin : jacket}
            />
            <Form at={[0, -0.6, 0.01]} size={[0.062, 0.09, 0.04]} color={skin} />
          </group>
        </group>
      ))}
      <mesh position={[0, 1.28, 0.18]}>
        <boxGeometry args={[0.035, 0.25, 0.02]} />
        <meshStandardMaterial color={accent ?? COLORS.tie[config.tie]} />
      </mesh>
      {[1.03, 1.12].map((y) => (
        <Form key={y} at={[0, y, 0.17]} size={[0.013, 0.013, 0.01]} color="#c6b486" />
      ))}
      <Form at={[0, 1.53, 0]} size={[0.075, 0.1, 0.075]} color={skin} />
      <group position={[0, 1.75, 0]} scale={[config.face, 1, 1]}>
        <Form at={[0, 0.02, 0]} size={[0.15, 0.21, 0.145]} color={skin} />
        <Form at={[0, -0.11, 0.015]} size={[0.115 * shape.jaw, 0.095, 0.12]} color={skin} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Form at={[side * 0.15, 0, 0]} size={[0.027, 0.052, 0.026]} color={skin} />
            <Form at={[side * 0.063, -0.035, 0.108]} size={[0.065, 0.045, 0.04]} color={skin} />
            <Form at={[side * 0.055, 0.035, 0.133]} size={[0.031, 0.014, 0.016]} color="#e4dfd2" />
            <Form
              at={[side * 0.055, 0.035, 0.149]}
              size={[0.013, 0.013, 0.007]}
              color={COLORS.eyes[config.eyes]}
            />
            <Form at={[side * 0.055, 0.035, 0.156]} size={[0.006, 0.009, 0.003]} color="#181a18" />
            <mesh position={[side * 0.055, 0.071, 0.135]} rotation={[0, 0, side * 0.08]}>
              <boxGeometry args={[0.065, 0.012, 0.012]} />
              <meshStandardMaterial color={hair} />
            </mesh>
          </group>
        ))}
        <Form at={[0, -0.012, 0.147]} size={[0.026, 0.053, 0.036 * config.nose]} color={skin} />
        <Form
          at={[0, -0.078, 0.128]}
          size={[0.047, 0.011, 0.013]}
          color={config.skin > 3 ? '#704941' : '#a87368'}
        />
        {config.facialHair > 0 && <Form at={[0, -0.061, 0.141]} size={[0.05, 0.013, 0.012]} color={hair} />}
        {config.facialHair === 2 && <Form at={[0, -0.145, 0.07]} size={[0.1, 0.045, 0.08]} color={hair} />}
        {config.hair !== 3 && (
          <>
            <Form at={[0, 0.17, -0.025]} size={[0.153, 0.08, 0.14]} color={hair} />
            {config.hair >= 4 ? (
              <Form at={[0, -0.03, -0.115]} size={[0.16, 0.19, 0.065]} color={hair} />
            ) : (
              <Form at={[-0.025, 0.16, 0.065]} size={[0.12, 0.055, 0.08]} color={hair} />
            )}
          </>
        )}
        {config.hair === 5 && <Form at={[0, 0.22, -0.12]} size={[0.09, 0.09, 0.09]} color={hair} />}
        {config.hat !== 0 && (
          <group position={[0, 0.23, 0]}>
            <mesh>
              <cylinderGeometry args={[0.24, 0.24, 0.025, 16]} />
              <meshStandardMaterial color={jacket} />
            </mesh>
            <Form at={[0, 0.06, 0]} size={[0.16, 0.1, 0.15]} color={jacket} />
          </group>
        )}
      </group>
    </group>
  )
})

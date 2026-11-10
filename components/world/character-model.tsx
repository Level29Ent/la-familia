'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHARACTER_OPTIONS as COLORS, type CharacterConfig } from '@/lib/game/character'

type Point = [number, number, number]
function Form({
  at,
  scale,
  color,
  roughness = 0.7,
}: {
  at: Point
  scale: Point
  color: string
  roughness?: number
}) {
  return (
    <mesh position={at} scale={scale}>
      <sphereGeometry args={[1, 20, 16]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  )
}
function Panel({
  at,
  size,
  color,
  rotation = 0,
}: {
  at: Point
  size: Point
  color: string
  rotation?: number
}) {
  return (
    <mesh position={at} rotation={[0, 0, rotation]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

// Original parametric human model; face, articulated limbs and tailored clothing share the same options for players and NPCs.
export function CharacterModel({
  config,
  motion,
  preview = false,
}: {
  config: CharacterConfig
  motion?: React.RefObject<{ moving: boolean; sprint: boolean }>
  preview?: boolean
}) {
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Group>(null)
  const phase = useRef(0)
  const skin = COLORS.skin[config.skin]
  const hair = COLORS.hairColor[config.hairColor]
  const shirt = COLORS.shirt[config.shirt]
  const jacket = config.outfit === 2 ? shirt : COLORS.jacket[config.jacket]
  const sleeves = config.outfit === 0 ? jacket : shirt
  useFrame((_, dt) => {
    const walking = motion?.current.moving ?? false
    const sprinting = motion?.current.sprint ?? false
    phase.current += Math.min(dt, 0.05) * (sprinting ? 12 : 8)
    const swing = walking ? Math.sin(phase.current) * (sprinting ? 0.65 : 0.4) : 0
    const blend = 1 - Math.exp(-dt * 15)
    if (leftLeg.current)
      leftLeg.current.rotation.x = THREE.MathUtils.lerp(leftLeg.current.rotation.x, swing, blend)
    if (rightLeg.current)
      rightLeg.current.rotation.x = THREE.MathUtils.lerp(rightLeg.current.rotation.x, -swing, blend)
    if (leftArm.current)
      leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -swing * 0.8, blend)
    if (rightArm.current)
      rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, swing * 0.8, blend)
    if (torso.current)
      torso.current.position.y = walking
        ? Math.abs(Math.sin(phase.current)) * 0.025
        : Math.sin(phase.current * 0.3) * 0.003
  })
  return (
    <group scale={[config.build, config.height, 1]} userData={{ character: true }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={preview ? 0.15 : 0.25} depthWrite={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <group
          key={side}
          ref={side === -1 ? leftLeg : rightLeg}
          position={[side * 0.13 * config.hips, 0.91, 0]}
        >
          <Form at={[0, -0.23, 0]} scale={[0.115, 0.27, 0.12]} color={COLORS.trousers[config.trousers]} />
          <Form at={[0, -0.62, 0]} scale={[0.095, 0.25, 0.1]} color={COLORS.trousers[config.trousers]} />
          <Form
            at={[0, -0.84, 0.075]}
            scale={[0.11, 0.07, 0.21]}
            color={COLORS.shoes[config.shoes]}
            roughness={0.3}
          />
          <Panel at={[0, -0.887, 0.075]} size={[0.2, 0.025, 0.34]} color="#171615" />
        </group>
      ))}
      <group ref={torso}>
        <Form at={[0, 1.17, 0]} scale={[0.28 * config.shoulders, 0.34, 0.16 * config.chest]} color={jacket} />
        <Form
          at={[0, 0.93, 0]}
          scale={[0.245 * config.hips, 0.13, 0.15]}
          color={COLORS.trousers[config.trousers]}
        />
        <Panel at={[0, 0.98, 0.145]} size={[0.39, 0.04, 0.025]} color="#342b22" />
        <Panel at={[0, 0.98, 0.165]} size={[0.045, 0.04, 0.02]} color="#c3a469" />
        <Form at={[0, 1.38, 0.145]} scale={[0.105, 0.18, 0.025]} color={shirt} />
        <Panel at={[0, 1.34, 0.18]} size={[0.045, 0.19, 0.02]} color={COLORS.tie[config.tie]} />
        <Form at={[0, 1.46, 0.18]} scale={[0.035, 0.035, 0.022]} color={COLORS.tie[config.tie]} />
        {config.outfit !== 2 &&
          [-1, 1].map((side) => (
            <Panel
              key={side}
              at={[side * 0.1, 1.34, 0.16]}
              size={[0.07, 0.27, 0.025]}
              rotation={side * -0.35}
              color={COLORS.jacket[config.jacket]}
            />
          ))}
        {[1.05, 1.16, 1.27].map((y) => (
          <Form key={y} at={[0, y, 0.16]} scale={[0.013, 0.013, 0.008]} color="#baa77e" />
        ))}
        {[-1, 1].map((side) => (
          <group
            key={side}
            ref={side === -1 ? leftArm : rightArm}
            position={[side * 0.29 * config.shoulders, 1.43, 0]}
            rotation={[0, 0, side * 0.07]}
          >
            <Form at={[0, -0.14, 0]} scale={[0.1, 0.21, 0.1]} color={sleeves} />
            <Form
              at={[side * 0.015, -0.4, 0.01]}
              scale={[0.075, 0.18, 0.08]}
              color={config.outfit === 2 ? skin : sleeves}
            />
            <Form at={[side * 0.015, -0.6, 0.02]} scale={[0.07, 0.1, 0.045]} color={skin} />
            {[0, 1, 2].map((finger) => (
              <Form
                key={finger}
                at={[side * 0.015 + (finger - 1) * 0.027, -0.68, 0.025]}
                scale={[0.012, 0.055, 0.018]}
                color={skin}
              />
            ))}
          </group>
        ))}
        <Form at={[0, 1.53, 0]} scale={[0.085, 0.11, 0.08]} color={skin} />
        <group position={[0, 1.76, 0]} scale={[config.face, 1, 1]}>
          <Form at={[0, 0.015, 0]} scale={[0.155, 0.22, 0.155]} color={skin} />
          <Form at={[0, -0.11, 0.015]} scale={[0.12 * config.jaw, 0.1, 0.125]} color={skin} />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Form at={[side * 0.157, 0, 0]} scale={[0.035, 0.065, 0.032]} color={skin} />
              <Form at={[side * 0.058, 0.025, 0.14]} scale={[0.039, 0.023, 0.014]} color="#ece3d6" />
              <Form
                at={[side * 0.058, 0.025, 0.153]}
                scale={[0.016, 0.018, 0.007]}
                color={COLORS.eyes[config.eyes]}
              />
              <Form at={[side * 0.058, 0.025, 0.16]} scale={[0.007, 0.011, 0.004]} color="#161514" />
              <Panel
                at={[side * 0.058, 0.068, 0.145]}
                size={[0.075, 0.013, 0.014]}
                color={hair}
                rotation={side * 0.08}
              />
            </group>
          ))}
          <Form at={[0, -0.015, 0.155]} scale={[0.027, 0.06, 0.045 * config.nose]} color={skin} />
          <Form at={[0, -0.09, 0.133]} scale={[0.05, 0.012, 0.015]} color="#976052" />
          {config.facialHair >= 1 && (
            <Form at={[0, -0.065, 0.147]} scale={[0.055, 0.018, 0.012]} color={hair} />
          )}
          {config.facialHair === 2 && (
            <Form at={[0, -0.145, 0.08]} scale={[0.117 * config.jaw, 0.055, 0.085]} color={hair} />
          )}
          {config.hair !== 3 && (
            <>
              <Form
                at={[0, 0.16, -0.025]}
                scale={[0.16, config.hair === 1 ? 0.085 : 0.11, 0.15]}
                color={hair}
              />
              {config.hair === 0 && (
                <Form at={[-0.035, 0.17, 0.07]} scale={[0.125, 0.08, 0.1]} color={hair} />
              )}
              {config.hair === 2 && <Form at={[0, -0.015, -0.12]} scale={[0.15, 0.24, 0.07]} color={hair} />}
            </>
          )}
          {config.glasses !== 0 &&
            [-1, 1].map((side) => (
              <group key={side} position={[side * 0.06, 0.025, 0.17]}>
                <mesh>
                  <torusGeometry args={[0.043, 0.006, 6, 20]} />
                  <meshStandardMaterial color="#b5a77e" metalness={0.7} />
                </mesh>
                {config.glasses === 2 && (
                  <mesh>
                    <circleGeometry args={[0.039, 20]} />
                    <meshStandardMaterial color="#17222b" metalness={0.3} />
                  </mesh>
                )}
              </group>
            ))}
          {config.glasses !== 0 && <Panel at={[0, 0.03, 0.17]} size={[0.045, 0.009, 0.01]} color="#b5a77e" />}
          {config.hat !== 0 && (
            <group position={[0, 0.21, 0]}>
              <mesh>
                <cylinderGeometry args={[config.hat === 1 ? 0.25 : 0.19, 0.25, 0.025, 32]} />
                <meshStandardMaterial color={jacket} />
              </mesh>
              <Form
                at={[0, 0.065, config.hat === 2 ? 0.03 : 0]}
                scale={[0.17, config.hat === 1 ? 0.12 : 0.065, 0.17]}
                color={jacket}
              />
              {config.hat === 1 && (
                <mesh position={[0, 0.025, 0]}>
                  <cylinderGeometry args={[0.171, 0.171, 0.035, 32]} />
                  <meshStandardMaterial color={COLORS.tie[config.tie]} />
                </mesh>
              )}
            </group>
          )}
        </group>
      </group>
    </group>
  )
}

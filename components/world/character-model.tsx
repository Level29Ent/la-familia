'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHARACTER_OPTIONS as COLORS, characterShape, type CharacterConfig } from '@/lib/game/character'

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
function Tailored({
  at,
  top,
  bottom,
  length,
  depth = 1,
  color,
}: {
  at: Point
  top: number
  bottom: number
  length: number
  depth?: number
  color: string
}) {
  return (
    <mesh position={at} scale={[1, 1, depth]}>
      <cylinderGeometry args={[top, bottom, length, 20]} />
      <meshStandardMaterial color={color} roughness={0.85} />
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
  const sleeves = [0, 3, 5].includes(config.outfit) ? jacket : shirt
  const shape = characterShape(config)
  const skirt = config.outfit === 3 || config.outfit === 4
  const dress = config.outfit === 4
  const jewelry = '#d5b76f'
  const lip = ['#976052', '#b76b79', '#a52f41', '#68324f'][config.lipstick]
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
          position={[side * 0.13 * shape.hips, 0.91, 0]}
        >
          <Tailored
            at={[0, -0.23, 0]}
            top={0.115}
            bottom={0.095}
            length={0.46}
            color={skirt ? skin : COLORS.trousers[config.trousers]}
          />
          <Tailored
            at={[0, -0.62, 0]}
            top={0.095}
            bottom={0.085}
            length={0.38}
            color={skirt ? skin : COLORS.trousers[config.trousers]}
          />
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
        <Tailored
          at={[0, 1.19, 0]}
          top={0.27 * shape.shoulders}
          bottom={0.23 * shape.hips * shape.waist}
          length={0.55}
          depth={0.62 * config.chest}
          color={dress ? shirt : jacket}
        />
        <Form
          at={[0, 0.93, 0]}
          scale={[0.245 * shape.hips, 0.13, 0.15]}
          color={dress ? shirt : COLORS.trousers[config.trousers]}
        />
        {skirt && (
          <Tailored
            at={[0, 0.78, 0]}
            top={0.24 * shape.hips}
            bottom={0.34 * shape.hips}
            length={dress ? 0.75 : 0.52}
            depth={0.7}
            color={dress ? shirt : COLORS.trousers[config.trousers]}
          />
        )}
        {config.outfit === 5 && (
          <Tailored
            at={[0, 0.82, 0]}
            top={0.23 * shape.hips}
            bottom={0.32 * shape.hips}
            length={0.55}
            depth={0.72}
            color={jacket}
          />
        )}
        {config.gender === 1 &&
          [-1, 1].map((side) => (
            <Form
              key={`tailoring-${side}`}
              at={[side * 0.1, 1.3, 0.095]}
              scale={[0.105, 0.115, 0.08 * config.chest]}
              color={dress ? shirt : jacket}
            />
          ))}
        <Panel at={[0, 0.98, 0.145]} size={[0.39, 0.04, 0.025]} color="#342b22" />
        <Panel at={[0, 0.98, 0.165]} size={[0.045, 0.04, 0.02]} color="#c3a469" />
        <Form at={[0, 1.38, 0.145]} scale={[0.105, 0.18, 0.025]} color={shirt} />
        {config.neckwear === 0 && !dress && (
          <>
            <Panel at={[0, 1.34, 0.18]} size={[0.045, 0.19, 0.02]} color={COLORS.tie[config.tie]} />
            <Form at={[0, 1.46, 0.18]} scale={[0.035, 0.035, 0.022]} color={COLORS.tie[config.tie]} />
          </>
        )}
        {config.neckwear === 2 &&
          !dress &&
          [-1, 1].map((side) => (
            <Form
              key={side}
              at={[side * 0.04, 1.44, 0.18]}
              scale={[0.045, 0.028, 0.02]}
              color={COLORS.tie[config.tie]}
            />
          ))}
        {config.necklace !== 0 && (
          <>
            {Array.from({ length: 11 }, (_, i) => {
              const angle = (Math.PI * i) / 10
              return (
                <Form
                  key={i}
                  at={[Math.cos(angle) * 0.1, 1.46 - Math.sin(angle) * 0.15, 0.185]}
                  scale={[0.013, 0.013, 0.01]}
                  color={config.necklace === 1 ? '#e8dfc8' : jewelry}
                />
              )
            })}
            {config.necklace === 2 && (
              <Form at={[0, 1.27, 0.19]} scale={[0.022, 0.035, 0.012]} color={jewelry} />
            )}
          </>
        )}
        {config.outfit !== 2 &&
          !dress &&
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
            position={[side * 0.29 * shape.shoulders, 1.43, 0]}
            rotation={[0, 0, side * 0.07]}
          >
            <Tailored
              at={[0, -0.14, 0]}
              top={0.095}
              bottom={0.08}
              length={0.38}
              color={dress ? skin : sleeves}
            />
            <Form
              at={[side * 0.015, -0.4, 0.01]}
              scale={[0.075, 0.18, 0.08]}
              color={config.outfit === 2 || dress ? skin : sleeves}
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
          <Form at={[0, -0.11, 0.015]} scale={[0.12 * shape.jaw, 0.1, 0.125]} color={skin} />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Form at={[side * 0.157, 0, 0]} scale={[0.035, 0.065, 0.032]} color={skin} />
              <Form at={[side * 0.058, 0.025, 0.14]} scale={[0.032, 0.016, 0.014]} color="#ece3d6" />
              <Form
                at={[side * 0.058, 0.025, 0.153]}
                scale={[0.013, 0.014, 0.007]}
                color={COLORS.eyes[config.eyes]}
              />
              <Form at={[side * 0.058, 0.025, 0.16]} scale={[0.006, 0.009, 0.004]} color="#161514" />
              <Panel
                at={[side * 0.058, 0.068, 0.145]}
                size={[0.075, 0.013, 0.014]}
                color={hair}
                rotation={side * 0.08}
              />
            </group>
          ))}
          <Form at={[0, -0.015, 0.155]} scale={[0.027, 0.06, 0.045 * config.nose]} color={skin} />
          <Form at={[0, -0.09, 0.133]} scale={[0.05, 0.012, 0.015]} color={lip} />
          {config.earrings !== 0 &&
            [-1, 1].map((side) =>
              config.earrings === 1 ? (
                <Form
                  key={side}
                  at={[side * 0.17, -0.055, 0.025]}
                  scale={[0.018, 0.018, 0.018]}
                  color="#eee4ca"
                />
              ) : (
                <mesh key={side} position={[side * 0.17, -0.1, 0.025]}>
                  <torusGeometry args={[0.04, 0.008, 8, 20]} />
                  <meshStandardMaterial color={jewelry} metalness={0.7} />
                </mesh>
              ),
            )}
          {config.facialHair >= 1 && (
            <Form at={[0, -0.065, 0.147]} scale={[0.055, 0.018, 0.012]} color={hair} />
          )}
          {config.facialHair === 2 && (
            <Form at={[0, -0.145, 0.08]} scale={[0.117 * shape.jaw, 0.055, 0.085]} color={hair} />
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
          {config.hair === 4 && (
            <>
              <Form at={[0, -0.05, -0.11]} scale={[0.17, 0.19, 0.09]} color={hair} />
              {[-1, 1].map((side) => (
                <Form key={side} at={[side * 0.145, -0.02, 0]} scale={[0.045, 0.18, 0.13]} color={hair} />
              ))}
            </>
          )}
          {config.hair === 5 && <Form at={[0, 0.24, -0.13]} scale={[0.11, 0.1, 0.1]} color={hair} />}
          {config.hair === 6 && <Form at={[0, -0.02, -0.2]} scale={[0.065, 0.29, 0.065]} color={hair} />}
          {config.hair === 7 &&
            [-1, 1].map((side) => (
              <group key={side}>
                {[0, 1, 2].map((strand) => (
                  <Form
                    key={strand}
                    at={[side * (0.14 + strand * 0.012), -0.06 - strand * 0.07, -0.03]}
                    scale={[0.055, 0.19, 0.1]}
                    color={hair}
                  />
                ))}
              </group>
            ))}
          {config.glasses !== 0 &&
            [-1, 1].map((side) => (
              <group key={side} position={[side * 0.06, 0.025, 0.17]}>
                <mesh>
                  <torusGeometry args={[0.043, 0.006, 6, config.glasses === 3 ? 4 : 20]} />
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
                <cylinderGeometry
                  args={[config.hat === 1 ? 0.25 : config.hat === 3 ? 0.21 : 0.19, 0.25, 0.025, 32]}
                />
                <meshStandardMaterial color={jacket} />
              </mesh>
              <Form
                at={[0, 0.065, config.hat === 2 ? 0.03 : 0]}
                scale={[
                  config.hat === 4 ? 0.23 : 0.17,
                  config.hat === 1 || config.hat === 3 ? 0.12 : 0.065,
                  0.17,
                ]}
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

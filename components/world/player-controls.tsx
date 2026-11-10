'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { input, MOVE_KEYS } from '@/lib/game/input'
import * as THREE from 'three'
import { VintageCar } from './vintage-car'
import { SEDAN_START, driveCar, carExit } from '@/lib/game/good-life'
import { CharacterModel } from './character-model'
import { cameraDistance, type CharacterConfig } from '@/lib/game/character'
import { focusedTarget, moveWithin, followCamera, type Navigation } from '@/lib/game/navigation'

const LOOK_SPEED = 0.0024

export function PlayerControls({
  enabled,
  navigation,
  character,
  onFocusChange,
  assets = [],
  driving = false,
}: {
  enabled: boolean
  navigation: Navigation
  character: CharacterConfig
  assets?: string[]
  driving?: boolean
  onFocusChange: (id: string | null) => void
}) {
  const { camera, gl } = useThree()
  const look = useRef({ yaw: 0, pitch: 0 })
  const focusedRef = useRef<string | null>(null)
  const car = useRef({ ...SEDAN_START })
  const carModel = useRef<THREE.Group>(null)
  const wasDriving = useRef(false)
  const player = useRef<THREE.Group>(null)
  const position = useRef({ x: navigation.start[0], z: navigation.start[2] })
  const motion = useRef({ moving: false, sprint: false })
  const distance = useRef(4)
  const view = useRef(new THREE.Vector3())

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    position.current = { x: navigation.start[0], z: navigation.start[2] }
    camera.position.set(navigation.start[0], 2.7, navigation.start[2] + 4)
    if (player.current) {
      player.current.position.set(navigation.start[0], 0, navigation.start[2])
      player.current.rotation.y = navigation.yaw + Math.PI
    }
    look.current = { yaw: navigation.yaw, pitch: 0 }
    focusedRef.current = null
    onFocusChange(null)
    input.keys.clear()
  }, [camera, navigation, onFocusChange])

  useEffect(() => {
    if (driving) {
      look.current = { yaw: car.current.yaw - Math.PI, pitch: 0.15 }
      position.current = { x: car.current.x, z: car.current.z }
      onFocusChange(null)
      focusedRef.current = null
    } else if (wasDriving.current) {
      position.current = carExit(car.current, navigation.bounds)
      car.current.speed = 0
    }
    wasDriving.current = driving
    input.keys.clear()
  }, [driving, navigation, onFocusChange])

  useEffect(() => {
    input.enabled = enabled
    if (!enabled) {
      input.keys.clear()
      if (document.pointerLockElement) document.exitPointerLock()
    }
  }, [enabled])

  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    const rotate = (dx: number, dy: number) => {
      look.current.yaw -= dx * LOOK_SPEED
      look.current.pitch = Math.max(0.05, Math.min(0.65, look.current.pitch + dy * LOOK_SPEED))
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!input.enabled) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      if (e.pointerType === 'mouse' && !document.pointerLockElement) {
        try {
          const result = el.requestPointerLock() as unknown as Promise<void> | undefined
          result?.catch?.(() => {})
        } catch {
          // Pointer lock can be blocked inside iframes; drag-to-look still works.
        }
      }
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!input.enabled) return
      if (document.pointerLockElement === el) {
        rotate(e.movementX, e.movementY)
      } else if (dragging) {
        rotate(e.clientX - lastX, e.clientY - lastY)
        lastX = e.clientX
        lastY = e.clientY
      }
    }
    const onPointerUp = () => {
      dragging = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!input.enabled || !MOVE_KEYS.has(e.code)) return
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return
      input.keys.add(e.code)
      if (e.code === 'Space') e.preventDefault()
      if (e.code.startsWith('Arrow')) e.preventDefault()
    }
    const onKeyUp = (e: KeyboardEvent) => input.keys.delete(e.code)
    const onBlur = () => input.keys.clear()

    const onWheel = (event: WheelEvent) => {
      if (!input.enabled) return
      event.preventDefault()
      distance.current = cameraDistance(distance.current, event.deltaY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    motion.current.moving = false
    if (!enabled) return
    const dt = Math.min(rawDt, 0.05)
    const { yaw, pitch } = look.current
    const k = input.keys
    const forward =
      (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const strafe =
      (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0)

    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)

    let mx = fx * forward + rx * strafe
    let mz = fz * forward + rz * strafe
    const len = Math.hypot(mx, mz)
    const moving = len > 0
    if (driving) {
      car.current = driveCar(car.current, forward, strafe, k.has('Space'), dt, navigation.bounds)
      position.current = { x: car.current.x, z: car.current.z }
      look.current.yaw = car.current.yaw - Math.PI
      if (carModel.current) {
        carModel.current.position.set(car.current.x, 0, car.current.z)
        carModel.current.rotation.y = car.current.yaw
      }
    } else if (moving) {
      const speed = navigation.speed * (k.has('ShiftLeft') || k.has('ShiftRight') ? 1.7 : 1)
      mx = (mx / len) * speed * dt
      mz = (mz / len) * speed * dt
      const next = moveWithin(position.current, mx, mz, navigation)
      motion.current.moving = Math.hypot(next.x - position.current.x, next.z - position.current.z) > 0.001
      motion.current.sprint = speed > navigation.speed
      position.current = next
      if (player.current && motion.current.moving) {
        const targetYaw = Math.atan2(mx, mz)
        const delta = Math.atan2(
          Math.sin(targetYaw - player.current.rotation.y),
          Math.cos(targetYaw - player.current.rotation.y),
        )
        player.current.rotation.y += delta * Math.min(1, dt * 12)
      }
    }
    if (player.current) player.current.position.set(position.current.x, 0, position.current.z)
    const orbit = followCamera(
      position.current,
      driving ? car.current.yaw - Math.PI : yaw,
      pitch + 0.15,
      driving ? 6 : distance.current,
      navigation,
    )
    if (player.current)
      player.current.visible =
        !driving && Math.hypot(orbit.x - position.current.x, orbit.z - position.current.z) >= 0.65
    camera.position.set(orbit.x, orbit.y, orbit.z)
    camera.lookAt(view.current.set(position.current.x, 1.25 * character.height, position.current.z))

    const nearCar =
      assets.includes('sedan') &&
      Math.hypot(position.current.x - car.current.x, position.current.z - car.current.z) < 3.2
    const best = driving ? null : nearCar ? 'sedan' : focusedTarget(position.current, yaw, navigation)
    if (best !== focusedRef.current) {
      focusedRef.current = best
      onFocusChange(best)
    }
  })

  return (
    <>
      <group ref={player}>
        <CharacterModel config={character} motion={motion} assets={assets} />
      </group>
      {assets.includes('sedan') && (
        <group ref={carModel} position={[car.current.x, 0, car.current.z]} rotation={[0, car.current.yaw, 0]}>
          <VintageCar position={[0, 0.18, 0]} color="#213f68" />
        </group>
      )}
    </>
  )
}

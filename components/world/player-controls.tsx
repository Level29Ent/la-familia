'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { input, MOVE_KEYS } from '@/lib/game/input'
import { PLACEMENTS, PLAYER_BOUNDS, PLAYER_START } from './layout'

const LOOK_SPEED = 0.0024
const WALK_SPEED = 6
const SPRINT_SPEED = 11
const FOCUS_RANGE = 9

export function PlayerControls({
  enabled,
  onFocusChange,
}: {
  enabled: boolean
  onFocusChange: (id: string | null) => void
}) {
  const { camera, gl } = useThree()
  const look = useRef({ yaw: 0, pitch: 0 })
  const focusedRef = useRef<string | null>(null)
  const bob = useRef(0)

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.position.set(...PLAYER_START)
  }, [camera])

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
      look.current.pitch = Math.max(-1.2, Math.min(1.2, look.current.pitch - dy * LOOK_SPEED))
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
      if (e.code.startsWith('Arrow')) e.preventDefault()
    }
    const onKeyUp = (e: KeyboardEvent) => input.keys.delete(e.code)
    const onBlur = () => input.keys.clear()

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const { yaw, pitch } = look.current
    const k = input.keys
    const forward = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const strafe = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0)

    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)

    let mx = fx * forward + rx * strafe
    let mz = fz * forward + rz * strafe
    const len = Math.hypot(mx, mz)
    const moving = len > 0
    if (moving) {
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? SPRINT_SPEED : WALK_SPEED
      mx = (mx / len) * speed * dt
      mz = (mz / len) * speed * dt
      camera.position.x = Math.max(PLAYER_BOUNDS.minX, Math.min(PLAYER_BOUNDS.maxX, camera.position.x + mx))
      camera.position.z = Math.max(PLAYER_BOUNDS.minZ, Math.min(PLAYER_BOUNDS.maxZ, camera.position.z + mz))
      bob.current += dt * 10
    }
    camera.position.y = PLAYER_START[1] + (moving ? Math.sin(bob.current) * 0.05 : 0)
    camera.rotation.set(pitch, yaw, 0)

    let best: string | null = null
    let bestDist = Infinity
    for (const p of PLACEMENTS) {
      const dx = p.door[0] - camera.position.x
      const dz = p.door[1] - camera.position.z
      const dist = Math.hypot(dx, dz)
      if (dist > FOCUS_RANGE) continue
      const facing = (dx * fx + dz * fz) / dist
      if (facing < 0.35) continue
      const score = dist * (1.6 - facing)
      if (score < bestDist) {
        bestDist = score
        best = p.id
      }
    }
    if (best !== focusedRef.current) {
      focusedRef.current = best
      onFocusChange(best)
    }
  })

  return null
}

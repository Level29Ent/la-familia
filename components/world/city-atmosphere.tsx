'use client'

import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { useRef } from 'react'
import type { DirectionalLight, AmbientLight, HemisphereLight } from 'three'

export function CityAtmosphere({ hour }: { hour: number }) {
  const ambient = useRef<AmbientLight>(null),
    sun = useRef<DirectionalLight>(null),
    hemi = useRef<HemisphereLight>(null)
  const night = hour < 6 || hour >= 18,
    twilight = hour === 6 || hour === 17
  const sky = new Color(night ? '#172d49' : twilight ? '#d4a58d' : '#aacbdd'),
    fog = new Color(night ? '#263d51' : twilight ? '#bc9b8c' : '#b9cdd6')
  useFrame(({ scene }, dt) => {
    const blend = 1 - Math.exp(-dt * 0.8)
    if (scene.background instanceof Color) scene.background.lerp(sky, blend)
    if (scene.fog) scene.fog.color.lerp(fog, blend)
    if (ambient.current)
      ambient.current.intensity += ((night ? 0.5 : 1.15) - ambient.current.intensity) * blend
    if (sun.current)
      sun.current.intensity += ((night ? 0.35 : twilight ? 1.8 : 2.5) - sun.current.intensity) * blend
    if (hemi.current) hemi.current.intensity += ((night ? 0.7 : 1.5) - hemi.current.intensity) * blend
  })
  return (
    <>
      <color attach="background" args={['#aacbdd']} />
      <fog attach="fog" args={['#b9cdd6', 70, 240]} />
      <ambientLight ref={ambient} intensity={1.15} color="#fff0db" />
      <hemisphereLight ref={hemi} args={['#d5e9f0', '#897661', 1.5]} />
      <directionalLight
        ref={sun}
        position={[45, 65, -70]}
        intensity={2.5}
        color={night ? '#9fb7de' : '#ffebc4'}
      />
      <directionalLight position={[-30, 20, 30]} intensity={0.45} color="#b4d0e3" />
    </>
  )
}

'use client'

import { useFrame } from '@react-three/fiber'

export type InspectionView = { position: [number, number, number]; target: [number, number, number] }

// Optional fixed camera used by the isolated preview fixture, never ordinary gameplay.
export function InspectionCamera({ view }: { view: InspectionView }) {
  useFrame(({ camera }) => {
    camera.position.set(...view.position)
    camera.lookAt(...view.target)
  })
  return null
}

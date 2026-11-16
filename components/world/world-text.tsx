'use client'

import { Suspense, type ComponentProps } from 'react'
import { Text } from '@react-three/drei'
import { assetPath } from '@/lib/asset-path'

// A pending font must not suspend the entire Canvas (and hide the playable world).
export function WorldText(props: Omit<ComponentProps<typeof Text>, 'font'>) {
  return (
    <Suspense fallback={null}>
      <Text {...props} font={assetPath('/fonts/Geist-Regular.ttf')} />
    </Suspense>
  )
}

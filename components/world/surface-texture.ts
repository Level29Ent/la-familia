import { useEffect, useMemo } from 'react'
import { DataTexture, RepeatWrapping, RGBAFormat, SRGBColorSpace, NearestFilter } from 'three'

// Local, deterministic surface grain; no remote images or loader suspension.
export function useSurfaceTexture(kind: 'brick' | 'wood' | 'tile', repeatX: number, repeatY: number) {
  const texture = useMemo(() => {
    const size = 64,
      data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const offset = Math.floor(y / 16) % 2 ? 16 : 0
        const seam =
          kind === 'brick'
            ? y % 16 < 1 || (x + offset) % 32 < 1
            : kind === 'tile'
              ? x % 32 === 0 || y % 32 === 0
              : x % 16 === 0
        const noise = ((x * 17 + y * 29 + x * y * 3) % 13) - 6
        const value = seam
          ? 128
          : kind === 'wood'
            ? 220 + Math.round(Math.sin(x * 2 + y * 0.15) * 8) + noise
            : 228 + noise
        const i = (y * size + x) * 4
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = 255
      }
    const t = new DataTexture(data, size, size, RGBAFormat)
    t.colorSpace = SRGBColorSpace
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(repeatX, repeatY)
    t.magFilter = NearestFilter
    t.needsUpdate = true
    return t
  }, [kind, repeatX, repeatY])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

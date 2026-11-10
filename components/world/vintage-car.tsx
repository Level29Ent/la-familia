'use client'

export function VintageCar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.65, 0.7, 3.7]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.18, -0.25]}>
        <boxGeometry args={[1.4, 0.8, 1.9]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.24, 0.72]}>
        <planeGeometry args={[1.15, 0.5]} />
        <meshStandardMaterial color="#7499ad" metalness={0.65} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.6, 1.88]}>
        <boxGeometry args={[0.8, 0.55, 0.08]} />
        <meshStandardMaterial color="#a8a8a0" metalness={0.9} roughness={0.2} />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${side}-${z}`} position={[side * 0.82, 0.35, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.4, 0.4, 0.18, 16]} />
            <meshStandardMaterial color="#101217" roughness={0.9} />
          </mesh>
        )),
      )}
      {[-0.63, 0.63].map((x) => (
        <mesh key={x} position={[x, 0.73, 1.9]}>
          <sphereGeometry args={[0.15, 12, 8]} />
          <meshStandardMaterial color="#ffe9b5" emissive="#ffe9b5" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

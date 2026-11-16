'use client'

import { useEffect, useRef } from 'react'
import { AVENUES, CITY_BUILDINGS, CROSS_STREETS, FAMILIES } from '@/lib/game/city'
import { FleetPanel } from './fleet-panel'
import { RivalPanel } from './rival-panel'

export function CityMap({
  position,
  onTravel,
  onClose,
}: {
  position: { x: number; z: number }
  onTravel: (id: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = ref.current!
    el.showModal()
    return () => el.close()
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      aria-labelledby="city-map-title"
      className="m-auto max-h-[94dvh] w-[min(1100px,96vw)] overflow-y-auto rounded-2xl border border-primary/30 bg-background p-5 text-foreground backdrop:bg-black/80"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background py-2">
        <div>
          <h2 id="city-map-title" className="font-serif text-2xl text-primary">
            City atlas & rival families
          </h2>
          <p className="text-xs text-muted-foreground">
            12 blocks · 48 enterable buildings · 26 businesses · 18 homes · 3 rival clubs
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded border border-border px-3 py-2">
          Close city map
        </button>
      </header>
      <div className="mt-4 grid gap-6 md:grid-cols-[1fr_0.8fr]">
        <section>
          <svg
            viewBox="-48 -30 172 136"
            role="img"
            aria-label="City street grid with buildings; gold dot marks your position"
            className="w-full rounded-xl bg-[#192d31]"
          >
            {AVENUES.map((x) => (
              <path key={x} d={`M ${x} -26 V 98`} stroke="#52636a" strokeWidth="9" />
            ))}
            {CROSS_STREETS.map((z) => (
              <path key={z} d={`M -44 ${-z} H 116`} stroke="#52636a" strokeWidth="9" />
            ))}
            {CITY_BUILDINGS.map((b) => (
              <rect
                key={b.id}
                x={b.position[0] - 5}
                y={-b.position[2] - 4.5}
                width="10"
                height="9"
                rx="1"
                fill={
                  b.kind === 'headquarters'
                    ? FAMILIES.find((f) => f.id === b.family)?.color
                    : b.kind === 'home'
                      ? '#a58c6d'
                      : b.kind === 'safehouse'
                        ? '#cfa952'
                        : '#759e8d'
                }
              >
                <title>{b.name}</title>
              </rect>
            ))}
            <circle cx={position.x} cy={-position.z} r="2" fill="#ffda65" stroke="white" strokeWidth="0.5" />
          </svg>
          <p className="mt-2 text-xs text-muted-foreground">
            Green: businesses · Tan: homes · Gold: safe house · Family colors: rival clubs. Travel brings you
            to the door, not inside. Walk anywhere with WASD; E enters a nearby building.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {CITY_BUILDINGS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => onTravel(b.id)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-left hover:border-primary"
              >
                <span className="block text-sm text-primary">Travel to {b.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {b.district} · {b.kind}
                </span>
              </button>
            ))}
          </div>
        </section>
        <div><FleetPanel /><RivalPanel /></div>
      </div>
    </dialog>
  )
}

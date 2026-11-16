'use client'

import { AVENUES, CROSS_STREETS, CITY_BUILDINGS, FAMILIES } from '@/lib/game/city'
import { mapPoint, nearestAddress, type MapPosition } from '@/lib/game/map'

export function StreetMap({
  position,
  territories,
  destination,
  onSelect,
  visibleIds,
  compact = false,
}: {
  territories?: { district: string; control: number }[]
  position: MapPosition
  destination?: string | null
  onSelect?: (id: string) => void
  visibleIds?: string[]
  compact?: boolean
}) {
  const p = mapPoint(position),
    target = CITY_BUILDINGS.find((b) => b.id === destination)
  return (
    <svg
      viewBox="-48 -30 244 136"
      role="img"
      aria-label={
        compact
          ? 'Live minimap with your current position'
          : 'City street grid with buildings; gold arrow marks your position'
      }
      className="h-full w-full rounded-xl bg-[#182b30]"
    >
      {territories?.map((t, i) => (
        <rect
          key={t.district}
          x={i < 3 ? -35 : i === 3 ? 73 : 109}
          y={i < 3 ? -17 + i * 36 : -17}
          width={i < 3 ? 106 : i === 4 ? 70 : 34}
          height={i < 3 ? 34 : 106}
          fill={t.control >= 75 ? '#bfa14e' : t.control > 0 ? '#8c6d40' : '#693d42'}
          opacity={0.3}
        >
          <title>
            {t.district}: {t.control}% Bellini influence
          </title>
        </rect>
      ))}
      <path d="M -44 104 H 190" stroke="#3b7180" strokeWidth="8" />
      {AVENUES.map((x) => (
        <path key={x} d={`M ${x} -26 V 98`} stroke="#43555b" strokeWidth="8" />
      ))}
      {CROSS_STREETS.map((z) => (
        <path key={z} d={`M -44 ${-z} H 188`} stroke="#43555b" strokeWidth="8" />
      ))}
      {!compact &&
        ['LITTLE ITALY', 'MARKET WARD', 'HARBOR QUARTER', 'EASTSIDE', 'GARDEN HEIGHTS'].map((s, i) => (
          <text
            key={s}
            x={i < 3 ? -40 : i === 3 ? 76 : 112}
            y={i < 3 ? -22 + i * 36 : -22}
            fill="#b6c3b8"
            fontSize="3.1"
          >
            {s}
          </text>
        ))}
      {CITY_BUILDINGS.map((b) => (
        <g key={b.id} opacity={!visibleIds || visibleIds.includes(b.id) ? 1 : 0.15}>
          {onSelect ? (
            <a
              href={`#destination-${b.id}`}
              aria-label={`Show ${b.name} on map`}
              onClick={(e) => {
                e.preventDefault()
                onSelect(b.id)
              }}
            >
              <rect
                x={b.position[0] - 5}
                y={-b.position[2] - 4.5}
                width="10"
                height="9"
                rx="1"
                fill={
                  b.kind === 'headquarters'
                    ? FAMILIES.find((f) => f.id === b.family)?.color
                    : b.kind === 'home'
                      ? '#aa8f71'
                      : b.kind === 'safehouse'
                        ? '#d0ae61'
                        : '#7ca594'
                }
                stroke={b.id === destination ? '#ffe7a0' : '#253b3d'}
                strokeWidth={b.id === destination ? 1 : 0.3}
              />
              <title>{b.name}</title>
            </a>
          ) : (
            <rect
              x={b.position[0] - 5}
              y={-b.position[2] - 4.5}
              width="10"
              height="9"
              rx="1"
              fill={b.kind === 'home' ? '#aa8f71' : b.kind === 'safehouse' ? '#d0ae61' : '#7ca594'}
            />
          )}
        </g>
      ))}
      {target && (
        <>
          <path
            d={`M ${p.x} ${p.y} L ${target.door[0]} ${-target.door[1]}`}
            stroke="#e4bf67"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <circle cx={target.door[0]} cy={-target.door[1]} r="2.3" fill="none" stroke="#ffdf7f" />
        </>
      )}
      <circle cx={p.x} cy={p.y} r={compact ? 4 : 3} fill="#f5cb60" opacity="0.2" />
      <path
        data-player-marker="true"
        data-x={position.x.toFixed(2)}
        data-z={position.z.toFixed(2)}
        transform={`translate(${p.x} ${p.y}) rotate(${((position.yaw ?? 0) * 180) / Math.PI})`}
        d="M 0 2.5 L -1.8 -1.5 L 0 -0.7 L 1.8 -1.5 Z"
        fill="#ffdf78"
        stroke="white"
        strokeWidth="0.45"
      />
      <text x="183" y="-22" fill="#f2e4bc" fontSize="4">
        N ↑
      </text>
    </svg>
  )
}
export function MiniMap({
  position,
  destination,
  onOpen,
}: {
  position: MapPosition
  destination?: string | null
  onOpen: () => void
}) {
  const address = nearestAddress(position)
  return (
    <button
      type="button"
      aria-label="Open city map menu"
      onClick={onOpen}
      className="pointer-events-auto absolute left-4 top-44 w-28 overflow-hidden rounded-xl border border-primary/40 bg-background/90 p-1.5 text-left md:left-6 md:w-40"
    >
      <span className="block h-16 md:h-24">
        <StreetMap position={position} destination={destination} compact />
      </span>
      <span className="block truncate text-[10px] text-primary">You are here · {address.district}</span>
      <span className="block text-[9px] text-muted-foreground">Map · Tab / G</span>
    </button>
  )
}

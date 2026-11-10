'use client'

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, type LucideIcon } from 'lucide-react'
import { input } from '@/lib/game/input'

const PAD: { code: string; label: string; icon: LucideIcon; className: string }[] = [
  { code: 'KeyW', label: 'Walk forward', icon: ArrowUp, className: 'col-start-2 row-start-1' },
  { code: 'KeyA', label: 'Step left', icon: ArrowLeft, className: 'col-start-1 row-start-2' },
  { code: 'KeyS', label: 'Walk back', icon: ArrowDown, className: 'col-start-2 row-start-2' },
  { code: 'KeyD', label: 'Step right', icon: ArrowRight, className: 'col-start-3 row-start-2' },
]

export function TouchControls({ driving = false }: { driving?: boolean }) {
  const press = (code: string) => {
    if (input.enabled) input.keys.add(code)
  }
  const release = (code: string) => input.keys.delete(code)

  return (
    <div className="pointer-events-auto hidden grid-cols-3 grid-rows-2 gap-2 self-start pointer-coarse:grid">
      {driving && (
        <button
          type="button"
          aria-label="Brake"
          onPointerDown={() => press('Space')}
          onPointerUp={() => release('Space')}
          onPointerLeave={() => release('Space')}
          onPointerCancel={() => release('Space')}
          className="col-start-3 row-start-1 flex size-14 touch-none items-center justify-center rounded-xl border border-border bg-background/90 text-xs text-primary"
        >
          Brake
        </button>
      )}
      {PAD.map(({ code, label, icon: Icon, className }) => (
        <button
          key={code}
          type="button"
          aria-label={
            driving
              ? (
                  { KeyW: 'Accelerate', KeyS: 'Reverse', KeyA: 'Steer left', KeyD: 'Steer right' } as Record<
                    string,
                    string
                  >
                )[code]
              : label
          }
          onPointerDown={() => press(code)}
          onPointerUp={() => release(code)}
          onPointerLeave={() => release(code)}
          onPointerCancel={() => release(code)}
          onContextMenu={(e) => e.preventDefault()}
          className={`flex size-14 touch-none items-center justify-center rounded-xl border border-border bg-background/70 text-foreground backdrop-blur-md select-none active:bg-primary active:text-primary-foreground ${className}`}
        >
          <Icon className="size-6" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { formatDuration, formatMoney } from '@/lib/game/format'
import { useGame } from './game-provider'

export function OfflineDialog() {
  const { offlineReport, dismissOfflineReport } = useGame()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (offlineReport && !dialog.open) dialog.showModal()
    if (!offlineReport && dialog.open) dialog.close()
  }, [offlineReport])

  return (
    <dialog
      ref={dialogRef}
      onClose={dismissOfflineReport}
      aria-labelledby="offline-title"
      className="m-auto w-[min(90vw,24rem)] rounded-2xl border border-border bg-card p-6 text-center text-foreground backdrop:bg-background/80 backdrop:backdrop-blur-sm"
    >
      {offlineReport && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs tracking-[0.3em] text-primary uppercase">Welcome back, Boss</p>
          <h2 id="offline-title" className="font-serif text-2xl font-bold text-balance">
            The family kept busy
          </h2>
          <p className="text-sm text-muted-foreground">
            While you were away for {formatDuration(offlineReport.seconds * 1000)}, your capos collected
          </p>
          <p className="font-serif text-4xl font-bold text-primary tabular-nums">{formatMoney(offlineReport.earnings)}</p>
          <button
            type="button"
            onClick={dismissOfflineReport}
            className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:bg-primary/85"
          >
            Collect
          </button>
        </div>
      )}
    </dialog>
  )
}

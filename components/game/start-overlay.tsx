'use client'

import Image from 'next/image'

const CONTROLS = [
  ['W A S D', 'Walk the street'],
  ['Mouse', 'Click or drag to look'],
  ['E', 'Collect from a racket'],
  ['F', 'Buy more / acquire'],
  ['Q', 'Hire a capo'],
  ['1 - 4', 'Buy x1, x10, x100, Max'],
  ['M', 'Open the ledger'],
]

export function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto p-4">
      <Image src="/images/city-skyline.png" alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
      <div className="absolute inset-0 bg-background/70" />
      <section
        aria-labelledby="start-title"
        className="relative flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-border bg-card/90 p-6 backdrop-blur-md md:p-8"
      >
        <div className="flex flex-col gap-2 text-center">
          <Image src="/icon.svg" alt="La Famiglia family crest" width={76} height={76} className="mx-auto mb-2 drop-shadow-lg" />
          <p className="text-xs font-medium tracking-[0.3em] text-primary uppercase">Little Italy · New York, 1931</p>
          <h1 id="start-title" className="font-serif text-4xl font-bold text-balance text-foreground md:text-5xl">
            La Famiglia
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            Fourteen properties. One family. Walk the neon streets, fund midnight operations, and turn your first dollar into a dynasty.
          </p>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {CONTROLS.map(([key, action]) => (
            <div key={key} className="contents">
              <dt>
                <kbd className="inline-block min-w-16 rounded-md border border-border bg-background px-2 py-0.5 text-center font-sans text-xs font-semibold text-foreground">
                  {key}
                </kbd>
              </dt>
              <dd className="text-muted-foreground">{action}</dd>
            </div>
          ))}
        </dl>

        <p className="text-center text-xs text-primary">New: Empire objectives · Luxury assets · Original night music</p>
        <button
          type="button"
          onClick={onStart}
          autoFocus
          className="rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          Hit the streets
        </button>
      </section>
    </div>
  )
}

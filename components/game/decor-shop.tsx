'use client'

import { useEffect, useRef, useState } from 'react'
import { Paintbrush, X, Check } from 'lucide-react'
import { CATEGORY_LABELS, DECOR_CATEGORIES, DECOR_ITEMS, type DecorCategory } from '@/lib/game/decor'
import { formatMoney } from '@/lib/game/format'
import { useGame } from './game-provider'

export function DecorShop({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [category, setCategory] = useState<DecorCategory>('walls')
  const [notice, setNotice] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current!
    el.showModal()
    return () => el.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      aria-labelledby="decor-shop-title"
      className="fixed inset-0 m-auto max-h-[94dvh] w-[min(900px,calc(100%_-_24px))] overflow-y-auto rounded-2xl border border-primary/30 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/75"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background p-5">
        <div>
          <p className="flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
            <Paintbrush className="size-4" /> Bellini Interiors
          </p>
          <h1 id="decor-shop-title" className="font-serif text-3xl">
            Decor Shop
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wallet <strong className="text-primary">{formatMoney(state.cash)}</strong>
          </p>
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close decor shop"
          className="rounded-full border border-border p-3 hover:bg-card"
        >
          <X className="size-5" />
        </button>
      </header>
      <div className="flex flex-col gap-4 p-5">
        <p className="text-sm text-muted-foreground">
          Buy with in-game wallet cash and apply instantly. Owned styles can be switched for free. Cosmetic
          only—no income bonus. Your collection survives retirement and is saved on this device; a hard reset
          erases it.
        </p>
        <nav aria-label="Decor categories" className="flex flex-wrap gap-2">
          {DECOR_CATEGORIES.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={category === id}
              onClick={() => {
                setCategory(id)
                setNotice('')
              }}
              className={`rounded-full border px-3 py-2 text-sm ${category === id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'}`}
            >
              {CATEGORY_LABELS[id]}
            </button>
          ))}
        </nav>
        <p role="status" className="min-h-5 text-sm text-primary">
          {notice}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {DECOR_ITEMS.filter((item) => item.category === category).map((item) => {
            const owned = state.safeHouse.decor.owned.includes(item.id)
            const equipped = state.safeHouse.decor.equipped[category] === item.id
            return (
              <article
                key={item.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-card ${equipped ? 'border-primary' : 'border-border'}`}
              >
                <div
                  aria-hidden="true"
                  className="relative flex h-28 items-center justify-center border-b border-border"
                  style={{ background: `linear-gradient(145deg, ${item.color}, #111820)` }}
                >
                  <span
                    className="size-14 rounded-lg border-2 border-[#d7ba7d] shadow-xl"
                    style={{ backgroundColor: item.color }}
                  />
                  {equipped && <Check className="absolute top-3 right-3 size-5 text-[#f8e8c0]" />}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h2 className="font-serif text-xl">{item.name}</h2>
                  <p className="flex-1 text-sm text-muted-foreground">{item.description}</p>
                  <button
                    type="button"
                    disabled={equipped || (!owned && state.cash < item.cost)}
                    onClick={() => {
                      dispatch({ type: 'decor', id: item.id })
                      setNotice(
                        `${item.name} ${owned ? 'equipped' : 'purchased and equipped'}. Close the shop to see your room.`,
                      )
                    }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/85 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    aria-label={`${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'} ${item.name}${owned ? '' : ` for ${formatMoney(item.cost)}`}`}
                  >
                    {equipped
                      ? 'Equipped'
                      : owned
                        ? 'Equip · Owned'
                        : `Buy & equip · ${formatMoney(item.cost)}`}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </dialog>
  )
}

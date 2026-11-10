'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, House, LockKeyhole, ShieldCheck, X } from 'lucide-react'
import { formatMoney } from '@/lib/game/format'
import { VAULT_TIERS } from '@/lib/game/safe-house'
import { useGame } from './game-provider'

const buttonClass =
  'rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40'

export function SafeHouse({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [amount, setAmount] = useState('')
  const [notice, setNotice] = useState('')
  const [vaultOpen, setVaultOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const vault = state.safeHouse
  const tier = VAULT_TIERS[vault.tier]
  const next = VAULT_TIERS[vault.tier + 1]
  const numeric = Number(amount)
  const valid = amount.trim() !== '' && Number.isFinite(numeric) && numeric > 0
  const room = tier.capacity - vault.balance

  useEffect(() => {
    const el = dialog.current!
    el.showModal()
    return () => el.close()
  }, [])

  const transfer = (direction: 'deposit' | 'withdraw', all = false) => {
    const value = all ? (direction === 'deposit' ? Math.min(state.cash, room) : vault.balance) : numeric
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      (direction === 'deposit' ? value > state.cash || value > room : value > vault.balance)
    )
      return
    dispatch({ type: 'vault', direction, amount: all ? 'all' : value })
    setNotice(
      `${formatMoney(value)} ${direction === 'deposit' ? 'stored in the vault' : 'returned to your wallet'}.`,
    )
    setVaultOpen(true)
    setAmount('')
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      aria-labelledby="safe-house-title"
      className="fixed inset-0 m-auto max-h-[94dvh] w-[min(1100px,calc(100%_-_24px))] overflow-y-auto rounded-2xl border border-primary/25 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/80"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-primary uppercase">
            <House className="size-3" /> The Bellini residence
          </p>
          <h1 id="safe-house-title" className="font-serif text-2xl font-bold">
            Your Safe House
          </h1>
        </div>
        <button
          autoFocus
          type="button"
          onClick={onClose}
          className={buttonClass}
          aria-label="Leave safe house"
        >
          <X className="inline size-4" /> <span className="hidden sm:inline">Back to the street</span>
        </button>
      </header>
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <section
          aria-label="Safe house interior"
          className="relative flex min-h-64 flex-col justify-end overflow-hidden border-b border-border bg-[#171d24] p-5 lg:border-r lg:border-b-0"
        >
          <svg
            viewBox="0 0 600 500"
            role="img"
            aria-label="A private Art Deco lounge with a leather sofa, city window, brass lamp, and steel vault"
            className="absolute inset-0 h-full w-full object-cover"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="room-wall" x2="0" y2="1">
                <stop stopColor="#26353b" />
                <stop offset="1" stopColor="#111b20" />
              </linearGradient>
              <linearGradient id="room-floor" x2="0.3" y2="1">
                <stop stopColor="#71513c" />
                <stop offset="1" stopColor="#211a19" />
              </linearGradient>
              <radialGradient id="room-glow">
                <stop stopColor="#ffcb77" stopOpacity=".3" />
                <stop offset="1" stopColor="#ffcb77" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d="M0 0h600v350H0z" fill="url(#room-wall)" />
            <path d="M0 350h600v150H0z" fill="url(#room-floor)" />
            {[30, 120, 210, 300, 390, 480, 570].map((x) => (
              <path
                key={x}
                d={`M${x} 0v350M${x} 350l${(x - 300) / 2} 150`}
                stroke="#c1a46b"
                strokeOpacity=".18"
              />
            ))}
            <path d="M0 55h600M0 61h600M0 343h600M0 352h600" stroke="#a68b59" strokeWidth="3" />
            <rect
              x="65"
              y="90"
              width="205"
              height="185"
              rx="2"
              fill="#0a1425"
              stroke="#b89760"
              strokeWidth="6"
            />
            {[80, 110, 148, 180, 222].map((x, i) => (
              <g key={x}>
                <rect x={x} y={145 + (i % 3) * 22} width="27" height="125" fill="#253447" />
                <path d={`M${x + 8} 205v8m0 10v8m10-20v8m0 10v8`} stroke="#cfad6a" strokeWidth="3" />
              </g>
            ))}
            <circle cx="234" cy="120" r="14" fill="#eee5c4" />
            <path d="M167 90v185M65 181h205" stroke="#b89760" strokeWidth="5" />
            <ellipse cx="288" cy="410" rx="240" ry="49" fill="#792f35" stroke="#b58961" strokeWidth="3" />
            <rect
              x="60"
              y="309"
              width="220"
              height="82"
              rx="16"
              fill="#552c28"
              stroke="#955e46"
              strokeWidth="3"
            />
            <rect x="52" y="343" width="236" height="43" rx="12" fill="#6e3b31" />
            <path d="M74 378v22m192-22v22M167 317v52" stroke="#bd9359" strokeWidth="5" />
            <ellipse cx="189" cy="408" rx="65" ry="20" fill="#271e1c" stroke="#b68f58" strokeWidth="3" />
            <path d="M152 410v29m73-29v29" stroke="#b68f58" strokeWidth="5" />
            <rect x="167" y="397" width="33" height="8" rx="2" fill="#a78858" />
            <circle cx="324" cy="247" r="110" fill="url(#room-glow)" />
            <path d="M325 254v130m-24 0h48" stroke="#b9985f" strokeWidth="5" />
            <path d="M304 210h42l18 48h-78z" fill="#d7bb82" />
            <rect
              x="403"
              y="153"
              width="137"
              height="226"
              rx="9"
              fill="#10191c"
              stroke="#a18b60"
              strokeWidth="4"
            />
            <rect
              x="414"
              y="164"
              width="115"
              height="202"
              rx="6"
              fill={vaultOpen ? '#172426' : '#3a494d'}
              stroke="#7b9194"
              strokeWidth="3"
            />
            {vaultOpen ? (
              <g fill="#bba16c">
                {[0, 1, 2].map((row) => (
                  <g key={row}>
                    {[0, 1, 2].map((col) => (
                      <rect key={col} x={425 + col * 29} y={313 - row * 20} width="25" height="15" rx="2" />
                    ))}
                  </g>
                ))}
              </g>
            ) : (
              <g stroke="#b9b39d" fill="none" strokeWidth="5">
                <circle cx="470" cy="257" r="26" />
                <path d="M444 257h52m-26-26v52m-18-44l36 36m0-36l-36 36" />
              </g>
            )}
            <path d="M520 205v80" stroke="#c1bfa9" strokeWidth="7" />
            <rect x="434" y="181" width="72" height="15" rx="2" fill="#ae925d" />
            <text x="470" y="192" textAnchor="middle" fill="#202528" fontSize="10" fontFamily="Georgia">
              LA FAMIGLIA
            </text>
            <path d="M397 382h150" stroke="#101719" strokeWidth="9" />
          </svg>
          <div className="relative mt-64 rounded-xl border border-primary/20 bg-black/70 p-4 backdrop-blur-sm lg:mt-80">
            <p className="font-serif text-lg text-primary">A place to call your own.</p>
            <p className="mt-1 text-xs leading-relaxed text-[#d0c9b7]">
              Your family&apos;s private retreat, just beside the starting block. Businesses keep earning
              while you are here.
            </p>
            <button
              type="button"
              onClick={() => setVaultOpen((open) => !open)}
              aria-pressed={vaultOpen}
              className="mt-3 text-sm font-semibold text-primary underline underline-offset-4"
            >
              {vaultOpen ? 'Close vault door' : 'Open vault door'}
            </button>
          </div>
        </section>
        <section aria-labelledby="vault-heading" className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <LockKeyhole className="size-7 text-primary" />
            <div>
              <h2 id="vault-heading" className="font-serif text-2xl">
                The Family Vault
              </h2>
              <p className="text-xs text-muted-foreground">
                {tier.name} · Level {vault.tier + 1}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Stored cash</p>
            <p className="mt-1 font-serif text-4xl text-primary tabular-nums">{formatMoney(vault.balance)}</p>
            <progress
              aria-label="Vault capacity used"
              max={tier.capacity}
              value={vault.balance}
              className="mt-3 h-2 w-full accent-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMoney(vault.balance)} / {formatMoney(tier.capacity)} capacity · {formatMoney(room)} free
            </p>
          </div>
          <p className="text-sm">
            Wallet: <strong className="text-primary tabular-nums">{formatMoney(state.cash)}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <label htmlFor="vault-amount" className="text-sm font-semibold">
              Transfer amount
            </label>
            <input
              id="vault-amount"
              type="number"
              min="0.01"
              step="any"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setNotice('')
              }}
              placeholder="Enter cash amount"
              className="w-full rounded-lg border border-border bg-card px-3 py-3 text-base outline-none focus:border-primary"
              aria-describedby="vault-help"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={!valid || numeric > state.cash || numeric > room}
                onClick={() => transfer('deposit')}
              >
                <ArrowDownToLine className="mr-1 inline size-4" /> Deposit
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={!valid || numeric > vault.balance}
                onClick={() => transfer('withdraw')}
              >
                <ArrowUpFromLine className="mr-1 inline size-4" /> Withdraw
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={state.cash <= 0 || room <= 0}
                onClick={() => transfer('deposit', true)}
              >
                Deposit all that fits
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={vault.balance <= 0}
                onClick={() => transfer('withdraw', true)}
              >
                Withdraw all
              </button>
            </div>
            <p id="vault-help" className="text-xs leading-relaxed text-muted-foreground">
              Stored cash cannot be spent until withdrawn. No interest or transfer fees. Vault cash and
              upgrades survive retirement, but a hard reset erases them. Saved on this device with your
              empire.
            </p>
            <p role="status" className="min-h-5 text-sm text-primary">
              {notice}
            </p>
          </div>
          <div className="mt-auto rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" /> {next ? next.name : 'Maximum security'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {next
                ? `Expand storage to ${formatMoney(next.capacity)}. Paid from your wallet.`
                : 'Your family has the largest vault available.'}
            </p>
            {next && (
              <button
                type="button"
                className={`${buttonClass} mt-3 w-full`}
                disabled={state.cash < next.cost}
                onClick={() => {
                  dispatch({ type: 'vaultUpgrade' })
                  setNotice(`Vault upgraded to ${next.name}.`)
                }}
              >
                Upgrade vault · {formatMoney(next.cost)}
              </button>
            )}
          </div>
        </section>
      </div>
    </dialog>
  )
}

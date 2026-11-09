'use client'

import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { BUSINESSES, SAVE_KEY, UPGRADES } from '@/lib/game/config'
import {
  claimableRespect,
  computeOfflineEarnings,
  costFor,
  createInitialState,
  resolveBuyAmount,
  tick,
  type BuyAmount,
  type GameState,
} from '@/lib/game/engine'

type Action =
  | { type: 'tick'; dt: number }
  | { type: 'run'; id: string }
  | { type: 'buy'; id: string; amount: BuyAmount }
  | { type: 'hire'; id: string }
  | { type: 'upgrade'; id: string }
  | { type: 'prestige' }
  | { type: 'load'; state: GameState }
  | { type: 'hardReset' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'tick':
      return tick(state, action.dt)
    case 'run': {
      const b = state.businesses[action.id]
      if (!b || b.owned === 0 || b.running || b.managed) return state
      return { ...state, businesses: { ...state.businesses, [action.id]: { ...b, running: true, progress: 0 } } }
    }
    case 'buy': {
      const config = BUSINESSES.find((c) => c.id === action.id)
      if (!config) return state
      const b = state.businesses[action.id]
      const qty = resolveBuyAmount(config, b.owned, state.cash, action.amount)
      const cost = costFor(config, b.owned, qty)
      if (cost > state.cash) return state
      return {
        ...state,
        cash: state.cash - cost,
        businesses: { ...state.businesses, [action.id]: { ...b, owned: b.owned + qty } },
      }
    }
    case 'hire': {
      const config = BUSINESSES.find((c) => c.id === action.id)
      const b = state.businesses[action.id]
      if (!config || !b || b.managed || b.owned === 0 || state.cash < config.managerCost) return state
      return {
        ...state,
        cash: state.cash - config.managerCost,
        businesses: { ...state.businesses, [action.id]: { ...b, managed: true, running: true } },
      }
    }
    case 'upgrade': {
      const up = UPGRADES.find((u) => u.id === action.id)
      if (!up || state.upgrades.includes(up.id) || state.cash < up.cost) return state
      return { ...state, cash: state.cash - up.cost, upgrades: [...state.upgrades, up.id] }
    }
    case 'prestige': {
      const gained = claimableRespect(state)
      if (gained <= 0) return state
      return createInitialState(state.respect + gained, state.lifetimeEarnings, state.heists + 1)
    }
    case 'load':
      return action.state
    case 'hardReset':
      return createInitialState()
  }
}

type OfflineReport = { earnings: number; seconds: number } | null

type GameContextValue = {
  state: GameState
  dispatch: (action: Action) => void
  hydrated: boolean
  offlineReport: OfflineReport
  dismissOfflineReport: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function loadSave(): GameState | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    const fresh = createInitialState()
    return {
      ...fresh,
      ...parsed,
      businesses: { ...fresh.businesses, ...parsed.businesses },
    }
  } catch {
    return null
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialState())
  const [hydrated, setHydrated] = useState(false)
  const [offlineReport, setOfflineReport] = useState<OfflineReport>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const saved = loadSave()
    if (saved) {
      const now = Date.now()
      const offline = computeOfflineEarnings(saved, now)
      const restored: GameState = {
        ...saved,
        cash: saved.cash + offline.earnings,
        runEarnings: saved.runEarnings + offline.earnings,
        lifetimeEarnings: saved.lifetimeEarnings + offline.earnings,
        lastSaved: now,
      }
      dispatch({ type: 'load', state: restored })
      if (offline.earnings > 0) setOfflineReport(offline)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    let last = Date.now()
    const loop = window.setInterval(() => {
      const now = Date.now()
      dispatch({ type: 'tick', dt: now - last })
      last = now
    }, 100)

    const save = () => {
      try {
        window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...stateRef.current, lastSaved: Date.now() }))
      } catch {
        // Storage may be unavailable (private mode); the game keeps running in memory.
      }
    }
    const saveLoop = window.setInterval(save, 5000)
    const onHide = () => {
      if (document.visibilityState === 'hidden') save()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', save)

    return () => {
      window.clearInterval(loop)
      window.clearInterval(saveLoop)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', save)
      save()
    }
  }, [hydrated])

  return (
    <GameContext.Provider
      value={{ state, dispatch, hydrated, offlineReport, dismissOfflineReport: () => setOfflineReport(null) }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}

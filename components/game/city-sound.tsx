'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useGame } from './game-provider'

const SoundContext = createContext({ enabled: false, toggle: async () => {} })
export function CitySoundProvider({ children }: { children: ReactNode }) {
  const { state } = useGame()
  const [enabled, setEnabled] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const signature = `${state.play.eventId}:${state.challenges.log[0]}:${state.harbor.log[0]}:${state.apartments.log[0]}`
  const previous = useRef(signature)
  const chime = () => {
    const ctx = audio.current
    if (!ctx || ctx.state !== 'running') return
    for (const [index, frequency] of [392, 493.88, 587.33].entries()) {
      const tone = ctx.createOscillator(),
        volume = ctx.createGain(),
        start = ctx.currentTime + index * 0.07
      tone.type = 'sine'
      tone.frequency.value = frequency
      volume.gain.setValueAtTime(0, start)
      volume.gain.linearRampToValueAtTime(0.035, start + 0.015)
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.3)
      tone.connect(volume)
      volume.connect(ctx.destination)
      tone.start(start)
      tone.stop(start + 0.32)
      tone.onended = () => {
        tone.disconnect()
        volume.disconnect()
      }
    }
  }
  useEffect(() => {
    if (signature !== previous.current && enabled) chime()
    previous.current = signature
  }, [signature, enabled])
  useEffect(
    () => () => {
      void audio.current?.close()
    },
    [],
  )
  const toggle = async () => {
    if (enabled) {
      setEnabled(false)
      await audio.current?.suspend()
      return
    }
    try {
      audio.current ??= new AudioContext()
      await audio.current.resume()
      setEnabled(true)
      chime()
    } catch {
      setEnabled(false)
    }
  }
  return <SoundContext.Provider value={{ enabled, toggle }}>{children}</SoundContext.Provider>
}
export function CitySound() {
  const { enabled, toggle } = useContext(SoundContext)
  return (
    <button
      type="button"
      aria-pressed={enabled}
      className="rounded-full border border-border bg-background/90 px-3 py-2 text-xs text-primary"
      onClick={() => {
        void toggle()
      }}
    >
      Reward sounds: {enabled ? 'On' : 'Off'}
    </button>
  )
}

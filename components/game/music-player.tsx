'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Original, synthesized 16-bar nocturne. No external streams or audio downloads.
const CHORDS = [
  [48, 51, 55, 58],
  [53, 56, 60, 63],
  [46, 50, 53, 56],
  [43, 47, 50, 53],
]
const MELODY = [72, 0, 75, 79, 77, 75, 0, 70, 68, 0, 72, 75, 74, 72, 0, 67]

export function MusicPlayer() {
  const audio = useRef<{
    ctx: AudioContext
    master: GainNode
    timer: number
  } | null>(null)
  const starting = useRef(false)
  const volumeRef = useRef(0.35)
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [error, setError] = useState(false)

  const stop = () => {
    if (!audio.current) return
    window.clearInterval(audio.current.timer)
    void audio.current.ctx.close()
    audio.current = null
  }

  useEffect(() => {
    const visibility = () => {
      const ctx = audio.current?.ctx
      if (!ctx) return
      if (document.hidden) void ctx.suspend()
      else void ctx.resume().catch(() => setError(true))
    }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      stop()
    }
  }, [])

  const toggle = async () => {
    if (starting.current) return
    if (audio.current) {
      stop()
      setEnabled(false)
      return
    }
    starting.current = true
    let ctx: AudioContext | null = null
    try {
      ctx = new AudioContext()
      await ctx.resume()
      const master = ctx.createGain()
      master.gain.value = volumeRef.current * 0.35
      master.connect(ctx.destination)
      const context = ctx
      const note = (midi: number, at: number, duration: number, gain: number, type: OscillatorType) => {
        const oscillator = context.createOscillator()
        const envelope = context.createGain()
        oscillator.type = type
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12)
        envelope.gain.setValueAtTime(0, at)
        envelope.gain.linearRampToValueAtTime(gain, at + 0.015)
        envelope.gain.exponentialRampToValueAtTime(0.001, at + duration)
        oscillator.connect(envelope)
        envelope.connect(master)
        oscillator.start(at)
        oscillator.stop(at + duration + 0.03)
        oscillator.onended = () => {
          oscillator.disconnect()
          envelope.disconnect()
        }
      }
      let step = 0
      let next = context.currentTime + 0.05
      const schedule = () => {
        while (next < context.currentTime + 0.25) {
          const chord = CHORDS[Math.floor(step / 8) % CHORDS.length]
          if (step % 2 === 0) note(chord[(step / 2) % 4] - 12, next, 0.32, 0.5, 'triangle')
          if (step % 4 === 0) chord.forEach((n) => note(n + 12, next, 0.65, 0.08, 'sine'))
          const melody = MELODY[step % MELODY.length]
          if (melody) note(melody, next, 0.35, 0.17, 'triangle')
          // A gentle swung eighth-note pulse at 92 BPM.
          next += (60 / 92 / 2) * (step % 2 === 0 ? 1.16 : 0.84)
          step++
        }
      }
      schedule()
      audio.current = { ctx, master, timer: window.setInterval(schedule, 100) }
      setEnabled(true)
      setError(false)
    } catch {
      if (ctx) void ctx.close()
      setError(true)
      setEnabled(false)
    } finally {
      starting.current = false
    }
  }

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 backdrop-blur-md">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={enabled}
        aria-label={enabled ? 'Mute music' : 'Play music'}
        className="flex items-center gap-2 text-xs font-semibold text-primary"
      >
        {enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        Music {enabled ? 'on' : 'off'}
      </button>
      {enabled && (
        <input
          type="range"
          aria-label="Music volume"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          className="w-16 accent-[var(--primary)]"
          onChange={(e) => {
            const value = Number(e.target.value)
            setVolume(value)
            volumeRef.current = value
            if (audio.current)
              audio.current.master.gain.setTargetAtTime(value * 0.35, audio.current.ctx.currentTime, 0.05)
          }}
        />
      )}
      {error && (
        <span role="status" className="text-xs text-muted-foreground">
          Audio unavailable; tap to retry.
        </span>
      )}
    </div>
  )
}

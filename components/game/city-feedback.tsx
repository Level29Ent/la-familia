'use client'

import { useEffect, useRef, useState } from 'react'
import { useGame } from './game-provider'
import { RANKS, rankIndex } from '@/lib/game/dynasty'
import { cityTime, JOBS } from '@/lib/game/city-play'

export function CityFeedback() {
  const { state } = useGame(),
    [message, setMessage] = useState(''),
    prev = useRef({ event: state.play.eventId, rank: rankIndex(state), log: state.dynasty.log[0], dispatch: state.challenges.log[0], property: state.apartments.log[0], harbor: state.harbor.log[0] })
  useEffect(() => {
    const rank = rankIndex(state)
    let text = ''
    if (prev.current.rank !== rank && rank > prev.current.rank) text = `Promoted to ${RANKS[rank].name}`
    else if (prev.current.event !== state.play.eventId) text = state.play.events[0]
    else if (prev.current.dispatch !== state.challenges.log[0]) text = state.challenges.log[0]
    else if (prev.current.property !== state.apartments.log[0]) text = state.apartments.log[0]
    else if (prev.current.harbor !== state.harbor.log[0]) text = state.harbor.log[0]
    else if (prev.current.log !== state.dynasty.log[0]) text = state.dynasty.log[0]
    prev.current = { event: state.play.eventId, rank, log: state.dynasty.log[0], dispatch: state.challenges.log[0], property: state.apartments.log[0], harbor: state.harbor.log[0] }
    if (text) setMessage(text)
  }, [state.play.eventId, state.dynasty.log[0], state.challenges.log[0], state.apartments.log[0], state.harbor.log[0], rankIndex(state)])
  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(''), 6500)
    return () => clearTimeout(id)
  }, [message])
  return (
    <>
      {message && (
        <div
          role="status"
          aria-label="City notification"
          className="pointer-events-none absolute inset-x-4 top-2 z-40 mx-auto max-w-xl rounded-xl border border-primary/40 bg-background/95 px-4 py-3 text-center text-sm text-primary"
        >
          {message}
        </div>
      )}
    </>
  )
}
export function ClockBadge() {
  const { state } = useGame()
  const time = cityTime(state.play),
    job = JOBS.find((j) => j.id === state.play.job?.id)
  return (
    <p aria-label="City clock" className="text-[11px] text-primary">
      {time.label} · {time.night ? 'Nightlife & late patrols' : 'Daytime commerce'} · {state.play.completed}{' '}
      city activities
      {state.challenges.run && <span className="block text-amber-200">Dispatch · {Math.ceil(state.challenges.run.remainingMs / 1000)}s · Stop {state.challenges.run.checkpoint + 1}</span>}
      {job && (
        <span className="block max-w-48 truncate">
          {job.title} · {Math.ceil((state.play.job?.remainingMs ?? 0) / 1000)}s · finish inside{' '}
          {job.destination}
        </span>
      )}
    </p>
  )
}

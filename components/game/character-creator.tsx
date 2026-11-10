'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { X, UserRound } from 'lucide-react'
import { CharacterModel } from '@/components/world/character-model'
import { CHARACTER_OPTIONS, DEFAULT_CHARACTER, type CharacterChoice } from '@/lib/game/character'
import { useGame } from './game-provider'

const LABELS: Record<CharacterChoice, string> = {
  skin: 'Skin tone',
  hairColor: 'Hair color',
  eyes: 'Eye color',
  jacket: 'Jacket / vest color',
  trousers: 'Trouser color',
  shirt: 'Shirt color',
  tie: 'Tie color',
  shoes: 'Shoe color',
  hair: 'Hair style',
  facialHair: 'Facial hair',
  outfit: 'Outfit',
  hat: 'Headwear',
  glasses: 'Eyewear',
}

export function CharacterCreator({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useGame()
  const [draft, setDraft] = useState({ ...state.character })
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
      aria-labelledby="character-title"
      className="fixed inset-0 m-auto max-h-[95dvh] w-[min(1000px,calc(100%_-_24px))] overflow-y-auto rounded-2xl border border-primary/30 bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/80"
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background p-4">
        <div>
          <p className="flex items-center gap-2 text-xs tracking-widest text-primary uppercase">
            <UserRound className="size-4" /> Your family. Your identity.
          </p>
          <h1 id="character-title" className="font-serif text-2xl">
            Create your character
          </h1>
        </div>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Cancel character changes"
          className="rounded-full border border-border p-3"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="grid md:grid-cols-[0.85fr_1.15fr]">
        <section aria-label="Character preview" className="bg-[#1c2631] md:sticky md:top-20 md:h-[560px]">
          <div className="h-72 md:h-[480px]">
            <Canvas
              camera={{ position: [0, 1.3, 4.1], fov: 37 }}
              dpr={[1, 1.5]}
              aria-label="Rotatable 3D character preview"
            >
              <color attach="background" args={['#1c2631']} />
              <ambientLight intensity={1.6} />
              <directionalLight position={[3, 5, 4]} intensity={2.5} color="#ffe5c4" />
              <directionalLight position={[-3, 2, -2]} intensity={1.5} color="#9ec3ff" />
              <CharacterModel config={draft} preview />
              <OrbitControls
                target={[0, 1.1, 0]}
                enablePan={false}
                minDistance={2.5}
                maxDistance={5}
                minPolarAngle={0.5}
                maxPolarAngle={1.8}
              />
            </Canvas>
          </div>
          <p className="px-4 py-2 text-center text-xs text-[#d9d5c8]">
            Drag to rotate · Scroll / pinch to zoom
            <br />
            Preview changes before saving. Customization is free.
          </p>
        </section>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            dispatch({ type: 'character', config: draft })
            onClose()
          }}
          className="flex flex-col gap-5 p-5"
        >
          <label className="flex flex-col gap-2 text-sm">
            Character name
            <input
              maxLength={24}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className="rounded-lg border border-border bg-card p-3"
            />
          </label>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-serif text-xl text-primary">Body & face</legend>
            {(['height', 'build', 'shoulders', 'hips', 'chest', 'face', 'nose', 'jaw'] as const).map(
              (key) => (
                <label key={key} className="flex flex-col gap-2 text-sm capitalize">
                  {key === 'face' ? 'Face width' : key === 'build' ? 'Body build' : key}
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.02"
                    value={draft[key]}
                    onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })}
                    className="accent-[var(--primary)]"
                  />
                </label>
              ),
            )}
          </fieldset>
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-3 font-serif text-xl text-primary">Appearance & wardrobe</legend>
            {(Object.keys(CHARACTER_OPTIONS) as CharacterChoice[]).map((key) => {
              const values = CHARACTER_OPTIONS[key]
              const color = values[0].startsWith('#')
              return (
                <label key={key} className="flex flex-col gap-2 text-sm">
                  {LABELS[key]}
                  <div className="flex items-center gap-2">
                    {color && (
                      <span
                        aria-hidden="true"
                        className="size-7 shrink-0 rounded-full border border-white/30"
                        style={{ backgroundColor: values[draft[key]] }}
                      />
                    )}
                    <select
                      value={draft[key]}
                      onChange={(event) => setDraft({ ...draft, [key]: Number(event.target.value) })}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2"
                    >
                      {values.map((value, index) => (
                        <option key={value} value={index}>
                          {color ? `${LABELS[key]} ${index + 1}` : value}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              )
            })}
          </fieldset>
          <p className="text-xs text-muted-foreground">
            Your look is saved on this device and stays with you after retirement. Hard reset restores the
            default character. The model is an original stylized human, not a photorealistic scan.
          </p>
          <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-background py-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground"
            >
              Save character
            </button>
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_CHARACTER })}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Reset draft
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

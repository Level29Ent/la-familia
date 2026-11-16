'use client'

import { Component, type ReactNode } from 'react'

export function SceneUnavailable() {
  return (
    <div role="alert" className="absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-sm rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="font-serif text-xl text-primary">The 3D scene could not start</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Check your connection and that WebGL is enabled in your browser, then reload. Your saved progress is kept.
        </p>
        <button type="button" className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground" onClick={() => window.location.reload()}>
          Reload game
        </button>
      </div>
    </div>
  )
}

export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('La Familia scene failed to load', error)
  }

  render() {
    return this.state.failed ? <SceneUnavailable /> : this.props.children
  }
}

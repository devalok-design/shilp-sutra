'use client'

/**
 * MotionProvider -- Motion presets and reduced-motion state for the whole tree.
 *
 * **`motion/` is an orthogonal layer.** It sits beside the
 * `primitives/ → ui/ → composed/ → shell/` hierarchy rather than inside it,
 * so the `no-restricted-imports` boundary rule in `eslint.config.js` does not
 * govern it and any layer may import from here. Today `ui/`, `composed/` and
 * `ai/` do; `shell/` does not.
 *
 * The one in-repo edge runs the other way: the `springs`/`tweens` presets come
 * from `ui/lib/motion`, a leaf module whose only import is `framer-motion`. It
 * imports nothing back, so `ui/` ↔ `motion/` is not a cycle. Those presets
 * are also re-exported from `motion/index.ts`, so they are reachable by two
 * paths — prefer `motion/`.
 *
 * Mounting is optional. With no provider above it, `useMotion()` falls back to
 * the OS `prefers-reduced-motion` setting, so a provider is an override rather
 * than a requirement.
 */
import { MotionConfig, useReducedMotion as useFMReducedMotion } from 'framer-motion'
import * as React from 'react'

import { springs, tweens } from '../ui/lib/motion'

type ReducedMotionMode = 'user' | boolean

type MotionContextValue = {
  springs: typeof springs
  tweens: typeof tweens
  reducedMotion: boolean
}

// `null` default = "no MotionProvider mounted". `useMotion()` detects this and
// falls back to the OS `prefers-reduced-motion` setting, so components respect
// reduced motion out of the box — a provider is an override, not a requirement.
const MotionContext = React.createContext<MotionContextValue | null>(null)

type MotionProviderProps = {
  children: React.ReactNode
  /** 'user' = detect OS preference, true = force off, false = force on */
  reducedMotion?: ReducedMotionMode
}

function MotionProvider({ children, reducedMotion = 'user' }: MotionProviderProps) {
  const osPreference = useFMReducedMotion() ?? false
  const isReduced = reducedMotion === 'user' ? osPreference : reducedMotion

  const value = React.useMemo<MotionContextValue>(
    () => ({ springs, tweens, reducedMotion: isReduced }),
    [isReduced],
  )

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion === 'user' ? 'user' : reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  )
}

function useMotion(): MotionContextValue {
  const ctx = React.useContext(MotionContext)
  // Always called (hook order stable); only used when no provider is mounted.
  const osPreference = useFMReducedMotion() ?? false
  if (ctx) return ctx
  return { springs, tweens, reducedMotion: osPreference }
}

export { MotionContext, MotionProvider, type MotionProviderProps,useMotion }

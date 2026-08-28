'use client'

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

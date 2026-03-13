'use client'

import * as React from 'react'
import { MotionConfig, useReducedMotion as useFMReducedMotion } from 'framer-motion'
import { springs, tweens } from '../ui/lib/motion'

type ReducedMotionMode = 'user' | boolean

type MotionContextValue = {
  springs: typeof springs
  tweens: typeof tweens
  reducedMotion: boolean
}

const MotionContext = React.createContext<MotionContextValue>({
  springs,
  tweens,
  reducedMotion: false,
})

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

function useMotion() {
  return React.useContext(MotionContext)
}

export { MotionProvider, useMotion, type MotionProviderProps }

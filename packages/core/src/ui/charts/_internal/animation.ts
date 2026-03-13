'use client'

import { useMotion } from '../../../motion/motion-provider'

/** Hook to detect reduced-motion preference via MotionProvider context */
export function useReducedMotion(): boolean {
  const { reducedMotion } = useMotion()
  return reducedMotion
}

/** Get transition duration respecting reduced motion preference */
export function getTransitionDuration(reducedMotion: boolean, duration = 300): number {
  return reducedMotion ? 0 : duration
}

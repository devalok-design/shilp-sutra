import { useState, useEffect } from 'react'

/** Hook to detect prefers-reduced-motion */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}

/** Get transition duration respecting reduced motion preference */
export function getTransitionDuration(reducedMotion: boolean, duration = 300): number {
  return reducedMotion ? 0 : duration
}

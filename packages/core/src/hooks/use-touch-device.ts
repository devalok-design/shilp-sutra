'use client'

import * as React from 'react'

/**
 * Detects whether the device supports touch input.
 *
 * Use `useIsMobile()` for layout decisions (viewport width).
 * Use `useTouchDevice()` for interaction decisions (hover vs touch).
 *
 * SSR-safe: returns false on server.
 * Stable: only checks on mount, doesn't change on resize.
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    setIsTouch(
      'ontouchstart' in window || navigator.maxTouchPoints > 0
    )
  }, [])

  return isTouch
}

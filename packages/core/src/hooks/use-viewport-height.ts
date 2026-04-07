'use client'

import * as React from 'react'

/**
 * Returns the current dynamic viewport height in pixels.
 *
 * Unlike CSS `100vh`, this accounts for mobile browser toolbar
 * show/hide and virtual keyboard appearance via the Visual Viewport API.
 *
 * SSR-safe: returns 0 on server (check for 0 to detect SSR).
 */
export function useViewportHeight(): number {
  const [height, setHeight] = React.useState(0)

  React.useEffect(() => {
    const update = () => {
      setHeight(window.visualViewport?.height ?? window.innerHeight)
    }

    update()

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', update)
      return () => vv.removeEventListener('resize', update)
    } else {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
  }, [])

  return height
}

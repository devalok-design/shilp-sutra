'use client'

import * as React from 'react'

export interface ContainerSize {
  width: number
  height: number
}

/**
 * Tracks an element's content-box size via `ResizeObserver`. Attach the
 * returned `ref` to the element you want to measure.
 *
 * SSR-safe: returns `{ width: 0, height: 0 }` until the ref is attached and
 * the observer fires.
 */
export function useContainerSize<T extends Element = HTMLDivElement>(): {
  ref: React.RefCallback<T>
  width: number
  height: number
} {
  const [size, setSize] = React.useState<ContainerSize>({ width: 0, height: 0 })
  const elementRef = React.useRef<T | null>(null)
  const observerRef = React.useRef<ResizeObserver | null>(null)

  const ref = React.useCallback((node: T | null) => {
    observerRef.current?.disconnect()
    elementRef.current = node
    if (!node) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    })
    observer.observe(node)
    observerRef.current = observer
  }, [])

  React.useEffect(() => () => observerRef.current?.disconnect(), [])

  return { ref, width: size.width, height: size.height }
}

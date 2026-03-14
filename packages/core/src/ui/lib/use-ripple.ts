import { useState, useCallback, useEffect, useRef, type MouseEvent } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function useRipple(duration = 600) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  useEffect(() => {
    return () => { timeoutsRef.current.forEach(clearTimeout) }
  }, [])

  const createRipple = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples((prev) => [...prev, { id, x, y, size }])
    const t = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
      timeoutsRef.current.delete(t)
    }, duration)
    timeoutsRef.current.add(t)
  }, [duration])

  return { ripples, createRipple }
}

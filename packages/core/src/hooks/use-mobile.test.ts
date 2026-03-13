import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useIsMobile } from './use-mobile'

function createMockMediaQueryList(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  return {
    matches,
    media: '',
    addEventListener: vi.fn((_event: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: (e: { matches: boolean }) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) listeners.splice(idx, 1)
    }),
    _listeners: listeners,
    _fireChange(newMatches: boolean) {
      // The hook reads window.innerWidth, not the event, so we update innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: newMatches ? 500 : 1024,
      })
      listeners.forEach((cb) => cb({ matches: newMatches }))
    },
  }
}

describe('useIsMobile', () => {
  beforeEach(() => {
    // Default: desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('returns false initially (before effect runs, coerced from undefined)', () => {
    const mql = createMockMediaQueryList(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    })

    // The hook returns !!undefined = false before the effect, then !!false = false after
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is below breakpoint (768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    const mql = createMockMediaQueryList(true)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('responds to matchMedia change events', () => {
    const mql = createMockMediaQueryList(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate viewport shrinking below 768
    act(() => {
      mql._fireChange(true)
    })
    expect(result.current).toBe(true)

    // Simulate viewport growing above 768
    act(() => {
      mql._fireChange(false)
    })
    expect(result.current).toBe(false)
  })

  it('cleans up event listener on unmount', () => {
    const mql = createMockMediaQueryList(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    })

    const { unmount } = renderHook(() => useIsMobile())
    expect(mql.addEventListener).toHaveBeenCalledTimes(1)

    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
    // The same callback should be removed that was added
    expect(mql.removeEventListener.mock.calls[0][1]).toBe(
      mql.addEventListener.mock.calls[0][1],
    )
  })

  it('returns false when innerWidth equals the breakpoint (768)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })
    const mql = createMockMediaQueryList(false)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mql),
    })

    const { result } = renderHook(() => useIsMobile())
    // 768 is NOT < 768, so not mobile
    expect(result.current).toBe(false)
  })
})

import { act, renderHook } from '@testing-library/react'

import { useViewportHeight } from '../use-viewport-height'

describe('useViewportHeight', () => {
  afterEach(() => {
    // Ensure no test's window/visualViewport mocking leaks into the next test.
    // @ts-expect-error - visualViewport is not writable in the lib.dom types
    delete window.visualViewport
    vi.restoreAllMocks()
  })

  it('returns window.innerHeight in jsdom', () => {
    const { result } = renderHook(() => useViewportHeight())
    expect(result.current).toBe(window.innerHeight)
  })

  it('falls back to window.innerHeight when visualViewport is unavailable (SSR-like/older-browser case)', () => {
    // @ts-expect-error - visualViewport is not writable in the lib.dom types
    delete window.visualViewport
    expect(window.visualViewport).toBeUndefined()

    Object.defineProperty(window, 'innerHeight', {
      value: 742,
      configurable: true,
    })

    const { result } = renderHook(() => useViewportHeight())

    // The hook's initial state is 0 (SSR-safe), but React effects flush
    // synchronously before renderHook returns in this environment, so by
    // the time we can observe `result.current` the fallback to
    // window.innerHeight has already settled.
    expect(result.current).toBe(742)
  })

  it('subscribes to Visual Viewport resize events and updates height', () => {
    const listeners: Record<string, () => void> = {}
    const fakeVisualViewport = {
      height: 500,
      addEventListener: vi.fn((event: string, listener: () => void) => {
        listeners[event] = listener
      }),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'visualViewport', {
      value: fakeVisualViewport,
      configurable: true,
    })

    const { result } = renderHook(() => useViewportHeight())

    expect(result.current).toBe(500)
    expect(fakeVisualViewport.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )

    fakeVisualViewport.height = 350
    act(() => {
      listeners.resize()
    })

    expect(result.current).toBe(350)
  })

  it('falls back to window resize events when visualViewport is absent', () => {
    // @ts-expect-error - visualViewport is not writable in the lib.dom types
    delete window.visualViewport
    expect(window.visualViewport).toBeUndefined()

    const { result } = renderHook(() => useViewportHeight())

    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      configurable: true,
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(900)
  })

  it('removes the Visual Viewport resize listener on unmount', () => {
    const fakeVisualViewport = {
      height: 500,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'visualViewport', {
      value: fakeVisualViewport,
      configurable: true,
    })

    const { unmount } = renderHook(() => useViewportHeight())

    expect(fakeVisualViewport.removeEventListener).not.toHaveBeenCalled()

    unmount()

    expect(fakeVisualViewport.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
  })

  it('removes the window resize listener on unmount when visualViewport is absent', () => {
    // @ts-expect-error - visualViewport is not writable in the lib.dom types
    delete window.visualViewport
    expect(window.visualViewport).toBeUndefined()

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useViewportHeight())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
  })
})

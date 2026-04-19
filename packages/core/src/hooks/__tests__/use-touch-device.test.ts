import { renderHook } from '@testing-library/react'

import { useTouchDevice } from '../use-touch-device'

describe('useTouchDevice', () => {
  it('returns false when no touch APIs exist', () => {
    // jsdom defines ontouchstart by default — remove it for this test
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ontouchstart')
    delete (window as any).ontouchstart
    const orig = navigator.maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })

    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(false)

    // restore
    if (descriptor) Object.defineProperty(window, 'ontouchstart', descriptor)
    Object.defineProperty(navigator, 'maxTouchPoints', { value: orig, configurable: true })
  })

  it('returns true when ontouchstart exists', () => {
    Object.defineProperty(window, 'ontouchstart', { value: null, configurable: true })
    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(true)
  })

  it('returns true when maxTouchPoints > 0', () => {
    delete (window as any).ontouchstart
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 2, configurable: true })

    const { result } = renderHook(() => useTouchDevice())
    expect(result.current).toBe(true)

    Object.defineProperty(navigator, 'maxTouchPoints', { value: 0, configurable: true })
  })
})

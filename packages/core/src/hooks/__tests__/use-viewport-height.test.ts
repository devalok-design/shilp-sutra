import { renderHook } from '@testing-library/react'
import { useViewportHeight } from '../use-viewport-height'

describe('useViewportHeight', () => {
  it('returns window.innerHeight in jsdom', () => {
    const { result } = renderHook(() => useViewportHeight())
    expect(result.current).toBe(window.innerHeight)
  })
})

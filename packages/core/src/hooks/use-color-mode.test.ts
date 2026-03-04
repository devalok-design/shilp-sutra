import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useColorMode } from './use-color-mode'

describe('useColorMode', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    document.cookie = 'theme=; max-age=0; path=/'

    // jsdom does not provide matchMedia — supply a default stub
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('defaults to system when no preference saved', () => {
    const { result } = renderHook(() => useColorMode())
    expect(result.current.colorMode).toBe('system')
  })

  it('reads saved preference from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useColorMode())
    expect(result.current.colorMode).toBe('dark')
  })

  it('toggleColorMode switches from light to dark', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('light'))
    act(() => result.current.toggleColorMode())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleColorMode switches from dark to light', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    act(() => result.current.toggleColorMode())
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setColorMode persists to localStorage', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('setColorMode sets cookie for SSR', () => {
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('dark'))
    expect(document.cookie).toContain('theme=dark')
  })

  it('setColorMode("system") uses matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
    const { result } = renderHook(() => useColorMode())
    act(() => result.current.setColorMode('system'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})

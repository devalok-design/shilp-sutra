'use client'

import { useState, useCallback, useEffect } from 'react'

export type ColorMode = 'light' | 'dark' | 'system'

function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return mode
}

export function useColorMode() {
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as ColorMode) ?? 'system'
  })

  const setColorMode = useCallback((newMode: ColorMode) => {
    const resolved = resolveMode(newMode)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('theme', newMode)
    document.cookie = `theme=${newMode};path=/;max-age=31536000;SameSite=Lax`
    setModeState(newMode)
  }, [])

  const toggleColorMode = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setColorMode(isDark ? 'light' : 'dark')
  }, [setColorMode])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  return { colorMode: mode, setColorMode, toggleColorMode } as const
}

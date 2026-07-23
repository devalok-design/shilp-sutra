'use client'

import { useEffect, useState } from 'react'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

type Theme = 'light' | 'dark'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = readInitialTheme()
    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    window.localStorage.setItem('theme', next)
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={mounted ? `Switch to ${theme === 'light' ? 'dark' : 'light'} theme` : 'Toggle theme'}
      onClick={toggle}
    >
      {mounted && theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
    </Button>
  )
}

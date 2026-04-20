import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import * as React from 'react'
import { describe, expect,it } from 'vitest'

import {
  type CommandRegistry,
  CommandRegistryProvider,
  useCommandRegistry,
} from '../command-registry'

const mockRegistry: CommandRegistry = {
  pages: [
    { id: 'dashboard', label: 'Dashboard', icon: <span>D</span>, path: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: <span>T</span>, path: '/tasks', keywords: ['todo'] },
  ],
  adminPages: [
    { id: 'settings', label: 'Settings', icon: <span>S</span>, path: '/settings' },
  ],
}

describe('CommandRegistry', () => {
  it('renders children', () => {
    render(
      <CommandRegistryProvider registry={mockRegistry}>
        <div>App content</div>
      </CommandRegistryProvider>,
    )
    expect(screen.getByText('App content')).toBeInTheDocument()
  })

  it('provides registry via hook', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommandRegistryProvider registry={mockRegistry}>
        {children}
      </CommandRegistryProvider>
    )
    const { result } = renderHook(() => useCommandRegistry(), { wrapper })
    expect(result.current).toBe(mockRegistry)
    expect(result.current!.pages).toHaveLength(2)
    expect(result.current!.adminPages).toHaveLength(1)
  })

  it('returns null when used outside provider', () => {
    const { result } = renderHook(() => useCommandRegistry())
    expect(result.current).toBeNull()
  })

  it('pages have correct structure', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CommandRegistryProvider registry={mockRegistry}>
        {children}
      </CommandRegistryProvider>
    )
    const { result } = renderHook(() => useCommandRegistry(), { wrapper })
    const tasksPage = result.current!.pages.find((p) => p.id === 'tasks')
    expect(tasksPage).toBeDefined()
    expect(tasksPage!.label).toBe('Tasks')
    expect(tasksPage!.path).toBe('/tasks')
    expect(tasksPage!.keywords).toContain('todo')
  })
})

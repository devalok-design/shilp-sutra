import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type CommandGroup,CommandPalette } from './command-palette'

const groups: CommandGroup[] = [
  {
    label: 'Pages',
    items: [
      { id: 'home', label: 'Home', onSelect: vi.fn() },
      { id: 'settings', label: 'Settings', description: 'App config', onSelect: vi.fn() },
    ],
  },
  {
    label: 'Actions',
    items: [
      { id: 'new-task', label: 'New Task', shortcut: 'Ctrl+N', onSelect: vi.fn() },
    ],
  },
]

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(<CommandPalette open groups={groups} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('shows all items when no search query', () => {
    render(<CommandPalette open groups={groups} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('New Task')).toBeInTheDocument()
  })

  it('filters items by search query', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open groups={groups} />)
    await user.type(screen.getByRole('combobox'), 'sett')
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('shows empty message when no results match', async () => {
    const user = userEvent.setup()
    render(<CommandPalette open groups={groups} emptyMessage="Nothing found" />)
    await user.type(screen.getByRole('combobox'), 'zzzzz')
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })

  it('calls onSelect and closes on Enter', async () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    const testGroups: CommandGroup[] = [
      {
        label: 'Test',
        items: [{ id: '1', label: 'Item One', onSelect }],
      },
    ]
    const user = userEvent.setup()
    render(
      <CommandPalette open groups={testGroups} onOpenChange={onOpenChange} />,
    )
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders the search placeholder', () => {
    render(<CommandPalette open groups={groups} placeholder="Type a command..." />)
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument()
  })
})

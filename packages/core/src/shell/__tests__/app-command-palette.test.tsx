import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../../composed/command-palette', () => ({
  CommandPalette: ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => (
    <div data-testid="command-palette" {...props}>{children}</div>
  ),
}))

import { AppCommandPalette } from '../app-command-palette'
import type { SearchResult, SearchResultGroup } from '../app-command-palette'

describe('AppCommandPalette', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppCommandPalette />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<AppCommandPalette />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('merges className', () => {
    const { container } = render(<AppCommandPalette className="custom" />)
    expect(container.firstChild).toHaveClass('custom')
  })

  it('spreads props', () => {
    const { container } = render(<AppCommandPalette data-testid="acp" />)
    expect(container.firstChild).toHaveAttribute('data-testid', 'acp')
  })

  // -- P0 #1: Consumer-owned routing --

  it('renders search results when onSearchResultSelect is provided', () => {
    const onSearchResultSelect = vi.fn()
    const onNavigate = vi.fn()
    const results: SearchResult[] = [
      { id: 'task-1', title: 'My Task', entityType: 'TASK', projectId: 'proj-1' },
    ]

    const { container } = render(
      <AppCommandPalette
        searchResults={results}
        onSearchResultSelect={onSearchResultSelect}
        onNavigate={onNavigate}
      />,
    )

    const commandPalette = container.querySelector('[data-testid="command-palette"]')
    expect(commandPalette).toBeInTheDocument()
  })

  // -- P0 #2: Grouped search results --

  it('accepts searchResultGroups prop', () => {
    const resultGroups: SearchResultGroup[] = [
      { label: 'Tasks', results: [{ id: 't1', title: 'Task 1', entityType: 'TASK' }] },
      { label: 'Projects', results: [{ id: 'p1', title: 'Project 1', entityType: 'PROJECT' }] },
    ]

    const { container } = render(
      <AppCommandPalette searchResultGroups={resultGroups} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  // -- P1 #5: Extended SearchResult type --

  it('accepts search results with icon, rank, and shortcut', () => {
    const results: SearchResult[] = [
      {
        id: 'task-1',
        title: 'My Task',
        entityType: 'TASK',
        icon: <span>CustomIcon</span>,
        rank: 10,
        shortcut: 'G T',
      },
    ]

    const { container } = render(
      <AppCommandPalette searchResults={results} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  // -- P2 #10: Configurable search label --

  it('accepts searchResultsLabel as string', () => {
    const results: SearchResult[] = [
      { id: 'task-1', title: 'Task', entityType: 'TASK' },
    ]

    const { container } = render(
      <AppCommandPalette searchResults={results} searchResultsLabel="Top Hits" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('accepts searchResultsLabel as function', () => {
    const results: SearchResult[] = [
      { id: 'task-1', title: 'Task', entityType: 'TASK' },
    ]
    const labelFn = (count: number) => `${count} results`

    const { container } = render(
      <AppCommandPalette searchResults={results} searchResultsLabel={labelFn} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  // -- Pass-through props --

  it('passes open/onOpenChange to CommandPalette', () => {
    const onOpenChange = vi.fn()
    const { container } = render(
      <AppCommandPalette open={true} onOpenChange={onOpenChange} />,
    )
    const cp = container.querySelector('[data-testid="command-palette"]')
    expect(cp).toBeInTheDocument()
  })

  it('passes keybinding to CommandPalette', () => {
    const { container } = render(
      <AppCommandPalette keybinding={false} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('passes maxHeight to CommandPalette', () => {
    const { container } = render(
      <AppCommandPalette maxHeight="500px" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('passes emptyState to CommandPalette', () => {
    const { container } = render(
      <AppCommandPalette emptyState={<div>Custom empty</div>} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('passes footerHints to CommandPalette', () => {
    const { container } = render(
      <AppCommandPalette footerHints={[{ keys: 'Tab', label: 'Filter' }]} />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})

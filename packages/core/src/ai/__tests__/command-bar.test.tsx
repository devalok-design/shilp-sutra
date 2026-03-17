import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CommandBar } from '../command-bar'
import type { CommandGroup } from '../../composed/command-palette'

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

const sampleGroups: CommandGroup[] = [
  {
    label: 'Actions',
    items: [
      {
        id: 'create-task',
        label: 'Create Task',
        description: 'Add a new task',
        onSelect: vi.fn(),
      },
      {
        id: 'open-settings',
        label: 'Open Settings',
        description: 'View preferences',
        onSelect: vi.fn(),
      },
    ],
  },
  {
    label: 'Pages',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        onSelect: vi.fn(),
      },
    ],
  },
]

/** Reset all mock functions in the sample groups. */
function resetGroupMocks() {
  for (const group of sampleGroups) {
    for (const item of group.items) {
      ;(item.onSelect as ReturnType<typeof vi.fn>).mockClear()
    }
  }
}

// -----------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------

describe('CommandBar', () => {
  beforeEach(() => {
    resetGroupMocks()
  })

  // ==== Hero variant ====

  it('renders search input with role="search"', () => {
    render(<CommandBar />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('renders greeting when provided', () => {
    render(<CommandBar greeting="Hello, how can I help?" />)
    expect(screen.getByText('Hello, how can I help?')).toBeInTheDocument()
  })

  it('renders hints when provided', () => {
    render(<CommandBar hints={['Show tasks', 'Create report']} />)
    expect(screen.getByText('Show tasks')).toBeInTheDocument()
    expect(screen.getByText('Create report')).toBeInTheDocument()
  })

  it('clicking a hint fills the input', async () => {
    const user = userEvent.setup()
    render(<CommandBar hints={['Show tasks']} />)

    await user.click(screen.getByText('Show tasks'))
    expect(screen.getByRole('combobox')).toHaveValue('Show tasks')
  })

  it('calls onSubmit when Enter pressed with text', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar onSubmit={onSubmit} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'What are my tasks?')
    await user.keyboard('{Enter}')

    expect(onSubmit).toHaveBeenCalledWith('What are my tasks?')
  })

  it('does not call onSubmit when Enter pressed with empty input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar onSubmit={onSubmit} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders children (response area)', () => {
    render(
      <CommandBar>
        <div data-testid="response">AI Response here</div>
      </CommandBar>,
    )
    expect(screen.getByTestId('response')).toBeInTheDocument()
  })

  it('shows disabled state', () => {
    render(<CommandBar disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('does not call onSubmit when disabled', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar onSubmit={onSubmit} disabled />)

    const input = screen.getByRole('combobox')
    // input is disabled, so type into it using keyboard after focusing
    await user.type(input, 'test')
    await user.keyboard('{Enter}')

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows spinner during processing state', () => {
    render(<CommandBar state="processing" />)
    expect(screen.getByTestId('command-bar-spinner')).toBeInTheDocument()
  })

  it('makes input readOnly during processing state', () => {
    render(<CommandBar state="processing" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('readonly')
  })

  it('shows clear button during responded state', () => {
    render(<CommandBar state="responded" />)
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  // ==== Inline variant ====

  it('renders inline without greeting or hints', () => {
    render(
      <CommandBar
        variant="inline"
        greeting="Should not show"
        hints={['Should not show']}
      />,
    )
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument()
  })

  it('renders inline with role="search"', () => {
    render(<CommandBar variant="inline" />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  // ==== Floating variant ====

  it('renders as dialog when variant="floating"', () => {
    render(<CommandBar variant="floating" open />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens and closes via controlled state', () => {
    const { rerender } = render(<CommandBar variant="floating" open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(<CommandBar variant="floating" open />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls onOpenChange when dialog closes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <CommandBar variant="floating" open onOpenChange={onOpenChange} />,
    )

    // Escape should close
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows AI Command Bar title in floating variant (visually hidden)', () => {
    render(<CommandBar variant="floating" open />)
    expect(screen.getByText('AI Command Bar')).toBeInTheDocument()
  })

  // ==== Command filtering ====

  it('filters groups as user types', async () => {
    const user = userEvent.setup()
    render(<CommandBar groups={sampleGroups} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'task')

    // "Create Task" should be visible, "Dashboard" should not
    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('shows empty message when no results match', async () => {
    const user = userEvent.setup()
    render(
      <CommandBar
        groups={sampleGroups}
        emptyMessage="Nothing here"
      />,
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzz')

    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows custom empty state when provided', async () => {
    const user = userEvent.setup()
    render(
      <CommandBar
        groups={sampleGroups}
        emptyState={<div data-testid="custom-empty">Custom empty</div>}
      />,
    )

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzz')

    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
  })

  it('selects active item on Enter', async () => {
    const user = userEvent.setup()
    render(<CommandBar groups={sampleGroups} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'Create')

    // First match should be active, Enter selects it
    await user.keyboard('{Enter}')
    expect(sampleGroups[0].items[0].onSelect).toHaveBeenCalled()
  })

  it('calls onSubmit on Enter when no command match', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar groups={sampleGroups} onSubmit={onSubmit} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzznotacommand')
    await user.keyboard('{Enter}')

    expect(onSubmit).toHaveBeenCalledWith('zzzznotacommand')
  })

  it('Cmd+Enter always calls onSubmit even with active match', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar groups={sampleGroups} onSubmit={onSubmit} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'Create')

    // Cmd+Enter should submit, not select
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(onSubmit).toHaveBeenCalledWith('Create')
    expect(sampleGroups[0].items[0].onSelect).not.toHaveBeenCalled()
  })

  // ==== Keyboard navigation ====

  it('arrow keys navigate results', async () => {
    const user = userEvent.setup()
    render(<CommandBar groups={sampleGroups} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    // Type "a" — matches "Create Task" (index 0) and "Dashboard" (index 1)
    // "Open Settings" is filtered out (no "a" in label or description)
    await user.type(input, 'a')

    // Arrow Down once: move from index 0 → 1 (Dashboard)
    await user.keyboard('{ArrowDown}')

    // Enter to select
    await user.keyboard('{Enter}')

    // Dashboard (index 1 in filtered results) should be selected
    expect(sampleGroups[1].items[0].onSelect).toHaveBeenCalled()
  })

  it('arrow up recalls last query when no groups', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CommandBar onSubmit={onSubmit} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'my previous query')
    await user.keyboard('{Enter}')

    // Clear the input
    await user.clear(input)

    // Arrow up should recall
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveValue('my previous query')
  })

  it('Escape blurs input on non-floating variant', async () => {
    const user = userEvent.setup()
    render(<CommandBar />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    expect(input).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(input).not.toHaveFocus()
  })

  // ==== Callbacks ====

  it('calls onSearch when query changes', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<CommandBar onSearch={onSearch} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'hello')

    // onSearch called for each character
    expect(onSearch).toHaveBeenCalledTimes(5)
    expect(onSearch).toHaveBeenLastCalledWith('hello')
  })

  // ==== Accessibility ====

  it('has aria-label on input', () => {
    render(<CommandBar />)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-label',
      'AI Command Bar',
    )
  })

  it('has custom aria-label when agentName provided', () => {
    render(<CommandBar agentName="Aria" />)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-label',
      'Ask Aria',
    )
  })

  it('has role="search" container', () => {
    render(<CommandBar />)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('sets aria-expanded based on filtered results', async () => {
    const user = userEvent.setup()
    render(<CommandBar groups={sampleGroups} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'task')

    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  // ==== Placeholder ====

  it('renders single placeholder as standard input placeholder', () => {
    render(<CommandBar placeholder="Ask me anything" />)
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'placeholder',
      'Ask me anything',
    )
  })
})

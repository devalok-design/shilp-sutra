import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { Scratchpad } from '../scratchpad'
import { ScratchpadProvider, useScratchpad } from '../scratchpad/scratchpad-context'
import type { ScratchpadItem as ScratchpadItemData } from '../scratchpad/scratchpad-context'

// ============================================================
// Test data
// ============================================================

const items: ScratchpadItemData[] = [
  { id: '1', text: 'Write tests', done: false },
  { id: '2', text: 'Review PR', done: true },
  { id: '3', text: 'Deploy app', done: false },
]

const noop = vi.fn()

// Helper to render with provider
function renderWithProvider(
  ui: React.ReactElement,
  providerProps: Partial<React.ComponentProps<typeof ScratchpadProvider>> = {},
) {
  return render(
    <ScratchpadProvider items={items} onToggle={noop} {...providerProps}>
      {ui}
    </ScratchpadProvider>,
  )
}

// ============================================================
// Context + Hook
// ============================================================

describe('useScratchpad', () => {
  it('throws when used outside provider', () => {
    function BadComponent() {
      useScratchpad()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useScratchpad must be used within a ScratchpadProvider',
    )
  })

  it('provides items and visibleItems', () => {
    let ctx: ReturnType<typeof useScratchpad> | null = null
    function Consumer() {
      ctx = useScratchpad()
      return null
    }
    renderWithProvider(<Consumer />)
    expect(ctx!.items).toHaveLength(3)
    expect(ctx!.visibleItems).toHaveLength(3)
  })

  it('filters completed items when showCompleted is false', () => {
    let ctx: ReturnType<typeof useScratchpad> | null = null
    function Consumer() {
      ctx = useScratchpad()
      return null
    }
    renderWithProvider(<Consumer />, { defaultShowCompleted: false })
    expect(ctx!.visibleItems).toHaveLength(2)
    expect(ctx!.visibleItems.every((i) => !i.done)).toBe(true)
  })

  it('sets capability flags based on callbacks', () => {
    let ctx: ReturnType<typeof useScratchpad> | null = null
    function Consumer() {
      ctx = useScratchpad()
      return null
    }
    renderWithProvider(<Consumer />, { onAdd: noop, onDelete: noop })
    expect(ctx!.canAdd).toBe(true)
    expect(ctx!.canDelete).toBe(true)
    expect(ctx!.canEdit).toBe(false)
    expect(ctx!.canReorder).toBe(false)
    expect(ctx!.canPromote).toBe(false)
  })
})

// ============================================================
// ProgressRing
// ============================================================

describe('Scratchpad.ProgressRing', () => {
  it('renders count from context', () => {
    renderWithProvider(<Scratchpad.ProgressRing />, { maxItems: 5 })
    expect(screen.getByTestId('progress-count')).toHaveTextContent('3/5')
  })

  it('renders sm size', () => {
    renderWithProvider(<Scratchpad.ProgressRing size="sm" />, { maxItems: 5 })
    const svg = screen.getByTestId('progress-count').previousElementSibling
    expect(svg).toHaveAttribute('width', '16')
  })
})

// ============================================================
// FilterToggle
// ============================================================

describe('Scratchpad.FilterToggle', () => {
  it('toggles showCompleted state', async () => {
    function TestComponent() {
      const { showCompleted } = useScratchpad()
      return (
        <>
          <Scratchpad.FilterToggle />
          <span data-testid="state">{showCompleted ? 'showing' : 'hiding'}</span>
        </>
      )
    }

    renderWithProvider(<TestComponent />)
    expect(screen.getByTestId('state')).toHaveTextContent('showing')

    await userEvent.click(screen.getByRole('button', { name: /hide completed/i }))
    expect(screen.getByTestId('state')).toHaveTextContent('hiding')

    await userEvent.click(screen.getByRole('button', { name: /show completed/i }))
    expect(screen.getByTestId('state')).toHaveTextContent('showing')
  })
})

// ============================================================
// EmptyState
// ============================================================

describe('Scratchpad.EmptyState', () => {
  it('renders message when no items', () => {
    render(
      <ScratchpadProvider items={[]} onToggle={noop}>
        <Scratchpad.EmptyState message="No tasks yet" />
      </ScratchpadProvider>,
    )
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('auto-hides when items exist', () => {
    renderWithProvider(<Scratchpad.EmptyState message="No tasks yet" />)
    expect(screen.queryByText('No tasks yet')).not.toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    function TestIcon({ className }: { className?: string }) {
      return <svg data-testid="empty-icon" className={className} />
    }
    render(
      <ScratchpadProvider items={[]} onToggle={noop}>
        <Scratchpad.EmptyState icon={TestIcon} />
      </ScratchpadProvider>,
    )
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument()
  })
})

// ============================================================
// Collapse
// ============================================================

describe('Scratchpad.Collapse', () => {
  it('starts expanded by default', () => {
    render(
      <Scratchpad.Collapse>
        <span>Content</span>
      </Scratchpad.Collapse>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('collapses when header clicked', async () => {
    render(
      <Scratchpad.Collapse>
        <span>Content</span>
      </Scratchpad.Collapse>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('starts collapsed when defaultOpen=false', () => {
    render(
      <Scratchpad.Collapse defaultOpen={false}>
        <span>Content</span>
      </Scratchpad.Collapse>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows badge count', () => {
    render(
      <Scratchpad.Collapse badgeCount={3}>
        <span>Content</span>
      </Scratchpad.Collapse>,
    )
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('hides badge when count is 0', () => {
    render(
      <Scratchpad.Collapse badgeCount={0}>
        <span>Content</span>
      </Scratchpad.Collapse>,
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})

// ============================================================
// Item
// ============================================================

describe('Scratchpad.Item', () => {
  it('renders text and checkbox', () => {
    renderWithProvider(
      <Scratchpad.Item item={items[0]} />,
    )
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Toggle Write tests/ })).toBeInTheDocument()
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={onToggle}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /Toggle Write tests/ }))
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('enters edit mode on double-click when canEdit', async () => {
    const onEdit = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onEdit={onEdit}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    await userEvent.dblClick(screen.getByText('Write tests'))
    const input = screen.getByDisplayValue('Write tests')
    expect(input).toBeInTheDocument()
  })

  it('confirms edit on Enter', async () => {
    const onEdit = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onEdit={onEdit}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    await userEvent.dblClick(screen.getByText('Write tests'))
    const input = screen.getByDisplayValue('Write tests')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated text{Enter}')
    expect(onEdit).toHaveBeenCalledWith('1', 'Updated text')
  })

  it('cancels edit on Escape', async () => {
    const onEdit = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onEdit={onEdit}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    await userEvent.dblClick(screen.getByText('Write tests'))
    const input = screen.getByDisplayValue('Write tests')
    await userEvent.clear(input)
    await userEvent.type(input, 'Changed')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onEdit).not.toHaveBeenCalled()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('shows promote button when canPromote', () => {
    const onPromote = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onPromote={onPromote}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    expect(screen.getByRole('button', { name: /Promote Write tests/ })).toBeInTheDocument()
  })

  it('hides promote button when no onPromote', () => {
    renderWithProvider(<Scratchpad.Item item={items[0]} />)
    expect(screen.queryByRole('button', { name: /Promote/ })).not.toBeInTheDocument()
  })

  it('shows delete button when canDelete', () => {
    render(
      <ScratchpadProvider items={items} onToggle={noop} onDelete={noop}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    expect(screen.getByRole('button', { name: /Delete Write tests/ })).toBeInTheDocument()
  })

  it('calls onDelete when delete clicked', async () => {
    const onDelete = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onDelete={onDelete}>
        <Scratchpad.Item item={items[0]} />
      </ScratchpadProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: /Delete Write tests/ }))
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('does not enter edit mode when canEdit is false', async () => {
    renderWithProvider(<Scratchpad.Item item={items[0]} />)
    await userEvent.dblClick(screen.getByText('Write tests'))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

// ============================================================
// List
// ============================================================

describe('Scratchpad.List', () => {
  it('renders all visible items', () => {
    renderWithProvider(<Scratchpad.List />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Review PR')).toBeInTheDocument()
    expect(screen.getByText('Deploy app')).toBeInTheDocument()
  })

  it('shows drag handles when onReorder provided', () => {
    render(
      <ScratchpadProvider items={items} onToggle={noop} onReorder={noop}>
        <Scratchpad.List />
      </ScratchpadProvider>,
    )
    const handles = screen.getAllByLabelText(/Drag/)
    expect(handles).toHaveLength(3)
  })

  it('hides drag handles when no onReorder', () => {
    renderWithProvider(<Scratchpad.List />)
    expect(screen.queryByLabelText(/Drag/)).not.toBeInTheDocument()
  })
})

// ============================================================
// AddInput
// ============================================================

describe('Scratchpad.AddInput', () => {
  it('renders nothing when onAdd not provided', () => {
    const { container } = renderWithProvider(<Scratchpad.AddInput />)
    expect(container.innerHTML).toBe('')
  })

  it('shows trigger button when onAdd provided', () => {
    render(
      <ScratchpadProvider items={items} onToggle={noop} onAdd={noop} maxItems={5}>
        <Scratchpad.AddInput />
      </ScratchpadProvider>,
    )
    expect(screen.getByText('+ Add a task...')).toBeInTheDocument()
  })

  it('hides when maxItems reached', () => {
    render(
      <ScratchpadProvider items={items} onToggle={noop} onAdd={noop} maxItems={3}>
        <Scratchpad.AddInput />
      </ScratchpadProvider>,
    )
    expect(screen.queryByText('+ Add a task...')).not.toBeInTheDocument()
  })

  it('opens input and calls onAdd on Enter', async () => {
    const onAdd = vi.fn()
    render(
      <ScratchpadProvider items={items} onToggle={noop} onAdd={onAdd} maxItems={5}>
        <Scratchpad.AddInput />
      </ScratchpadProvider>,
    )
    await userEvent.click(screen.getByText('+ Add a task...'))
    const input = screen.getByPlaceholderText('What needs doing?')
    await userEvent.type(input, 'New task{Enter}')
    expect(onAdd).toHaveBeenCalledWith('New task')
  })

  it('closes input on Escape', async () => {
    render(
      <ScratchpadProvider items={items} onToggle={noop} onAdd={noop} maxItems={5}>
        <Scratchpad.AddInput />
      </ScratchpadProvider>,
    )
    await userEvent.click(screen.getByText('+ Add a task...'))
    const input = screen.getByPlaceholderText('What needs doing?')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByPlaceholderText('What needs doing?')).not.toBeInTheDocument()
  })
})

// ============================================================
// Composed: Full card a11y
// ============================================================

describe('Scratchpad composed', () => {
  it('has no a11y violations in full card arrangement (no reorder)', async () => {
    const { container } = render(
      <Scratchpad.Root items={items} onToggle={noop} onAdd={noop} onDelete={noop} maxItems={5}>
        <Scratchpad.Header title="My Scratchpad">
          <Scratchpad.ProgressRing />
        </Scratchpad.Header>
        <Scratchpad.EmptyState />
        <Scratchpad.List />
        <Scratchpad.AddInput />
      </Scratchpad.Root>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations in full card arrangement (with reorder)', async () => {
    const { container } = render(
      <Scratchpad.Root items={items} onToggle={noop} onAdd={noop} onDelete={noop} onReorder={noop} maxItems={5}>
        <Scratchpad.Header title="My Scratchpad">
          <Scratchpad.ProgressRing />
        </Scratchpad.Header>
        <Scratchpad.EmptyState />
        <Scratchpad.List />
        <Scratchpad.AddInput />
      </Scratchpad.Root>,
    )
    // nested-interactive: dnd-kit adds role="button" to sortable items containing checkboxes
    const results = await axe(container, { rules: { 'nested-interactive': { enabled: false } } })
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations in sidebar arrangement', async () => {
    const { container } = render(
      <Scratchpad.Root items={items} onToggle={noop}>
        <Scratchpad.Collapse>
          <Scratchpad.List compact />
        </Scratchpad.Collapse>
      </Scratchpad.Root>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

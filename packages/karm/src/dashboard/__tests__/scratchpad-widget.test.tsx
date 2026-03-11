import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ScratchpadWidget } from '../scratchpad-widget'
import type { ScratchpadItem } from '../scratchpad-widget'

const items: ScratchpadItem[] = [
  { id: '1', text: 'Write tests', done: false },
  { id: '2', text: 'Review PR', done: true },
  { id: '3', text: 'Deploy app', done: false },
]

const noop = vi.fn()

function renderWidget(props: Partial<React.ComponentProps<typeof ScratchpadWidget>> = {}) {
  return render(
    <ScratchpadWidget
      items={items}
      onToggle={noop}
      onAdd={noop}
      onDelete={noop}
      {...props}
    />,
  )
}

describe('ScratchpadWidget', () => {
  it('has no a11y violations', async () => {
    const { container } = renderWidget()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders all items', () => {
    renderWidget()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Review PR')).toBeInTheDocument()
    expect(screen.getByText('Deploy app')).toBeInTheDocument()
  })

  it('shows progress badge with count (X/maxItems)', () => {
    renderWidget({ maxItems: 5 })
    expect(screen.getByTestId('progress-count')).toHaveTextContent('3/5')
  })

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = vi.fn()
    renderWidget({ onToggle })
    const checkbox = screen.getByRole('checkbox', { name: /Toggle Write tests/ })
    await userEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  it('calls onAdd when text entered and Enter pressed', async () => {
    const onAdd = vi.fn()
    renderWidget({ onAdd })

    // Click add button to enter adding mode
    await userEvent.click(screen.getByText('+ Add a task...'))

    const input = screen.getByPlaceholderText('What needs doing?')
    await userEvent.type(input, 'New task{Enter}')
    expect(onAdd).toHaveBeenCalledWith('New task')
  })

  it('cancels add on Escape', async () => {
    renderWidget()

    await userEvent.click(screen.getByText('+ Add a task...'))
    const input = screen.getByPlaceholderText('What needs doing?')
    expect(input).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByPlaceholderText('What needs doing?')).not.toBeInTheDocument()
  })

  it('hides add button when maxItems reached', () => {
    renderWidget({ maxItems: 3 })
    expect(screen.queryByText('+ Add a task...')).not.toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    renderWidget({ items: [] })
    expect(screen.getByText('Nothing here yet. Add a task!')).toBeInTheDocument()
  })

  it('renders loading skeleton', () => {
    const { container } = renderWidget({ loading: true })
    const pulseElements = container.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })
})

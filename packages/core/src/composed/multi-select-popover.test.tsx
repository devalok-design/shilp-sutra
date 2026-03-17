import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MultiSelectPopover, type MultiSelectItem } from './multi-select-popover'

const items: MultiSelectItem[] = [
  { id: '1', label: 'Alice' },
  { id: '2', label: 'Bob' },
  { id: '3', label: 'Charlie' },
]

function renderPopover(props: Partial<React.ComponentProps<typeof MultiSelectPopover>> = {}) {
  const onValueChange = props.onValueChange ?? vi.fn()
  return {
    onValueChange,
    ...render(
      <MultiSelectPopover
        items={items}
        value={[]}
        onValueChange={onValueChange}
        {...props}
      >
        <button>Select people</button>
      </MultiSelectPopover>,
    ),
  }
}

describe('MultiSelectPopover', () => {
  it('renders the trigger', () => {
    renderPopover()
    expect(screen.getByRole('button', { name: 'Select people' })).toBeInTheDocument()
  })

  it('opens popover on trigger click and shows items', async () => {
    const user = userEvent.setup()
    renderPopover()
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows search input inside the popover', async () => {
    const user = userEvent.setup()
    renderPopover()
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })

  it('filters items by search query', async () => {
    const user = userEvent.setup()
    renderPopover()
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    await user.type(screen.getByLabelText('Search'), 'Ali')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('shows empty message when no items match', async () => {
    const user = userEvent.setup()
    renderPopover({ emptyMessage: 'Nothing here' })
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    await user.type(screen.getByLabelText('Search'), 'zzz')
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('calls onValueChange when item is clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderPopover({ onValueChange })
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    await user.click(screen.getByText('Bob'))
    expect(onValueChange).toHaveBeenCalledWith(['2'])
  })

  it('deselects an already-selected item', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderPopover({ value: ['1', '2'], onValueChange })
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    await user.click(screen.getByText('Alice'))
    expect(onValueChange).toHaveBeenCalledWith(['2'])
  })

  it('renders grouped items with section headers', async () => {
    const user = userEvent.setup()
    renderPopover({
      items: undefined,
      groups: [
        { label: 'Team A', items: [{ id: '1', label: 'Alice' }] },
        { label: 'Team B', items: [{ id: '2', label: 'Bob' }] },
      ],
    })
    await user.click(screen.getByRole('button', { name: 'Select people' }))
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(screen.getByText('Team B')).toBeInTheDocument()
  })
})

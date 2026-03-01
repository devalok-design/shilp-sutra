import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders with a title', () => {
    render(<EmptyState title="No items found" />)
    expect(screen.getByRole('heading', { name: 'No items found' })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting your filters"
      />,
    )
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('renders action slot when provided', () => {
    render(
      <EmptyState
        title="No items"
        action={<button>Add Item</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <EmptyState title="Empty" className="my-empty" />,
    )
    expect(container.firstElementChild).toHaveClass('my-empty')
  })
})

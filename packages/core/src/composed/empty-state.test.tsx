import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No tasks yet" />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(
      <EmptyState title="No items" description="Create your first item" />,
    )
    expect(screen.getByText('Create your first item')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="Empty" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(0)
  })

  it('renders an action when provided', () => {
    render(
      <EmptyState
        title="No results"
        action={<button>Create new</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Create new' })).toBeInTheDocument()
  })

  it('renders a custom icon element', () => {
    render(
      <EmptyState
        title="Custom icon"
        icon={<svg data-testid="custom-icon" />}
      />,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders a component-type icon', () => {
    function MyIcon({ className }: { className?: string }) {
      return <span data-testid="component-icon" className={className}>icon</span>
    }
    render(<EmptyState title="Component Icon" icon={MyIcon} />)
    expect(screen.getByTestId('component-icon')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <EmptyState title="Styled" className="my-empty" />,
    )
    expect(container.firstElementChild).toHaveClass('my-empty')
  })
})

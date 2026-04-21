import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

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

  describe('iconSize prop', () => {
    const TestIcon = ({ className }: { className?: string }) => (
      <svg data-testid="test-icon" className={className} aria-hidden="true">
        <circle cx="16" cy="16" r="16" />
      </svg>
    )

    it('defaults to md icon size (h-ico-lg)', () => {
      render(<EmptyState title="Default" icon={TestIcon} />)
      const cls = screen.getByTestId('test-icon').getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-lg')
    })

    it('applies sm icon size', () => {
      render(<EmptyState title="Small" icon={TestIcon} iconSize="sm" />)
      const cls = screen.getByTestId('test-icon').getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-sm')
    })

    it('applies lg icon size', () => {
      render(<EmptyState title="Large" icon={TestIcon} iconSize="lg" />)
      const cls = screen.getByTestId('test-icon').getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-xl')
    })

    it('defaults to sm when compact and no explicit iconSize', () => {
      render(<EmptyState title="Compact" icon={TestIcon} compact />)
      const cls = screen.getByTestId('test-icon').getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-sm')
    })

    it('respects explicit iconSize over compact default', () => {
      render(<EmptyState title="Compact lg" icon={TestIcon} compact iconSize="lg" />)
      const cls = screen.getByTestId('test-icon').getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-xl')
    })

    it('applies icon size to container when icon is ReactNode', () => {
      render(
        <EmptyState
          title="ReactNode icon"
          icon={<span data-testid="node-icon">icon</span>}
          iconSize="lg"
        />,
      )
      const nodeIcon = screen.getByTestId('node-icon')
      expect(nodeIcon.parentElement!.className).toContain('h-ico-xl')
    })
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { EmptyState } from '../empty-state'

describe('EmptyState', () => {
  it('should have no accessibility violations with title only', async () => {
    const { container } = render(<EmptyState title="No items found" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with description', async () => {
    const { container } = render(
      <EmptyState
        title="No results"
        description="Try adjusting your search filters to find what you are looking for."
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with action', async () => {
    const { container } = render(
      <EmptyState
        title="No projects yet"
        description="Create your first project to get started."
        action={<button type="button">Create Project</button>}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations in compact mode', async () => {
    const { container } = render(
      <EmptyState title="Empty list" compact />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  describe('iconSize prop', () => {
    const TestIcon = ({ className }: { className?: string }) => (
      <svg data-testid="test-icon" className={className} aria-hidden="true">
        <circle cx="16" cy="16" r="16" />
      </svg>
    )

    it('should default to md icon size', () => {
      render(<EmptyState title="Default" icon={TestIcon} />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-lg')
      expect(cls).toContain('w-ico-lg')
    })

    it('should apply sm icon size with ComponentType', () => {
      render(<EmptyState title="Small" icon={TestIcon} iconSize="sm" />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-sm')
      expect(cls).toContain('w-ico-sm')
    })

    it('should apply md icon size with ComponentType', () => {
      render(<EmptyState title="Medium" icon={TestIcon} iconSize="md" />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-lg')
      expect(cls).toContain('w-ico-lg')
    })

    it('should apply lg icon size with ComponentType', () => {
      render(<EmptyState title="Large" icon={TestIcon} iconSize="lg" />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-xl')
      expect(cls).toContain('w-ico-xl')
    })

    it('should default to sm when compact and no explicit iconSize', () => {
      render(<EmptyState title="Compact" icon={TestIcon} compact />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-sm')
      expect(cls).toContain('w-ico-sm')
    })

    it('should respect explicit iconSize over compact default', () => {
      render(<EmptyState title="Compact lg" icon={TestIcon} compact iconSize="lg" />)
      const icon = screen.getByTestId('test-icon')
      const cls = icon.getAttribute('class') ?? ''
      expect(cls).toContain('h-ico-xl')
      expect(cls).toContain('w-ico-xl')
    })

    it('should apply icon size to container when icon is ReactNode', () => {
      render(
        <EmptyState
          title="ReactNode icon"
          icon={<span data-testid="node-icon">icon</span>}
          iconSize="lg"
        />,
      )
      const nodeIcon = screen.getByTestId('node-icon')
      const container = nodeIcon.parentElement!
      expect(container.className).toContain('h-ico-xl')
      expect(container.className).toContain('w-ico-xl')
    })

    it('should have no accessibility violations with iconSize', async () => {
      const { container } = render(
        <EmptyState title="A11y check" icon={TestIcon} iconSize="lg" />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})

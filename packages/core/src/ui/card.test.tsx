import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders accent element when accent prop is set', () => {
    const { container } = render(<Card accent="left" accentColor="error">Content</Card>)
    const accentEl = container.querySelector('[aria-hidden="true"]')
    expect(accentEl).toBeInTheDocument()
    expect(accentEl).toHaveStyle({ backgroundColor: 'var(--color-error-9)' })
  })

  it('does not render accent when prop is not set', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('adds overflow-hidden when accent is set', () => {
    const { container } = render(<Card accent="top">Content</Card>)
    expect(container.firstChild).toHaveClass('overflow-hidden')
  })

  it('defaults accentColor to default', () => {
    const { container } = render(<Card accent="left">Content</Card>)
    const accentEl = container.querySelector('[aria-hidden="true"]')
    expect(accentEl).toHaveStyle({ backgroundColor: 'var(--color-accent-9)' })
  })

  it('supports all accent positions', () => {
    const positions = ['left', 'top', 'right', 'bottom'] as const
    positions.forEach(pos => {
      const { container, unmount } = render(<Card accent={pos}>Content</Card>)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
      unmount()
    })
  })

  it('supports all accent colors', () => {
    const colors = ['default', 'secondary', 'error', 'success', 'warning', 'info'] as const
    colors.forEach(color => {
      const { container, unmount } = render(<Card accent="left" accentColor={color}>Content</Card>)
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
      unmount()
    })
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="my-class">Content</Card>)
    expect(container.firstChild).toHaveClass('my-class')
  })
})

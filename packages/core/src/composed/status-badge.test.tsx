import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it('renders with default status (pending) and auto-generated label', () => {
    render(<StatusBadge />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders with the specified status', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders custom label when provided', () => {
    render(<StatusBadge status="approved" label="All Good" />)
    expect(screen.getByText('All Good')).toBeInTheDocument()
    expect(screen.queryByText('Approved')).not.toBeInTheDocument()
  })

  it('renders a colored dot by default', () => {
    const { container } = render(<StatusBadge status="rejected" />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).toBeInTheDocument()
  })

  it('hides the dot when hideDot is true', () => {
    const { container } = render(<StatusBadge status="active" hideDot />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).not.toBeInTheDocument()
  })

  it('capitalizes status key for display label', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    const { container } = render(
      <StatusBadge status="draft" className="extra-class" />,
    )
    expect(container.firstElementChild).toHaveClass('extra-class')
  })
})

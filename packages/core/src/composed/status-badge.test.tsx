import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { StatusBadge } from './status-badge'

describeConformance(
  'StatusBadge',
  (props) => <StatusBadge status="active" {...props} />,
  {
    sizes: ['sm', 'md'],
    colors: ['success', 'warning', 'error', 'info', 'neutral'],
  },
)

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

  it('renders in-progress status with accent-3 background', () => {
    const { container } = render(<StatusBadge status="in-progress" />)
    const badge = container.querySelector('[class*="bg-accent-3"]')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-accent-11')
  })

  it('renders review status with info-3 background', () => {
    const { container } = render(<StatusBadge status="review" />)
    const badge = container.querySelector('[class*="bg-info-3"]')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-info-11')
  })

  it('renders as button when onClick provided', async () => {
    const handleClick = vi.fn()
    render(<StatusBadge status="active" onClick={handleClick} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('cursor-pointer')

    const user = userEvent.setup()
    await user.click(button)
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('shows auto chevron-down icon when clickable and no custom icon', () => {
    const { container } = render(
      <StatusBadge status="active" onClick={() => {}} />,
    )
    // The Icon component renders an SVG from IconChevronDown
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows custom icon when provided (no auto-chevron)', () => {
    const customIcon = <span data-testid="custom-icon">★</span>
    const { container } = render(
      <StatusBadge status="active" onClick={() => {}} icon={customIcon} />,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    // Should not have the auto-chevron SVG from Icon
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(0)
  })

  it('backward compat: active status renders success classes unchanged', () => {
    const { container } = render(<StatusBadge status="active" />)
    const badge = container.querySelector('[class*="bg-success-3"]')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-success-11')
    // Should render as span, not button
    expect(badge!.tagName).toBe('SPAN')
  })

  it('renders as span without chevron when onClick not provided', () => {
    const { container } = render(<StatusBadge status="pending" />)
    const badge = container.querySelector('[class*="bg-warning-3"]')
    expect(badge).toBeInTheDocument()
    expect(badge!.tagName).toBe('SPAN')
    // Should not have chevron icon
    const svg = container.querySelector('svg')
    expect(svg).toBeNull()
  })

  it('renders as button in color branch when onClick provided', () => {
    const handleClick = vi.fn()
    render(<StatusBadge color="success" onClick={handleClick} />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('cursor-pointer')
  })

  it('uses color name as default label when color is set without label or status', () => {
    render(<StatusBadge color="warning" />)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('prefers explicit label over color name', () => {
    render(<StatusBadge color="error" label="Failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('color wins over status when both are provided', () => {
    const { container } = render(<StatusBadge status="active" color="error" />)
    const badge = container.firstElementChild!
    expect(badge.className).toContain('bg-error-3')
  })
})

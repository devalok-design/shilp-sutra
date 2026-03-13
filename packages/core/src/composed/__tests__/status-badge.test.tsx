import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { StatusBadge } from '../status-badge'

const allStatuses = [
  'active',
  'pending',
  'approved',
  'rejected',
  'completed',
  'blocked',
  'cancelled',
  'draft',
] as const

describe('StatusBadge', () => {
  it('should have no accessibility violations with default status', async () => {
    const { container } = render(<StatusBadge />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it.each(allStatuses)(
    'should have no accessibility violations with status="%s"',
    async (status) => {
      const { container } = render(<StatusBadge status={status} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )

  it('should have no accessibility violations with custom label', async () => {
    const { container } = render(
      <StatusBadge status="approved" label="Shipped" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations with hidden dot', async () => {
    const { container } = render(<StatusBadge status="active" hideDot />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no accessibility violations at small size', async () => {
    const { container } = render(<StatusBadge status="pending" size="sm" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  // --- color prop tests ---

  const allColors = [
    'success',
    'warning',
    'error',
    'info',
    'neutral',
  ] as const

  it.each(allColors)(
    'should have no accessibility violations with color="%s"',
    async (color) => {
      const { container } = render(<StatusBadge color={color} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    },
  )

  it('should render color variant classes when color prop is set', () => {
    const { container } = render(<StatusBadge color="success" />)
    const badge = container.firstElementChild!
    expect(badge.className).toContain('bg-success-3')
    expect(badge.className).toContain('text-success-11')
  })

  it('should use color name as default label when color is set without label or status', () => {
    const { getByText } = render(<StatusBadge color="warning" />)
    expect(getByText('Warning')).toBeTruthy()
  })

  it('should prefer explicit label over color name', () => {
    const { getByText } = render(<StatusBadge color="error" label="Failed" />)
    expect(getByText('Failed')).toBeTruthy()
  })

  it('should use color variant styling even when status is also provided', () => {
    const { container } = render(<StatusBadge status="active" color="error" />)
    const badge = container.firstElementChild!
    // color should win over status
    expect(badge.className).toContain('bg-error-3')
    expect(badge.className).toContain('text-error-11')
  })

  it('should render correct dot color for color prop', () => {
    const { container } = render(<StatusBadge color="info" />)
    const dot = container.querySelector('[aria-hidden="true"]')!
    expect(dot.className).toContain('bg-info-9')
  })

  it('should render neutral color variant correctly', () => {
    const { container, getByText } = render(<StatusBadge color="neutral" />)
    const badge = container.firstElementChild!
    expect(badge.className).toContain('bg-surface-2')
    expect(badge.className).toContain('text-surface-fg-subtle')
    expect(getByText('Neutral')).toBeTruthy()
  })

  it('should work with color prop and size sm', () => {
    const { container } = render(<StatusBadge color="success" size="sm" />)
    const badge = container.firstElementChild!
    expect(badge.className).toContain('bg-success-3')
    expect(badge.className).toContain('text-ds-xs')
  })

  it('should work with color prop and hideDot', () => {
    const { container } = render(<StatusBadge color="warning" hideDot />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).toBeNull()
  })
})

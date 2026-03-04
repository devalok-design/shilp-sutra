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
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { ApprovedAdjustments } from '../approved-adjustments'
import type { Adjustment } from '../../types'

const mockAdjustment: Adjustment = {
  id: 'adj1',
  userId: 'u1',
  numberOfDays: 2,
  type: 'Earned Leave',
  reason: 'Extra work',
  status: 'APPROVED',
  comment: null,
  approvedBy: 'admin1',
  createdAt: '2026-03-10T10:00:00Z',
  updatedAt: '2026-03-10T10:00:00Z',
  user: { name: 'Alice', email: 'alice@test.com' },
  approver: { name: 'Admin', email: 'admin@test.com' },
}

describe('ApprovedAdjustments', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ApprovedAdjustments adjustments={[mockAdjustment]} adminId="admin1" />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ApprovedAdjustments adjustments={[mockAdjustment]} adminId="admin1" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders column headers', () => {
    render(
      <ApprovedAdjustments adjustments={[mockAdjustment]} adminId="admin1" />,
    )
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Days')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Reason')).toBeInTheDocument()
    expect(screen.getByText('Approved By')).toBeInTheDocument()
  })

  it('renders adjustment data', () => {
    render(
      <ApprovedAdjustments adjustments={[mockAdjustment]} adminId="admin1" />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Earned Leave')).toBeInTheDocument()
    expect(screen.getByText('Extra work')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('shows "You" when approvedBy matches adminId and no approver name', () => {
    const adjWithoutApprover: Adjustment = {
      ...mockAdjustment,
      approver: undefined,
    }
    render(
      <ApprovedAdjustments adjustments={[adjWithoutApprover]} adminId="admin1" />,
    )
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('shows empty message when no adjustments', () => {
    render(
      <ApprovedAdjustments adjustments={[]} adminId="admin1" />,
    )
    expect(screen.getByText('No approved adjustments found')).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <ApprovedAdjustments
        ref={ref}
        className="custom"
        adjustments={[]}
        adminId="admin1"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})

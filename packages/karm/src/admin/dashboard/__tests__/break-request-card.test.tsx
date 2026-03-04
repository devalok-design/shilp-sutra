import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { BreakRequestCard } from '../break-request'
import type { BreakRequest } from '../../types'

const futureDate = new Date()
futureDate.setDate(futureDate.getDate() + 5)

const singleDayBreak: BreakRequest = {
  id: 'break-1',
  userId: 'user-1',
  startDate: futureDate.toISOString(),
  endDate: futureDate.toISOString(),
  numberOfDays: 1,
  reason: 'Personal day off',
  status: 'APPROVED',
  adminComment: 'Approved by admin',
}

const multiDayBreak: BreakRequest = {
  id: 'break-2',
  userId: 'user-1',
  startDate: futureDate.toISOString(),
  endDate: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  numberOfDays: 3,
  reason: 'Family vacation',
  status: 'PENDING',
}

describe('BreakRequestCard', () => {
  it('has no a11y violations', async () => {
    const { container } = render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={singleDayBreak}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders break reason', () => {
    render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={singleDayBreak}
      />,
    )
    expect(screen.getByText('Personal day off')).toBeInTheDocument()
  })

  it('renders break status section', () => {
    render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={singleDayBreak}
      />,
    )
    expect(screen.getByText('Break Status')).toBeInTheDocument()
  })

  it('renders Reason label', () => {
    render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={singleDayBreak}
      />,
    )
    expect(screen.getByText('Reason')).toBeInTheDocument()
  })

  it('renders nothing when breakRequest is null', () => {
    const { container } = render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={null}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing for cancelled breaks', () => {
    const cancelled: BreakRequest = {
      ...singleDayBreak,
      status: 'CANCELLED',
    }
    const { container } = render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={cancelled}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows multi-day break period', () => {
    render(
      <BreakRequestCard
        selectedDate={futureDate}
        userId="user-1"
        breakRequest={multiDayBreak}
      />,
    )
    expect(screen.getByText(/3 days/)).toBeInTheDocument()
  })
})

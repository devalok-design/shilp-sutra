import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { LeaveRequests } from '../leave-requests'
import type { BreakRequest } from '../../types'

// Mock Tooltip
vi.mock('@/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock useIsMobile
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

const mockRequest: BreakRequest = {
  id: 'r1',
  userId: 'u2',
  startDate: '2026-03-15',
  endDate: '2026-03-15',
  numberOfDays: 1,
  reason: 'Doctor appointment',
  status: 'PENDING',
  user: { id: 'u2', name: 'Bob', firstName: 'Bob', image: null },
}

describe('LeaveRequests', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <LeaveRequests
        requests={[mockRequest]}
        currentUserId="u1"
        userImages={{ u2: '/bob.png' }}
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <LeaveRequests
        requests={[mockRequest]}
        currentUserId="u1"
        userImages={{ u2: '/bob.png' }}
      />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders user name', () => {
    render(
      <LeaveRequests
        requests={[mockRequest]}
        currentUserId="u1"
        userImages={{ u2: '/bob.png' }}
      />,
    )
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders break reason', () => {
    render(
      <LeaveRequests
        requests={[mockRequest]}
        currentUserId="u1"
        userImages={{ u2: '/bob.png' }}
      />,
    )
    expect(screen.getByText('Doctor appointment')).toBeInTheDocument()
  })

  it('renders approve and reject buttons', () => {
    render(
      <LeaveRequests
        requests={[mockRequest]}
        currentUserId="u1"
        userImages={{ u2: '/bob.png' }}
      />,
    )
    expect(screen.getByLabelText('Reject request')).toBeInTheDocument()
    expect(screen.getByLabelText('Approve request')).toBeInTheDocument()
  })

  it('renders empty when no requests', () => {
    const { container } = render(
      <LeaveRequests
        requests={[]}
        currentUserId="u1"
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('forwards ref and className', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>
    const { container } = render(
      <LeaveRequests
        ref={ref}
        className="custom"
        requests={[]}
        currentUserId="u1"
      />,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(container.firstChild).toHaveClass('custom')
  })
})

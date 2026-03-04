import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { LeaveRequest } from '../leave-request'
import { TooltipProvider } from '@/ui/tooltip'
import type { BreakRequest } from '../../types'

// ============================================================
// Fixtures
// ============================================================

const baseRequest: BreakRequest = {
  id: 'req-1',
  userId: 'user-1',
  startDate: new Date(2026, 2, 10).toISOString(),
  endDate: new Date(2026, 2, 10).toISOString(),
  numberOfDays: 1,
  reason: 'Doctor appointment',
  status: 'PENDING',
  user: { id: 'user-1', name: 'Alice Smith', firstName: 'Alice', image: null },
}

const multiDayRequest: BreakRequest = {
  ...baseRequest,
  id: 'req-2',
  endDate: new Date(2026, 2, 13).toISOString(),
  numberOfDays: 4,
  reason: 'Family vacation',
}

const correctionRequest: BreakRequest = {
  ...baseRequest,
  id: 'req-3',
  correction: true,
}

const userImages: Record<string, string> = {
  'user-1': 'https://example.com/alice.jpg',
}

function renderLeaveRequest(overrides: Partial<React.ComponentProps<typeof LeaveRequest>> = {}) {
  const defaultProps: React.ComponentProps<typeof LeaveRequest> = {
    request: baseRequest,
    userImages,
    handleRejectRequest: vi.fn(),
    handleApproveRequest: vi.fn(),
    commentBoxOpen: false,
    onCommentBoxClose: vi.fn(),
    clickedAction: null,
    userId: 'admin-1',
    ...overrides,
  }
  return render(
    <TooltipProvider>
      <LeaveRequest {...defaultProps} />
    </TooltipProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('LeaveRequest', () => {
  it('has no a11y violations', async () => {
    const { container } = renderLeaveRequest()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders user name', () => {
    renderLeaveRequest()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders the break reason', () => {
    renderLeaveRequest()
    // Reason appears in the row (tooltip trigger) — there may be multiple instances
    const reasons = screen.getAllByText('Doctor appointment')
    expect(reasons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders single-day date', () => {
    renderLeaveRequest()
    // formatDateWithWeekday outputs date with weekday — just check it appears
    expect(screen.getByText(/Tuesday/i)).toBeInTheDocument()
  })

  it('renders multi-day date range with number of days', () => {
    renderLeaveRequest({ request: multiDayRequest })
    expect(screen.getByText(/4 days/)).toBeInTheDocument()
  })

  it('renders correction badge when correction is true', () => {
    renderLeaveRequest({ request: correctionRequest })
    expect(screen.getByText('Attendance Corrections')).toBeInTheDocument()
  })

  it('renders approve and reject buttons', () => {
    renderLeaveRequest()
    expect(screen.getByLabelText('Approve break request')).toBeInTheDocument()
    expect(screen.getByLabelText('Reject break request')).toBeInTheDocument()
  })

  it('calls handleRejectRequest when reject button is clicked', async () => {
    const handleReject = vi.fn()
    renderLeaveRequest({ handleRejectRequest: handleReject })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Reject break request'))
    expect(handleReject).toHaveBeenCalledTimes(1)
    expect(handleReject).toHaveBeenCalledWith(
      expect.anything(),
      'req-1',
    )
  })

  it('calls handleApproveRequest when approve button is clicked', async () => {
    const handleApprove = vi.fn()
    renderLeaveRequest({ handleApproveRequest: handleApprove })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Approve break request'))
    expect(handleApprove).toHaveBeenCalledTimes(1)
    expect(handleApprove).toHaveBeenCalledWith(
      expect.anything(),
      'req-1',
    )
  })

  it('disables approve/reject when user is the request owner', () => {
    renderLeaveRequest({ userId: 'user-1' })
    expect(screen.getByLabelText('Approve break request')).toBeDisabled()
    expect(screen.getByLabelText('Reject break request')).toBeDisabled()
  })

  it('does not call handlers when user is the request owner', async () => {
    const handleApprove = vi.fn()
    const handleReject = vi.fn()
    renderLeaveRequest({
      userId: 'user-1',
      handleApproveRequest: handleApprove,
      handleRejectRequest: handleReject,
    })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Approve break request'))
    await user.click(screen.getByLabelText('Reject break request'))
    expect(handleApprove).not.toHaveBeenCalled()
    expect(handleReject).not.toHaveBeenCalled()
  })

  it('renders avatar fallback initial', () => {
    renderLeaveRequest()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders comment dialog when commentBoxOpen is true', () => {
    renderLeaveRequest({ commentBoxOpen: true, clickedAction: 'approve' })
    expect(screen.getByPlaceholderText('Enjoy your break')).toBeInTheDocument()
    expect(screen.getByText('Approve')).toBeInTheDocument()
  })

  it('shows Reject button text when clickedAction is reject', () => {
    renderLeaveRequest({ commentBoxOpen: true, clickedAction: 'reject' })
    expect(screen.getByText('Reject')).toBeInTheDocument()
  })
})

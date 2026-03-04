import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { EditBreak } from '../edit-break'
import type { BreakRequest } from '../../types'

// ============================================================
// Fixtures
// ============================================================

const selectedLeave: BreakRequest & { numberOfDays: number } = {
  id: 'break-1',
  userId: 'user-1',
  startDate: '2026-03-10T00:00:00.000Z',
  endDate: '2026-03-13T00:00:00.000Z',
  numberOfDays: 4,
  reason: 'Family vacation',
  status: 'PENDING',
  adminComment: 'Needs review',
  user: { id: 'user-1', name: 'Alice Smith', firstName: 'Alice', image: null },
}

function renderEditBreak(overrides: Partial<React.ComponentProps<typeof EditBreak>> = {}) {
  const defaultProps: React.ComponentProps<typeof EditBreak> = {
    selectedLeave,
    existingBreaks: [],
    onSave: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  }
  return render(<EditBreak {...defaultProps} />)
}

// ============================================================
// Tests
// ============================================================

describe('EditBreak', () => {
  it('has no a11y violations in closed state', async () => {
    const { container } = renderEditBreak()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders the Edit trigger button', () => {
    renderEditBreak()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('opens dialog and shows user name when Edit is clicked', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText(/Alice Smith/)).toBeInTheDocument()
  })

  it('shows the break reason inside the dialog', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Family vacation')).toBeInTheDocument()
  })

  it('shows the Reason heading', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Reason')).toBeInTheDocument()
  })

  it('shows number of days', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('No of Days')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows the status field', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Change status')).toBeInTheDocument()
  })

  it('shows the pending status badge', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows the comment field pre-filled', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    const commentInput = screen.getByPlaceholderText('Enjoy your break, TC')
    expect(commentInput).toBeInTheDocument()
    expect(commentInput).toHaveValue('Needs review')
  })

  it('shows the Update button', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Update')).toBeInTheDocument()
  })

  it('shows the start and end dates as buttons', async () => {
    renderEditBreak()
    const user = userEvent.setup()
    await user.click(screen.getByText('Edit'))

    // formatDateToLongForm outputs "EEEE, MMMM d" e.g. "Tuesday, March 10"
    expect(screen.getByText(/March 10/)).toBeInTheDocument()
    expect(screen.getByText(/March 13/)).toBeInTheDocument()
  })
})

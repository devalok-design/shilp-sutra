import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { AttendanceCTA } from '../attendance-cta'

describe('AttendanceCTA', () => {
  it('has no a11y violations in unmarked state', async () => {
    const { container } = render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={null}
        canMarkAttendance
        onMarkAttendance={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders greeting with user first name', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={null}
        canMarkAttendance
      />,
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders Mark Attendance button when can mark', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={null}
        canMarkAttendance
        onMarkAttendance={vi.fn()}
      />,
    )
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
  })

  it('renders marked state with time', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={{
          attendance: {
            id: 'att-1',
            status: 'PRESENT',
            timeIn: '2026-03-03T09:00:00Z',
            timeOut: null,
          },
          breakReason: null,
        }}
        canMarkAttendance={false}
        formatTime={() => '09:00 AM'}
      />,
    )
    expect(screen.getByText(/Marked at/)).toBeInTheDocument()
    expect(screen.getByText(/09:00 AM/)).toBeInTheDocument()
  })

  it('renders on-break state', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={{
          attendance: {
            id: 'att-1',
            status: 'BREAK',
            timeIn: '2026-03-03T09:00:00Z',
            timeOut: null,
          },
          breakReason: 'Lunch',
        }}
        canMarkAttendance={false}
      />,
    )
    expect(screen.getByText(/On break/)).toBeInTheDocument()
  })

  it('renders attendance window closed state', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={null}
        canMarkAttendance={false}
      />,
    )
    expect(screen.getByText('Attendance window closed')).toBeInTheDocument()
  })

  it('shows submitting state', () => {
    render(
      <AttendanceCTA
        userName="Alice Johnson"
        attendance={null}
        canMarkAttendance
        isSubmitting
      />,
    )
    expect(screen.getByText(/Marked at/)).toBeInTheDocument()
  })
})

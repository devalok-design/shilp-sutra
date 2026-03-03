import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { AttendanceOverview } from '../attendance-overview'
import { TooltipProvider } from '../../../../ui/tooltip'
import type { AdminUser, GroupedAttendance } from '../../types'

// ============================================================
// Fixtures
// ============================================================

const alice: AdminUser = {
  id: 'user-1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  designation: 'Developer',
  image: null,
  role: 'Associate',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const bob: AdminUser = {
  id: 'user-2',
  name: 'Bob Jones',
  email: 'bob@example.com',
  designation: 'Designer',
  image: null,
  role: 'Apprentice',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const carol: AdminUser = {
  id: 'user-3',
  name: 'Carol Lee',
  email: 'carol@example.com',
  designation: 'PM',
  image: null,
  role: 'Associate',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
}

const groupedAttendance: GroupedAttendance = {
  present: [
    {
      user: alice,
      attendance: {
        id: 'att-1',
        userId: 'user-1',
        date: '2026-03-03',
        timeIn: '09:00',
        timeOut: '18:00',
        status: 'PRESENT',
      },
    },
  ],
  absent: [
    {
      user: bob,
    },
  ],
  onBreak: [
    {
      user: carol,
      attendance: {
        id: 'att-3',
        userId: 'user-3',
        date: '2026-03-03',
        timeIn: null,
        timeOut: null,
        status: 'BREAK',
      },
    },
  ],
  yetToMark: [],
}

const emptyGrouped: GroupedAttendance = {
  present: [],
  absent: [],
  onBreak: [],
  yetToMark: [],
}

const userImages: Record<string, string> = {
  'user-1': 'https://example.com/alice.jpg',
  'user-2': 'https://example.com/bob.jpg',
  'user-3': 'https://example.com/carol.jpg',
}

function renderOverview(
  overrides: Partial<React.ComponentProps<typeof AttendanceOverview>> = {},
) {
  const defaultProps: React.ComponentProps<typeof AttendanceOverview> = {
    isFutureDate: false,
    users: [alice, bob, carol],
    groupedAttendance,
    userImages,
    selectedDate: '2026-03-03',
    ...overrides,
  }
  return render(
    <TooltipProvider>
      <AttendanceOverview {...defaultProps} />
    </TooltipProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('AttendanceOverview', () => {
  it('has no a11y violations', async () => {
    const { container } = renderOverview()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders group headers with counts', () => {
    renderOverview()
    expect(screen.getByText(/present/i)).toBeInTheDocument()
    expect(screen.getByText(/absent/i)).toBeInTheDocument()
    expect(screen.getByText(/on break/i)).toBeInTheDocument()
  })

  it('shows count in the present group header', () => {
    renderOverview()
    expect(screen.getByText(/present.*\(1\)/i)).toBeInTheDocument()
  })

  it('shows count in the absent group header', () => {
    renderOverview()
    expect(screen.getByText(/absent.*\(1\)/i)).toBeInTheDocument()
  })

  it('shows count in the on break group header', () => {
    renderOverview()
    expect(screen.getByText(/on break.*\(1\)/i)).toBeInTheDocument()
  })

  it('renders avatar fallback initials for users', () => {
    renderOverview()
    // AvatarStack renders fallback chars: A, B, C
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders empty groups with (0) count', () => {
    renderOverview({ groupedAttendance: emptyGrouped })
    expect(screen.getByText(/present.*\(0\)/i)).toBeInTheDocument()
    expect(screen.getByText(/absent.*\(0\)/i)).toBeInTheDocument()
  })

  it('renders Yet to Mark group header', () => {
    const withYetToMark: GroupedAttendance = {
      ...emptyGrouped,
      yetToMark: [{ user: alice }],
    }
    renderOverview({ groupedAttendance: withYetToMark })
    expect(screen.getByText(/Yet to Mark/i)).toBeInTheDocument()
  })

  it('renders future date view without errors', () => {
    const { container } = renderOverview({
      isFutureDate: true,
      groupedAttendance: null,
      users: [alice, bob],
    })
    expect(container).toBeTruthy()
  })
})

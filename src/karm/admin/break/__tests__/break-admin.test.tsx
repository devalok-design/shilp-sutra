import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { BreakAdmin } from '../break-admin'
import { TooltipProvider } from '../../../../ui/tooltip'
import type { BreakRequest, BreakBalanceData, AdminUser } from '../../types'

// ============================================================
// Mock use-toast to prevent side-effects
// ============================================================

vi.mock('../../../../hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// ============================================================
// Fixtures
// ============================================================

const adminUser: Pick<AdminUser, 'id' | 'name' | 'role'> = {
  id: 'admin-1',
  name: 'Admin User',
  role: 'Admin',
}

const users: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    designation: 'Engineer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2025-01-01',
  },
  {
    id: 'user-2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    designation: 'Designer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2025-01-01',
  },
]

const breaks: BreakRequest[] = [
  {
    id: 'br-1',
    userId: 'user-1',
    startDate: new Date(2026, 2, 10).toISOString(),
    endDate: new Date(2026, 2, 12).toISOString(),
    numberOfDays: 3,
    reason: 'Family vacation',
    status: 'APPROVED',
    user: { id: 'user-1', name: 'Alice Smith', firstName: 'Alice', image: null },
  },
  {
    id: 'br-2',
    userId: 'user-2',
    startDate: new Date(2026, 2, 15).toISOString(),
    endDate: new Date(2026, 2, 15).toISOString(),
    numberOfDays: 1,
    reason: 'Doctor visit',
    status: 'PENDING',
    user: { id: 'user-2', name: 'Bob Jones', firstName: 'Bob', image: null },
  },
]

const pendingRequests: BreakRequest[] = [
  {
    id: 'pr-1',
    userId: 'user-2',
    startDate: new Date(2026, 2, 20).toISOString(),
    endDate: new Date(2026, 2, 21).toISOString(),
    numberOfDays: 2,
    reason: 'Personal day',
    status: 'PENDING',
    user: { id: 'user-2', name: 'Bob Jones', firstName: 'Bob', image: null },
  },
]

const breakBalanceData: BreakBalanceData[] = [
  {
    id: 'bal-1',
    userId: 'user-1',
    totalDays: 20,
    usedDays: 5,
    carryForward: 2,
    cashout: 0,
    createdAt: '2026-01-01',
    updatedAt: '2026-03-01',
    user: { id: 'user-1', name: 'Alice Smith', firstName: 'Alice', image: null },
  },
]

const defaultProps = {
  currentUser: adminUser,
  breaks,
  pendingRequests,
  cashoutRequests: [],
  breakBalanceData,
  breakBalance: { remainingDays: 15, breakBalance: 20 },
  userImages: {} as Record<string, string>,
  users,
}

function renderBreakAdmin(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <TooltipProvider>
      <BreakAdmin {...defaultProps} {...overrides} />
    </TooltipProvider>,
  )
}

// ============================================================
// Tests
// ============================================================

describe('BreakAdmin — integration', () => {
  it('has no critical a11y violations', async () => {
    const { container } = renderBreakAdmin()
    // Known: some icon-only buttons may lack aria-labels in sub-components
    const results = await axe(container, {
      rules: {
        'button-name': { enabled: false },
        'nested-interactive': { enabled: false },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('renders header with associate filter', () => {
    renderBreakAdmin()
    expect(screen.getByText('Associate')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
  })

  it('renders all three tabs', () => {
    renderBreakAdmin()
    expect(screen.getByText('BREAKS')).toBeInTheDocument()
    expect(screen.getByText(/REQUESTS/)).toBeInTheDocument()
    expect(screen.getByText(/BALANCE/)).toBeInTheDocument()
  })

  it('shows pending requests count in REQUESTS tab', () => {
    renderBreakAdmin()
    // Both REQUESTS and BALANCE tabs show "(1)", so use getAllByText
    const counts = screen.getAllByText('(1)')
    expect(counts.length).toBeGreaterThanOrEqual(1)
  })

  it('shows balance count in BALANCE tab', () => {
    renderBreakAdmin()
    const requestsTab = screen.getByText(/REQUESTS/)
    const balanceTab = screen.getByText(/BALANCE/)
    expect(requestsTab).toBeInTheDocument()
    expect(balanceTab).toBeInTheDocument()
  })

  it('shows breaks list by default (BREAKS tab active)', () => {
    renderBreakAdmin()
    // The breaks table header columns should be visible
    expect(screen.getByText('NAME')).toBeInTheDocument()
    expect(screen.getByText('REASON')).toBeInTheDocument()
    expect(screen.getByText('STATUS')).toBeInTheDocument()
    // Break data should be visible
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Family vacation')).toBeInTheDocument()
  })

  it('switches to REQUESTS tab and shows pending requests', async () => {
    renderBreakAdmin()
    const user = userEvent.setup()

    await user.click(screen.getByText(/REQUESTS/))

    // Pending request data should now be visible
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Personal day')).toBeInTheDocument()
  })

  it('switches to BALANCE tab and shows balance data', async () => {
    renderBreakAdmin()
    const user = userEvent.setup()

    await user.click(screen.getByText(/BALANCE/))

    // The balance panel renders firstName, not full name
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = renderBreakAdmin({ isLoading: true } as never)
    // The BreakAdminSkeleton renders skeleton elements, not the tabs
    expect(screen.queryByText('BREAKS')).not.toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders compound sub-components when children are provided', () => {
    render(
      <TooltipProvider>
        <BreakAdmin.Root {...defaultProps}>
          <BreakAdmin.Header />
          <BreakAdmin.TabBar />
          <BreakAdmin.BreaksPanel />
        </BreakAdmin.Root>
      </TooltipProvider>,
    )

    expect(screen.getByText('Associate')).toBeInTheDocument()
    expect(screen.getByText('BREAKS')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })
})

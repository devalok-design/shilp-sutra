import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { DashboardHeader } from '../dashboard-header'
import type { AdminUser } from '../../types'

// ============================================================
// Fixtures
// ============================================================

const users: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    designation: 'Developer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    designation: 'Designer',
    image: null,
    role: 'Apprentice',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
]

const userImages: Record<string, string> = {
  'user-1': 'https://example.com/alice.jpg',
  'user-2': 'https://example.com/bob.jpg',
}

const yearsList = [
  '2026 January',
  '2026 February',
  '2026 March',
  '2026 April',
]

function renderDashboardHeader(
  overrides: Partial<React.ComponentProps<typeof DashboardHeader>> = {},
) {
  const defaultProps: React.ComponentProps<typeof DashboardHeader> = {
    selectedMonth: '2026 March',
    yearsList,
    isTodaySelected: false,
    selectedAssociate: null,
    users,
    userImages,
    activeTimeFrame: 'weekly',
    onMonthSelection: vi.fn(),
    onTodayClick: vi.fn(),
    onSelectAssociate: vi.fn(),
    onTimeFrameChange: vi.fn(),
    onDateChange: vi.fn(),
    ...overrides,
  }
  return render(<DashboardHeader {...defaultProps} />)
}

// ============================================================
// Tests
// ============================================================

describe('DashboardHeader', () => {
  it('has no a11y violations', async () => {
    const { container } = renderDashboardHeader()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders the selected month', () => {
    renderDashboardHeader()
    expect(screen.getByText('2026 March')).toBeInTheDocument()
  })

  it('renders Today button when today is not selected', () => {
    renderDashboardHeader({ isTodaySelected: false })
    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('hides Today button when today is selected', () => {
    renderDashboardHeader({ isTodaySelected: true })
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })

  it('calls onTodayClick when Today button is clicked', async () => {
    const onTodayClick = vi.fn()
    renderDashboardHeader({ onTodayClick })

    const user = userEvent.setup()
    await user.click(screen.getByText('Today'))
    expect(onTodayClick).toHaveBeenCalledTimes(1)
  })

  it('renders Weekly/Monthly toggle options', () => {
    renderDashboardHeader()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('renders Previous and Next navigation buttons', () => {
    renderDashboardHeader()
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('calls onDateChange with prev when Previous button is clicked', async () => {
    const onDateChange = vi.fn()
    renderDashboardHeader({ onDateChange })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Previous'))
    expect(onDateChange).toHaveBeenCalledWith('prev')
  })

  it('calls onDateChange with next when Next button is clicked', async () => {
    const onDateChange = vi.fn()
    renderDashboardHeader({ onDateChange })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Next'))
    expect(onDateChange).toHaveBeenCalledWith('next')
  })

  it('renders Associate dropdown trigger when no associate selected', () => {
    renderDashboardHeader()
    expect(screen.getByText('Associate')).toBeInTheDocument()
  })

  it('shows selected associate name', () => {
    renderDashboardHeader({ selectedAssociate: users[0] })
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('calls onSelectAssociate(null) when clearing selected associate', () => {
    const onSelectAssociate = vi.fn()
    const { container } = renderDashboardHeader({
      selectedAssociate: users[0],
      onSelectAssociate,
    })

    // The clear button is inside a "hidden md:flex" wrapper — hidden in jsdom.
    // Find the button that's a child of the bg-interactive associate chip.
    const chip = container.querySelector('.bg-interactive')
    expect(chip).toBeTruthy()
    const clearButton = chip!.querySelector('button')
    expect(clearButton).toBeTruthy()
    fireEvent.click(clearButton!)
    expect(onSelectAssociate).toHaveBeenCalledWith(null)
  })
})

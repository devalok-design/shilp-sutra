import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { BreakBalance } from '../break-balance'
import type { BreakBalanceData } from '../../types'

// ============================================================
// Fixtures
// ============================================================

const breakBalanceData: BreakBalanceData[] = [
  {
    id: 'bal-1',
    userId: 'user-1',
    totalDays: 24,
    usedDays: 5,
    carryForward: 3,
    cashout: 0,
    yearlyBalance: 21,
    user: { id: 'user-1', name: 'Alice Smith', firstName: 'Alice', image: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'bal-2',
    userId: 'user-2',
    totalDays: 18,
    usedDays: 2,
    carryForward: 0,
    cashout: 1,
    user: { id: 'user-2', name: 'Bob Jones', firstName: 'Bob', image: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
]

const userImages: Record<string, string> = {
  'user-1': 'https://example.com/alice.jpg',
  'user-2': 'https://example.com/bob.jpg',
}

function renderBreakBalance(
  overrides: Partial<React.ComponentProps<typeof BreakBalance>> = {},
) {
  const defaultProps: React.ComponentProps<typeof BreakBalance> = {
    breakBalanceData,
    userImages,
    onSaveBalance: vi.fn(),
    ...overrides,
  }
  return render(<BreakBalance {...defaultProps} />)
}

// ============================================================
// Tests
// ============================================================

describe('BreakBalance', () => {
  it('has no a11y violations', async () => {
    const { container } = renderBreakBalance()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders the NAME column header', () => {
    renderBreakBalance()
    expect(screen.getByText('NAME')).toBeInTheDocument()
  })

  it('renders the Total Balance column header', () => {
    renderBreakBalance()
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
  })

  it('renders user first names (uses firstName when available)', () => {
    renderBreakBalance()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders total days for each user', () => {
    renderBreakBalance()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('renders avatar fallback initials when images do not load', () => {
    renderBreakBalance({ userImages: {} })
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders empty list without errors', () => {
    const { container } = renderBreakBalance({ breakBalanceData: [] })
    // Headers should still render
    expect(screen.getByText('NAME')).toBeInTheDocument()
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    // No user rows
    expect(container.querySelectorAll('[class*="hover:bg-field"]').length).toBe(0)
  })

  it('falls back to first part of name when firstName is absent', () => {
    const dataWithoutFirstName: BreakBalanceData[] = [
      {
        ...breakBalanceData[0],
        user: { id: 'user-1', name: 'Alice Smith', image: null },
      },
    ]
    renderBreakBalance({ breakBalanceData: dataWithoutFirstName })
    // Without firstName, it splits name and takes first part
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})

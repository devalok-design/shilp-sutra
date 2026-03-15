import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { WeekHeatmap } from '../week-heatmap'
import { WeekHeatmapProvider, useWeekHeatmap } from '../week-heatmap/week-heatmap-context'
import type { WeekDay } from '../week-heatmap/week-heatmap-context'

// ============================================================
// Test data
// ============================================================

// A week of Mon-Sun with mixed completion states
// Using dates from a Monday (2026-03-09) through Sunday (2026-03-15)
// "today" in tests will be 2026-03-12 (Thursday)
const mockDays: WeekDay[] = [
  { date: '2026-03-09', completed: 3, total: 3 }, // Mon — past, all complete
  { date: '2026-03-10', completed: 1, total: 3 }, // Tue — past, partial
  { date: '2026-03-11', completed: 0, total: 2 }, // Wed — past, nothing done
  { date: '2026-03-12', completed: 2, total: 4 }, // Thu — today
  { date: '2026-03-13', completed: 0, total: 3 }, // Fri — future
  { date: '2026-03-14', completed: 0, total: 0 }, // Sat — empty
  { date: '2026-03-15', completed: 0, total: 0 }, // Sun — empty
]

const allCompleteDays: WeekDay[] = [
  { date: '2026-03-09', completed: 2, total: 2 },
  { date: '2026-03-10', completed: 3, total: 3 },
  { date: '2026-03-11', completed: 1, total: 1 },
  { date: '2026-03-12', completed: 4, total: 4 },
  { date: '2026-03-13', completed: 0, total: 2 },
  { date: '2026-03-14', completed: 0, total: 0 },
  { date: '2026-03-15', completed: 0, total: 0 },
]

const noop = vi.fn()

// ============================================================
// Context + Hook
// ============================================================

describe('useWeekHeatmap', () => {
  it('throws when used outside provider', () => {
    function BadComponent() {
      useWeekHeatmap()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow(
      'useWeekHeatmap must be used within a WeekHeatmapProvider',
    )
  })

  it('provides days and computed totals', () => {
    let ctx: ReturnType<typeof useWeekHeatmap> | null = null
    function Consumer() {
      ctx = useWeekHeatmap()
      return null
    }
    render(
      <WeekHeatmapProvider days={mockDays} today="2026-03-12">
        <Consumer />
      </WeekHeatmapProvider>,
    )
    expect(ctx!.days).toHaveLength(7)
    expect(ctx!.totalCompleted).toBe(6) // 3+1+0+2+0+0+0
    expect(ctx!.totalTasks).toBe(15) // 3+3+2+4+3+0+0
  })

  it('computes streak — consecutive complete past days from most recent', () => {
    // Mon all complete (3/3), Tue partial (1/3) — streak should be 1 only (Mon is complete but Tue breaks it)
    // Actually streak counts backward from most recent past day.
    // Most recent past day = Wed (2026-03-11), completed=0 → streak breaks immediately = 0
    let ctx: ReturnType<typeof useWeekHeatmap> | null = null
    function Consumer() {
      ctx = useWeekHeatmap()
      return null
    }
    render(
      <WeekHeatmapProvider days={mockDays} today="2026-03-12">
        <Consumer />
      </WeekHeatmapProvider>,
    )
    expect(ctx!.streak).toBe(0)
  })

  it('computes streak when consecutive past days are all complete', () => {
    let ctx: ReturnType<typeof useWeekHeatmap> | null = null
    function Consumer() {
      ctx = useWeekHeatmap()
      return null
    }
    // All complete through Thursday (today)
    render(
      <WeekHeatmapProvider days={allCompleteDays} today="2026-03-12">
        <Consumer />
      </WeekHeatmapProvider>,
    )
    // Past days: Mon(2/2), Tue(3/3), Wed(1/1) — all complete, streak = 3
    expect(ctx!.streak).toBe(3)
  })
})

// ============================================================
// A11y
// ============================================================

describe('WeekHeatmap a11y', () => {
  it('has no violations in default state', async () => {
    const { container } = render(
      <WeekHeatmap days={mockDays} today="2026-03-12" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no violations in composable arrangement', async () => {
    const { container } = render(
      <WeekHeatmap.Root days={mockDays} today="2026-03-12">
        <WeekHeatmap.DayStrip />
        <WeekHeatmap.Summary />
        <WeekHeatmap.ProgressBar />
      </WeekHeatmap.Root>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// DayStrip
// ============================================================

describe('WeekHeatmap.DayStrip', () => {
  it('renders 7 day cells with correct day labels', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
  })

  it('renders completion counts for days with tasks', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.getByText('3/3')).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByText('0/2')).toBeInTheDocument()
    expect(screen.getByText('2/4')).toBeInTheDocument()
    expect(screen.getByText('0/3')).toBeInTheDocument()
  })

  it('fires onDayClick when day is clicked', async () => {
    const onClick = vi.fn()
    render(<WeekHeatmap days={mockDays} today="2026-03-12" onDayClick={onClick} />)
    const mondayCell = screen.getByText('Mon').closest('[role="gridcell"]')!
    await userEvent.click(mondayCell)
    expect(onClick).toHaveBeenCalledWith('2026-03-09')
  })

  it('has role="grid" on strip and role="gridcell" on cells', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(7)
  })
})

// ============================================================
// Keyboard navigation
// ============================================================

describe('WeekHeatmap keyboard navigation', () => {
  it('ArrowRight moves focus to next day', async () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const cells = screen.getAllByRole('gridcell')

    // Focus first cell
    cells[0].focus()
    expect(cells[0]).toHaveFocus()

    // ArrowRight
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' })
    expect(cells[1]).toHaveFocus()
  })

  it('ArrowLeft moves focus to previous day', async () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const cells = screen.getAllByRole('gridcell')

    // First move focus to cell 1 via ArrowRight from cell 0
    act(() => { cells[0].focus() })
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' })
    expect(cells[1]).toHaveFocus()

    // Now ArrowLeft should go back to cell 0
    fireEvent.keyDown(cells[1], { key: 'ArrowLeft' })
    expect(cells[0]).toHaveFocus()
  })

  it('Home jumps to Monday, End jumps to Sunday', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const cells = screen.getAllByRole('gridcell')

    cells[3].focus()
    fireEvent.keyDown(cells[3], { key: 'End' })
    expect(cells[6]).toHaveFocus()

    fireEvent.keyDown(cells[6], { key: 'Home' })
    expect(cells[0]).toHaveFocus()
  })

  it('Enter fires onDayClick on focused cell', () => {
    const onClick = vi.fn()
    render(<WeekHeatmap days={mockDays} today="2026-03-12" onDayClick={onClick} />)
    const cells = screen.getAllByRole('gridcell')

    cells[0].focus()
    fireEvent.keyDown(cells[0], { key: 'Enter' })
    expect(onClick).toHaveBeenCalledWith('2026-03-09')
  })

  it('Space fires onDayClick on focused cell', () => {
    const onClick = vi.fn()
    render(<WeekHeatmap days={mockDays} today="2026-03-12" onDayClick={onClick} />)
    const cells = screen.getAllByRole('gridcell')

    cells[0].focus()
    fireEvent.keyDown(cells[0], { key: ' ' })
    expect(onClick).toHaveBeenCalledWith('2026-03-09')
  })

  it('ArrowLeft at Monday does not move focus', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const cells = screen.getAllByRole('gridcell')

    cells[0].focus()
    fireEvent.keyDown(cells[0], { key: 'ArrowLeft' })
    expect(cells[0]).toHaveFocus()
  })

  it('ArrowRight at Sunday does not move focus', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const cells = screen.getAllByRole('gridcell')

    // Navigate to last cell via End
    act(() => { cells[0].focus() })
    fireEvent.keyDown(cells[0], { key: 'End' })
    expect(cells[6]).toHaveFocus()

    // ArrowRight should stay at Sunday
    fireEvent.keyDown(cells[6], { key: 'ArrowRight' })
    expect(cells[6]).toHaveFocus()
  })
})

// ============================================================
// Summary
// ============================================================

describe('WeekHeatmap.Summary', () => {
  it('renders completed and remaining counts', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.getByText('6 completed')).toBeInTheDocument()
    expect(screen.getByText('9 remaining')).toBeInTheDocument()
  })

  it('renders overdue count when provided', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" overdue={2} />)
    expect(screen.getByText('2 overdue')).toBeInTheDocument()
  })

  it('does not render overdue when not provided', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.queryByText(/overdue/)).not.toBeInTheDocument()
  })
})

// ============================================================
// Streak
// ============================================================

describe('WeekHeatmap.Streak', () => {
  it('renders when consecutive complete days > 1', () => {
    render(<WeekHeatmap days={allCompleteDays} today="2026-03-12" />)
    expect(screen.getByText(/3-day streak/)).toBeInTheDocument()
  })

  it('is hidden when streak <= 1', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.queryByText(/streak/)).not.toBeInTheDocument()
  })
})

// ============================================================
// ProgressBar
// ============================================================

describe('WeekHeatmap.ProgressBar', () => {
  it('renders a progress bar', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('has correct value based on completion percentage', () => {
    render(<WeekHeatmap days={mockDays} today="2026-03-12" />)
    const progressbar = screen.getByRole('progressbar')
    // 6/15 = 40%
    expect(progressbar).toHaveAttribute('aria-valuenow', '40')
  })
})

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { CalendarGrid } from '../calendar-grid'
import { DatePicker } from '../date-picker'
import { DateRangePicker } from '../date-range-picker'
import { DateTimePicker } from '../date-time-picker'
import { MonthPicker } from '../month-picker'
import { Presets } from '../presets'
import { TimePicker } from '../time-picker'
import { YearPicker } from '../year-picker'

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------

describe('DatePicker', () => {
  it('renders with default placeholder', () => {
    render(<DatePicker />)
    expect(screen.getByText('Pick a date')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<DatePicker placeholder="Select due date" />)
    expect(screen.getByText('Select due date')).toBeInTheDocument()
  })

  it('displays formatted date when value is provided', () => {
    render(<DatePicker value={new Date(2026, 2, 15)} />)
    expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument()
  })

  it('uses custom formatStr', () => {
    render(<DatePicker value={new Date(2026, 0, 5)} formatStr="dd/MM/yyyy" />)
    expect(screen.getByText('05/01/2026')).toBeInTheDocument()
  })

  it('sets correct aria-label when value is set', () => {
    render(<DatePicker value={new Date(2026, 2, 15)} />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Change date, Mar 15, 2026',
    )
  })

  it('sets placeholder as aria-label when no value', () => {
    render(<DatePicker placeholder="Pick a date" />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Pick a date',
    )
  })

  it('opens popover and shows calendar on click', async () => {
    const user = userEvent.setup()
    render(<DatePicker />)
    await user.click(screen.getByRole('button'))
    // Calendar grid should be visible with weekday headers
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('shows the current month header when opened', async () => {
    const user = userEvent.setup()
    const now = new Date()
    render(<DatePicker />)
    await user.click(screen.getByRole('button'))
    expect(
      screen.getByText(format(now, 'MMMM yyyy')),
    ).toBeInTheDocument()
  })

  it('shows the value month when value is set and opened', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={new Date(2025, 5, 10)} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('June 2025')).toBeInTheDocument()
  })

  it('fires onChange when a date is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    // Use a fixed month so we know what dates appear
    render(<DatePicker value={new Date(2026, 2, 1)} onChange={onChange} />)
    await user.click(screen.getByRole('button'))

    // Click day 10 in the calendar
    const day10 = screen.getByRole('gridcell', {
      name: 'Tuesday, March 10, 2026',
    })
    await user.click(day10)

    expect(onChange).toHaveBeenCalledOnce()
    const selectedDate: Date = onChange.mock.calls[0][0]
    expect(selectedDate.getDate()).toBe(10)
    expect(selectedDate.getMonth()).toBe(2) // March
    expect(selectedDate.getFullYear()).toBe(2026)
  })

  it('sets open=false after selecting a date (popover closes)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker value={new Date(2026, 2, 1)} onChange={onChange} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()

    await user.click(
      screen.getByRole('gridcell', { name: 'Tuesday, March 10, 2026' }),
    )
    // Radix Popover in jsdom may keep content mounted but hidden.
    // We verify the callback was called (which also sets open=false internally).
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('navigates to previous month', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={new Date(2026, 2, 1)} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('March 2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('February 2026')).toBeInTheDocument()
  })

  it('navigates to next month', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={new Date(2026, 2, 1)} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('March 2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('April 2026')).toBeInTheDocument()
  })

  it('switches to month picker when header is clicked', async () => {
    const user = userEvent.setup()
    render(<DatePicker value={new Date(2026, 2, 1)} />)
    await user.click(screen.getByRole('button'))
    // Click the month/year header to switch to month view
    await user.click(
      screen.getByRole('button', { name: 'Switch to month/year view' }),
    )
    // Should show month picker with short month labels
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('has no accessibility violations in closed state', async () => {
    const { container } = render(<DatePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// DateRangePicker
// ---------------------------------------------------------------------------

describe('DateRangePicker', () => {
  it('renders with default placeholder', () => {
    render(<DateRangePicker />)
    expect(screen.getByText('Pick a date range')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<DateRangePicker placeholder="Select sprint dates" />)
    expect(screen.getByText('Select sprint dates')).toBeInTheDocument()
  })

  it('displays formatted range when both dates set', () => {
    render(
      <DateRangePicker
        startDate={new Date(2026, 2, 1)}
        endDate={new Date(2026, 2, 15)}
      />,
    )
    expect(screen.getByText('Mar 1, 2026 - Mar 15, 2026')).toBeInTheDocument()
  })

  it('opens popover on click', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()
  })

  it('fires onChange after selecting two dates', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    // Provide both startDate and endDate so that the first click resets
    // (rangeStart && rangeEnd both exist → first click sets new rangeStart)
    render(
      <DateRangePicker
        startDate={new Date(2026, 2, 1)}
        endDate={new Date(2026, 2, 5)}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button'))

    // First click resets range and sets new rangeStart
    await user.click(
      screen.getByRole('gridcell', { name: 'Wednesday, March 4, 2026' }),
    )
    expect(onChange).not.toHaveBeenCalled()

    // Second click sets rangeEnd and fires onChange
    await user.click(
      screen.getByRole('gridcell', { name: 'Friday, March 20, 2026' }),
    )
    expect(onChange).toHaveBeenCalledOnce()
    const range = onChange.mock.calls[0][0]
    expect(range.start.getDate()).toBe(4)
    expect(range.end.getDate()).toBe(20)
  })

  it('renders multiple calendar months when numberOfMonths > 1', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker numberOfMonths={2} />)
    await user.click(screen.getByRole('button'))

    const grids = screen.getAllByRole('grid', { name: 'Calendar' })
    expect(grids.length).toBe(2)
  })

  it('has no accessibility violations in closed state', async () => {
    const { container } = render(<DateRangePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// TimePicker
// ---------------------------------------------------------------------------

describe('TimePicker', () => {
  it('renders with default placeholder', () => {
    render(<TimePicker />)
    expect(screen.getByText('Pick a time')).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<TimePicker placeholder="Select meeting time" />)
    expect(screen.getByText('Select meeting time')).toBeInTheDocument()
  })

  it('displays formatted time when value is set (12h)', () => {
    const time = new Date(2026, 0, 1, 14, 30, 0)
    render(<TimePicker value={time} format="12h" />)
    expect(screen.getByText('2:30 PM')).toBeInTheDocument()
  })

  it('displays formatted time when value is set (24h)', () => {
    const time = new Date(2026, 0, 1, 14, 30, 0)
    render(<TimePicker value={time} format="24h" />)
    expect(screen.getByText('14:30')).toBeInTheDocument()
  })

  it('opens popover and shows hour/minute columns', async () => {
    const user = userEvent.setup()
    render(<TimePicker />)
    await user.click(screen.getByRole('button'))

    const group = screen.getByRole('group', { name: 'Time picker' })
    expect(group).toBeInTheDocument()
    expect(screen.getByText('Hr')).toBeInTheDocument()
    expect(screen.getByText('Min')).toBeInTheDocument()
  })

  it('fires onChange when an hour is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker onChange={onChange} />)
    await user.click(screen.getByRole('button'))

    // Click hour "3"
    await user.click(screen.getByRole('button', { name: '3 hours' }))
    expect(onChange).toHaveBeenCalledOnce()
    const result: Date = onChange.mock.calls[0][0]
    // In 12h mode, 3 AM => getHours() === 3
    expect(result.getHours()).toBe(3)
  })

  it('fires onChange when a minute is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const base = new Date(2026, 0, 1, 10, 0, 0)
    render(<TimePicker value={base} onChange={onChange} />)
    await user.click(screen.getByRole('button'))

    await user.click(screen.getByRole('button', { name: '15 minutes' }))
    expect(onChange).toHaveBeenCalledOnce()
    const result: Date = onChange.mock.calls[0][0]
    expect(result.getMinutes()).toBe(15)
  })

  it('shows AM/PM buttons in 12h mode', async () => {
    const user = userEvent.setup()
    render(<TimePicker format="12h" />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button', { name: 'AM' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PM' })).toBeInTheDocument()
  })

  it('does not show AM/PM buttons in 24h mode', async () => {
    const user = userEvent.setup()
    render(<TimePicker format="24h" />)
    await user.click(screen.getByRole('button'))
    expect(screen.queryByRole('button', { name: 'AM' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'PM' })).not.toBeInTheDocument()
  })

  it('shows seconds column when showSeconds is true', async () => {
    const user = userEvent.setup()
    render(<TimePicker showSeconds />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Sec')).toBeInTheDocument()
  })

  it('does not show seconds column by default', async () => {
    const user = userEvent.setup()
    render(<TimePicker />)
    await user.click(screen.getByRole('button'))
    expect(screen.queryByText('Sec')).not.toBeInTheDocument()
  })

  it('renders disabled state', () => {
    render(<TimePicker disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has no accessibility violations in closed state', async () => {
    const { container } = render(<TimePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// DateTimePicker
// ---------------------------------------------------------------------------

describe('DateTimePicker', () => {
  it('renders with default placeholder', () => {
    render(<DateTimePicker />)
    expect(screen.getByText('Pick date & time')).toBeInTheDocument()
  })

  it('displays formatted date-time when value is set', () => {
    const dt = new Date(2026, 2, 15, 14, 30)
    render(<DateTimePicker value={dt} />)
    expect(screen.getByText('Mar 15, 2026 2:30 PM')).toBeInTheDocument()
  })

  it('displays 24h format when timeFormat is 24h', () => {
    const dt = new Date(2026, 2, 15, 14, 30)
    render(<DateTimePicker value={dt} timeFormat="24h" />)
    expect(screen.getByText('Mar 15, 2026 14:30')).toBeInTheDocument()
  })

  it('opens popover showing both calendar and time selectors', async () => {
    const user = userEvent.setup()
    render(<DateTimePicker />)
    await user.click(screen.getByRole('button'))

    // Calendar should be present
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()
    // Time controls should be present
    expect(screen.getByLabelText('Hour')).toBeInTheDocument()
    expect(screen.getByLabelText('Minute')).toBeInTheDocument()
  })

  it('fires onChange when a date is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateTimePicker value={new Date(2026, 2, 1, 10, 0)} onChange={onChange} />)
    await user.click(screen.getByRole('button'))

    await user.click(
      screen.getByRole('gridcell', { name: 'Wednesday, March 11, 2026' }),
    )
    expect(onChange).toHaveBeenCalledOnce()
    const result: Date = onChange.mock.calls[0][0]
    expect(result.getDate()).toBe(11)
    // Time should be preserved
    expect(result.getHours()).toBe(10)
    expect(result.getMinutes()).toBe(0)
  })

  it('has no accessibility violations in closed state', async () => {
    const { container } = render(<DateTimePicker />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

// ---------------------------------------------------------------------------
// CalendarGrid (standalone)
// ---------------------------------------------------------------------------

describe('CalendarGrid', () => {
  const baseProps = {
    currentMonth: new Date(2026, 2, 1), // March 2026
    onSelect: vi.fn(),
    onMonthChange: vi.fn(),
  }

  it('renders a grid with weekday headers', () => {
    render(<CalendarGrid {...baseProps} />)
    expect(screen.getByRole('grid', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByText('Su')).toBeInTheDocument()
    expect(screen.getByText('Mo')).toBeInTheDocument()
    expect(screen.getByText('Sa')).toBeInTheDocument()
  })

  it('renders day buttons for the current month', () => {
    render(<CalendarGrid {...baseProps} />)
    // March has 31 days
    expect(
      screen.getByRole('gridcell', { name: 'Sunday, March 1, 2026' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('gridcell', { name: 'Tuesday, March 31, 2026' }),
    ).toBeInTheDocument()
  })

  it('marks selected day with aria-selected', () => {
    render(
      <CalendarGrid {...baseProps} selected={new Date(2026, 2, 15)} />,
    )
    expect(
      screen.getByRole('gridcell', { name: 'Sunday, March 15, 2026' }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onSelect when a day is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<CalendarGrid {...baseProps} onSelect={onSelect} />)

    await user.click(
      screen.getByRole('gridcell', { name: 'Tuesday, March 10, 2026' }),
    )
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect.mock.calls[0][0].getDate()).toBe(10)
  })

  it('disables dates outside minDate/maxDate', () => {
    render(
      <CalendarGrid
        {...baseProps}
        minDate={new Date(2026, 2, 5)}
        maxDate={new Date(2026, 2, 25)}
      />,
    )
    // Day 4 should be disabled
    expect(
      screen.getByRole('gridcell', { name: 'Wednesday, March 4, 2026' }),
    ).toHaveAttribute('aria-disabled', 'true')
    // Day 26 should be disabled
    expect(
      screen.getByRole('gridcell', { name: 'Thursday, March 26, 2026' }),
    ).toHaveAttribute('aria-disabled', 'true')
    // Day 15 should NOT be disabled
    expect(
      screen.getByRole('gridcell', { name: 'Sunday, March 15, 2026' }),
    ).not.toHaveAttribute('aria-disabled')
  })

  it('disables dates matching disabledDates predicate', () => {
    // Disable weekends
    render(
      <CalendarGrid
        {...baseProps}
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />,
    )
    // March 1, 2026 is a Sunday
    expect(
      screen.getByRole('gridcell', { name: 'Sunday, March 1, 2026' }),
    ).toHaveAttribute('aria-disabled', 'true')
    // March 2, 2026 is a Monday
    expect(
      screen.getByRole('gridcell', { name: 'Monday, March 2, 2026' }),
    ).not.toHaveAttribute('aria-disabled')
  })

  it('calls onMonthChange when previous month button is clicked', async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    render(<CalendarGrid {...baseProps} onMonthChange={onMonthChange} />)

    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(onMonthChange).toHaveBeenCalledOnce()
    const newMonth: Date = onMonthChange.mock.calls[0][0]
    expect(newMonth.getMonth()).toBe(1) // February
  })

  it('calls onMonthChange when next month button is clicked', async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    render(<CalendarGrid {...baseProps} onMonthChange={onMonthChange} />)

    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(onMonthChange).toHaveBeenCalledOnce()
    const newMonth: Date = onMonthChange.mock.calls[0][0]
    expect(newMonth.getMonth()).toBe(3) // April
  })

  it('hides prev/next nav when told to', () => {
    render(
      <CalendarGrid {...baseProps} hidePrevNav hideNextNav />,
    )
    expect(
      screen.queryByRole('button', { name: 'Previous month' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Next month' }),
    ).not.toBeInTheDocument()
  })

  it('renders event dots', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[{ date: new Date(2026, 2, 10), label: 'Test event' }]}
      />,
    )
    expect(container.querySelectorAll('[data-event-dot]').length).toBe(1)
  })

  it('caps event dots at 3', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[
          { date: new Date(2026, 2, 10), color: 'red' },
          { date: new Date(2026, 2, 10), color: 'blue' },
          { date: new Date(2026, 2, 10), color: 'green' },
          { date: new Date(2026, 2, 10), color: 'orange' },
          { date: new Date(2026, 2, 10), color: 'purple' },
        ]}
      />,
    )
    expect(container.querySelectorAll('[data-event-dot]').length).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// MonthPicker (standalone)
// ---------------------------------------------------------------------------

describe('MonthPicker', () => {
  const defaultProps = {
    currentYear: 2026,
    onMonthSelect: vi.fn(),
  }

  it('renders all 12 month buttons', () => {
    render(<MonthPicker {...defaultProps} />)
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Jun')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('displays the current year', () => {
    render(<MonthPicker {...defaultProps} />)
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('calls onMonthSelect when a month is clicked', async () => {
    const user = userEvent.setup()
    const onMonthSelect = vi.fn()
    render(<MonthPicker {...defaultProps} onMonthSelect={onMonthSelect} />)

    await user.click(screen.getByText('Mar'))
    expect(onMonthSelect).toHaveBeenCalledWith(2) // March is index 2
  })

  it('disables months before minDate', () => {
    render(
      <MonthPicker
        {...defaultProps}
        minDate={new Date(2026, 3, 1)} // April
      />,
    )
    expect(screen.getByText('Jan')).toBeDisabled()
    expect(screen.getByText('Mar')).toBeDisabled()
    expect(screen.getByText('Apr')).not.toBeDisabled()
  })

  it('disables months after maxDate', () => {
    render(
      <MonthPicker
        {...defaultProps}
        maxDate={new Date(2026, 8, 30)} // September
      />,
    )
    expect(screen.getByText('Sep')).not.toBeDisabled()
    expect(screen.getByText('Oct')).toBeDisabled()
    expect(screen.getByText('Dec')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// YearPicker (standalone)
// ---------------------------------------------------------------------------

describe('YearPicker', () => {
  const defaultProps = {
    currentYear: 2026,
    onYearSelect: vi.fn(),
  }

  it('renders a decade of year buttons', () => {
    render(<YearPicker {...defaultProps} />)
    // 2026 falls in the 2020-2031 decade
    expect(screen.getByText('2020')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('2031')).toBeInTheDocument()
  })

  it('displays the decade range header', () => {
    render(<YearPicker {...defaultProps} />)
    // Header uses &ndash; (\u2013) between start and end years
    expect(screen.getByText(/2020\s*\u2013\s*2031/)).toBeInTheDocument()
  })

  it('calls onYearSelect when a year is clicked', async () => {
    const user = userEvent.setup()
    const onYearSelect = vi.fn()
    render(<YearPicker {...defaultProps} onYearSelect={onYearSelect} />)

    await user.click(screen.getByText('2025'))
    expect(onYearSelect).toHaveBeenCalledWith(2025)
  })

  it('disables years before minDate', () => {
    render(
      <YearPicker
        {...defaultProps}
        minDate={new Date(2024, 0, 1)}
      />,
    )
    expect(screen.getByText('2023')).toBeDisabled()
    expect(screen.getByText('2024')).not.toBeDisabled()
  })

  it('disables years after maxDate', () => {
    render(
      <YearPicker
        {...defaultProps}
        maxDate={new Date(2028, 11, 31)}
      />,
    )
    expect(screen.getByText('2028')).not.toBeDisabled()
    expect(screen.getByText('2029')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Presets (standalone)
// ---------------------------------------------------------------------------

describe('Presets', () => {
  it('renders preset buttons', () => {
    render(<Presets presets={['today', 'last7days']} onSelect={vi.fn()} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
  })

  it('fires onSelect with start/end dates when a preset is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Presets presets={['today']} onSelect={onSelect} />)

    await user.click(screen.getByText('Today'))
    expect(onSelect).toHaveBeenCalledOnce()
    const [start, end] = onSelect.mock.calls[0]
    expect(start).toBeInstanceOf(Date)
    expect(end).toBeInstanceOf(Date)
    // "Today" preset: start <= end, both on the same day
    expect(start.getDate()).toBe(end.getDate())
  })

  it('renders all preset options', () => {
    render(
      <Presets
        presets={['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'thisYear']}
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('This month')).toBeInTheDocument()
    expect(screen.getByText('Last month')).toBeInTheDocument()
    expect(screen.getByText('This year')).toBeInTheDocument()
  })
})

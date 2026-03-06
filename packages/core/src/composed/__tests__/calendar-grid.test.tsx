import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CalendarGrid } from '../date-picker/calendar-grid'

describe('CalendarGrid events', () => {
  const baseProps = {
    currentMonth: new Date(2026, 2, 1),
    onSelect: vi.fn(),
    onMonthChange: vi.fn(),
  }

  it('renders event dots on dates with events', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[{ date: new Date(2026, 2, 10), label: '3 tasks due' }]}
      />,
    )
    const dots = container.querySelectorAll('[data-event-dot]')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('caps visible dots at 3 for many events', () => {
    const { container } = render(
      <CalendarGrid
        {...baseProps}
        events={[
          { date: new Date(2026, 2, 10), color: 'red' },
          { date: new Date(2026, 2, 10), color: 'blue' },
          { date: new Date(2026, 2, 10), color: 'green' },
          { date: new Date(2026, 2, 10), color: 'orange' },
        ]}
      />,
    )
    const dots = container.querySelectorAll('[data-event-dot]')
    expect(dots.length).toBe(3)
  })

  it('renders no dots when no events', () => {
    const { container } = render(<CalendarGrid {...baseProps} />)
    const dots = container.querySelectorAll('[data-event-dot]')
    expect(dots.length).toBe(0)
  })
})

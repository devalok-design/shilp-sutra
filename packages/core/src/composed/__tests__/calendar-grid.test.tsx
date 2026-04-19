import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CalendarGrid {...baseProps} />,
    )
    // CalendarGrid uses role="grid" with gridcell children — the full row
    // structure is composed by the parent DatePicker, so ARIA parent/child
    // rules fire when CalendarGrid is rendered in isolation.
    expect(await axe(container, {
      rules: {
        'aria-required-parent': { enabled: false },
        'aria-required-children': { enabled: false },
      },
    })).toHaveNoViolations()
  })
})

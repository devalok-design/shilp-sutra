import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ScheduleView } from '../schedule-view'

const baseEvents = [
  {
    id: '1',
    title: 'Sprint Planning',
    start: new Date(2026, 2, 10, 9, 0),
    end: new Date(2026, 2, 10, 10, 30),
    color: 'info' as const,
  },
  {
    id: '2',
    title: 'Lunch',
    start: new Date(2026, 2, 10, 12, 0),
    end: new Date(2026, 2, 10, 13, 0),
    color: 'neutral' as const,
  },
]

describe('ScheduleView', () => {
  it('renders day view with events', () => {
    render(<ScheduleView view="day" date={new Date(2026, 2, 10)} events={baseEvents} />)
    expect(screen.getByText('Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
  })

  it('renders week view with day columns', () => {
    render(<ScheduleView view="week" date={new Date(2026, 2, 10)} events={baseEvents} />)
    expect(screen.getByText(/Mon/)).toBeInTheDocument()
    expect(screen.getByText(/Tue/)).toBeInTheDocument()
  })

  it('calls onEventClick when event is clicked', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <ScheduleView view="day" date={new Date(2026, 2, 10)} events={baseEvents} onEventClick={onClick} />
    )
    await user.click(screen.getByText('Sprint Planning'))
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
  })

  it('renders time labels', () => {
    render(<ScheduleView view="day" date={new Date(2026, 2, 10)} events={[]} />)
    expect(screen.getByText('9 AM')).toBeInTheDocument()
    expect(screen.getByText('12 PM')).toBeInTheDocument()
  })

  it('should have no a11y violations', async () => {
    const { container } = render(
      <ScheduleView view="day" date={new Date(2026, 2, 10)} events={baseEvents} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

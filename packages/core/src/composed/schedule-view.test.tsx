import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { type ScheduleEvent,ScheduleView } from './schedule-view'

const baseDate = new Date('2026-03-17T12:00:00Z')

describeConformance(
  'ScheduleView',
  (props) => <ScheduleView view="day" date={baseDate} events={[]} {...props} />,
)

const sampleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    start: new Date('2026-03-17T09:00:00Z'),
    end: new Date('2026-03-17T09:30:00Z'),
    color: 'accent',
  },
  {
    id: '2',
    title: 'Design Review',
    start: new Date('2026-03-17T14:00:00Z'),
    end: new Date('2026-03-17T15:00:00Z'),
    color: 'success',
  },
]

describe('ScheduleView', () => {
  it('renders day view as a labelled region', () => {
    render(
      <ScheduleView view="day" date={baseDate} events={[]} />,
    )
    expect(
      screen.getByRole('region', { name: /Schedule for/i }),
    ).toBeInTheDocument()
  })

  it('renders week view as a labelled region', () => {
    render(
      <ScheduleView view="week" date={baseDate} events={[]} />,
    )
    expect(
      screen.getByRole('region', { name: /Week schedule starting/i }),
    ).toBeInTheDocument()
  })

  it('renders time column with hour labels', () => {
    render(
      <ScheduleView view="day" date={baseDate} events={[]} startHour={8} endHour={12} />,
    )
    expect(screen.getByText('8 AM')).toBeInTheDocument()
    expect(screen.getByText('9 AM')).toBeInTheDocument()
    expect(screen.getByText('10 AM')).toBeInTheDocument()
    expect(screen.getByText('11 AM')).toBeInTheDocument()
  })

  it('renders events as buttons with accessible labels', () => {
    render(
      <ScheduleView view="day" date={baseDate} events={sampleEvents} />,
    )
    expect(screen.getByText('Team Standup')).toBeInTheDocument()
    expect(screen.getByText('Design Review')).toBeInTheDocument()
  })

  it('calls onEventClick when an event is clicked', async () => {
    const onEventClick = vi.fn()
    render(
      <ScheduleView
        view="day"
        date={baseDate}
        events={sampleEvents}
        onEventClick={onEventClick}
      />,
    )
    const eventButton = screen.getByText('Team Standup').closest('button')!
    eventButton.click()
    expect(onEventClick).toHaveBeenCalledWith(sampleEvents[0])
  })

  it('merges custom className', () => {
    const { container } = render(
      <ScheduleView view="day" date={baseDate} events={[]} className="my-schedule" />,
    )
    expect(container.firstElementChild).toHaveClass('my-schedule')
  })

  it('week view renders day columns', () => {
    render(<ScheduleView view="week" date={baseDate} events={[]} />)
    expect(screen.getByText(/Mon/)).toBeInTheDocument()
    expect(screen.getByText(/Tue/)).toBeInTheDocument()
  })

  it('slots are non-interactive (no tab stops) when onSlotClick is absent', () => {
    render(<ScheduleView view="day" date={baseDate} events={[]} startHour={8} endHour={10} />)
    // No slot buttons — only event buttons would be role=button, and there are none here.
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('slots become interactive buttons when onSlotClick is provided', async () => {
    const onSlotClick = vi.fn()
    render(
      <ScheduleView view="day" date={baseDate} events={[]} startHour={8} endHour={10} slotDuration={30} onSlotClick={onSlotClick} />,
    )
    const slots = screen.getAllByRole('button')
    expect(slots.length).toBeGreaterThan(0)
    await userEvent.click(slots[0])
    expect(onSlotClick).toHaveBeenCalled()
  })

  it('roving tabindex: only one slot is tabbable, arrows move focus', async () => {
    const user = userEvent.setup()
    render(
      <ScheduleView view="day" date={baseDate} events={[]} startHour={8} endHour={10} slotDuration={30} onSlotClick={vi.fn()} />,
    )
    const slots = screen.getAllByRole('button')
    const tabbable = slots.filter((s) => s.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    tabbable[0].focus()
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(slots[1])
  })

  it('overlapping events both render side by side', () => {
    const overlapping: ScheduleEvent[] = [
      { id: 'a', title: 'A', start: new Date('2026-03-17T09:00:00Z'), end: new Date('2026-03-17T10:00:00Z') },
      { id: 'b', title: 'B', start: new Date('2026-03-17T09:30:00Z'), end: new Date('2026-03-17T10:30:00Z') },
    ]
    render(<ScheduleView view="day" date={baseDate} events={overlapping} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('marks the selected event', () => {
    render(<ScheduleView view="day" date={baseDate} events={sampleEvents} selectedEventId="1" />)
    const selected = screen.getByText('Team Standup').closest('button')!
    expect(selected).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders a custom empty state', () => {
    render(<ScheduleView view="day" date={baseDate} events={[]} emptyState="Nothing today" />)
    expect(screen.getByText('Nothing today')).toBeInTheDocument()
  })

  it('renderEvent customizes the event body', () => {
    render(
      <ScheduleView
        view="day"
        date={baseDate}
        events={sampleEvents}
        renderEvent={(e) => <span data-testid="ev">{e.id}</span>}
      />,
    )
    expect(screen.getAllByTestId('ev')[0]).toHaveTextContent('1')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ScheduleView view="week" date={baseDate} events={sampleEvents} onSlotClick={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

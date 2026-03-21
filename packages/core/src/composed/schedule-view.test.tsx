import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ScheduleView, type ScheduleEvent } from './schedule-view'

const baseDate = new Date('2026-03-17T12:00:00Z')

const sampleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    start: new Date('2026-03-17T09:00:00Z'),
    end: new Date('2026-03-17T09:30:00Z'),
    color: 'primary',
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
  it('renders day view with aria label', () => {
    render(
      <ScheduleView view="day" date={baseDate} events={[]} />,
    )
    expect(
      screen.getByRole('region', { name: /Schedule for/i }),
    ).toBeInTheDocument()
  })

  it('renders week view with aria label', () => {
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
})

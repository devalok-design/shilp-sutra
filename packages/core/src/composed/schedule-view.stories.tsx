import type { Meta, StoryObj } from '@storybook/react'
import { ScheduleView, type ScheduleEvent } from './schedule-view'

const baseDate = new Date(2026, 2, 10) // Tuesday, March 10 2026

const sampleEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: 'Sprint Planning',
    start: new Date(2026, 2, 10, 9, 0),
    end: new Date(2026, 2, 10, 10, 30),
    color: 'info',
  },
  {
    id: '2',
    title: 'Design Review',
    start: new Date(2026, 2, 10, 11, 0),
    end: new Date(2026, 2, 10, 11, 45),
    color: 'primary',
  },
  {
    id: '3',
    title: 'Lunch Break',
    start: new Date(2026, 2, 10, 12, 0),
    end: new Date(2026, 2, 10, 13, 0),
    color: 'neutral',
  },
  {
    id: '4',
    title: 'Client Call',
    start: new Date(2026, 2, 10, 14, 0),
    end: new Date(2026, 2, 10, 15, 0),
    color: 'warning',
  },
  {
    id: '5',
    title: 'Deploy v0.6.0',
    start: new Date(2026, 2, 10, 16, 0),
    end: new Date(2026, 2, 10, 17, 0),
    color: 'success',
  },
  {
    id: '6',
    title: 'Incident Retro',
    start: new Date(2026, 2, 11, 10, 0),
    end: new Date(2026, 2, 11, 11, 0),
    color: 'error',
  },
  {
    id: '7',
    title: 'Team Standup',
    start: new Date(2026, 2, 12, 9, 0),
    end: new Date(2026, 2, 12, 9, 30),
    color: 'info',
  },
  {
    id: '8',
    title: 'Workshop',
    start: new Date(2026, 2, 13, 13, 0),
    end: new Date(2026, 2, 13, 15, 0),
    color: 'primary',
  },
]

const meta: Meta<typeof ScheduleView> = {
  title: 'Composed/ScheduleView',
  component: ScheduleView,
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'select',
      options: ['day', 'week'],
    },
    startHour: {
      control: { type: 'number', min: 0, max: 12 },
    },
    endHour: {
      control: { type: 'number', min: 12, max: 24 },
    },
    slotDuration: {
      control: 'select',
      options: [15, 30, 60],
    },
  },
}
export default meta
type Story = StoryObj<typeof ScheduleView>

export const DayView: Story = {
  args: {
    view: 'day',
    date: baseDate,
    events: sampleEvents,
  },
}

export const WeekView: Story = {
  args: {
    view: 'week',
    date: baseDate,
    events: sampleEvents,
  },
}

export const EmptyState: Story = {
  args: {
    view: 'day',
    date: baseDate,
    events: [],
  },
}

export const CustomHours: Story = {
  args: {
    view: 'day',
    date: baseDate,
    events: [
      {
        id: 'early',
        title: 'Early Meeting',
        start: new Date(2026, 2, 10, 6, 0),
        end: new Date(2026, 2, 10, 7, 0),
        color: 'info',
      },
      {
        id: 'late',
        title: 'Late Shift',
        start: new Date(2026, 2, 10, 20, 0),
        end: new Date(2026, 2, 10, 21, 30),
        color: 'warning',
      },
    ],
    startHour: 6,
    endHour: 22,
  },
}

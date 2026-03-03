import type { Meta, StoryObj } from '@storybook/react'
import { RenderDate, type DateAttendanceInfo } from './render-date'
import type { DayInfo } from '../types'

// ============================================================
// Mock Data
// ============================================================

const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const baseDayInfo: DayInfo = {
  day: 'MON',
  date: today.getDate(),
  fullDate: today,
  isToday: true,
  isActive: true,
  isPadding: false,
  hasBreak: false,
  isAbsent: false,
  isDisabled: false,
}

const pastDate = new Date('2026-02-25')
const futureDate = new Date('2026-03-15')

const pastDayInfo: DayInfo = {
  day: 'TUE',
  date: pastDate.getDate(),
  fullDate: pastDate,
  isToday: false,
  isActive: false,
  isPadding: false,
  hasBreak: false,
  isAbsent: false,
  isDisabled: false,
}

const futureDayInfo: DayInfo = {
  day: 'SAT',
  date: futureDate.getDate(),
  fullDate: futureDate,
  isToday: false,
  isActive: false,
  isPadding: false,
  hasBreak: false,
  isAbsent: false,
  isDisabled: false,
}

const disabledDayInfo: DayInfo = {
  ...pastDayInfo,
  isDisabled: true,
}

const presentMap = new Map<string, DateAttendanceInfo>([
  [todayStr, { status: 'PRESENT', hasCorrectionOrApproval: false }],
])

const absentMap = new Map<string, DateAttendanceInfo>([
  ['2026-02-25', { status: 'ABSENT', hasCorrectionOrApproval: false }],
])

const breakMap = new Map<string, DateAttendanceInfo>([
  [todayStr, { status: 'BREAK', isBreakApproved: true }],
])

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Dashboard/RenderDate',
  component: RenderDate,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RenderDate>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Today's date cell — highlighted with interactive color */
export const Today: Story = {
  args: {
    day: baseDayInfo,
    isAdmin: true,
    selectedDate: todayStr,
    dateAttendanceMap: null,
    activeTimeFrame: 'weekly',
  },
}

/** Date cell showing present attendance status */
export const Present: Story = {
  args: {
    day: baseDayInfo,
    isAdmin: true,
    selectedDate: todayStr,
    dateAttendanceMap: presentMap,
    activeTimeFrame: 'weekly',
  },
}

/** Past date cell showing absent status with error dot indicator */
export const Absent: Story = {
  args: {
    day: pastDayInfo,
    isAdmin: true,
    selectedDate: '2026-02-25',
    dateAttendanceMap: absentMap,
    activeTimeFrame: 'weekly',
  },
}

/** Date cell showing on-break status */
export const OnBreak: Story = {
  args: {
    day: baseDayInfo,
    isAdmin: true,
    selectedDate: todayStr,
    dateAttendanceMap: breakMap,
    activeTimeFrame: 'weekly',
  },
}

/** Disabled date cell — non-interactive styling */
export const Disabled: Story = {
  args: {
    day: disabledDayInfo,
    isAdmin: true,
    selectedDate: todayStr,
    dateAttendanceMap: null,
    activeTimeFrame: 'weekly',
  },
}

/** Future date with no attendance data — default styling */
export const FutureDefault: Story = {
  args: {
    day: futureDayInfo,
    isAdmin: true,
    selectedDate: todayStr,
    dateAttendanceMap: null,
    activeTimeFrame: 'monthly',
  },
}

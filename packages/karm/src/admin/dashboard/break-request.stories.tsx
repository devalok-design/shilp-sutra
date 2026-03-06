import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { BreakRequestCard } from './break-request'
import type { BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const today = new Date().toISOString().split('T')[0]

const singleDayBreak: BreakRequest = {
  id: 'br-1',
  userId: 'u1',
  startDate: today,
  endDate: today,
  numberOfDays: 1,
  reason: 'Doctor appointment',
  status: 'APPROVED',
  adminComment: 'Approved by admin',
}

const multiDayBreak: BreakRequest = {
  id: 'br-2',
  userId: 'u1',
  startDate: '2026-03-03',
  endDate: '2026-03-07',
  numberOfDays: 5,
  reason: 'Family vacation',
  status: 'APPROVED',
  adminComment: 'Enjoy your trip!',
}

const pendingBreak: BreakRequest = {
  id: 'br-3',
  userId: 'u1',
  startDate: '2026-03-10',
  endDate: '2026-03-12',
  numberOfDays: 3,
  reason: 'Personal time off',
  status: 'PENDING',
}

const rejectedBreak: BreakRequest = {
  id: 'br-4',
  userId: 'u1',
  startDate: '2026-03-15',
  endDate: '2026-03-15',
  numberOfDays: 1,
  reason: 'Moving day',
  status: 'REJECTED',
  adminComment: 'Critical deadline — please reschedule',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Dashboard/BreakRequestCard',
  component: BreakRequestCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BreakRequestCard } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BreakRequestCard>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Approved single-day break with cancel option */
export const Default: Story = {
  args: {
    selectedDate: today,
    userId: 'u1',
    breakRequest: singleDayBreak,
    assetsBaseUrl: '',
    onCancelBreak: fn(),
    onRefreshAttendance: fn(),
    onRefreshGroupedAttendance: fn(),
  },
}

/** Multi-day approved break showing date range */
export const MultiDay: Story = {
  args: {
    selectedDate: '2026-03-04',
    userId: 'u1',
    breakRequest: multiDayBreak,
    assetsBaseUrl: '',
    onCancelBreak: fn(),
    onRefreshAttendance: fn(),
    onRefreshGroupedAttendance: fn(),
  },
}

/** Pending break request awaiting approval */
export const Pending: Story = {
  args: {
    selectedDate: '2026-03-10',
    userId: 'u1',
    breakRequest: pendingBreak,
    assetsBaseUrl: '',
    onCancelBreak: fn(),
    onRefreshAttendance: fn(),
    onRefreshGroupedAttendance: fn(),
  },
}

/** Rejected break request showing admin comment */
export const Rejected: Story = {
  args: {
    selectedDate: '2026-03-15',
    userId: 'u1',
    breakRequest: rejectedBreak,
    assetsBaseUrl: '',
  },
}

/** No break request — renders nothing */
export const NoBreakRequest: Story = {
  args: {
    selectedDate: today,
    userId: 'u1',
    breakRequest: null,
  },
}

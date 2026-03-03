import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { EditBreak } from './edit-break'
import type { BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const approvedBreak: BreakRequest & { numberOfDays: number } = {
  id: 'brk-1',
  userId: 'u1',
  startDate: '2026-03-10',
  endDate: '2026-03-12',
  numberOfDays: 3,
  reason: 'Family wedding in Jaipur',
  status: 'APPROVED',
  adminComment: 'Enjoy the celebrations!',
  user: { id: 'u1', name: 'Arjun Mehta', firstName: 'Arjun', image: null },
}

const pendingBreak: BreakRequest & { numberOfDays: number } = {
  id: 'brk-2',
  userId: 'u2',
  startDate: '2026-03-20',
  endDate: '2026-03-20',
  numberOfDays: 1,
  reason: 'Doctor appointment in the afternoon',
  status: 'PENDING',
  user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
}

const rejectedBreak: BreakRequest & { numberOfDays: number } = {
  id: 'brk-3',
  userId: 'u3',
  startDate: '2026-03-25',
  endDate: '2026-03-28',
  numberOfDays: 4,
  reason: 'Personal travel to Goa',
  status: 'REJECTED',
  adminComment: 'Overlaps with sprint deadline',
  user: { id: 'u3', name: 'Kavita Reddy', firstName: 'Kavita', image: null },
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/EditBreak',
  component: EditBreak,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onSave: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof EditBreak>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Edit button for an approved break request */
export const Default: Story = {
  args: {
    selectedLeave: approvedBreak,
  },
}

/** Edit button for a pending break request */
export const Pending: Story = {
  args: {
    selectedLeave: pendingBreak,
  },
}

/** Edit button for a rejected break request */
export const Rejected: Story = {
  args: {
    selectedLeave: rejectedBreak,
  },
}

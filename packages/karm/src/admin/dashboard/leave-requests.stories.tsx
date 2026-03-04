import type { Meta, StoryObj } from '@storybook/react'
import { LeaveRequests } from './leave-requests'
import type { BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockRequests: BreakRequest[] = [
  {
    id: 'req-1',
    userId: 'u1',
    startDate: '2026-03-10',
    endDate: '2026-03-10',
    numberOfDays: 1,
    reason: 'Doctor appointment in the afternoon',
    status: 'PENDING',
    user: {
      id: 'u1',
      name: 'Arjun Mehta',
      firstName: 'Arjun',
      image: null,
    },
  },
  {
    id: 'req-2',
    userId: 'u2',
    startDate: '2026-03-15',
    endDate: '2026-03-18',
    numberOfDays: 4,
    reason: 'Family vacation to Rajasthan',
    status: 'PENDING',
    user: {
      id: 'u2',
      name: 'Priya Sharma',
      firstName: 'Priya',
      image: null,
    },
  },
  {
    id: 'req-3',
    userId: 'u3',
    startDate: '2026-03-20',
    endDate: '2026-03-22',
    numberOfDays: 3,
    reason: 'Wedding ceremony of a close friend',
    status: 'PENDING',
    user: {
      id: 'u3',
      name: 'Kavita Reddy',
      firstName: 'Kavita',
      image: null,
    },
  },
]

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/LeaveRequests',
  component: LeaveRequests,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onApproveBreak: { action: 'approveBreak' },
    onRejectBreak: { action: 'rejectBreak' },
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeaveRequests>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default with multiple pending leave requests */
export const Default: Story = {
  args: {
    requests: mockRequests,
    currentUserId: 'admin-1',
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
  },
}

/** Single day leave request */
export const SingleDayRequest: Story = {
  args: {
    requests: [mockRequests[0]],
    currentUserId: 'admin-1',
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
  },
}

/** Multi-day leave request */
export const MultiDayRequest: Story = {
  args: {
    requests: [mockRequests[1]],
    currentUserId: 'admin-1',
    userImages: mockUserImages,
    activeTimeFrame: 'monthly',
  },
}

/** Current user's own request (approve/reject buttons disabled) */
export const OwnRequest: Story = {
  args: {
    requests: [mockRequests[0]],
    currentUserId: 'u1',
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
  },
}

/** Empty state — no pending requests */
export const Empty: Story = {
  args: {
    requests: [],
    currentUserId: 'admin-1',
    userImages: {},
    activeTimeFrame: 'weekly',
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { LeaveRequest } from './leave-request'
import type { BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const singleDayRequest: BreakRequest = {
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
}

const multiDayRequest: BreakRequest = {
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
}

const correctionRequest: BreakRequest = {
  id: 'req-3',
  userId: 'u3',
  startDate: '2026-03-05',
  endDate: '2026-03-05',
  numberOfDays: 1,
  reason: 'Forgot to mark attendance',
  status: 'PENDING',
  correction: true,
  user: {
    id: 'u3',
    name: 'Kavita Reddy',
    firstName: 'Kavita',
    image: null,
  },
}

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/LeaveRequest',
  component: LeaveRequest,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    handleRejectRequest: fn(),
    handleApproveRequest: fn(),
    onCommentBoxClose: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LeaveRequest>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Single day leave request with approve/reject actions */
export const Default: Story = {
  args: {
    request: singleDayRequest,
    userImages: mockUserImages,
    commentBoxOpen: false,
    clickedAction: null,
    userId: 'admin-1',
  },
}

/** Multi-day leave request showing date range and day count */
export const MultiDay: Story = {
  args: {
    request: multiDayRequest,
    userImages: mockUserImages,
    commentBoxOpen: false,
    clickedAction: null,
    userId: 'admin-1',
  },
}

/** Attendance correction request (shows "Attendance Corrections" label) */
export const CorrectionRequest: Story = {
  args: {
    request: correctionRequest,
    userImages: mockUserImages,
    commentBoxOpen: false,
    clickedAction: null,
    userId: 'admin-1',
  },
}

/** Comment dialog open in approve mode */
export const WithApproveComment: Story = {
  args: {
    request: multiDayRequest,
    userImages: mockUserImages,
    commentBoxOpen: true,
    clickedAction: 'approve',
    userId: 'admin-1',
  },
}

/** Comment dialog open in reject mode */
export const WithRejectComment: Story = {
  args: {
    request: singleDayRequest,
    userImages: mockUserImages,
    commentBoxOpen: true,
    clickedAction: 'reject',
    userId: 'admin-1',
  },
}

/** Own request — approve/reject buttons are disabled */
export const OwnRequest: Story = {
  args: {
    request: singleDayRequest,
    userImages: mockUserImages,
    commentBoxOpen: false,
    clickedAction: null,
    userId: 'u1',
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { AttendanceOverview } from './attendance-overview'
import type { AdminUser, GroupedAttendance, AttendanceRecord } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Arjun Mehta',
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun@example.com',
    designation: 'Senior Developer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    designation: 'Designer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Kavita Reddy',
    firstName: 'Kavita',
    lastName: 'Reddy',
    email: 'kavita@example.com',
    designation: 'Product Manager',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'u4',
    name: 'Rohan Gupta',
    firstName: 'Rohan',
    lastName: 'Gupta',
    email: 'rohan@example.com',
    designation: 'QA Engineer',
    image: null,
    role: 'Apprentice',
    isActive: true,
    createdAt: '2024-04-05T00:00:00Z',
  },
  {
    id: 'u5',
    name: 'Sneha Patel',
    firstName: 'Sneha',
    lastName: 'Patel',
    email: 'sneha@example.com',
    designation: 'Frontend Developer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2024-05-20T00:00:00Z',
  },
]

const today = new Date().toISOString().split('T')[0]

const mockAttendanceRecord = (
  userId: string,
  status: 'PRESENT' | 'ABSENT' | 'BREAK',
): { user: AdminUser; attendance: AttendanceRecord } => ({
  user: mockUsers.find((u) => u.id === userId)!,
  attendance: {
    id: `att-${userId}`,
    userId,
    date: today,
    timeIn: status === 'PRESENT' ? '2026-03-01T09:00:00Z' : null,
    timeOut: status === 'PRESENT' ? '2026-03-01T18:00:00Z' : null,
    status,
  },
})

const mockGroupedAttendance: GroupedAttendance = {
  present: [
    mockAttendanceRecord('u1', 'PRESENT'),
    mockAttendanceRecord('u2', 'PRESENT'),
  ],
  absent: [
    { user: mockUsers[2], attendance: undefined },
  ],
  onBreak: [
    {
      ...mockAttendanceRecord('u3', 'BREAK'),
      breakRequest: {
        id: 'br-1',
        userId: 'u3',
        startDate: '2026-02-28',
        endDate: '2026-03-02',
        numberOfDays: 3,
        reason: 'Family vacation',
        status: 'APPROVED',
      },
    },
  ],
  yetToMark: [{ user: mockUsers[3] }, { user: mockUsers[4] }],
}

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
  u4: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
  u5: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/AttendanceOverview',
  component: AttendanceOverview,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AttendanceOverview>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default overview showing present, absent, on break, and yet-to-mark groups */
export const Default: Story = {
  args: {
    isFutureDate: false,
    users: mockUsers,
    groupedAttendance: mockGroupedAttendance,
    userImages: mockUserImages,
    selectedDate: today,
  },
}

/** Future date view — shows only on-break users */
export const FutureDate: Story = {
  args: {
    isFutureDate: true,
    users: mockUsers,
    groupedAttendance: null,
    userImages: mockUserImages,
    selectedDate: '2026-03-15',
  },
}

/** Empty state when no attendance data is available */
export const Empty: Story = {
  args: {
    isFutureDate: false,
    users: [],
    groupedAttendance: {
      present: [],
      absent: [],
      onBreak: [],
      yetToMark: [],
    },
    userImages: {},
    selectedDate: today,
  },
}

/** All users present */
export const AllPresent: Story = {
  args: {
    isFutureDate: false,
    users: mockUsers,
    groupedAttendance: {
      present: mockUsers.map((user) => ({
        user,
        attendance: {
          id: `att-${user.id}`,
          userId: user.id,
          date: today,
          timeIn: '2026-03-01T09:00:00Z',
          timeOut: '2026-03-01T18:00:00Z',
          status: 'PRESENT' as const,
        },
      })),
      absent: [],
      onBreak: [],
      yetToMark: [],
    },
    userImages: mockUserImages,
    selectedDate: today,
  },
}

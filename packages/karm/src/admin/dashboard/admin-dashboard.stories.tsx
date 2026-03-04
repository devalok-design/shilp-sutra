import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { AdminDashboard } from './admin-dashboard'
import type { AdminUser, GroupedAttendance, AttendanceRecord, BreakRequest } from '../types'
import type { AttendanceCorrection } from './correction-list'
import type { TaskItem } from './associate-detail'

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
]

const today = new Date().toISOString().split('T')[0]

const mockGroupedAttendance: GroupedAttendance = {
  present: [
    {
      user: mockUsers[0],
      attendance: {
        id: 'att-u1',
        userId: 'u1',
        date: today,
        timeIn: `${today}T09:00:00Z`,
        timeOut: null,
        status: 'PRESENT',
      },
    },
  ],
  absent: [{ user: mockUsers[1] }],
  onBreak: [
    {
      user: mockUsers[2],
      attendance: {
        id: 'att-u3',
        userId: 'u3',
        date: today,
        timeIn: null,
        timeOut: null,
        status: 'BREAK',
      },
      breakRequest: {
        id: 'br-1',
        userId: 'u3',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        numberOfDays: 5,
        reason: 'Family vacation',
        status: 'APPROVED',
      },
    },
  ],
  yetToMark: [],
}

const mockBreakRequests: BreakRequest[] = [
  {
    id: 'br-2',
    userId: 'u2',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    numberOfDays: 3,
    reason: 'Personal time off',
    status: 'PENDING',
    user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
  },
]

const mockCorrections: AttendanceCorrection[] = [
  {
    id: 'corr-1',
    date: '2026-03-01',
    reason: 'Forgot to clock in',
    correctionStatus: 'PENDING',
    user: mockUsers[0],
  },
]

const mockTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Review pull request for auth module',
    status: 'TODO',
    assigneeIds: 'u1',
    priority: 'HIGH',
  },
  {
    id: 'task-2',
    title: 'Update API documentation',
    status: 'COMPLETED',
    assigneeIds: 'u1',
    priority: 'MEDIUM',
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
  title: 'Karm/Admin/Dashboard/AdminDashboard',
  component: AdminDashboard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onAssociateChange: fn(),
  },
} satisfies Meta<typeof AdminDashboard>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Full compound dashboard with Calendar, AttendanceOverview, and LeaveRequests */
export const Default: Story = {
  args: {
    currentUserId: 'admin-1',
    currentUserRole: 'Admin',
    userImages: mockUserImages,
  },
  render: (args) => (
    <AdminDashboard {...args}>
      <AdminDashboard.Calendar
        users={mockUsers}
        onDateChange={fn()}
        onTimeFrameChange={fn()}
      />
      <AdminDashboard.Content>
        <AdminDashboard.AttendanceOverview
          groupedAttendance={mockGroupedAttendance}
          users={mockUsers}
        />
        <AdminDashboard.LeaveRequests
          requests={mockBreakRequests}
          corrections={mockCorrections}
          onApproveBreak={fn()}
          onRejectBreak={fn()}
          onApproveCorrection={fn()}
          onRejectCorrection={fn()}
        />
      </AdminDashboard.Content>
    </AdminDashboard>
  ),
}

/** Dashboard in a loading state showing the skeleton */
export const Loading: Story = {
  args: {
    currentUserId: 'admin-1',
    currentUserRole: 'Admin',
    isLoading: true,
    children: null as unknown as React.ReactNode,
  },
}

/** Dashboard with no pending requests or corrections */
export const NoRequests: Story = {
  args: {
    currentUserId: 'admin-1',
    currentUserRole: 'Admin',
    userImages: mockUserImages,
  },
  render: (args) => (
    <AdminDashboard {...args}>
      <AdminDashboard.Calendar
        users={mockUsers}
        onDateChange={fn()}
        onTimeFrameChange={fn()}
      />
      <AdminDashboard.Content>
        <AdminDashboard.AttendanceOverview
          groupedAttendance={mockGroupedAttendance}
          users={mockUsers}
        />
      </AdminDashboard.Content>
    </AdminDashboard>
  ),
}

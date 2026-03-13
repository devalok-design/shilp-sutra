import type { Meta, StoryObj } from '@storybook/react'
import { AssociateDetail, type TaskItem } from './associate-detail'
import type { AdminUser, AttendanceRecord, BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockAssociate: AdminUser = {
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
}

const today = new Date().toISOString().split('T')[0]

const presentAttendance: AttendanceRecord = {
  id: 'att-1',
  userId: 'u1',
  date: today,
  timeIn: `${today}T09:15:00Z`,
  timeOut: null,
  status: 'PRESENT',
}

const absentAttendance: AttendanceRecord = {
  id: 'att-2',
  userId: 'u1',
  date: today,
  timeIn: null,
  timeOut: null,
  status: 'ABSENT',
}

const breakAttendance: AttendanceRecord = {
  id: 'att-3',
  userId: 'u1',
  date: today,
  timeIn: null,
  timeOut: null,
  status: 'BREAK',
}

const notMarkedAttendance: AttendanceRecord = {
  id: 'att-4',
  userId: 'u1',
  date: '2026-02-28',
  timeIn: null,
  timeOut: null,
  status: 'Not_Marked',
}

const mockBreakRequest: BreakRequest = {
  id: 'br-1',
  userId: 'u1',
  startDate: '2026-03-01',
  endDate: '2026-03-03',
  numberOfDays: 3,
  reason: 'Family vacation',
  status: 'APPROVED',
}

const mockTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Review pull request for authentication module',
    status: 'TODO',
    assigneeIds: 'u1',
    priority: 'HIGH',
  },
  {
    id: 'task-2',
    title: 'Update API documentation for v2 endpoints',
    status: 'COMPLETED',
    assigneeIds: 'u1',
    priority: 'MEDIUM',
  },
  {
    id: 'task-3',
    title: 'Fix responsive layout issues on dashboard',
    status: 'TODO',
    assigneeIds: 'u1',
    priority: 'HIGH',
  },
  {
    id: 'task-4',
    title: 'Write unit tests for date utility functions',
    status: 'TODO',
    assigneeIds: 'u1',
    priority: 'LOW',
  },
]

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/AssociateDetail',
  component: AssociateDetail,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { AssociateDetail } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  argTypes: {
    onUpdateAttendanceStatus: { action: 'updateAttendanceStatus' },
    onToggleTaskStatus: { action: 'toggleTaskStatus' },
    onAddTask: { action: 'addTask' },
    onReorderTasks: { action: 'reorderTasks' },
    onCancelBreak: { action: 'cancelBreak' },
    onRefreshSelectedUserAttendance: { action: 'refreshSelectedUserAttendance' },
    onRefreshAttendanceData: { action: 'refreshAttendanceData' },
  },
  decorators: [
    (Story) => (
      <div className="w-[720px] rounded-ds-lg border border-surface-border-strong bg-surface-1">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssociateDetail>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Present associate with tasks for today */
export const Default: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: today,
    selectedUserAttendance: presentAttendance,
    userTasks: mockTasks,
    selectedBreakRequest: null,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Associate marked as absent — shows comment input and mark-as-present option */
export const Absent: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: today,
    selectedUserAttendance: absentAttendance,
    userTasks: [],
    selectedBreakRequest: null,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Associate on break — shows break request card */
export const OnBreak: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: today,
    selectedUserAttendance: breakAttendance,
    userTasks: [],
    selectedBreakRequest: mockBreakRequest,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Future date selected — shows break request if on break, otherwise empty */
export const FutureDate: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: '2026-03-15',
    selectedUserAttendance: null,
    userTasks: [],
    selectedBreakRequest: null,
    isFutureDate: true,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Future date with scheduled break */
export const FutureDateOnBreak: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: '2026-03-15',
    selectedUserAttendance: breakAttendance,
    userTasks: [],
    selectedBreakRequest: mockBreakRequest,
    isFutureDate: true,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Past date not marked — shows absent state with comment */
export const PastNotMarked: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: '2026-02-28',
    selectedUserAttendance: notMarkedAttendance,
    userTasks: [],
    selectedBreakRequest: null,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Present with no tasks assigned */
export const NoTasks: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: today,
    selectedUserAttendance: presentAttendance,
    userTasks: [],
    selectedBreakRequest: null,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

/** Present with all tasks completed */
export const AllTasksCompleted: Story = {
  args: {
    selectedAssociate: mockAssociate,
    selectedDate: today,
    selectedUserAttendance: presentAttendance,
    userTasks: mockTasks.map((task) => ({ ...task, status: 'COMPLETED' })),
    selectedBreakRequest: null,
    isFutureDate: false,
    assetsBaseUrl: 'https://assets.example.com',
  },
}

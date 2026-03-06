import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { BreakAdmin } from './break-admin'
import type { AdminUser, BreakRequest, BreakBalanceData } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockCurrentUser: Pick<AdminUser, 'id' | 'name' | 'role'> = {
  id: 'admin-1',
  name: 'Vikram Singh',
  role: 'Admin',
}

const mockUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Arjun Mehta',
    firstName: 'Arjun',
    lastName: 'Mehta',
    email: 'arjun@example.com',
    designation: 'Developer',
    image: null,
    role: 'Associate',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
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
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Kavita Reddy',
    firstName: 'Kavita',
    lastName: 'Reddy',
    email: 'kavita@example.com',
    designation: 'QA Engineer',
    image: null,
    role: 'Apprentice',
    isActive: true,
    createdAt: '2025-06-10T00:00:00Z',
  },
]

const mockBreaks: BreakRequest[] = [
  {
    id: 'brk-1',
    userId: 'u1',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    numberOfDays: 3,
    reason: 'Family wedding in Jaipur',
    status: 'APPROVED',
    adminComment: 'Enjoy the celebrations!',
    user: { id: 'u1', name: 'Arjun Mehta', firstName: 'Arjun', image: null },
  },
  {
    id: 'brk-2',
    userId: 'u2',
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    numberOfDays: 1,
    reason: 'Doctor appointment',
    status: 'PENDING',
    user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
  },
  {
    id: 'brk-3',
    userId: 'u3',
    startDate: '2026-03-25',
    endDate: '2026-03-28',
    numberOfDays: 4,
    reason: 'Personal travel',
    status: 'REJECTED',
    adminComment: 'Overlaps with sprint deadline',
    user: { id: 'u3', name: 'Kavita Reddy', firstName: 'Kavita', image: null },
  },
]

const mockPendingRequests: BreakRequest[] = [
  {
    id: 'req-1',
    userId: 'u2',
    startDate: '2026-03-20',
    endDate: '2026-03-20',
    numberOfDays: 1,
    reason: 'Doctor appointment',
    status: 'PENDING',
    user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
  },
]

const mockBreakBalanceData: BreakBalanceData[] = [
  {
    id: 'bal-1',
    userId: 'u1',
    totalDays: 24,
    usedDays: 8,
    carryForward: 3,
    cashout: 2,
    user: { id: 'u1', name: 'Arjun Mehta', firstName: 'Arjun', image: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'bal-2',
    userId: 'u2',
    totalDays: 18,
    usedDays: 4,
    carryForward: 0,
    cashout: 0,
    user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
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
  title: 'Karm/Admin/Break/BreakAdmin',
  component: BreakAdmin,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BreakAdmin } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  args: {
    onApproveRequest: fn(),
    onRejectRequest: fn(),
    onRefresh: fn(),
    onSaveBreak: fn(),
    onDeleteBreak: fn(),
    onSaveBalance: fn(),
    onFilterChange: fn(),
  },
} satisfies Meta<typeof BreakAdmin>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default break admin panel showing the breaks tab */
export const Default: Story = {
  args: {
    currentUser: mockCurrentUser,
    breaks: mockBreaks,
    pendingRequests: mockPendingRequests,
    breakBalanceData: mockBreakBalanceData,
    userImages: mockUserImages,
    users: mockUsers,
  },
}

/** Loading state showing the skeleton placeholder */
export const Loading: Story = {
  args: {
    currentUser: mockCurrentUser,
    breaks: [],
    pendingRequests: [],
    breakBalanceData: [],
    userImages: {},
    users: [],
    isLoading: true,
  },
}

/** Empty state with no break data */
export const Empty: Story = {
  args: {
    currentUser: mockCurrentUser,
    breaks: [],
    pendingRequests: [],
    breakBalanceData: [],
    userImages: {},
    users: mockUsers,
  },
}

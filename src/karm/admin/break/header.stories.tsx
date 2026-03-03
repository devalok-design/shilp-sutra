import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { BreakAdminHeader } from './header'
import type { AdminUser } from '../types'

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

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/BreakAdminHeader',
  component: BreakAdminHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onFilterChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[960px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BreakAdminHeader>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default header with associate and date filter dropdowns */
export const Default: Story = {
  args: {
    filters: {
      selectedAssociate: null,
      dateFilterStart: null,
      dateFilterEnd: null,
      currMonth: new Date().getMonth(),
      currYear: new Date().getFullYear(),
      isOpen: false,
    },
    userImages: mockUserImages,
    users: mockUsers,
  },
}

/** Header with a selected associate showing break balance */
export const WithSelectedAssociate: Story = {
  args: {
    filters: {
      selectedAssociate: mockUsers[0],
      dateFilterStart: null,
      dateFilterEnd: null,
      currMonth: new Date().getMonth(),
      currYear: new Date().getFullYear(),
      isOpen: false,
    },
    breakBalance: { remainingDays: 16, breakBalance: 24 },
    userImages: mockUserImages,
    users: mockUsers,
  },
}

/** Header with an active date filter applied */
export const WithDateFilter: Story = {
  args: {
    filters: {
      selectedAssociate: null,
      dateFilterStart: new Date(2026, 2, 1),
      dateFilterEnd: new Date(2026, 2, 31),
      currMonth: 2,
      currYear: 2026,
      isOpen: false,
    },
    userImages: mockUserImages,
    users: mockUsers,
  },
}

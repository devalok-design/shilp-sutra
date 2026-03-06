import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DashboardHeader } from './dashboard-header'
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

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

const yearsList = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
]

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Dashboard/DashboardHeader',
  component: DashboardHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { DashboardHeader } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
} satisfies Meta<typeof DashboardHeader>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default header showing current month, weekly toggle, and navigation arrows */
export const Default: Story = {
  args: {
    selectedMonth: 'March 2026',
    yearsList,
    isTodaySelected: true,
    selectedAssociate: null,
    users: mockUsers,
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
    onMonthSelection: fn(),
    onTodayClick: fn(),
    onSelectAssociate: fn(),
    onTimeFrameChange: fn(),
    onDateChange: fn(),
  },
}

/** Header when today is not selected — shows "Today" button */
export const TodayNotSelected: Story = {
  args: {
    selectedMonth: 'February 2026',
    yearsList,
    isTodaySelected: false,
    selectedAssociate: null,
    users: mockUsers,
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
    onMonthSelection: fn(),
    onTodayClick: fn(),
    onSelectAssociate: fn(),
    onTimeFrameChange: fn(),
    onDateChange: fn(),
  },
}

/** Header with an associate selected — shows associate chip instead of dropdown */
export const WithSelectedAssociate: Story = {
  args: {
    selectedMonth: 'March 2026',
    yearsList,
    isTodaySelected: true,
    selectedAssociate: mockUsers[0],
    users: mockUsers,
    userImages: mockUserImages,
    activeTimeFrame: 'weekly',
    onMonthSelection: fn(),
    onTodayClick: fn(),
    onSelectAssociate: fn(),
    onTimeFrameChange: fn(),
    onDateChange: fn(),
  },
}

/** Header in monthly time frame view */
export const MonthlyView: Story = {
  args: {
    selectedMonth: 'March 2026',
    yearsList,
    isTodaySelected: true,
    selectedAssociate: null,
    users: mockUsers,
    userImages: mockUserImages,
    activeTimeFrame: 'monthly',
    onMonthSelection: fn(),
    onTodayClick: fn(),
    onSelectAssociate: fn(),
    onTimeFrameChange: fn(),
    onDateChange: fn(),
  },
}

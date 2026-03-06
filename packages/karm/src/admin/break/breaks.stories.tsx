import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Breaks } from './breaks'
import type { BreakRequest } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
  u4: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
}

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
  {
    id: 'brk-4',
    userId: 'u4',
    startDate: '2026-04-01',
    endDate: '2026-04-01',
    numberOfDays: 1,
    reason: 'Moving to a new apartment',
    status: 'CANCELLED',
    user: { id: 'u4', name: 'Rohan Gupta', firstName: 'Rohan', image: null },
  },
]

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/Breaks',
  component: Breaks,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { Breaks } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  args: {
    onSave: fn(),
    onDelete: fn(),
    onRefresh: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[960px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Breaks>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Break list table with mixed statuses */
export const Default: Story = {
  args: {
    breaks: mockBreaks,
    userImages: mockUserImages,
  },
}

/** Single approved break entry */
export const SingleBreak: Story = {
  args: {
    breaks: [mockBreaks[0]],
    userImages: mockUserImages,
  },
}

/** Empty breaks table with no records */
export const Empty: Story = {
  args: {
    breaks: [],
    userImages: {},
  },
}

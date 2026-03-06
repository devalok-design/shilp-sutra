import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { BreakBalance } from './break-balance'
import type { BreakBalanceData } from '../types'

// ============================================================
// Mock Data
// ============================================================

const mockUserImages: Record<string, string> = {
  u1: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
  u2: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
  u3: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita',
}

const mockBreakBalanceData: BreakBalanceData[] = [
  {
    id: 'bal-1',
    userId: 'u1',
    totalDays: 24,
    usedDays: 8,
    carryForward: 3,
    cashout: 2,
    yearlyBalance: 24,
    user: { id: 'u1', name: 'Arjun Mehta', firstName: 'Arjun', image: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'bal-2',
    userId: 'u2',
    totalDays: 18,
    usedDays: 12,
    carryForward: 0,
    cashout: 0,
    yearlyBalance: 18,
    user: { id: 'u2', name: 'Priya Sharma', firstName: 'Priya', image: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'bal-3',
    userId: 'u3',
    totalDays: 30,
    usedDays: 5,
    carryForward: 10,
    cashout: 5,
    yearlyBalance: 24,
    other: 1,
    user: { id: 'u3', name: 'Kavita Reddy', firstName: 'Kavita', image: null },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z',
  },
]

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/BreakBalance',
  component: BreakBalance,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BreakBalance } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  args: {
    onSaveBalance: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[800px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BreakBalance>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Balance table showing multiple users with their break totals */
export const Default: Story = {
  args: {
    breakBalanceData: mockBreakBalanceData,
    userImages: mockUserImages,
  },
}

/** Single user in the balance table */
export const SingleUser: Story = {
  args: {
    breakBalanceData: [mockBreakBalanceData[0]],
    userImages: mockUserImages,
  },
}

/** Empty balance table with no data */
export const Empty: Story = {
  args: {
    breakBalanceData: [],
    userImages: {},
  },
}

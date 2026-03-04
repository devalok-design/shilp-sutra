import type { Meta, StoryObj } from '@storybook/react'
import { EditBreakBalance } from './edit-break-balance'
import type { BreakBalanceData } from '../types'

// ============================================================
// Mock Data
// ============================================================

const defaultBalance: BreakBalanceData = {
  id: 'bal-1',
  userId: 'u1',
  totalDays: 24,
  usedDays: 8,
  carryForward: 3,
  cashout: 2,
  yearlyBalance: 24,
  other: 0,
  user: {
    id: 'u1',
    name: 'Arjun Mehta',
    firstName: 'Arjun',
    image: null,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-15T00:00:00Z',
}

const zeroCashoutBalance: BreakBalanceData = {
  id: 'bal-2',
  userId: 'u2',
  totalDays: 18,
  usedDays: 12,
  carryForward: 0,
  cashout: 0,
  yearlyBalance: 18,
  other: 0,
  user: {
    id: 'u2',
    name: 'Priya Sharma',
    firstName: 'Priya',
    image: null,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
}

const highCarryForwardBalance: BreakBalanceData = {
  id: 'bal-3',
  userId: 'u3',
  totalDays: 30,
  usedDays: 5,
  carryForward: 10,
  cashout: 5,
  yearlyBalance: 24,
  other: 1,
  user: {
    id: 'u3',
    name: 'Kavita Reddy',
    firstName: 'Kavita',
    image: null,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-28T00:00:00Z',
}

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/EditBreakBalance',
  component: EditBreakBalance,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSave: { action: 'save' },
  },
} satisfies Meta<typeof EditBreakBalance>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default edit dialog trigger with existing cashout and carry forward values */
export const Default: Story = {
  args: {
    selectedLeave: defaultBalance,
  },
}

/** Balance with zero cashout and zero carry forward */
export const ZeroCashout: Story = {
  args: {
    selectedLeave: zeroCashoutBalance,
  },
}

/** Balance with high carry forward days */
export const HighCarryForward: Story = {
  args: {
    selectedLeave: highCarryForwardBalance,
  },
}

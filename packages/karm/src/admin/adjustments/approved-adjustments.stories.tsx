import type { Meta, StoryObj } from '@storybook/react'
import { ApprovedAdjustments } from './approved-adjustments'
import type { Adjustment } from '../types'

const mockAdjustments: Adjustment[] = [
  {
    id: 'adj-1',
    userId: 'user-1',
    numberOfDays: 2,
    type: 'CARRY_FORWARD',
    reason: 'Unused leave from Q4',
    status: 'APPROVED',
    comment: null,
    approvedBy: 'admin-1',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T12:00:00.000Z',
    user: { name: 'Priya Sharma', email: 'priya@example.com' },
    approver: { name: 'Aarav Patel', email: 'aarav@example.com' },
  },
  {
    id: 'adj-2',
    userId: 'user-2',
    numberOfDays: 1,
    type: 'CASHOUT',
    reason: 'End-of-year cashout',
    status: 'APPROVED',
    comment: 'Processed in March payroll',
    approvedBy: 'admin-1',
    createdAt: '2026-03-01T09:30:00.000Z',
    updatedAt: '2026-03-01T11:00:00.000Z',
    user: { name: 'Vikram Singh', email: 'vikram@example.com' },
    approver: { name: 'Aarav Patel', email: 'aarav@example.com' },
  },
  {
    id: 'adj-3',
    userId: 'user-3',
    numberOfDays: 5,
    type: 'YEARLY_BALANCE',
    reason: 'Annual leave allocation',
    status: 'APPROVED',
    comment: null,
    approvedBy: 'user-3',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    user: { name: 'Ananya Gupta', email: 'ananya@example.com' },
    approver: { name: 'Ananya Gupta', email: 'ananya@example.com' },
  },
]

const meta = {
  title: 'Karm/Admin/Adjustments/ApprovedAdjustments',
  component: ApprovedAdjustments,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ApprovedAdjustments } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 960 }}><Story /></div>],
} satisfies Meta<typeof ApprovedAdjustments>

export default meta
type Story = StoryObj<typeof ApprovedAdjustments>

export const Default: Story = {
  args: {
    adjustments: mockAdjustments,
    adminId: 'admin-1',
  },
}

export const SelfApproved: Story = {
  args: {
    adjustments: mockAdjustments,
    adminId: 'user-3',
  },
}

export const Empty: Story = {
  args: {
    adjustments: [],
    adminId: 'admin-1',
  },
}

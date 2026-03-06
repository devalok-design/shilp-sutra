import type { Meta, StoryObj } from '@storybook/react'
import { DashboardSkeleton } from './dashboard-skeleton'

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Dashboard/DashboardSkeleton',
  component: DashboardSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { DashboardSkeleton } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
} satisfies Meta<typeof DashboardSkeleton>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default loading skeleton matching the AdminDashboard layout */
export const Default: Story = {}

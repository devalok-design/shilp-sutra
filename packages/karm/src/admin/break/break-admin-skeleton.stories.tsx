import type { Meta, StoryObj } from '@storybook/react'
import { BreakAdminSkeleton } from './break-admin-skeleton'

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/BreakAdminSkeleton',
  component: BreakAdminSkeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BreakAdminSkeleton } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
} satisfies Meta<typeof BreakAdminSkeleton>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default skeleton loading state for the break admin panel */
export const Default: Story = {}

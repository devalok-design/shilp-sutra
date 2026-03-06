import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { DeleteBreak } from './delete-break'

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Break/DeleteBreak',
  component: DeleteBreak,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { DeleteBreak } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  args: {
    onDelete: fn(),
  },
} satisfies Meta<typeof DeleteBreak>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Delete button that opens a confirmation dialog */
export const Default: Story = {
  args: {
    id: 'brk-1',
    userId: 'u1',
  },
}

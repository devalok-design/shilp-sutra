import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from './calendar'

// ============================================================
// Meta
// ============================================================

const meta = {
  title: 'Karm/Admin/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { Calendar } from "@devalok/shilp-sutra-karm/admin"`',
      },
    },
  },
  argTypes: {
    onDateSelect: { action: 'dateSelected' },
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

// ============================================================
// Stories
// ============================================================

/** Default calendar with weekly/monthly toggle and date navigation */
export const Default: Story = {
  args: {
    onDateSelect: () => {},
  },
}

/** Calendar with correction indicators on specific dates */
export const WithCorrections: Story = {
  args: {
    onDateSelect: () => {},
    hasCorrection: (date: Date) => {
      // Show correction dots on a few dates for demonstration
      const day = date.getDate()
      return day === 5 || day === 12 || day === 20
    },
  },
}

/** Calendar with no correction indicators */
export const NoCorrections: Story = {
  args: {
    onDateSelect: () => {},
    hasCorrection: () => false,
  },
}

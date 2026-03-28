import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TaskComposer } from './task-composer'

const meta: Meta<typeof TaskComposer> = {
  title: 'Karm/Composed/TaskComposer',
  component: TaskComposer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Message composer with auto-resize textarea, optional visibility toggle, and file attach.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof TaskComposer>

export const Default: Story = {
  args: {
    onSubmit: fn(),
    placeholder: 'Add a comment...',
  },
}

export const WithVisibility: Story = {
  args: {
    onSubmit: fn(),
    showVisibility: true,
  },
}

export const Disabled: Story = {
  args: {
    onSubmit: fn(),
    disabled: true,
  },
}

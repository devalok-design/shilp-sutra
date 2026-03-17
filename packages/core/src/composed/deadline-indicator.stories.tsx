import type { Meta, StoryObj } from '@storybook/react'
import { DeadlineIndicator } from './deadline-indicator'

const meta: Meta<typeof DeadlineIndicator> = {
  title: 'Composed/DeadlineIndicator',
  component: DeadlineIndicator,
  tags: ['autodocs'],
  argTypes: {
    format: { control: 'select', options: ['relative', 'absolute'] },
    showIcon: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof DeadlineIndicator>

export const FarAway: Story = {
  args: {
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
}

export const Warning: Story = {
  args: {
    deadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
  },
}

export const Critical: Story = {
  args: {
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
}

export const Overdue: Story = {
  args: {
    deadline: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
}

export const WithIcon: Story = {
  args: {
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
    showIcon: true,
  },
}

export const AbsoluteFormat: Story = {
  args: {
    deadline: new Date(Date.now() + 72 * 60 * 60 * 1000),
    format: 'absolute',
    showIcon: true,
  },
}

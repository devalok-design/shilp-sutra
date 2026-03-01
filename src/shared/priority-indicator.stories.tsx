import type { Meta, StoryObj } from '@storybook/react'
import { PriorityIndicator } from './priority-indicator'

const meta: Meta<typeof PriorityIndicator> = {
  title: 'Shared/PriorityIndicator',
  component: PriorityIndicator,
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    },
    display: {
      control: 'select',
      options: ['full', 'compact'],
    },
  },
}
export default meta
type Story = StoryObj<typeof PriorityIndicator>

export const Default: Story = {
  args: {
    priority: 'MEDIUM',
  },
}

export const Low: Story = {
  args: {
    priority: 'LOW',
  },
}

export const Medium: Story = {
  args: {
    priority: 'MEDIUM',
  },
}

export const High: Story = {
  args: {
    priority: 'HIGH',
  },
}

export const Urgent: Story = {
  args: {
    priority: 'URGENT',
  },
}

export const CompactLow: Story = {
  args: {
    priority: 'LOW',
    display: 'compact',
  },
}

export const CompactMedium: Story = {
  args: {
    priority: 'MEDIUM',
    display: 'compact',
  },
}

export const CompactHigh: Story = {
  args: {
    priority: 'HIGH',
    display: 'compact',
  },
}

export const CompactUrgent: Story = {
  args: {
    priority: 'URGENT',
    display: 'compact',
  },
}

export const AllPriorities: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PriorityIndicator priority="LOW" />
      <PriorityIndicator priority="MEDIUM" />
      <PriorityIndicator priority="HIGH" />
      <PriorityIndicator priority="URGENT" />
    </div>
  ),
}

export const AllPrioritiesCompact: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <PriorityIndicator priority="LOW" display="compact" />
      <PriorityIndicator priority="MEDIUM" display="compact" />
      <PriorityIndicator priority="HIGH" display="compact" />
      <PriorityIndicator priority="URGENT" display="compact" />
    </div>
  ),
}

export const SideBySideComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
        <div key={priority} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 120 }}>
            <PriorityIndicator priority={priority} display="full" />
          </div>
          <PriorityIndicator priority={priority} display="compact" />
        </div>
      ))}
    </div>
  ),
}

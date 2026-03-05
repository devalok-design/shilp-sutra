import type { Meta, StoryObj } from '@storybook/react'
import { StatCard } from './stat-card'

const meta: Meta<typeof StatCard> = {
  title: 'UI/Data Display/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    loading: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: 'Total Projects',
    value: 24,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaUp: Story = {
  args: {
    label: 'Active Tasks',
    value: 142,
    delta: { value: '+12% from last month', direction: 'up' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaDown: Story = {
  args: {
    label: 'Open Issues',
    value: 8,
    delta: { value: '-3 from last week', direction: 'down' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithDeltaNeutral: Story = {
  args: {
    label: 'Team Members',
    value: 12,
    delta: { value: 'No change', direction: 'neutral' },
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const WithIcon: Story = {
  args: {
    label: 'Revenue',
    value: '$45,231',
    delta: { value: '+20.1% from last month', direction: 'up' },
    icon: <span className="text-ds-lg">$</span>,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const Loading: Story = {
  args: {
    label: 'Loading...',
    value: 0,
    loading: true,
  },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
}

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ds-04">
      <StatCard
        label="Total Lokwasi"
        value={24}
        delta={{ value: '+2 this month', direction: 'up' }}
      />
      <StatCard
        label="Active Projects"
        value={8}
        delta={{ value: '+1 from last month', direction: 'up' }}
      />
      <StatCard
        label="Pending Breaks"
        value={3}
        delta={{ value: '-2 from yesterday', direction: 'down' }}
      />
      <StatCard
        label="Attendance Rate"
        value="96%"
        delta={{ value: 'No change', direction: 'neutral' }}
      />
    </div>
  ),
}

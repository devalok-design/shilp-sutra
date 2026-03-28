import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusDot } from './status-dot'

const meta: Meta<typeof StatusDot> = {
  title: 'UI/Core/StatusDot',
  component: StatusDot,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'critical', 'neutral', 'inactive'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    pulse: { control: 'boolean' },
    label: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof StatusDot>

export const Default: Story = {
  args: {
    status: 'healthy',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <StatusDot status="healthy" label="Healthy" />
      <StatusDot status="warning" label="Warning" />
      <StatusDot status="critical" label="Critical" />
      <StatusDot status="neutral" label="Neutral" />
      <StatusDot status="inactive" label="Inactive" />
    </div>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <StatusDot status="healthy" label="All systems operational" />
      <StatusDot status="warning" label="Elevated latency detected" />
      <StatusDot status="critical" label="Service degraded" />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <StatusDot status="healthy" size="sm" label="Small" />
      <StatusDot status="healthy" size="md" label="Medium" />
      <StatusDot status="healthy" size="lg" label="Large" />
    </div>
  ),
}

export const PulsingCritical: Story = {
  args: {
    status: 'critical',
    pulse: true,
    label: 'Service down',
  },
}

export const NoPulse: Story = {
  args: {
    status: 'healthy',
    pulse: false,
    label: 'Online (no pulse)',
  },
}

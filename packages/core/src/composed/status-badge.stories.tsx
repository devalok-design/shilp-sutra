import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from './status-badge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Composed/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: [
        'active',
        'pending',
        'approved',
        'rejected',
        'completed',
        'blocked',
        'cancelled',
        'draft',
      ],
    },
    color: {
      control: 'select',
      options: ['success', 'warning', 'error', 'info', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
}
export default meta
type Story = StoryObj<typeof StatusBadge>

export const Default: Story = {
  args: {
    status: 'pending',
  },
}

export const Active: Story = {
  args: {
    status: 'active',
  },
}

export const Pending: Story = {
  args: {
    status: 'pending',
  },
}

export const Approved: Story = {
  args: {
    status: 'approved',
  },
}

export const Rejected: Story = {
  args: {
    status: 'rejected',
  },
}

export const Completed: Story = {
  args: {
    status: 'completed',
  },
}

export const Blocked: Story = {
  args: {
    status: 'blocked',
  },
}

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
  },
}

export const Draft: Story = {
  args: {
    status: 'draft',
  },
}

export const SmallSize: Story = {
  args: {
    status: 'active',
    size: 'sm',
  },
}

export const CustomLabel: Story = {
  args: {
    status: 'active',
    label: 'Online',
  },
}

export const HiddenDot: Story = {
  args: {
    status: 'completed',
    hideDot: true,
  },
}

export const SmallHiddenDot: Story = {
  args: {
    status: 'rejected',
    size: 'sm',
    hideDot: true,
    label: 'Denied',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <StatusBadge status="active" />
      <StatusBadge status="pending" />
      <StatusBadge status="approved" />
      <StatusBadge status="rejected" />
      <StatusBadge status="completed" />
      <StatusBadge status="blocked" />
      <StatusBadge status="cancelled" />
      <StatusBadge status="draft" />
    </div>
  ),
}

export const AllStatusesSmall: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <StatusBadge status="active" size="sm" />
      <StatusBadge status="pending" size="sm" />
      <StatusBadge status="approved" size="sm" />
      <StatusBadge status="rejected" size="sm" />
      <StatusBadge status="completed" size="sm" />
      <StatusBadge status="blocked" size="sm" />
      <StatusBadge status="cancelled" size="sm" />
      <StatusBadge status="draft" size="sm" />
    </div>
  ),
}

// --- Color prop stories ---

export const ColorSuccess: Story = {
  args: {
    color: 'success',
  },
}

export const ColorWarning: Story = {
  args: {
    color: 'warning',
  },
}

export const ColorError: Story = {
  args: {
    color: 'error',
  },
}

export const ColorInfo: Story = {
  args: {
    color: 'info',
  },
}

export const ColorNeutral: Story = {
  args: {
    color: 'neutral',
  },
}

export const ColorWithCustomLabel: Story = {
  args: {
    color: 'success',
    label: 'Connected',
  },
}

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <StatusBadge color="success" />
      <StatusBadge color="warning" />
      <StatusBadge color="error" />
      <StatusBadge color="info" />
      <StatusBadge color="neutral" />
    </div>
  ),
}

export const AllColorsSmall: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <StatusBadge color="success" size="sm" />
      <StatusBadge color="warning" size="sm" />
      <StatusBadge color="error" size="sm" />
      <StatusBadge color="info" size="sm" />
      <StatusBadge color="neutral" size="sm" />
    </div>
  ),
}

export const ColorWithCustomLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <StatusBadge color="success" label="Connected" />
      <StatusBadge color="warning" label="Degraded" />
      <StatusBadge color="error" label="Offline" />
      <StatusBadge color="info" label="Syncing" />
      <StatusBadge color="neutral" label="Unknown" />
    </div>
  ),
}

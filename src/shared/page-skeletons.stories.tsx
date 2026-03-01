import type { Meta, StoryObj } from '@storybook/react'
import {
  DashboardSkeleton,
  ProjectListSkeleton,
  DevsabhaSkeleton,
  BandwidthSkeleton,
  TaskDetailSkeleton,
} from './page-skeletons'

const meta: Meta = {
  title: 'Shared/PageSkeletons',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj

export const Dashboard: Story = {
  render: () => <DashboardSkeleton />,
}

export const ProjectList: Story = {
  render: () => <ProjectListSkeleton />,
}

export const Devsabha: Story = {
  render: () => <DevsabhaSkeleton />,
}

export const Bandwidth: Story = {
  render: () => <BandwidthSkeleton />,
}

export const TaskDetail: Story = {
  render: () => (
    <div style={{ maxWidth: 480, height: 600 }}>
      <TaskDetailSkeleton />
    </div>
  ),
}

export const AllPageSkeletons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          DashboardSkeleton
        </p>
        <DashboardSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          ProjectListSkeleton
        </p>
        <ProjectListSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          DevsabhaSkeleton
        </p>
        <DevsabhaSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          BandwidthSkeleton
        </p>
        <BandwidthSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          TaskDetailSkeleton
        </p>
        <div style={{ maxWidth: 480, height: 600 }}>
          <TaskDetailSkeleton />
        </div>
      </div>
    </div>
  ),
}

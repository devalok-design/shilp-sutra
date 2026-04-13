import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DashboardSkeleton,
  ProjectListSkeleton,
  TaskDetailSkeleton,
} from './page-skeletons'

const meta: Meta = {
  title: 'Patterns/PageSkeletons',
  tags: ['autodocs', 'stable'],
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
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
          DashboardSkeleton
        </p>
        <DashboardSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
          ProjectListSkeleton
        </p>
        <ProjectListSkeleton />
      </div>

      <div>
        <p style={{ marginBottom: 16, fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>
          TaskDetailSkeleton
        </p>
        <div style={{ maxWidth: 480, height: 600 }}>
          <TaskDetailSkeleton />
        </div>
      </div>
    </div>
  ),
}

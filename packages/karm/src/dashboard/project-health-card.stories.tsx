import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProjectHealthCard, type ProjectHealthData } from './project-health-card'

const meta: Meta<typeof ProjectHealthCard> = {
  title: 'Karm/Dashboard/ProjectHealthCard',
  component: ProjectHealthCard,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ProjectHealthCard } from "@devalok/shilp-sutra-karm/dashboard"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ProjectHealthCard>

// ── Mock data ──────────────────────────────────────────────

const defaultProject: ProjectHealthData = {
  id: 'p1',
  name: 'Client Portal Redesign',
  completed: 18,
  total: 24,
  urgent: 2,
  overdue: 3,
  contextLine: 'Sprint ends Mar 19',
  trend: [0.3, 0.35, 0.4, 0.5, 0.55, 0.65, 0.75],
}

const onTrackProject: ProjectHealthData = {
  id: 'p2',
  name: 'Design System v2',
  completed: 14,
  total: 18,
  contextLine: 'Sprint ends Mar 22',
  trend: [0.4, 0.45, 0.5, 0.55, 0.6, 0.7, 0.78],
}

const urgentProject: ProjectHealthData = {
  id: 'p3',
  name: 'Payment Gateway Integration',
  completed: 5,
  total: 20,
  urgent: 4,
  overdue: 6,
  contextLine: 'Sprint ends Mar 16',
  trend: [0.5, 0.45, 0.4, 0.35, 0.3, 0.28, 0.25],
}

const overdueProject: ProjectHealthData = {
  id: 'p4',
  name: 'Mobile App Launch',
  completed: 12,
  total: 20,
  overdue: 3,
  contextLine: 'Sprint ends Mar 20',
  trend: [0.4, 0.45, 0.5, 0.48, 0.52, 0.55, 0.6],
}

const trendUpProject: ProjectHealthData = {
  id: 'p5',
  name: 'API Documentation',
  completed: 8,
  total: 10,
  contextLine: 'Sprint ends Mar 18',
  trend: [0.2, 0.3, 0.4, 0.55, 0.65, 0.75, 0.8],
}

const trendDownProject: ProjectHealthData = {
  id: 'p6',
  name: 'CI/CD Pipeline Overhaul',
  completed: 3,
  total: 16,
  overdue: 2,
  contextLine: 'Sprint ends Mar 21',
  trend: [0.7, 0.65, 0.55, 0.5, 0.4, 0.35, 0.2],
}

const noTrendProject: ProjectHealthData = {
  id: 'p7',
  name: 'Internal Dashboard',
  completed: 6,
  total: 12,
  contextLine: 'Sprint ends Mar 25',
}

// ── Stories ──────────────────────────────────────────────

export const Default: Story = {
  args: {
    project: defaultProject,
    onClick: () => console.log('clicked'),
  },
}

export const OnTrack: Story = {
  args: {
    project: onTrackProject,
    onClick: () => console.log('clicked'),
  },
}

export const Urgent: Story = {
  args: {
    project: urgentProject,
    onClick: () => console.log('clicked'),
  },
}

export const OverdueOnly: Story = {
  args: {
    project: overdueProject,
    onClick: () => console.log('clicked'),
  },
}

export const WithTrend: Story = {
  args: {
    project: trendUpProject,
    onClick: () => console.log('clicked'),
  },
}

export const WithoutTrend: Story = {
  args: {
    project: noTrendProject,
    onClick: () => console.log('clicked'),
  },
}

export const Loading: Story = {
  args: {
    project: defaultProject,
    loading: true,
  },
}

export const TrendingDown: Story = {
  args: {
    project: trendDownProject,
    onClick: () => console.log('clicked'),
  },
}

export const Grid: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 960 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-ds-04">
      <ProjectHealthCard
        project={defaultProject}
        onClick={() => console.log('clicked p1')}
      />
      <ProjectHealthCard
        project={onTrackProject}
        onClick={() => console.log('clicked p2')}
      />
      <ProjectHealthCard
        project={urgentProject}
        onClick={() => console.log('clicked p3')}
      />
      <ProjectHealthCard
        project={overdueProject}
        onClick={() => console.log('clicked p4')}
      />
    </div>
  ),
}

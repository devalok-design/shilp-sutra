import type { Meta, StoryObj } from '@storybook/react'
import { ProjectCard } from './project-card'

const meta: Meta<typeof ProjectCard> = {
  title: 'Karm/Client/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ProjectCard>

// ── Stories ─────────────────────────────────────────────────

export const Active: Story = {
  args: {
    name: 'Client Portal Redesign',
    description: 'Complete overhaul of the client-facing portal with new dashboard, improved task visibility, and accent color theming.',
    status: 'active',
    taskCount: 24,
    completedTasks: 14,
  },
}

export const Completed: Story = {
  args: {
    name: 'Brand Identity Refresh',
    description: 'Updated logo, typography system, and color palette across all digital touchpoints.',
    status: 'completed',
    taskCount: 18,
    completedTasks: 18,
  },
}

export const Paused: Story = {
  args: {
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for the client portal. Paused pending budget approval for Q3.',
    status: 'paused',
    taskCount: 32,
    completedTasks: 8,
  },
}

export const JustStarted: Story = {
  name: 'Just Started (0% Progress)',
  args: {
    name: 'SEO Optimization Phase 2',
    description: 'Technical SEO audit, content optimization, and backlink strategy for improved organic reach.',
    status: 'active',
    taskCount: 15,
    completedTasks: 0,
  },
}

export const AlmostDone: Story = {
  name: 'Almost Done (95%)',
  args: {
    name: 'API Documentation',
    description: 'Comprehensive API reference documentation with examples, authentication guides, and SDKs.',
    status: 'active',
    taskCount: 20,
    completedTasks: 19,
  },
}

export const NoDescription: Story = {
  name: 'No Description',
  args: {
    name: 'Internal Tool Migration',
    status: 'active',
    taskCount: 10,
    completedTasks: 3,
  },
}

export const NoTasks: Story = {
  name: 'No Tasks Yet',
  args: {
    name: 'New Project Setup',
    description: 'Project created but no tasks have been added yet.',
    status: 'active',
    taskCount: 0,
    completedTasks: 0,
  },
}

export const LongProjectName: Story = {
  name: 'Long Project Name',
  args: {
    name: 'Enterprise Resource Planning System Integration and Data Migration',
    description: 'Full ERP system integration with existing tools, including data migration from legacy systems.',
    status: 'active',
    taskCount: 50,
    completedTasks: 12,
  },
}

export const CardGrid: Story = {
  name: 'Card Grid (Multiple)',
  decorators: [
    () => (
      <div style={{ maxWidth: 860 }} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProjectCard
          name="Client Portal Redesign"
          description="Complete overhaul of the client-facing portal."
          status="active"
          taskCount={24}
          completedTasks={14}
        />
        <ProjectCard
          name="Brand Identity Refresh"
          description="Updated logo, typography, and color palette."
          status="completed"
          taskCount={18}
          completedTasks={18}
        />
        <ProjectCard
          name="Mobile App Development"
          description="Native iOS and Android app. Pending budget."
          status="paused"
          taskCount={32}
          completedTasks={8}
        />
        <ProjectCard
          name="API Documentation"
          description="Comprehensive API reference with examples."
          status="active"
          taskCount={20}
          completedTasks={19}
        />
      </div>
    ),
  ],
}

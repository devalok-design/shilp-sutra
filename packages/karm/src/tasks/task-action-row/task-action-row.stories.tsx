import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TaskActionRow } from './task-action-row'
import type { TaskActionRowTask } from './task-action-row-context'

const meta: Meta<typeof TaskActionRow> = {
  title: 'Karm/Tasks/TaskActionRow',
  component: TaskActionRow,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof TaskActionRow>

// ── Test data ──

const fullTask: TaskActionRowTask = {
  id: 'task-1',
  title: 'Implement dashboard layout with responsive grid',
  priority: 'HIGH',
  dueDate: '2026-03-20',
  projectName: 'Project Alpha',
  projectId: 'proj-1',
  stage: 'active',
  isOverdue: false,
  labels: ['frontend', 'urgent', 'design', 'sprint-12'],
}

const overdueTask: TaskActionRowTask = {
  id: 'task-2',
  title: 'Fix critical authentication bug in login flow',
  priority: 'URGENT',
  dueDate: '2026-03-10',
  projectName: 'Karm Platform',
  projectId: 'proj-2',
  stage: 'blocked',
  isOverdue: true,
  labels: ['backend', 'security'],
}

const simpleTask: TaskActionRowTask = {
  id: 'task-3',
  title: 'Update README documentation',
  priority: 'LOW',
  dueDate: '2026-03-25',
}

const mediumTask: TaskActionRowTask = {
  id: 'task-4',
  title: 'Design new onboarding flow',
  priority: 'MEDIUM',
  dueDate: '2026-03-22',
  projectName: 'UX Refresh',
  projectId: 'proj-3',
  stage: 'pending',
  labels: ['design'],
}

const completedTask: TaskActionRowTask = {
  id: 'task-5',
  title: 'Set up CI/CD pipeline',
  priority: 'HIGH',
  dueDate: '2026-03-14',
  projectName: 'DevOps',
  projectId: 'proj-4',
  stage: 'completed',
}

// ── Stories ──

/** Full dashboard layout showing all sub-components. */
export const FullDashboard: Story = {
  render: () => (
    <div className="max-w-3xl">
      <TaskActionRow.Root task={fullTask} onClick={fn()}>
        <TaskActionRow.Checkbox onComplete={fn()} />
        <TaskActionRow.Priority />
        <TaskActionRow.Title truncate />
        <TaskActionRow.Labels max={2} />
        <TaskActionRow.ProjectBadge onClick={fn()} />
        <TaskActionRow.DueDate />
        <TaskActionRow.StatusBadge />
        <TaskActionRow.Navigate href="/projects/proj-1/board?task=task-1" />
      </TaskActionRow.Root>
    </div>
  ),
}

/** Minimal notification row — just Priority + Title + DueDate. */
export const MinimalNotification: Story = {
  render: () => (
    <div className="max-w-2xl">
      <TaskActionRow.Root task={simpleTask} onClick={fn()}>
        <TaskActionRow.Priority />
        <TaskActionRow.Title />
        <TaskActionRow.DueDate />
      </TaskActionRow.Root>
    </div>
  ),
}

/** Client portal read-only row — no checkbox, includes status badge. */
export const ClientPortalReadOnly: Story = {
  render: () => (
    <div className="max-w-2xl">
      <TaskActionRow.Root task={mediumTask} onClick={fn()}>
        <TaskActionRow.Priority />
        <TaskActionRow.Title truncate />
        <TaskActionRow.StatusBadge />
        <TaskActionRow.DueDate />
      </TaskActionRow.Root>
    </div>
  ),
}

/** Props shorthand API for quick usage. */
export const PropsShorthand: Story = {
  args: {
    task: fullTask,
    onClick: fn(),
    onComplete: fn(),
    showCheckbox: true,
    showPriority: true,
    showLabels: true,
    showProject: true,
    showDueDate: true,
    showNavigate: true,
    truncateTitle: true,
    maxLabels: 2,
  },
}

/** Overdue task — red due date, urgent priority. */
export const OverdueTask: Story = {
  render: () => (
    <div className="max-w-3xl">
      <TaskActionRow.Root task={overdueTask} onClick={fn()}>
        <TaskActionRow.Checkbox onComplete={fn()} />
        <TaskActionRow.Priority />
        <TaskActionRow.Title truncate />
        <TaskActionRow.Labels max={2} />
        <TaskActionRow.DueDate />
        <TaskActionRow.StatusBadge />
      </TaskActionRow.Root>
    </div>
  ),
}

/** Row with multiple labels and overflow badge. */
export const WithLabels: Story = {
  render: () => (
    <div className="max-w-3xl">
      <TaskActionRow.Root task={fullTask} onClick={fn()}>
        <TaskActionRow.Priority />
        <TaskActionRow.Title truncate />
        <TaskActionRow.Labels max={2} />
      </TaskActionRow.Root>
    </div>
  ),
}

/** Multiple rows showing separator pattern. */
export const List: Story = {
  render: () => {
    const tasks: TaskActionRowTask[] = [fullTask, overdueTask, mediumTask, completedTask, simpleTask]
    return (
      <div className="max-w-3xl rounded-ds-lg border border-surface-border overflow-hidden">
        {tasks.map((task, i) => (
          <TaskActionRow.Root
            key={task.id}
            task={task}
            onClick={fn()}
            showSeparator={i < tasks.length - 1}
          >
            <TaskActionRow.Checkbox onComplete={fn()} />
            <TaskActionRow.Priority />
            <TaskActionRow.Title truncate />
            <TaskActionRow.Labels max={1} />
            <TaskActionRow.ProjectBadge />
            <TaskActionRow.DueDate />
            <TaskActionRow.StatusBadge />
            <TaskActionRow.Navigate href={`/tasks/${task.id}`} />
          </TaskActionRow.Root>
        ))}
      </div>
    )
  },
}

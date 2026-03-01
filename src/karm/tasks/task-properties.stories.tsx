import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TaskProperties, type TaskData, type Member, type Column } from './task-properties'

// ============================================================
// Mock Data
// ============================================================

const members: Member[] = [
  { id: 'user-1', name: 'Arjun Mehta', email: 'arjun@devalok.com', image: null },
  { id: 'user-2', name: 'Priya Sharma', email: 'priya@devalok.com', image: null },
  { id: 'user-3', name: 'Kavita Reddy', email: 'kavita@devalok.com', image: null },
  { id: 'user-4', name: 'Rahul Verma', email: 'rahul@devalok.com', image: null },
  { id: 'user-5', name: 'Ananya Desai', email: 'ananya@devalok.com', image: null },
]

const columns: Column[] = [
  { id: 'col-backlog', name: 'Backlog', isDefault: true },
  { id: 'col-todo', name: 'To Do' },
  { id: 'col-progress', name: 'In Progress' },
  { id: 'col-review', name: 'Review' },
  { id: 'col-done', name: 'Done', isTerminal: true },
]

const fullyLoadedTask: TaskData = {
  id: 'task-1',
  columnId: 'col-progress',
  column: { id: 'col-progress', name: 'In Progress' },
  ownerId: 'user-1',
  owner: members[0],
  assignees: [
    { user: members[0] },
    { user: members[1] },
    { user: members[2] },
  ],
  priority: 'HIGH',
  dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
  labels: ['frontend', 'design-system', 'v2'],
  visibility: 'INTERNAL',
}

const minimalTask: TaskData = {
  id: 'task-2',
  columnId: 'col-backlog',
  column: { id: 'col-backlog', name: 'Backlog' },
  ownerId: null,
  owner: null,
  assignees: [],
  priority: 'LOW',
  dueDate: null,
  labels: [],
  visibility: 'INTERNAL',
}

const everyoneVisibleTask: TaskData = {
  ...fullyLoadedTask,
  id: 'task-3',
  visibility: 'EVERYONE',
}

const urgentOverdueTask: TaskData = {
  id: 'task-4',
  columnId: 'col-review',
  column: { id: 'col-review', name: 'Review' },
  ownerId: 'user-2',
  owner: members[1],
  assignees: [{ user: members[1] }],
  priority: 'URGENT',
  dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
  labels: ['bug', 'production', 'hotfix'],
  visibility: 'INTERNAL',
}

const singleAssigneeTask: TaskData = {
  id: 'task-5',
  columnId: 'col-todo',
  column: { id: 'col-todo', name: 'To Do' },
  ownerId: 'user-3',
  owner: members[2],
  assignees: [{ user: members[2] }],
  priority: 'MEDIUM',
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
  labels: ['documentation'],
  visibility: 'INTERNAL',
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof TaskProperties> = {
  title: 'Karm/Tasks/TaskProperties',
  component: TaskProperties,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    columns,
    members,
    onUpdate: fn(),
    onAssign: fn(),
    onUnassign: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] rounded-lg border border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TaskProperties>

// ============================================================
// Stories
// ============================================================

/** Fully loaded task with owner, multiple assignees, labels, due date, and internal visibility */
export const FullyLoaded: Story = {
  args: {
    task: fullyLoadedTask,
  },
}

/** Minimal task with no owner, no assignees, no labels, no due date */
export const Minimal: Story = {
  args: {
    task: minimalTask,
  },
}

/** Task visible to everyone (clients) -- visibility badge shows green "Everyone" */
export const EveryoneVisible: Story = {
  args: {
    task: everyoneVisibleTask,
  },
}

/** Urgent priority with overdue date and multiple labels */
export const UrgentOverdue: Story = {
  args: {
    task: urgentOverdueTask,
  },
}

/** Single assignee with medium priority */
export const SingleAssignee: Story = {
  args: {
    task: singleAssigneeTask,
  },
}

/** Read-only mode: owner and visibility rows hidden, no edit controls */
export const ReadOnly: Story = {
  args: {
    task: fullyLoadedTask,
    readOnly: true,
  },
}

/** Read-only but with specific editable fields (client portal pattern) */
export const ReadOnlyWithEditableFields: Story = {
  args: {
    task: fullyLoadedTask,
    readOnly: true,
    editableFields: ['priority', 'dueDate'],
  },
}

/** All four priority levels for visual comparison */
export const AllPriorities: Story = {
  render: (args) => (
    <div className="space-y-6">
      {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
        <div key={priority} className="rounded-lg border border-[var(--border-primary)] bg-[var(--Mapped-Surface-Primary)] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--Mapped-Text-Quaternary)]">
            {priority}
          </p>
          <TaskProperties
            {...args}
            task={{ ...minimalTask, priority }}
          />
        </div>
      ))}
    </div>
  ),
  args: {
    task: minimalTask,
  },
  decorators: [],
}

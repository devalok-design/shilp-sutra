import type { Meta, StoryObj } from '@storybook/react'
import { KanbanBoard, type BoardData } from './kanban-board'
import type { BoardTask } from './task-card'

// ============================================================
// Mock Data Factory
// ============================================================

function createTask(
  overrides: Partial<BoardTask> & { id: string; title: string },
): BoardTask {
  return {
    priority: 'MEDIUM',
    labels: [],
    dueDate: null,
    isBlocked: false,
    assignees: [],
    ...overrides,
  }
}

const teamMembers = {
  arjun: { id: 'u1', name: 'Arjun Mehta', image: null },
  priya: { id: 'u2', name: 'Priya Sharma', image: null },
  kavita: { id: 'u3', name: 'Kavita Reddy', image: null },
  rahul: { id: 'u4', name: 'Rahul Verma', image: null },
  deepa: { id: 'u5', name: 'Deepa Nair', image: null },
}

const fullBoardData: BoardData = {
  columns: [
    {
      id: 'col-backlog',
      name: 'Backlog',
      isClientVisible: false,
      tasks: [
        createTask({
          id: 'task-1',
          title: 'Research SSO providers for enterprise clients',
          priority: 'LOW',
          labels: ['research'],
          assignees: [teamMembers.deepa],
        }),
        createTask({
          id: 'task-2',
          title: 'Create design tokens documentation',
          priority: 'LOW',
          labels: ['docs', 'design-system'],
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        }),
      ],
    },
    {
      id: 'col-todo',
      name: 'To Do',
      isClientVisible: false,
      tasks: [
        createTask({
          id: 'task-3',
          title: 'Implement file upload drag-and-drop zone',
          priority: 'MEDIUM',
          labels: ['frontend', 'feature'],
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
          assignees: [teamMembers.priya],
        }),
        createTask({
          id: 'task-4',
          title: 'Set up Redis pub/sub for real-time notifications',
          priority: 'HIGH',
          labels: ['backend', 'infrastructure'],
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
          assignees: [teamMembers.arjun, teamMembers.rahul],
        }),
        createTask({
          id: 'task-5',
          title: 'Write integration tests for billing API',
          priority: 'MEDIUM',
          labels: ['testing'],
          assignees: [teamMembers.kavita],
        }),
      ],
    },
    {
      id: 'col-in-progress',
      name: 'In Progress',
      isClientVisible: true,
      tasks: [
        createTask({
          id: 'task-6',
          title: 'Build Kanban board drag-and-drop interactions',
          priority: 'HIGH',
          labels: ['frontend', 'core'],
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
          assignees: [teamMembers.arjun],
        }),
        createTask({
          id: 'task-7',
          title: 'Fix critical memory leak in WebSocket connection handler',
          priority: 'URGENT',
          labels: ['bug', 'production'],
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          isBlocked: true,
          assignees: [teamMembers.rahul],
        }),
      ],
    },
    {
      id: 'col-review',
      name: 'Code Review',
      isClientVisible: false,
      tasks: [
        createTask({
          id: 'task-8',
          title: 'Add pagination to project listing page',
          priority: 'MEDIUM',
          labels: ['frontend'],
          assignees: [teamMembers.priya, teamMembers.kavita],
        }),
      ],
    },
    {
      id: 'col-done',
      name: 'Done',
      isClientVisible: true,
      tasks: [
        createTask({
          id: 'task-9',
          title: 'Deploy authentication microservice to staging',
          priority: 'HIGH',
          labels: ['devops'],
          assignees: [teamMembers.deepa],
        }),
        createTask({
          id: 'task-10',
          title: 'Update user onboarding flow copy',
          priority: 'LOW',
          labels: ['content'],
          assignees: [teamMembers.priya],
        }),
      ],
    },
  ],
}

const emptyBoardData: BoardData = {
  columns: [
    { id: 'col-todo', name: 'To Do', isClientVisible: false, tasks: [] },
    {
      id: 'col-in-progress',
      name: 'In Progress',
      isClientVisible: true,
      tasks: [],
    },
    { id: 'col-done', name: 'Done', isClientVisible: true, tasks: [] },
  ],
}

const singleColumnData: BoardData = {
  columns: [
    {
      id: 'col-inbox',
      name: 'Inbox',
      isClientVisible: false,
      tasks: [
        createTask({
          id: 'task-11',
          title: 'Triage new customer bug reports',
          priority: 'HIGH',
          labels: ['triage'],
        }),
        createTask({
          id: 'task-12',
          title: 'Review pull request #342',
          priority: 'MEDIUM',
          labels: ['review'],
        }),
      ],
    },
  ],
}

const heavyBoardData: BoardData = {
  columns: [
    {
      id: 'col-backlog',
      name: 'Backlog',
      isClientVisible: false,
      tasks: Array.from({ length: 8 }, (_, i) =>
        createTask({
          id: `heavy-${i}`,
          title: `Backlog task ${i + 1}: ${['Refactor auth module', 'Add dark mode support', 'Create email templates', 'Update dependencies', 'Optimize images', 'Add analytics tracking', 'Write E2E tests', 'Review security audit'][i]}`,
          priority: (['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const)[i % 4],
          labels: [
            ['backend'],
            ['frontend', 'design'],
            ['email'],
            ['maintenance'],
            ['performance'],
            ['analytics'],
            ['testing'],
            ['security'],
          ][i],
          assignees:
            i % 2 === 0
              ? [teamMembers.arjun]
              : [teamMembers.priya, teamMembers.kavita],
        }),
      ),
    },
    {
      id: 'col-in-progress',
      name: 'In Progress',
      isClientVisible: true,
      tasks: Array.from({ length: 4 }, (_, i) =>
        createTask({
          id: `heavy-ip-${i}`,
          title: `In progress task ${i + 1}: ${['Build notification system', 'Implement search indexing', 'Create admin dashboard', 'Fix mobile responsiveness'][i]}`,
          priority: (['HIGH', 'URGENT', 'MEDIUM', 'HIGH'] as const)[i],
          labels: [['notifications'], ['search'], ['admin'], ['mobile']][i],
          dueDate: new Date(Date.now() + (i - 1) * 86400000).toISOString(),
          assignees: [teamMembers.rahul],
        }),
      ),
    },
    {
      id: 'col-done',
      name: 'Done',
      isClientVisible: true,
      tasks: Array.from({ length: 6 }, (_, i) =>
        createTask({
          id: `heavy-done-${i}`,
          title: `Completed task ${i + 1}`,
          priority: 'LOW',
          assignees: [teamMembers.deepa],
        }),
      ),
    },
  ],
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof KanbanBoard> = {
  title: 'Karm/Board/KanbanBoard',
  component: KanbanBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-gray-50 p-6">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onTaskMove: { action: 'taskMove' },
    onTaskAdd: { action: 'taskAdd' },
    onColumnRename: { action: 'columnRename' },
    onColumnDelete: { action: 'columnDelete' },
    onColumnToggleVisibility: { action: 'columnToggleVisibility' },
    onClickTask: { action: 'clickTask' },
    onAddColumn: { action: 'addColumn' },
  },
}

export default meta
type Story = StoryObj<typeof KanbanBoard>

// ============================================================
// Stories
// ============================================================

/** Full project board with 5 columns, realistic tasks, and various states */
export const FullBoard: Story = {
  args: {
    initialData: fullBoardData,
  },
}

/** Board with empty columns -- useful for new projects */
export const EmptyColumns: Story = {
  args: {
    initialData: emptyBoardData,
  },
}

/** Board with a single column */
export const SingleColumn: Story = {
  args: {
    initialData: singleColumnData,
  },
}

/** Board with many tasks per column to test scrolling and performance */
export const HeavyBoard: Story = {
  args: {
    initialData: heavyBoardData,
  },
}

/** Board with no columns at all -- just the "Add column" button */
export const NoColumns: Story = {
  args: {
    initialData: { columns: [] },
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { KanbanBoard } from './kanban-board'
import type { BoardData, BoardTask } from './board-types'

// ============================================================
// Mock Data Factory
// ============================================================

function createTask(
  overrides: Partial<BoardTask> & { id: string; title: string },
): BoardTask {
  return {
    taskId: overrides.id.toUpperCase().replace('TASK-', 'KRM-'),
    priority: 'MEDIUM',
    labels: [],
    dueDate: null,
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: null,
    assignees: [],
    subtaskCount: 0,
    subtasksDone: 0,
    ...overrides,
  }
}

const teamMembers = {
  arjun: { id: 'u1', name: 'Arjun Mehta', image: 'https://i.pravatar.cc/150?u=arjun' },
  priya: { id: 'u2', name: 'Priya Sharma', image: 'https://i.pravatar.cc/150?u=priya' },
  kavita: { id: 'u3', name: 'Kavita Reddy', image: 'https://i.pravatar.cc/150?u=kavita' },
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
          subtaskCount: 3,
          subtasksDone: 1,
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
          subtaskCount: 8,
          subtasksDone: 5,
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
          owner: teamMembers.arjun,
          assignees: [teamMembers.arjun],
          subtaskCount: 5,
          subtasksDone: 3,
        }),
        createTask({
          id: 'task-7',
          title: 'Fix critical memory leak in WebSocket connection handler',
          priority: 'URGENT',
          labels: ['bug', 'production'],
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          isBlocked: true,
          owner: teamMembers.rahul,
          assignees: [teamMembers.rahul],
          subtaskCount: 3,
          subtasksDone: 1,
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
          visibility: 'EVERYONE',
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

const wipBoardData: BoardData = {
  columns: [
    {
      id: 'col-todo',
      name: 'To Do',
      wipLimit: 5,
      tasks: [
        createTask({ id: 'wip-1', title: 'Design landing page mockups', labels: ['design'] }),
        createTask({ id: 'wip-2', title: 'Set up monitoring alerts', priority: 'HIGH', labels: ['devops'] }),
      ],
    },
    {
      id: 'col-in-progress',
      name: 'In Progress',
      wipLimit: 2,
      isClientVisible: true,
      tasks: [
        createTask({ id: 'wip-3', title: 'Implement WebSocket auth', priority: 'HIGH', assignees: [teamMembers.arjun] }),
        createTask({ id: 'wip-4', title: 'Build notification center', priority: 'URGENT', assignees: [teamMembers.priya] }),
        createTask({ id: 'wip-5', title: 'Fix CSS grid layout on Safari', priority: 'HIGH', labels: ['bug'], assignees: [teamMembers.kavita] }),
      ],
    },
    {
      id: 'col-done',
      name: 'Done',
      isClientVisible: true,
      tasks: [
        createTask({ id: 'wip-6', title: 'Add rate limiter middleware', assignees: [teamMembers.deepa] }),
      ],
    },
  ],
}

const emptyBoardData: BoardData = {
  columns: [
    { id: 'col-todo', name: 'To Do', isClientVisible: false, tasks: [] },
    { id: 'col-in-progress', name: 'In Progress', isClientVisible: true, tasks: [] },
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
        createTask({ id: 'task-11', title: 'Triage new customer bug reports', priority: 'HIGH', labels: ['triage'] }),
        createTask({
          id: 'task-12', title: 'Review pull request #342', priority: 'MEDIUM', labels: ['review'],
          owner: teamMembers.arjun, assignees: [teamMembers.priya],
        }),
        createTask({ id: 'task-13', title: 'Update deployment runbook', priority: 'LOW', labels: ['docs'] }),
      ],
    },
  ],
}

const heavyBoardData: BoardData = {
  columns: Array.from({ length: 8 }, (_, colIdx) => {
    const colNames = ['Backlog', 'Triage', 'To Do', 'In Progress', 'Review', 'QA', 'Staging', 'Done']
    return {
      id: `heavy-col-${colIdx}`,
      name: colNames[colIdx],
      isClientVisible: colIdx >= 5,
      tasks: Array.from({ length: colIdx === 0 ? 10 : colIdx < 4 ? 6 : 3 }, (_, taskIdx) => {
        const globalIdx = colIdx * 10 + taskIdx
        return createTask({
          id: `heavy-${globalIdx}`,
          title: `${colNames[colIdx]} task ${taskIdx + 1}`,
          priority: (['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const)[globalIdx % 4],
          labels: [['backend', 'frontend', 'devops', 'testing', 'design', 'docs'][globalIdx % 6]],
          assignees: globalIdx % 3 === 0 ? [teamMembers.arjun] : globalIdx % 3 === 1 ? [teamMembers.priya, teamMembers.kavita] : [],
          subtaskCount: globalIdx % 5,
          subtasksDone: Math.floor((globalIdx % 5) * 0.6),
        })
      }),
    }
  }),
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
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { KanbanBoard } from "@devalok/shilp-sutra-karm/board"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-surface-1 p-ds-06">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onTaskMove: { action: 'taskMove' },
    onTaskAdd: { action: 'taskAdd' },
    onBulkAction: { action: 'bulkAction' },
    onColumnReorder: { action: 'columnReorder' },
    onColumnRename: { action: 'columnRename' },
    onColumnDelete: { action: 'columnDelete' },
    onColumnToggleVisibility: { action: 'columnToggleVisibility' },
    onColumnWipLimitChange: { action: 'columnWipLimitChange' },
    onClickTask: { action: 'clickTask' },
    onAddColumn: { action: 'addColumn' },
    onQuickPriorityChange: { action: 'quickPriorityChange' },
    onQuickAssign: { action: 'quickAssign' },
    onQuickDueDateChange: { action: 'quickDueDateChange' },
    onQuickLabelAdd: { action: 'quickLabelAdd' },
    onQuickVisibilityChange: { action: 'quickVisibilityChange' },
    onQuickDelete: { action: 'quickDelete' },
  },
}

export default meta
type Story = StoryObj<typeof KanbanBoard>

// ============================================================
// Stories
// ============================================================

/** Full project board with 5 columns, realistic tasks with avatars, labels, subtasks, and due dates */
export const FullBoard: Story = {
  args: {
    initialData: fullBoardData,
    currentUserId: 'u1',
  },
}

/** Board with WIP limits — "In Progress" column exceeds its limit of 2 */
export const WithWipLimits: Story = {
  args: {
    initialData: wipBoardData,
  },
}

/** Board with empty columns — useful for new projects */
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

/** 8 columns, 50+ tasks — performance and horizontal scroll test */
export const HeavyBoard: Story = {
  args: {
    initialData: heavyBoardData,
  },
}

/** Board with no columns at all — just the "Add column" button */
export const NoColumns: Story = {
  args: {
    initialData: { columns: [] },
  },
}

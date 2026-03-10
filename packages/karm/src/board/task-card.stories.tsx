import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard, TaskCardOverlay } from './task-card'
import { BoardProvider } from './board-context'
import type { BoardTask } from './board-types'

// ============================================================
// Mock Data
// ============================================================

const baseTask: BoardTask = {
  id: 'task-1',
  taskId: 'KRM-1',
  title: 'Implement user authentication flow',
  priority: 'HIGH',
  labels: ['backend', 'security'],
  dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: { id: 'u1', name: 'Arjun Mehta', image: null },
  assignees: [
    { id: 'u2', name: 'Priya Sharma', image: null },
    { id: 'u3', name: 'Kavita Reddy', image: null },
  ],
  subtaskCount: 5,
  subtasksDone: 3,
}

const urgentBlockedTask: BoardTask = {
  id: 'task-2',
  taskId: 'KRM-2',
  title: 'Fix critical production database connection pooling issue',
  priority: 'URGENT',
  labels: ['bug', 'production', 'database'],
  dueDate: new Date(Date.now() - 86400000).toISOString(),
  isBlocked: true,
  visibility: 'EVERYONE',
  owner: { id: 'u1', name: 'Arjun Mehta', image: null },
  assignees: [{ id: 'u2', name: 'Priya Sharma', image: null }],
  subtaskCount: 3,
  subtasksDone: 1,
}

const minimalTask: BoardTask = {
  id: 'task-3',
  taskId: 'KRM-3',
  title: 'Update README',
  priority: 'LOW',
  labels: [],
  dueDate: null,
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: null,
  assignees: [],
  subtaskCount: 0,
  subtasksDone: 0,
}

// ============================================================
// Wrapper to provide Board + DnD context
// ============================================================

function BoardWrapper({
  children,
  tasks,
}: {
  children: React.ReactNode
  tasks: BoardTask[]
}) {
  return (
    <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks }] }}>
      <DndContext>
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-[300px] space-y-ds-02">{children}</div>
        </SortableContext>
      </DndContext>
    </BoardProvider>
  )
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof TaskCard> = {
  title: 'Karm/Board/TaskCard',
  component: TaskCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { TaskCard } from "@devalok/shilp-sutra-karm/board"`',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TaskCard>

// ============================================================
// Stories
// ============================================================

/** Default task card with all fields populated: HIGH priority, 2 labels, due in 2 days, owner, 2 assignees, 3/5 subtasks */
export const Default: Story = {
  args: { task: baseTask },
  decorators: [
    (Story) => (
      <BoardWrapper tasks={[baseTask]}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** URGENT priority, overdue, blocked, EVERYONE visibility */
export const UrgentBlocked: Story = {
  args: { task: urgentBlockedTask },
  decorators: [
    (Story) => (
      <BoardWrapper tasks={[urgentBlockedTask]}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** Only required fields — no labels, no assignees, no owner, no subtasks, no due date */
export const Minimal: Story = {
  args: { task: minimalTask },
  decorators: [
    (Story) => (
      <BoardWrapper tasks={[minimalTask]}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** Various subtask completion levels displayed side by side */
export const WithSubtaskProgress: Story = {
  render: () => {
    const tasks: BoardTask[] = [
      { ...baseTask, id: 'sub-0', taskId: 'KRM-10', title: 'No progress yet', subtasksDone: 0, subtaskCount: 5 },
      { ...baseTask, id: 'sub-3', taskId: 'KRM-11', title: 'In progress', subtasksDone: 3, subtaskCount: 5 },
      { ...baseTask, id: 'sub-5', taskId: 'KRM-12', title: 'All done', subtasksDone: 5, subtaskCount: 5 },
    ]
    return (
      <BoardWrapper tasks={tasks}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </BoardWrapper>
    )
  },
}

/** All four priority levels displayed side-by-side for comparison */
export const AllPriorities: Story = {
  render: () => {
    const priorities: BoardTask['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    const tasks: BoardTask[] = priorities.map((p, i) => ({
      ...minimalTask,
      id: `prio-${p}`,
      taskId: `KRM-${20 + i}`,
      title: `${p.charAt(0) + p.slice(1).toLowerCase()} priority task`,
      priority: p,
    }))
    return (
      <BoardWrapper tasks={tasks}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </BoardWrapper>
    )
  },
}

/** TaskCardOverlay variant shown during drag */
export const DragOverlay: StoryObj<typeof TaskCardOverlay> = {
  render: () => (
    <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [baseTask] }] }}>
      <div className="w-[300px]">
        <TaskCardOverlay task={baseTask} />
      </div>
    </BoardProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The drag overlay variant shown while a card is being dragged. Has a slight rotation and elevated shadow.',
      },
    },
  },
}

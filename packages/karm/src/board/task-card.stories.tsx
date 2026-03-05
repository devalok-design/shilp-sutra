import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard, TaskCardOverlay, type BoardTask } from './task-card'

// ============================================================
// Mock Data
// ============================================================

const baseTask: BoardTask = {
  id: 'task-1',
  title: 'Implement user authentication flow',
  priority: 'HIGH',
  labels: ['backend', 'security'],
  dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  isBlocked: false,
  assignees: [
    { id: 'u1', name: 'Arjun Mehta', image: null },
    { id: 'u2', name: 'Priya Sharma', image: null },
  ],
}

const urgentOverdueTask: BoardTask = {
  id: 'task-2',
  title: 'Fix critical production database connection pooling issue',
  priority: 'URGENT',
  labels: ['bug', 'production', 'database'],
  dueDate: new Date(Date.now() - 86400000).toISOString(),
  isBlocked: true,
  assignees: [{ id: 'u1', name: 'Arjun Mehta', image: null }],
}

const minimalTask: BoardTask = {
  id: 'task-3',
  title: 'Update README',
  priority: 'LOW',
  labels: [],
  dueDate: null,
  isBlocked: false,
  assignees: [],
}

const mediumTask: BoardTask = {
  id: 'task-4',
  title: 'Design new dashboard wireframes for client review',
  priority: 'MEDIUM',
  labels: ['design'],
  dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  isBlocked: false,
  assignees: [{ id: 'u3', name: 'Kavita Reddy', image: null }],
}

const dueTodayTask: BoardTask = {
  id: 'task-5',
  title: 'Submit quarterly report',
  priority: 'HIGH',
  labels: ['report', 'Q1'],
  dueDate: new Date().toISOString(),
  isBlocked: false,
  assignees: [
    { id: 'u1', name: 'Arjun Mehta', image: null },
    { id: 'u2', name: 'Priya Sharma', image: null },
    { id: 'u3', name: 'Kavita Reddy', image: null },
  ],
}

const manyLabelsTask: BoardTask = {
  id: 'task-6',
  title: 'Refactor API layer',
  priority: 'MEDIUM',
  labels: ['refactor', 'api', 'breaking-change', 'v2'],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
  isBlocked: false,
  assignees: [{ id: 'u1', name: 'Arjun Mehta', image: null }],
}

// ============================================================
// Wrapper to provide DnD context for sortable TaskCard
// ============================================================

function SortableWrapper({
  children,
  taskIds,
}: {
  children: React.ReactNode
  taskIds: string[]
}) {
  return (
    <DndContext>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="w-[280px] space-y-ds-02">{children}</div>
      </SortableContext>
    </DndContext>
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
  },
  decorators: [
    (Story, context) => (
      <SortableWrapper taskIds={[context.args.task.id]}>
        <Story />
      </SortableWrapper>
    ),
  ],
  argTypes: {
    onClickTask: { action: 'clickTask' },
  },
}

export default meta
type Story = StoryObj<typeof TaskCard>

// ============================================================
// Stories
// ============================================================

/** Default task card with assignees, labels, and a due date */
export const Default: Story = {
  args: {
    task: baseTask,
  },
}

/** Urgent priority with overdue date and blocked indicator (red left border) */
export const UrgentBlocked: Story = {
  args: {
    task: urgentOverdueTask,
  },
}

/** Minimal task with no labels, assignees, or due date */
export const Minimal: Story = {
  args: {
    task: minimalTask,
  },
}

/** Medium priority with a single assignee */
export const MediumPriority: Story = {
  args: {
    task: mediumTask,
  },
}

/** Task due today (shown as "Today" in orange) */
export const DueToday: Story = {
  args: {
    task: dueTodayTask,
  },
}

/** Task with more than 2 labels (truncated with +N indicator) */
export const ManyLabels: Story = {
  args: {
    task: manyLabelsTask,
  },
}

/** More than 2 assignees (shows +N overflow count) */
export const ManyAssignees: Story = {
  args: {
    task: dueTodayTask,
  },
}

// ============================================================
// TaskCardOverlay stories (drag overlay variant)
// ============================================================

export const DragOverlay: StoryObj<typeof TaskCardOverlay> = {
  render: () => (
    <div className="w-[280px]">
      <TaskCardOverlay task={baseTask} />
    </div>
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

/** All priority levels displayed side-by-side for comparison */
export const AllPriorities: Story = {
  render: () => {
    const priorities: BoardTask['priority'][] = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'URGENT',
    ]
    return (
      <DndContext>
        <SortableContext
          items={priorities.map((p) => `prio-${p}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-[280px] space-y-ds-02">
            {priorities.map((priority) => (
              <TaskCard
                key={priority}
                task={{
                  ...minimalTask,
                  id: `prio-${priority}`,
                  title: `${priority.charAt(0) + priority.slice(1).toLowerCase()} priority task`,
                  priority,
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comparison of all four priority levels: Low (blue), Medium (yellow), High (orange), Urgent (red).',
      },
    },
  },
}

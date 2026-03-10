import React, { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  TaskCard,
  TaskCardOverlay,
  TaskCardCompact,
  TaskCardCompactOverlay,
} from './task-card'
import { BoardProvider, useBoardContext } from './board-context'
import type { BoardTask } from './board-types'

// ============================================================
// Mock Data
// ============================================================

const AVATAR_IMAGES = {
  arjun: 'https://i.pravatar.cc/150?u=arjun',
  priya: 'https://i.pravatar.cc/150?u=priya',
  kavita: 'https://i.pravatar.cc/150?u=kavita',
}

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

const taskWithImages: BoardTask = {
  ...baseTask,
  id: 'task-img',
  taskId: 'KRM-50',
  title: 'Design system avatar integration',
  owner: { id: 'u1', name: 'Arjun Mehta', image: AVATAR_IMAGES.arjun },
  assignees: [
    { id: 'u2', name: 'Priya Sharma', image: AVATAR_IMAGES.priya },
    { id: 'u3', name: 'Kavita Reddy', image: AVATAR_IMAGES.kavita },
  ],
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

/** Long title that gets truncated with line-clamp-2 */
export const LongTitle: Story = {
  render: () => {
    const longTask: BoardTask = {
      ...baseTask,
      id: 'long-1',
      taskId: 'KRM-99',
      title:
        'Refactor the entire authentication middleware to support multi-tenant OAuth2 with PKCE flow, refresh token rotation, and cross-origin session management for all microservices',
    }
    return (
      <BoardWrapper tasks={[longTask]}>
        <TaskCard task={longTask} />
      </BoardWrapper>
    )
  },
}

/** Long title in compact mode — single line truncation */
export const LongTitleCompact: StoryObj<typeof TaskCardCompact> = {
  render: () => {
    const longTask: BoardTask = {
      ...baseTask,
      id: 'long-compact-1',
      taskId: 'KRM-100',
      title:
        'Refactor the entire authentication middleware to support multi-tenant OAuth2 with PKCE flow, refresh token rotation, and cross-origin session management for all microservices',
    }
    return (
      <BoardWrapper tasks={[longTask]}>
        <TaskCardCompact task={longTask} />
      </BoardWrapper>
    )
  },
}

// ============================================================
// Compact Stories
// ============================================================

/** Compact single-row view of a task card — dense list item layout */
export const Compact: StoryObj<typeof TaskCardCompact> = {
  args: { task: baseTask },
  render: (args) => (
    <BoardWrapper tasks={[baseTask]}>
      <TaskCardCompact {...args} />
    </BoardWrapper>
  ),
}

/** Compact card with only required fields — no owner, no subtasks */
export const CompactMinimal: StoryObj<typeof TaskCardCompact> = {
  args: { task: minimalTask },
  render: (args) => (
    <BoardWrapper tasks={[minimalTask]}>
      <TaskCardCompact {...args} />
    </BoardWrapper>
  ),
}

/** All four priority levels in compact mode for comparison */
export const CompactAllPriorities: StoryObj<typeof TaskCardCompact> = {
  render: () => {
    const priorities: BoardTask['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    const tasks: BoardTask[] = priorities.map((p, i) => ({
      ...baseTask,
      id: `compact-prio-${p}`,
      taskId: `KRM-${30 + i}`,
      title: `${p.charAt(0) + p.slice(1).toLowerCase()} priority task`,
      priority: p,
    }))
    return (
      <BoardWrapper tasks={tasks}>
        {tasks.map((t) => (
          <TaskCardCompact key={t.id} task={t} />
        ))}
      </BoardWrapper>
    )
  },
}

/** Compact overlay variant shown during drag */
export const CompactDragOverlay: StoryObj<typeof TaskCardCompactOverlay> = {
  render: () => (
    <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [baseTask] }] }}>
      <div className="w-[400px]">
        <TaskCardCompactOverlay task={baseTask} />
      </div>
    </BoardProvider>
  ),
}

/** Cards with avatar images — owner + assignees have profile photos */
export const WithAvatarImages: Story = {
  args: { task: taskWithImages },
  decorators: [
    (Story) => (
      <BoardWrapper tasks={[taskWithImages]}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** Compact card with avatar images */
export const CompactWithAvatarImages: StoryObj<typeof TaskCardCompact> = {
  render: () => (
    <BoardWrapper tasks={[taskWithImages]}>
      <TaskCardCompact task={taskWithImages} />
    </BoardWrapper>
  ),
}

/** Mix of image and fallback avatars */
export const MixedAvatars: Story = {
  render: () => {
    const mixed: BoardTask = {
      ...baseTask,
      id: 'task-mixed',
      taskId: 'KRM-51',
      title: 'Mixed avatar types — some with images, some with initials',
      owner: { id: 'u1', name: 'Arjun Mehta', image: AVATAR_IMAGES.arjun },
      assignees: [
        { id: 'u2', name: 'Priya Sharma', image: null },
        { id: 'u3', name: 'Kavita Reddy', image: AVATAR_IMAGES.kavita },
      ],
    }
    return (
      <BoardWrapper tasks={[mixed]}>
        <TaskCard task={mixed} />
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

// ============================================================
// Selection & State Stories
// ============================================================

/** Helper to pre-select tasks in the board context */
function SelectTasksEffect({ taskIds }: { taskIds: string[] }) {
  const { toggleTaskSelection } = useBoardContext()
  const didSelect = React.useRef(false)
  useEffect(() => {
    if (!didSelect.current) {
      didSelect.current = true
      taskIds.forEach((id) => toggleTaskSelection(id))
    }
  }, [taskIds, toggleTaskSelection])
  return null
}

/** Selected state — ring + subtle glow to indicate the card is part of a selection */
export const Selected: Story = {
  render: () => {
    const tasks = [baseTask, minimalTask]
    return (
      <BoardProvider initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks }] }}>
        <DndContext>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <SelectTasksEffect taskIds={['task-1']} />
            <div className="w-[300px] space-y-ds-02">
              <TaskCard task={baseTask} />
              <TaskCard task={minimalTask} />
            </div>
          </SortableContext>
        </DndContext>
      </BoardProvider>
    )
  },
}

/** Card with EVERYONE visibility — shows the globe badge */
export const ClientVisible: Story = {
  render: () => {
    const visibleTask: BoardTask = {
      ...baseTask,
      id: 'task-visible',
      taskId: 'KRM-42',
      title: 'Client-visible task with EVERYONE visibility',
      visibility: 'EVERYONE',
    }
    return (
      <BoardWrapper tasks={[visibleTask]}>
        <TaskCard task={visibleTask} />
      </BoardWrapper>
    )
  },
}

/** Blocked card — red border accent + lock icon */
export const Blocked: Story = {
  render: () => {
    const blockedTask: BoardTask = {
      ...baseTask,
      id: 'task-blocked',
      taskId: 'KRM-77',
      title: 'Blocked by dependency — waiting on API team',
      isBlocked: true,
      priority: 'URGENT',
    }
    return (
      <BoardWrapper tasks={[blockedTask]}>
        <TaskCard task={blockedTask} />
      </BoardWrapper>
    )
  },
}

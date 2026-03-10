import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { BoardColumn } from './board-column'
import { BoardProvider } from './board-context'
import type { BoardTask, BoardColumn as BoardColumnType } from './board-types'

// ============================================================
// Mock Data
// ============================================================

const mockTasks: BoardTask[] = [
  {
    id: 'task-1',
    taskId: 'KRM-1',
    title: 'Set up CI/CD pipeline for staging environment',
    priority: 'HIGH',
    labels: ['devops', 'infrastructure'],
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: { id: 'u1', name: 'Arjun Mehta', image: null },
    assignees: [{ id: 'u4', name: 'Rohan Gupta', image: null }],
    subtaskCount: 4,
    subtasksDone: 2,
  },
  {
    id: 'task-2',
    taskId: 'KRM-2',
    title: 'Implement OAuth2 refresh token rotation',
    priority: 'URGENT',
    labels: ['security'],
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    isBlocked: true,
    visibility: 'EVERYONE',
    owner: { id: 'u2', name: 'Priya Sharma', image: null },
    assignees: [{ id: 'u3', name: 'Kavita Reddy', image: null }],
    subtaskCount: 3,
    subtasksDone: 1,
  },
  {
    id: 'task-3',
    taskId: 'KRM-3',
    title: 'Add unit tests for payment service',
    priority: 'MEDIUM',
    labels: ['testing'],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: null,
    assignees: [],
    subtaskCount: 0,
    subtasksDone: 0,
  },
  {
    id: 'task-4',
    taskId: 'KRM-4',
    title: 'Update API documentation for v2 endpoints',
    priority: 'LOW',
    labels: ['docs'],
    dueDate: null,
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: { id: 'u1', name: 'Arjun Mehta', image: null },
    assignees: [],
    subtaskCount: 2,
    subtasksDone: 2,
  },
]

const columnWithTasks: BoardColumnType = {
  id: 'col-in-progress',
  name: 'In Progress',
  isClientVisible: false,
  tasks: mockTasks,
}

const emptyColumn: BoardColumnType = {
  id: 'col-backlog',
  name: 'Backlog',
  isClientVisible: false,
  tasks: [],
}

const wipExceededColumn: BoardColumnType = {
  id: 'col-wip',
  name: 'In Review',
  isClientVisible: false,
  wipLimit: 2,
  tasks: mockTasks.slice(0, 3), // 3 tasks, limit 2
}

// ============================================================
// Wrapper
// ============================================================

function BoardWrapper({
  children,
  column,
}: {
  children: React.ReactNode
  column: BoardColumnType
}) {
  return (
    <BoardProvider initialData={{ columns: [column] }}>
      <DndContext>
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="h-[600px]">{children}</div>
        </SortableContext>
      </DndContext>
    </BoardProvider>
  )
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof BoardColumn> = {
  title: 'Karm/Board/BoardColumn',
  component: BoardColumn,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BoardColumn } from "@devalok/shilp-sutra-karm/board"`',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BoardColumn>

// ============================================================
// Stories
// ============================================================

/** Column with multiple tasks showing various priorities, labels, and assignees */
export const WithTasks: Story = {
  args: { column: columnWithTasks, index: 1 },
  decorators: [
    (Story) => (
      <BoardWrapper column={columnWithTasks}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** Empty column showing line-art illustration + CTA */
export const Empty: Story = {
  args: { column: emptyColumn, index: 0 },
  decorators: [
    (Story) => (
      <BoardWrapper column={emptyColumn}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** WIP limit exceeded — red dot, error surface tint, count shows "3/2" in red */
export const WipExceeded: Story = {
  args: { column: wipExceededColumn, index: 2 },
  decorators: [
    (Story) => (
      <BoardWrapper column={wipExceededColumn}>
        <Story />
      </BoardWrapper>
    ),
  ],
}

/** All 8 column accent colors displayed side-by-side */
export const AllAccentColors: Story = {
  render: () => {
    const columnNames = [
      'To Do', 'In Progress', 'Review', 'QA',
      'Staging', 'Deployed', 'Archived', 'Done',
    ]
    const columns: BoardColumnType[] = columnNames.map((name, i) => ({
      id: `accent-${i}`,
      name,
      tasks: [],
    }))
    return (
      <BoardProvider initialData={{ columns }}>
        <DndContext>
          <div className="flex gap-ds-04 overflow-x-auto">
            {columns.map((col, i) => (
              <SortableContext key={col.id} items={[]} strategy={verticalListSortingStrategy}>
                <div className="h-[250px]">
                  <BoardColumn column={col} index={i} />
                </div>
              </SortableContext>
            ))}
          </div>
        </DndContext>
      </BoardProvider>
    )
  },
  parameters: { layout: 'padded' },
}

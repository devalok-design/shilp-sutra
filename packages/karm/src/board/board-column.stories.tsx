import type { Meta, StoryObj } from '@storybook/react'
import { DndContext } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BoardColumn, type BoardColumnData } from './board-column'
import type { BoardTask } from './task-card'

// ============================================================
// Mock Data
// ============================================================

const mockTasks: BoardTask[] = [
  {
    id: 'task-1',
    title: 'Set up CI/CD pipeline for staging environment',
    priority: 'HIGH',
    labels: ['devops', 'infrastructure'],
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    isBlocked: false,
    assignees: [{ id: 'u1', name: 'Arjun Mehta', image: null }],
  },
  {
    id: 'task-2',
    title: 'Implement OAuth2 refresh token rotation',
    priority: 'URGENT',
    labels: ['security'],
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    isBlocked: true,
    assignees: [
      { id: 'u2', name: 'Priya Sharma', image: null },
      { id: 'u3', name: 'Kavita Reddy', image: null },
    ],
  },
  {
    id: 'task-3',
    title: 'Add unit tests for payment service',
    priority: 'MEDIUM',
    labels: ['testing'],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    isBlocked: false,
    assignees: [],
  },
  {
    id: 'task-4',
    title: 'Update API documentation for v2 endpoints',
    priority: 'LOW',
    labels: ['docs'],
    dueDate: null,
    isBlocked: false,
    assignees: [{ id: 'u1', name: 'Arjun Mehta', image: null }],
  },
]

const columnWithTasks: BoardColumnData = {
  id: 'col-in-progress',
  name: 'In Progress',
  isClientVisible: false,
  tasks: mockTasks,
}

const emptyColumn: BoardColumnData = {
  id: 'col-backlog',
  name: 'Backlog',
  isClientVisible: false,
  tasks: [],
}

const clientVisibleColumn: BoardColumnData = {
  id: 'col-review',
  name: 'Client Review',
  isClientVisible: true,
  tasks: [mockTasks[0], mockTasks[2]],
}

const singleTaskColumn: BoardColumnData = {
  id: 'col-done',
  name: 'Done',
  isClientVisible: true,
  tasks: [mockTasks[3]],
}

// ============================================================
// DnD Wrapper
// ============================================================

function DndWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DndContext>
      <SortableContext
        items={['column-wrapper']}
        strategy={horizontalListSortingStrategy}
      >
        <div className="group">{children}</div>
      </SortableContext>
    </DndContext>
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
  },
  decorators: [
    (Story) => (
      <DndWrapper>
        <div className="h-[600px]">
          <Story />
        </div>
      </DndWrapper>
    ),
  ],
  argTypes: {
    onAddTask: { action: 'addTask' },
    onClickTask: { action: 'clickTask' },
    onRenameColumn: { action: 'renameColumn' },
    onDeleteColumn: { action: 'deleteColumn' },
    onToggleVisibility: { action: 'toggleVisibility' },
  },
}

export default meta
type Story = StoryObj<typeof BoardColumn>

// ============================================================
// Stories
// ============================================================

/** Column with multiple tasks showing various priorities, labels, and assignees */
export const WithTasks: Story = {
  args: {
    column: columnWithTasks,
    index: 1,
    onAddTask: () => {},
  },
}

/** Empty column showing the "No tasks" placeholder */
export const Empty: Story = {
  args: {
    column: emptyColumn,
    index: 0,
    onAddTask: () => {},
  },
}

/** Column marked as visible to clients (shows eye icon in header) */
export const ClientVisible: Story = {
  args: {
    column: clientVisibleColumn,
    index: 4,
    onAddTask: () => {},
  },
}

/** Column with a single task */
export const SingleTask: Story = {
  args: {
    column: singleTaskColumn,
    index: 3,
    onAddTask: () => {},
  },
}

/** First column index (blue accent border) */
export const FirstColumnAccent: Story = {
  args: {
    column: { ...columnWithTasks, name: 'To Do' },
    index: 0,
    onAddTask: () => {},
  },
}

/** Fifth column index (pink accent border) */
export const FifthColumnAccent: Story = {
  args: {
    column: { ...columnWithTasks, name: 'Deployed' },
    index: 4,
    onAddTask: () => {},
  },
}

/** All column accent colors displayed together */
export const AllAccentColors: Story = {
  render: () => {
    const columnNames = [
      'To Do',
      'In Progress',
      'Review',
      'QA',
      'Staging',
      'Deployed',
      'Archived',
      'Done',
    ]
    return (
      <DndContext>
        <SortableContext
          items={columnNames.map((_, i) => `column-accent-${i}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4 overflow-x-auto">
            {columnNames.map((name, i) => (
              <div key={i} className="group h-[200px]">
                <BoardColumn
                  column={{
                    id: `accent-${i}`,
                    name,
                    tasks: [],
                    isClientVisible: false,
                  }}
                  index={i}
                  onAddTask={() => {}}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    )
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Shows all 8 column accent colors cycling through: blue, violet, amber, emerald, pink, cyan, orange, teal.',
      },
    },
  },
}

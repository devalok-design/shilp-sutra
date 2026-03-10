import type { Meta, StoryObj } from '@storybook/react'
import { BoardToolbar } from './board-toolbar'
import { BulkActionBar } from './bulk-action-bar'
import { BoardProvider } from './board-context'
import type { BoardData, BoardTask } from './board-types'

// ============================================================
// Mock Data
// ============================================================

const tasks: BoardTask[] = [
  {
    id: 't1',
    taskId: 'KRM-1',
    title: 'Implement user authentication flow',
    priority: 'HIGH',
    labels: ['backend', 'security'],
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: { id: 'u1', name: 'Arjun Mehta', image: null },
    assignees: [{ id: 'u2', name: 'Priya Sharma', image: null }],
    subtaskCount: 5,
    subtasksDone: 3,
  },
  {
    id: 't2',
    taskId: 'KRM-2',
    title: 'Fix database connection pooling',
    priority: 'URGENT',
    labels: ['backend', 'bug'],
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    isBlocked: true,
    visibility: 'EVERYONE',
    owner: { id: 'u2', name: 'Priya Sharma', image: null },
    assignees: [{ id: 'u3', name: 'Kavita Reddy', image: null }],
    subtaskCount: 3,
    subtasksDone: 1,
  },
  {
    id: 't3',
    taskId: 'KRM-3',
    title: 'Update README documentation',
    priority: 'LOW',
    labels: ['docs'],
    dueDate: null,
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: null,
    assignees: [],
    subtaskCount: 0,
    subtasksDone: 0,
  },
  {
    id: 't4',
    taskId: 'KRM-4',
    title: 'Design system token migration',
    priority: 'MEDIUM',
    labels: ['frontend', 'design'],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    isBlocked: false,
    visibility: 'INTERNAL',
    owner: { id: 'u1', name: 'Arjun Mehta', image: null },
    assignees: [
      { id: 'u3', name: 'Kavita Reddy', image: null },
      { id: 'u4', name: 'Rohan Gupta', image: null },
    ],
    subtaskCount: 8,
    subtasksDone: 2,
  },
]

const boardData: BoardData = {
  columns: [
    { id: 'col-1', name: 'Backlog', tasks: [tasks[2]] },
    { id: 'col-2', name: 'In Progress', tasks: [tasks[0], tasks[1]] },
    { id: 'col-3', name: 'Review', tasks: [tasks[3]] },
    { id: 'col-4', name: 'Done', tasks: [] },
  ],
}

// ============================================================
// Wrapper that can pre-select tasks for BulkActionBar demo
// ============================================================

import React from 'react'
import { useBoardContext } from './board-context'

function SelectTasksEffect({ ids }: { ids: string[] }) {
  const { toggleTaskSelection } = useBoardContext()
  const didSelect = React.useRef(false)
  React.useEffect(() => {
    if (!didSelect.current) {
      didSelect.current = true
      ids.forEach((id) => toggleTaskSelection(id))
    }
  }, [ids, toggleTaskSelection])
  return null
}

// ============================================================
// Meta
// ============================================================

const meta: Meta<typeof BoardToolbar> = {
  title: 'Karm/Board/BoardToolbar',
  component: BoardToolbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { BoardToolbar } from "@devalok/shilp-sutra-karm/board"`',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BoardToolbar>

// ============================================================
// Stories
// ============================================================

/** Default toolbar with search, filters, view toggle, and my-tasks button */
export const Default: Story = {
  render: () => (
    <BoardProvider initialData={boardData} currentUserId="u1">
      <BoardToolbar />
    </BoardProvider>
  ),
}

/** Toolbar + BulkActionBar shown together — select tasks to see the bulk bar */
export const WithBulkActionBar: Story = {
  render: () => (
    <BoardProvider initialData={boardData} currentUserId="u1">
      <div className="flex flex-col gap-ds-02">
        <BoardToolbar />
        <BulkActionBar />
      </div>
    </BoardProvider>
  ),
}

/** BulkActionBar with pre-selected tasks — shows the bar expanded */
export const BulkBarWithSelection: Story = {
  render: () => (
    <BoardProvider initialData={boardData} currentUserId="u1">
      <SelectTasksEffect ids={['t1', 't2']} />
      <div className="flex flex-col gap-ds-02">
        <BoardToolbar />
        <BulkActionBar />
      </div>
    </BoardProvider>
  ),
}

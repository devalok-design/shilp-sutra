import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColumnHeader } from './column-header'
import { BoardProvider } from './board-context'
import type { BoardTask } from './board-types'

const mockTask: BoardTask = {
  id: 'task-1',
  taskId: 'KRM-1',
  title: 'Example task',
  priority: 'MEDIUM',
  labels: [],
  dueDate: null,
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: null,
  assignees: [],
  subtaskCount: 0,
  subtasksDone: 0,
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BoardProvider
      initialData={{
        columns: [
          { id: 'c1', name: 'Todo', tasks: [mockTask] },
          { id: 'c2', name: 'In Progress', tasks: [] },
          { id: 'c3', name: 'Done', tasks: [] },
        ],
      }}
    >
      {children}
    </BoardProvider>
  )
}

const meta: Meta<typeof ColumnHeader> = {
  title: 'Karm/Board/ColumnHeader',
  component: ColumnHeader,
  tags: ['autodocs'],
  decorators: [(Story) => <Wrapper><Story /></Wrapper>],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Header for a kanban board column with title, task count, and actions menu.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ColumnHeader>

export const Default: Story = {
  args: {
    column: { id: 'c1', name: 'Todo', tasks: [mockTask] },
    index: 0,
  },
}

export const EmptyColumn: Story = {
  args: {
    column: { id: 'c2', name: 'In Progress', tasks: [] },
    index: 1,
  },
}

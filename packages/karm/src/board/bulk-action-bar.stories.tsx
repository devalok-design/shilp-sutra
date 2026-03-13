import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BulkActionBar } from './bulk-action-bar'
import { BoardProvider } from './board-context'
import type { BoardTask } from './board-types'

const mockTask: BoardTask = {
  id: 'task-1',
  taskId: 'KRM-1',
  title: 'Test task',
  priority: 'HIGH',
  labels: ['frontend'],
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
      initialData={{ columns: [{ id: 'c1', name: 'Todo', tasks: [mockTask] }] }}
    >
      {children}
    </BoardProvider>
  )
}

const meta: Meta<typeof BulkActionBar> = {
  title: 'Karm/Board/BulkActionBar',
  component: BulkActionBar,
  tags: ['autodocs'],
  decorators: [(Story) => <Wrapper><Story /></Wrapper>],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Floating bar for bulk task operations when tasks are selected.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BulkActionBar>

export const Default: Story = {}

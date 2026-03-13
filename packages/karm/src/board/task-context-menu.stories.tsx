import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { TaskContextMenu } from './task-context-menu'
import { BoardProvider } from './board-context'
import type { BoardTask } from './board-types'

const mockTask: BoardTask = {
  id: 'task-1',
  taskId: 'KRM-1',
  title: 'Example task for context menu',
  priority: 'HIGH',
  labels: ['frontend'],
  dueDate: null,
  isBlocked: false,
  visibility: 'INTERNAL',
  owner: { id: 'u1', name: 'Alice', image: null },
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

const meta: Meta<typeof TaskContextMenu> = {
  title: 'Karm/Board/TaskContextMenu',
  component: TaskContextMenu,
  tags: ['autodocs'],
  decorators: [(Story) => <Wrapper><Story /></Wrapper>],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Right-click context menu for task cards with quick actions.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TaskContextMenu>

export const Default: Story = {
  args: {
    taskId: 'task-1',
    children: (
      <div className="w-[280px] rounded-ds-lg border border-border bg-layer-01 p-ds-05">
        Right-click this card to see the context menu
      </div>
    ),
  },
}

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColumnEmpty } from './column-empty'

const meta: Meta<typeof ColumnEmpty> = {
  title: 'Karm/Board/ColumnEmpty',
  component: ColumnEmpty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra-karm` · Empty state illustration shown when a board column has no tasks.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ColumnEmpty>

export const Default: Story = {
  args: {
    index: 0,
  },
}

export const WithAddTask: Story = {
  args: {
    index: 1,
    onAddTask: () => alert('Add task clicked'),
  },
}

export const DropTarget: Story = {
  args: {
    index: 2,
    isDropTarget: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-ds-05">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="w-[272px]">
          <ColumnEmpty index={i} />
        </div>
      ))}
    </div>
  ),
}

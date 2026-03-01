import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './data-table'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from './badge'

type Task = {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
}

const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const variant = status === 'done' ? 'green' : status === 'in-progress' ? 'blue' : 'neutral'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      const variant = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'neutral'
      return <Badge variant={variant}>{priority}</Badge>
    },
  },
]

const data: Task[] = [
  { id: 'TASK-001', title: 'Design system tokens', status: 'done', priority: 'high' },
  { id: 'TASK-002', title: 'Component extraction', status: 'in-progress', priority: 'high' },
  { id: 'TASK-003', title: 'Storybook setup', status: 'in-progress', priority: 'medium' },
  { id: 'TASK-004', title: 'Write unit tests', status: 'todo', priority: 'medium' },
  { id: 'TASK-005', title: 'Documentation', status: 'todo', priority: 'low' },
]

const meta: Meta<typeof DataTable> = {
  title: 'UI/Data Display/DataTable',
  component: DataTable,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: () => <DataTable columns={columns} data={data} />,
}

export const Empty: Story = {
  render: () => <DataTable columns={columns} data={[]} />,
}

export const CustomNoResults: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      noResultsText="No tasks match your filter criteria."
    />
  ),
}

export const SingleRow: Story = {
  render: () => <DataTable columns={columns} data={[data[0]]} />,
}

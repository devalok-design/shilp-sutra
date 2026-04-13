import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from 'storybook/test'
import { FilterBar, FilterSelect, FilterMultiSelect } from './filter-bar'

const meta: Meta<typeof FilterBar> = {
  title: 'Components/Selectors/FilterBar',
  component: FilterBar,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof FilterBar>

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const priorityOptions = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

function DefaultDemo() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  return (
    <FilterBar
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search tasks..."
      onClearAll={() => {
        setSearch('')
        setStatus('all')
        setPriority('all')
      }}
    >
      <FilterSelect
        label="Status"
        value={status}
        onValueChange={setStatus}
        options={statusOptions}
      />
      <FilterSelect
        label="Priority"
        value={priority}
        onValueChange={setPriority}
        options={priorityOptions}
      />
    </FilterBar>
  )
}

export const Default: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => <DefaultDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Type in the search field
    const searchInput = canvas.getByPlaceholderText('Search tasks...')
    await userEvent.type(searchInput, 'design')
    await expect(searchInput).toHaveValue('design')
  },
}

const assigneeOptions = [
  { value: 'aanya', label: 'Aanya Patel' },
  { value: 'rohan', label: 'Rohan Sharma' },
  { value: 'priya', label: 'Priya Mehta' },
  { value: 'vikram', label: 'Vikram Singh' },
]

function WithMultiSelectDemo() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [assignees, setAssignees] = useState<string[]>([])

  return (
    <FilterBar
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onClearAll={() => {
        setSearch('')
        setStatus('all')
        setAssignees([])
      }}
    >
      <FilterSelect
        label="Status"
        value={status}
        onValueChange={setStatus}
        options={statusOptions}
      />
      <FilterMultiSelect
        label="Assignees"
        value={assignees}
        onValueChange={setAssignees}
        options={assigneeOptions}
      />
    </FilterBar>
  )
}

export const WithMultiSelect: Story = {
  render: () => <WithMultiSelectDemo />,
}

function CompactXSDemo() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  return (
    <FilterBar
      size="xs"
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search..."
      onClearAll={() => {
        setSearch('')
        setStatus('all')
        setPriority('all')
      }}
    >
      <FilterSelect
        label="Status"
        value={status}
        onValueChange={setStatus}
        options={statusOptions}
      />
      <FilterSelect
        label="Priority"
        value={priority}
        onValueChange={setPriority}
        options={priorityOptions}
      />
    </FilterBar>
  )
}

export const CompactXS: Story = {
  render: () => <CompactXSDemo />,
}

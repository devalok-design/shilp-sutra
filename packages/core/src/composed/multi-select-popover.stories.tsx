import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MultiSelectPopover, type MultiSelectItem, type MultiSelectGroup } from './multi-select-popover'
import { Button } from '../ui/button'

const meta: Meta<typeof MultiSelectPopover> = {
  title: 'Composed/MultiSelectPopover',
  component: MultiSelectPopover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}
export default meta
type Story = StoryObj<typeof MultiSelectPopover>

const teamMembers: MultiSelectItem[] = [
  { id: '1', label: 'Aanya Patel' },
  { id: '2', label: 'Rohan Sharma' },
  { id: '3', label: 'Priya Mehta' },
  { id: '4', label: 'Vikram Singh' },
  { id: '5', label: 'Diya Gupta' },
  { id: '6', label: 'Arjun Reddy' },
]

function DefaultDemo() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <MultiSelectPopover items={teamMembers} value={selected} onValueChange={setSelected}>
      <Button variant="outline">
        {selected.length > 0 ? `${selected.length} selected` : 'Select members'}
      </Button>
    </MultiSelectPopover>
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

const groupedItems: MultiSelectGroup[] = [
  {
    label: 'Engineering',
    items: [
      { id: 'e1', label: 'Aanya Patel' },
      { id: 'e2', label: 'Rohan Sharma' },
      { id: 'e3', label: 'Vikram Singh' },
    ],
  },
  {
    label: 'Design',
    items: [
      { id: 'd1', label: 'Priya Mehta' },
      { id: 'd2', label: 'Diya Gupta' },
    ],
  },
  {
    label: 'Product',
    items: [
      { id: 'p1', label: 'Arjun Reddy' },
    ],
  },
]

function WithGroupsDemo() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <MultiSelectPopover groups={groupedItems} value={selected} onValueChange={setSelected}>
      <Button variant="outline">
        {selected.length > 0 ? `${selected.length} members` : 'Choose team members'}
      </Button>
    </MultiSelectPopover>
  )
}

export const WithGroups: Story = {
  render: () => <WithGroupsDemo />,
}

function PreSelectedDemo() {
  const [selected, setSelected] = useState<string[]>(['1', '3'])
  return (
    <MultiSelectPopover items={teamMembers} value={selected} onValueChange={setSelected}>
      <Button variant="outline">
        {selected.length > 0 ? `${selected.length} selected` : 'Select members'}
      </Button>
    </MultiSelectPopover>
  )
}

export const PreSelected: Story = {
  render: () => <PreSelectedDemo />,
}

const itemsWithDescription: MultiSelectItem[] = [
  { id: '1', label: 'Aanya Patel', description: 'Frontend Engineer' },
  { id: '2', label: 'Rohan Sharma', description: 'Backend Engineer' },
  { id: '3', label: 'Priya Mehta', description: 'UX Designer' },
  { id: '4', label: 'Vikram Singh', description: 'DevOps Lead' },
  { id: '5', label: 'Diya Gupta', description: 'Product Manager' },
]

function WithDescriptionDemo() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <MultiSelectPopover
      items={itemsWithDescription}
      value={selected}
      onValueChange={setSelected}
      width={300}
    >
      <Button variant="outline">
        {selected.length > 0 ? `${selected.length} selected` : 'Select team'}
      </Button>
    </MultiSelectPopover>
  )
}

export const WithDescription: Story = {
  render: () => <WithDescriptionDemo />,
}

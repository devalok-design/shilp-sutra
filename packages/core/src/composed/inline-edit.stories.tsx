import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { InlineEdit } from './inline-edit'

const meta: Meta<typeof InlineEdit> = {
  title: 'Composed/InlineEdit',
  component: InlineEdit,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}
export default meta
type Story = StoryObj<typeof InlineEdit>

function DefaultDemo() {
  const [value, setValue] = useState('Sprint Planning Q2')
  return <InlineEdit value={value} onSave={setValue} textClassName="text-ds-lg font-semibold" />
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}

function WithPlaceholderDemo() {
  const [value, setValue] = useState('')
  return (
    <InlineEdit
      value={value}
      onSave={setValue}
      placeholder="Add a title..."
    />
  )
}

export const WithPlaceholder: Story = {
  render: () => <WithPlaceholderDemo />,
}

function MultilineDemo() {
  const [value, setValue] = useState(
    'This project aims to migrate all legacy components to the new design system. Key milestones include token adoption, component parity, and Storybook documentation.',
  )
  return (
    <InlineEdit
      value={value}
      onSave={setValue}
      multiline
      className="max-w-md"
    />
  )
}

export const Multiline: Story = {
  render: () => <MultilineDemo />,
}

export const ReadOnly: Story = {
  render: () => (
    <InlineEdit
      value="This field cannot be edited"
      onSave={() => {}}
      readOnly
      textClassName="text-ds-md"
    />
  ),
}

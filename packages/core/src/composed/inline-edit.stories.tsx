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

function HeadingDemo() {
  const [value, setValue] = useState('Sprint Planning Q2')
  return <InlineEdit value={value} onSave={setValue} textClassName="text-ds-lg font-semibold" />
}

export const Default: Story = {
  render: () => <HeadingDemo />,
  name: 'Heading (click to edit)',
}

function BodyTextDemo() {
  const [value, setValue] = useState('A short description that you can edit inline.')
  return <InlineEdit value={value} onSave={setValue} textClassName="text-ds-md" />
}

export const BodyText: Story = {
  render: () => <BodyTextDemo />,
}

function WithPlaceholderDemo() {
  const [value, setValue] = useState('')
  return (
    <InlineEdit
      value={value}
      onSave={setValue}
      placeholder="Add a title..."
      textClassName="text-ds-lg font-semibold"
    />
  )
}

export const WithPlaceholder: Story = {
  render: () => <WithPlaceholderDemo />,
}

function AsyncSaveDemo() {
  const [value, setValue] = useState('Click me, edit, then press Enter')
  return (
    <InlineEdit
      value={value}
      onSave={async (newVal) => {
        await new Promise((r) => setTimeout(r, 1000))
        setValue(newVal)
      }}
      textClassName="text-ds-md"
    />
  )
}

export const AsyncSave: Story = {
  render: () => <AsyncSaveDemo />,
  name: 'Async Save (1s delay)',
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

function MaxLengthDemo() {
  const [value, setValue] = useState('Limited to 20 chars')
  return (
    <InlineEdit
      value={value}
      onSave={setValue}
      maxLength={20}
      textClassName="text-ds-md"
    />
  )
}

export const MaxLength: Story = {
  render: () => <MaxLengthDemo />,
  name: 'Max Length (20 chars)',
}

import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SearchInput } from './search-input'

const meta: Meta<typeof SearchInput> = {
  title: 'UI/Form Controls/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof SearchInput>

export const Default: Story = {
  args: {
    placeholder: 'Search...',
  },
}

const ControlledSearchInput = () => {
  const [value, setValue] = useState('')
  return (
    <SearchInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
      placeholder="Search projects..."
    />
  )
}

export const Interactive: Story = {
  render: () => <ControlledSearchInput />,
}

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('design system')
    return (
      <SearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
        placeholder="Search..."
      />
    )
  },
}

export const Loading: Story = {
  render: () => {
    const [value, setValue] = useState('searching...')
    return (
      <SearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
        loading
        placeholder="Search..."
      />
    )
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Search disabled',
  },
}

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <SearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue('')}
        placeholder="No clear button when empty"
      />
    )
  },
}

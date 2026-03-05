import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Core/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    required: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Email address',
  },
}

export const Required: Story = {
  args: {
    children: 'Full name',
    required: true,
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-02">
      <Label htmlFor="name">Full name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  ),
}

export const RequiredWithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-02">
      <Label htmlFor="email" required>
        Email address
      </Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
}

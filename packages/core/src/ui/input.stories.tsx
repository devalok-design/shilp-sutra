import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Input> = {
  title: 'UI/Core/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'error', 'warning', 'success'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter text...')
    // Click to focus and type text
    await userEvent.click(input)
    await userEvent.type(input, 'Hello, Shilp Sutra!')
    // Verify the typed value
    await expect(input).toHaveValue('Hello, Shilp Sutra!')
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello, world!',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const ErrorState: Story = {
  args: {
    state: 'error',
    defaultValue: 'invalid-email',
    placeholder: 'Enter email',
  },
}

export const WarningState: Story = {
  args: {
    state: 'warning',
    defaultValue: 'weak-password',
    placeholder: 'Enter password',
  },
}

export const SuccessState: Story = {
  args: {
    state: 'success',
    defaultValue: 'verified@example.com',
    placeholder: 'Enter email',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit',
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'Read-only value',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-02">
      <Label htmlFor="email-input">Email address</Label>
      <Input id="email-input" type="email" placeholder="you@example.com" />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      <div className="flex flex-col gap-ds-01">
        <Label>Default</Label>
        <Input placeholder="Default state" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Error</Label>
        <Input state="error" defaultValue="Invalid value" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Warning</Label>
        <Input state="warning" defaultValue="Needs attention" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Success</Label>
        <Input state="success" defaultValue="Looks good" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Disabled</Label>
        <Input disabled defaultValue="Disabled" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Read Only</Label>
        <Input readOnly defaultValue="Read only" />
      </div>
    </div>
  ),
}

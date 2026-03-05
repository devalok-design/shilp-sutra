import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'
import { Label } from './label'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Form Controls/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'error', 'warning', 'success'],
    },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is a longer text that demonstrates how the textarea handles multiple lines of content. It can grow vertically as needed.',
  },
}

export const ErrorState: Story = {
  args: {
    state: 'error',
    defaultValue: 'This field has an error',
  },
}

export const WarningState: Story = {
  args: {
    state: 'warning',
    defaultValue: 'This field needs attention',
  },
}

export const SuccessState: Story = {
  args: {
    state: 'success',
    defaultValue: 'This looks good!',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled',
  },
}

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'This content is read-only and cannot be edited',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-02 max-w-md">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="Describe the task in detail..."
        rows={4}
      />
    </div>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-md">
      <div className="flex flex-col gap-ds-01">
        <Label>Default</Label>
        <Textarea placeholder="Default state" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Error</Label>
        <Textarea state="error" defaultValue="Invalid content" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Warning</Label>
        <Textarea state="warning" defaultValue="Review needed" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Success</Label>
        <Textarea state="success" defaultValue="Verified content" />
      </div>
    </div>
  ),
}

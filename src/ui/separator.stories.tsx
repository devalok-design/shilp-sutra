import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta: Meta<typeof Separator> = {
  title: 'UI/Core/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    decorative: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="h-20 flex items-center">
        <Story />
      </div>
    ),
  ],
}

export const BetweenText: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <div>
        <h4 className="text-sm font-medium">Section One</h4>
        <p className="text-sm text-text-secondary">
          Content for the first section.
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Section Two</h4>
        <p className="text-sm text-text-secondary">
          Content for the second section.
        </p>
      </div>
    </div>
  ),
}

export const VerticalInline: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-6">
      <span className="text-sm">Home</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Settings</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Profile</span>
    </div>
  ),
}

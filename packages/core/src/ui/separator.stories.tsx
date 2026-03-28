import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta: Meta<typeof Separator> = {
  title: 'UI/Core/Separator',
  component: Separator,
  tags: ['autodocs', 'stable'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    decorative: { control: 'boolean' },
    variant: {
      control: 'radio',
      options: ['default', 'gradient', 'gradient-left', 'gradient-right'],
    },
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
    <div className="max-w-md space-y-ds-04">
      <div>
        <h4 className="text-ds-sm font-medium">Section One</h4>
        <p className="text-ds-sm text-surface-fg-muted">
          Content for the first section.
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-ds-sm font-medium">Section Two</h4>
        <p className="text-ds-sm text-surface-fg-muted">
          Content for the second section.
        </p>
      </div>
    </div>
  ),
}

export const Gradient: Story = {
  render: () => (
    <div className="max-w-md space-y-ds-06">
      <div className="space-y-ds-04">
        <p className="text-ds-sm font-medium text-surface-fg-muted">
          gradient — fades at both edges
        </p>
        <Separator variant="gradient" />
      </div>
      <div className="space-y-ds-04">
        <p className="text-ds-sm font-medium text-surface-fg-muted">
          gradient-left — fades on the left
        </p>
        <Separator variant="gradient-left" />
      </div>
      <div className="space-y-ds-04">
        <p className="text-ds-sm font-medium text-surface-fg-muted">
          gradient-right — fades on the right
        </p>
        <Separator variant="gradient-right" />
      </div>
      <div className="space-y-ds-04">
        <p className="text-ds-sm font-medium text-surface-fg-muted">
          default — solid line (for comparison)
        </p>
        <Separator />
      </div>
    </div>
  ),
}

export const VerticalInline: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04 h-6">
      <span className="text-ds-sm">Home</span>
      <Separator orientation="vertical" />
      <span className="text-ds-sm">Settings</span>
      <Separator orientation="vertical" />
      <span className="text-ds-sm">Profile</span>
    </div>
  ),
}

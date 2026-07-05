import { preview } from '#.storybook/preview'
import { Separator } from './separator'

const meta = preview.meta({
  title: 'Components/Layout/Separator',
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
})
export default meta

export const Horizontal = meta.story({
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    (Story: any) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
})

export const Vertical = meta.story({
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story: any) => (
      <div className="h-20 flex items-center">
        <Story />
      </div>
    ),
  ],
})

export const BetweenText = meta.story({
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
})

export const VerticalInline = meta.story({
  render: () => (
    <div className="flex items-center gap-ds-04 h-6">
      <span className="text-ds-sm">Home</span>
      <Separator orientation="vertical" />
      <span className="text-ds-sm">Settings</span>
      <Separator orientation="vertical" />
      <span className="text-ds-sm">Profile</span>
    </div>
  ),
})

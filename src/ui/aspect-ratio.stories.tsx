import type { Meta, StoryObj } from '@storybook/react'
import { AspectRatio } from './aspect-ratio'

const meta: Meta<typeof AspectRatio> = {
  title: 'UI/Data Display/AspectRatio',
  component: AspectRatio,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof AspectRatio>

export const Default: Story = {
  render: () => (
    <div className="w-[450px]">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-field)] text-sm text-[var(--color-text-secondary)]">
          16:9
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  render: () => (
    <div className="w-[300px]">
      <AspectRatio ratio={1}>
        <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-field)] text-sm text-[var(--color-text-secondary)]">
          1:1
        </div>
      </AspectRatio>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, expect } from 'storybook/test'
import { Slider } from './slider'

const meta: Meta<typeof Slider> = {
  title: 'Components/Inputs/Slider',
  component: Slider,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    className: 'w-60',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const slider = canvas.getByRole('slider')
    await expect(slider).toBeVisible()
    await expect(slider).toHaveAttribute('aria-valuenow', '50')
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
    className: 'w-60',
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
    disabled: true,
    className: 'w-60',
  },
}

export const Sizes: Story = {
  render: () => {
    const sizes = ['sm', 'md', 'lg'] as const

    return (
      <div className="flex w-60 flex-col gap-ds-06">
        {sizes.map((size) => (
          <div key={size}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">{size}</p>
            <Slider defaultValue={[50]} max={100} step={1} size={size} />
          </div>
        ))}
      </div>
    )
  },
}

export const Colors: Story = {
  render: () => {
    const colors = ['accent', 'success', 'warning', 'error'] as const

    return (
      <div className="flex w-60 flex-col gap-ds-06">
        {colors.map((color) => (
          <div key={color}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">{color}</p>
            <Slider defaultValue={[50]} max={100} step={1} color={color} />
          </div>
        ))}
      </div>
    )
  },
}

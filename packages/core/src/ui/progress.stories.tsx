import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'UI/Data Display/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
}
export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
  args: {
    value: 60,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Empty: Story = {
  args: {
    value: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Complete: Story = {
  args: {
    value: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Quarter: Story = {
  args: {
    value: 25,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const Half: Story = {
  args: {
    value: 50,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const CustomIndicator: Story = {
  args: {
    value: 80,
    indicatorClassName: 'bg-success',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
}

export const AllStages: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-md">
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-text-secondary">0%</span>
        <Progress value={0} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-text-secondary">25%</span>
        <Progress value={25} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-text-secondary">50%</span>
        <Progress value={50} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-text-secondary">75%</span>
        <Progress value={75} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-text-secondary">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => {
    const sizes = ['sm', 'md', 'lg'] as const
    const colors = ['default', 'success', 'warning', 'error'] as const

    return (
      <div className="flex flex-col gap-ds-06 max-w-md">
        {sizes.map((size) => (
          <div key={size}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary capitalize">Size: {size}</p>
            <div className="flex flex-col gap-ds-03">
              {colors.map((color) => (
                <div key={`${size}-${color}`} className="flex flex-col gap-ds-02b">
                  <span className="text-ds-xs text-text-secondary capitalize">{color}</span>
                  <Progress size={size} color={color} value={65} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Indeterminate</p>
          <div className="flex flex-col gap-ds-03">
            {colors.map((color) => (
              <div key={`indeterminate-${color}`} className="flex flex-col gap-ds-02b">
                <span className="text-ds-xs text-text-secondary capitalize">{color}</span>
                <Progress color={color} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">With Label</p>
          <div className="flex flex-col gap-ds-03">
            {colors.map((color) => (
              <Progress key={`label-${color}`} color={color} value={72} showLabel />
            ))}
          </div>
        </div>
      </div>
    )
  },
}

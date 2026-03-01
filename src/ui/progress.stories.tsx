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
    indicatorClassName: 'bg-[var(--color-success)]',
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
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">0%</span>
        <Progress value={0} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">25%</span>
        <Progress value={25} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">50%</span>
        <Progress value={50} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">75%</span>
        <Progress value={75} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[var(--color-text-secondary)]">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
}

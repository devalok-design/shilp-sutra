import type { Meta, StoryObj } from '@storybook/react'
import { Sparkline } from './sparkline'

const meta: Meta<typeof Sparkline> = {
  title: 'UI/Charts/Sparkline',
  component: Sparkline,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['line', 'bar', 'area'],
    },
    width: { control: { type: 'number', min: 60, max: 300 } },
    height: { control: { type: 'number', min: 16, max: 80 } },
    strokeWidth: { control: { type: 'range', min: 0.5, max: 4, step: 0.5 } },
    showLastDot: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Sparkline>

const sparkData = [4, 7, 3, 8, 5, 9, 6, 10, 7, 12]

export const Line: Story = {
  args: {
    data: sparkData,
  },
}

export const Bar: Story = {
  args: {
    data: sparkData,
    variant: 'bar',
  },
}

export const Area: Story = {
  args: {
    data: sparkData,
    variant: 'area',
  },
}

export const Colored: Story = {
  args: {
    data: sparkData,
    color: 'var(--color-success-11)',
  },
}

export const InlineWithText: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04 text-ds-sm text-surface-fg">
      <span>Revenue</span>
      <Sparkline data={sparkData} color="chart-2" width={80} height={24} />
      <span className="font-semibold text-success">+12%</span>
    </div>
  ),
}

export const LastDot: Story = {
  args: {
    data: sparkData,
    showLastDot: true,
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { LineChart } from './line-chart'

const meta: Meta<typeof LineChart> = {
  title: 'UI/Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  argTypes: {
    curved: { control: 'boolean' },
    showDots: { control: 'boolean' },
    dotSize: { control: { type: 'range', min: 2, max: 8, step: 1 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 5, step: 0.5 } },
    showGrid: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    animate: { control: 'boolean' },
    height: { control: { type: 'number', min: 150, max: 600 } },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[700px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof LineChart>

const timeData = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 95, costs: 70 },
  { month: 'Mar', revenue: 150, costs: 90 },
  { month: 'Apr', revenue: 180, costs: 100 },
  { month: 'May', revenue: 130, costs: 85 },
  { month: 'Jun', revenue: 160, costs: 95 },
]

export const Default: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [{ key: 'revenue', label: 'Revenue' }],
    height: 300,
  },
}

export const MultiSeries: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue' },
      { key: 'costs', label: 'Costs' },
    ],
    height: 300,
  },
}

export const Curved: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue' },
      { key: 'costs', label: 'Costs' },
    ],
    curved: true,
    height: 300,
  },
}

export const WithDots: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue' },
      { key: 'costs', label: 'Costs' },
    ],
    showDots: true,
    curved: true,
    height: 300,
  },
}

export const WithLegend: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue' },
      { key: 'costs', label: 'Costs' },
    ],
    showLegend: true,
    showDots: true,
    curved: true,
    height: 300,
  },
}

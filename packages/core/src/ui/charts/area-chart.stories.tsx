import type { Meta, StoryObj } from '@storybook/react'
import { AreaChart } from './area-chart'

const meta: Meta<typeof AreaChart> = {
  title: 'UI/Charts/AreaChart',
  component: AreaChart,
  tags: ['autodocs'],
  argTypes: {
    curved: { control: 'boolean' },
    stacked: { control: 'boolean' },
    gradient: { control: 'boolean' },
    fillOpacity: { control: { type: 'range', min: 0.05, max: 1, step: 0.05 } },
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
type Story = StoryObj<typeof AreaChart>

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

export const Stacked: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [
      { key: 'revenue', label: 'Revenue' },
      { key: 'costs', label: 'Costs' },
    ],
    stacked: true,
    showLegend: true,
    curved: true,
    height: 300,
  },
}

export const Gradient: Story = {
  args: {
    data: timeData,
    xKey: 'month',
    series: [{ key: 'revenue', label: 'Revenue' }],
    gradient: true,
    curved: true,
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
    curved: true,
    gradient: true,
    showLegend: true,
    height: 300,
  },
}

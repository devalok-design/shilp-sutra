import type { Meta, StoryObj } from '@storybook/react'
import { BarChart } from './bar-chart'

const meta: Meta<typeof BarChart> = {
  title: 'UI/Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
    stacked: { control: 'boolean' },
    grouped: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    showTooltip: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    animate: { control: 'boolean' },
    barRadius: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    height: { control: { type: 'number', min: 150, max: 600 } },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-[700px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof BarChart>

const monthlyData = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 95 },
  { month: 'Mar', value: 150 },
  { month: 'Apr', value: 180 },
  { month: 'May', value: 130 },
  { month: 'Jun', value: 160 },
]

const multiSeriesData = [
  { month: 'Jan', revenue: 120, costs: 80 },
  { month: 'Feb', revenue: 95, costs: 70 },
  { month: 'Mar', revenue: 150, costs: 90 },
  { month: 'Apr', revenue: 180, costs: 100 },
  { month: 'May', revenue: 130, costs: 85 },
  { month: 'Jun', revenue: 160, costs: 95 },
]

export const Default: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    height: 300,
  },
}

export const Horizontal: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    orientation: 'horizontal',
    height: 300,
  },
}

export const MultiSeries: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    grouped: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const Stacked: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    stacked: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const WithLegend: Story = {
  args: {
    data: multiSeriesData,
    xKey: 'month',
    yKey: ['revenue', 'costs'],
    grouped: true,
    showLegend: true,
    seriesLabels: ['Revenue', 'Costs'],
    height: 300,
  },
}

export const CustomColors: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    color: 'chart-3',
    height: 300,
  },
}

export const WithLabels: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    xLabel: 'Month',
    yLabel: 'Sales',
    height: 350,
  },
}

export const NoGrid: Story = {
  args: {
    data: monthlyData,
    xKey: 'month',
    yKey: 'value',
    showGrid: false,
    height: 300,
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { PieChart } from './pie-chart'

const meta: Meta<typeof PieChart> = {
  title: 'UI/Charts/PieChart',
  component: PieChart,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['pie', 'donut'],
    },
    innerRadius: { control: { type: 'range', min: 0.1, max: 0.9, step: 0.05 } },
    padAngle: { control: { type: 'range', min: 0, max: 0.1, step: 0.005 } },
    cornerRadius: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    height: { control: { type: 'number', min: 150, max: 600 } },
    showTooltip: { control: 'boolean' },
    showLegend: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    animate: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-[500px]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof PieChart>

const pieData = [
  { label: 'Approved', value: 45 },
  { label: 'Pending', value: 12 },
  { label: 'Rejected', value: 5 },
  { label: 'Draft', value: 8 },
]

export const Default: Story = {
  args: {
    data: pieData,
    height: 300,
  },
}

export const Donut: Story = {
  args: {
    data: pieData,
    variant: 'donut',
    height: 300,
  },
}

export const WithLabels: Story = {
  args: {
    data: pieData,
    showLabels: true,
    height: 300,
  },
}

export const WithCenterLabel: Story = {
  args: {
    data: pieData,
    variant: 'donut',
    centerLabel: (
      <div>
        <div className="text-ds-2xl font-bold">70</div>
        <div>Total</div>
      </div>
    ),
    height: 300,
  },
}

export const WithLegend: Story = {
  args: {
    data: pieData,
    showLegend: true,
    height: 300,
  },
}

export const CustomColors: Story = {
  args: {
    data: [
      { label: 'Approved', value: 45, color: 'var(--color-success-text)' },
      { label: 'Pending', value: 12, color: 'var(--color-warning-text)' },
      { label: 'Rejected', value: 5, color: 'var(--color-error-text)' },
      { label: 'Draft', value: 8, color: 'var(--color-text-tertiary)' },
    ],
    height: 300,
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { GaugeChart } from './gauge-chart'

const meta: Meta<typeof GaugeChart> = {
  title: 'UI/Charts/GaugeChart',
  component: GaugeChart,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    max: { control: { type: 'number', min: 1, max: 1000 } },
    min: { control: { type: 'number', min: 0, max: 100 } },
    height: { control: { type: 'number', min: 100, max: 400 } },
    thickness: { control: { type: 'range', min: 4, max: 40, step: 2 } },
    startAngle: { control: { type: 'range', min: -180, max: 0, step: 10 } },
    endAngle: { control: { type: 'range', min: 0, max: 180, step: 10 } },
    animate: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center p-ds-08">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof GaugeChart>

export const Default: Story = {
  args: {
    value: 73,
    label: 'Attendance',
  },
}

export const CustomRange: Story = {
  args: {
    value: 350,
    min: 0,
    max: 500,
    label: 'Score',
  },
}

export const FormattedLabel: Story = {
  args: {
    value: 85,
    valueLabel: (v: number) => `${v}%`,
    label: 'Completion',
    color: 'var(--color-success-11)',
  },
}

export const MultiGauges: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-08">
      <GaugeChart
        value={92}
        label="Attendance"
        color="chart-1"
        height={160}
      />
      <GaugeChart
        value={67}
        label="Tasks Done"
        color="chart-2"
        height={160}
      />
      <GaugeChart
        value={45}
        label="Utilization"
        color="chart-3"
        height={160}
      />
    </div>
  ),
}

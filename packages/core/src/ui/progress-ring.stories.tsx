import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProgressRing, MultiProgressRing } from './progress-ring'

const meta: Meta<typeof ProgressRing> = {
  title: 'Components/Feedback/ProgressRing',
  component: ProgressRing,
  tags: ['autodocs', 'stable'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'select', options: ['default', 'success', 'warning', 'error', 'info'] },
    showValue: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof ProgressRing>

export const Default: Story = {
  args: {
    value: 65,
  },
}

export const WithValue: Story = {
  args: {
    value: 73,
    showValue: true,
    size: 'lg',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <ProgressRing value={60} size="sm" />
      <ProgressRing value={60} size="md" />
      <ProgressRing value={60} size="lg" />
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <ProgressRing value={75} color="default" showValue size="lg" />
      <ProgressRing value={75} color="success" showValue size="lg" />
      <ProgressRing value={75} color="warning" showValue size="lg" />
      <ProgressRing value={75} color="error" showValue size="lg" />
      <ProgressRing value={75} color="info" showValue size="lg" />
    </div>
  ),
}

export const MultiRing: Story = {
  render: () => (
    <MultiProgressRing
      size="lg"
      rings={[
        { value: 85, color: 'error', label: 'Move' },
        { value: 62, color: 'success', label: 'Exercise' },
        { value: 40, color: 'info', label: 'Stand' },
      ]}
    />
  ),
}

export const FullProgress: Story = {
  args: {
    value: 100,
    showValue: true,
    color: 'success',
    size: 'lg',
  },
}

export const ZeroProgress: Story = {
  args: {
    value: 0,
    showValue: true,
    size: 'lg',
  },
}

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'Components/Feedback/Progress',
  component: Progress,
  tags: ['autodocs', 'stable'],
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
    indicatorClassName: 'bg-success-9',
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
        <span className="text-ds-sm text-surface-fg-muted">0%</span>
        <Progress value={0} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-surface-fg-muted">25%</span>
        <Progress value={25} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-surface-fg-muted">50%</span>
        <Progress value={50} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-surface-fg-muted">75%</span>
        <Progress value={75} />
      </div>
      <div className="flex flex-col gap-ds-01">
        <span className="text-ds-sm text-surface-fg-muted">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => {
    const sizes = ['sm', 'md', 'lg'] as const
    const colors = ['accent', 'success', 'warning', 'error'] as const

    return (
      <div className="flex flex-col gap-ds-06 max-w-md">
        {sizes.map((size) => (
          <div key={size}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">Size: {size}</p>
            <div className="flex flex-col gap-ds-03">
              {colors.map((color) => (
                <div key={`${size}-${color}`} className="flex flex-col gap-ds-02b">
                  <span className="text-ds-xs text-surface-fg-muted capitalize">{color}</span>
                  <Progress size={size} color={color} value={65} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Indeterminate</p>
          <div className="flex flex-col gap-ds-03">
            {colors.map((color) => (
              <div key={`indeterminate-${color}`} className="flex flex-col gap-ds-02b">
                <span className="text-ds-xs text-surface-fg-muted capitalize">{color}</span>
                <Progress color={color} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">With Label</p>
          <div className="flex flex-col gap-ds-03">
            {colors.map((color) => (
              <Progress key={`label-${color}`} color={color} value={72} showValue />
            ))}
          </div>
        </div>
      </div>
    )
  },
}

export const AutoColor: Story = {
  render: () => {
    const [value, setValue] = React.useState(50)

    const colorLabel =
      value > 100
        ? 'error'
        : value >= 85
          ? 'success'
          : value >= 60
            ? 'warning'
            : 'accent'

    return (
      <div className="flex flex-col gap-ds-04 max-w-md">
        <Progress value={value} autoColor showValue />
        <input
          type="range"
          min={0}
          max={110}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full"
          aria-label="Progress value"
        />
        <p className="text-ds-xs text-surface-fg-muted">
          Value: <strong>{value}</strong> — auto color: <strong>{colorLabel}</strong>
          {' '}(0-59 accent, 60-84 warning, 85-100 success, {'>'}100 error)
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'When `autoColor` is true, the indicator color auto-shifts based on value thresholds.',
      },
    },
  },
}

// ── New in 0.49.0: label + value, multi-segment, and the compound API ──

export const WithLabelAndValue: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-md">
      <Progress value={72} label="Uploading" showValue />
      <Progress value={100} color="success" label="Backup" showValue />
      <Progress value={45} autoColor label="Disk usage" showValue />
    </div>
  ),
  parameters: {
    docs: { description: { story: 'The smart form: `label` names the bar and renders before it; `showValue` adds the `{n}%` readout after it.' } },
  },
}

export const Segments: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-05 max-w-md">
      <div className="flex flex-col gap-ds-02b">
        <span className="text-ds-xs text-surface-fg-muted">Budget: 40% spent, 30% committed</span>
        <Progress segments={[{ value: 40, color: 'success' }, { value: 30, color: 'warning' }]} />
      </div>
      <div className="flex flex-col gap-ds-02b">
        <span className="text-ds-xs text-surface-fg-muted">Storage breakdown</span>
        <Progress
          size="lg"
          segments={[
            { value: 30, color: 'accent' },
            { value: 25, color: 'success' },
            { value: 20, color: 'warning' },
            { value: 10, color: 'error' },
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: { description: { story: 'Mantine-style multi-segment bars via the `segments` prop — each slice is a portion of `max`.' } },
  },
}

export const Compound: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-05 max-w-md">
      <Progress.Root value={62} size="lg">
        <Progress.Label id="storage-lbl">Storage</Progress.Label>
        <Progress.Track aria-labelledby="storage-lbl">
          <Progress.Indicator color="warning" />
        </Progress.Track>
        <Progress.Value format={(pct) => `${pct}% of 50 GB`} />
      </Progress.Root>

      <Progress.Root value={90}>
        <Progress.Track aria-label="Sync progress">
          <Progress.Indicator autoColor />
        </Progress.Track>
        <Progress.Value />
      </Progress.Root>
    </div>
  ),
  parameters: {
    docs: { description: { story: 'The compound API (Ark UI / Chakra structure) — arrange Label, Track, Indicator and Value however you need. `Progress.Value` accepts a custom `format`.' } },
  },
}

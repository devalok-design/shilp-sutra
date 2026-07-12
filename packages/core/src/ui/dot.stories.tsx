import type { Meta, StoryObj } from '@storybook/react-vite'

import { Dot, type DotColor } from './dot'

const meta: Meta<typeof Dot> = {
  title: 'Components/Data Display/Dot',
  component: Dot,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof Dot>

const COLORS: DotColor[] = ['accent', 'success', 'warning', 'error', 'info', 'neutral']

export const Default: Story = {
  args: { color: 'success' },
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      {COLORS.map((c) => (
        <Dot key={c} color={c} />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      <Dot color="accent" size="xs" />
      <Dot color="accent" size="sm" />
      <Dot color="accent" size="md" />
      <Dot color="accent" size="lg" />
    </div>
  ),
}

export const Off: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      {COLORS.map((c) => (
        <Dot key={c} color={c} variant="off" size="lg" />
      ))}
    </div>
  ),
  parameters: {
    docs: { description: { story: 'The `off` variant — faint same-tone fill + light border. Reads as present-but-inactive/disabled.' } },
  },
}

export const Treatments: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <Dot color="success" variant="filled" size="lg" label="Filled — active" />
      <Dot color="success" variant="ring" size="lg" label="Ring — outline" />
      <Dot color="success" variant="off" size="lg" label="Off — inactive" />
    </div>
  ),
}

export const WithBorder: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04 rounded-surface bg-accent-9 p-ds-04">
      {COLORS.map((c) => (
        <Dot key={c} color={c} size="lg" withBorder />
      ))}
    </div>
  ),
  parameters: {
    docs: { description: { story: '`withBorder` adds a contrast ring so the dot stays visible on busy/coloured backgrounds (here, on an accent fill).' } },
  },
}

export const PulseSpeed: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <Dot color="accent" pulse pulseSpeed="slow" label="Slow" />
      <Dot color="warning" pulse pulseSpeed="normal" label="Normal" />
      <Dot color="error" pulse pulseSpeed="fast" label="Fast" />
    </div>
  ),
}

export const LabelPosition: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <Dot color="success" label="Label at end" labelPosition="end" />
      <Dot color="success" label="Label at start" labelPosition="start" />
    </div>
  ),
}

export const Filled: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      {COLORS.map((c) => (
        <Dot key={c} color={c} variant="filled" size="lg" />
      ))}
    </div>
  ),
}

export const Ring: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      {COLORS.map((c) => (
        <Dot key={c} color={c} variant="ring" size="lg" />
      ))}
    </div>
  ),
}

export const Pulse: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <Dot color="success" pulse label="Live" />
      <Dot color="error" pulse label="Recording" />
      <Dot color="accent" pulse label="Connecting" />
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <Dot color="success" label="Operational" />
      <Dot color="warning" label="Degraded" />
      <Dot color="error" label="Outage" />
      <Dot color="neutral" variant="ring" label="Idle" />
    </div>
  ),
}

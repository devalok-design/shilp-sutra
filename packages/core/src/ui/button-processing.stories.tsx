import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProcessingOverlay } from './button-processing'
import { Button } from './button'
import * as React from 'react'

const meta: Meta<typeof ProcessingOverlay> = {
  title: 'UI/Core/ButtonProcessing',
  component: ProcessingOverlay,
  tags: ['autodocs', 'stable'],
}
export default meta
type Story = StoryObj<typeof ProcessingOverlay>

/* ── Helper: wraps a button with the overlay the way Button uses it ── */

function DemoButton({
  speed,
  color,
  label,
}: {
  speed: 'ambient' | 'working' | 'urgent'
  color: string
  label: string
}) {
  const [active, setActive] = React.useState(true)
  return (
    <div className="flex flex-col items-center gap-ds-03">
      <span className="relative inline-flex">
        <Button variant="soft" color={color as any} onClick={() => setActive(!active)}>
          {label}
        </Button>
        <ProcessingOverlay active={active} speed={speed} color={color} />
      </span>
      <span className="text-xs text-text-secondary">{speed} / {color}</span>
    </div>
  )
}

/* ── 1. Default (working speed) ─────────────────────────────────────── */

export const Default: Story = {
  render: () => <DemoButton speed="working" color="accent" label="Processing..." />,
}

/* ── 2. Speed Variants ──────────────────────────────────────────────── */

export const SpeedVariants: Story = {
  render: () => (
    <div className="flex items-start gap-ds-08">
      <DemoButton speed="ambient" color="accent" label="Ambient" />
      <DemoButton speed="working" color="accent" label="Working" />
      <DemoButton speed="urgent" color="accent" label="Urgent" />
    </div>
  ),
}

/* ── 3. Color Variants ──────────────────────────────────────────────── */

export const ColorVariants: Story = {
  render: () => (
    <div className="flex items-start gap-ds-08">
      <DemoButton speed="working" color="accent" label="Accent" />
      <DemoButton speed="working" color="success" label="Success" />
      <DemoButton speed="working" color="error" label="Error" />
      <DemoButton speed="working" color="warning" label="Warning" />
      <DemoButton speed="working" color="neutral" label="Neutral" />
    </div>
  ),
}

import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IconList, IconLayoutGrid, IconCalendar, IconChartBar, IconUsers } from '@tabler/icons-react'
import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
  type SegmentedControlVariant,
} from './segmented-control'

// ── Mock options ────────────────────────────────────────────

const textOptions: SegmentedControlOption[] = [
  { id: 'board', text: 'Board' },
  { id: 'list', text: 'List' },
  { id: 'calendar', text: 'Calendar' },
]

const iconOptions: SegmentedControlOption[] = [
  { id: 'board', text: 'Board', icon: IconLayoutGrid },
  { id: 'list', text: 'List', icon: IconList },
  { id: 'calendar', text: 'Calendar', icon: IconCalendar },
]

const mixedOptions: SegmentedControlOption[] = [
  { id: 'overview', text: 'Overview', icon: IconChartBar },
  { id: 'members', text: 'Members', icon: IconUsers },
  { id: 'settings', text: 'Settings' },
]

const twoOptions: SegmentedControlOption[] = [
  { id: 'active', text: 'Active' },
  { id: 'archived', text: 'Archived' },
]

// ── Meta ────────────────────────────────────────────────────

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'tonal'],
    },
    disabled: {
      control: 'boolean',
    },
    onSelect: { action: 'onSelect' },
  },
}
export default meta
type Story = StoryObj<typeof SegmentedControl>

// ── Helper wrapper for controlled state ─────────────────────

function ControlledDemo({
  size = 'md',
  variant = 'filled',
  options = textOptions,
  disabled = false,
  defaultId,
}: {
  size?: SegmentedControlSize
  variant?: SegmentedControlVariant
  options?: SegmentedControlOption[]
  disabled?: boolean
  defaultId?: string
}) {
  const [selectedId, setSelectedId] = useState(defaultId ?? options[0].id)

  return (
    <SegmentedControl
      size={size}
      variant={variant}
      options={options}
      selectedId={selectedId}
      onSelect={setSelectedId}
      disabled={disabled}
    />
  )
}

// ── Stories ──────────────────────────────────────────────────

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'filled',
    options: textOptions,
    selectedId: 'board',
  },
}

export const Tonal: Story = {
  args: {
    size: 'md',
    variant: 'tonal',
    options: textOptions,
    selectedId: 'board',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'filled',
    options: textOptions,
    selectedId: 'list',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'filled',
    options: textOptions,
    selectedId: 'calendar',
  },
}

export const WithIcons: Story = {
  args: {
    size: 'md',
    variant: 'filled',
    options: iconOptions,
    selectedId: 'board',
  },
}

export const WithIconsTonal: Story = {
  args: {
    size: 'md',
    variant: 'tonal',
    options: iconOptions,
    selectedId: 'list',
  },
}

export const MixedIconsAndText: Story = {
  args: {
    size: 'md',
    variant: 'filled',
    options: mixedOptions,
    selectedId: 'overview',
  },
}

export const TwoOptions: Story = {
  args: {
    size: 'md',
    variant: 'filled',
    options: twoOptions,
    selectedId: 'active',
  },
}

export const Disabled: Story = {
  args: {
    size: 'md',
    variant: 'filled',
    options: textOptions,
    selectedId: 'board',
    disabled: true,
  },
}

export const DisabledTonal: Story = {
  args: {
    size: 'md',
    variant: 'tonal',
    options: iconOptions,
    selectedId: 'list',
    disabled: true,
  },
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
}

export const ControlledWithIcons: Story = {
  render: () => <ControlledDemo options={iconOptions} />,
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-text-secondary">
          Small
        </p>
        <ControlledDemo size="sm" options={iconOptions} />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-text-secondary">
          Medium (default)
        </p>
        <ControlledDemo size="md" options={iconOptions} />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-text-secondary">
          Large
        </p>
        <ControlledDemo size="lg" options={iconOptions} />
      </div>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Filled variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-text-primary">
          Filled
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="filled" options={iconOptions} />
          <ControlledDemo size="md" variant="filled" options={iconOptions} />
          <ControlledDemo size="lg" variant="filled" options={iconOptions} />
        </div>
      </div>

      {/* Tonal variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-text-primary">
          Tonal
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="tonal" options={iconOptions} />
          <ControlledDemo size="md" variant="tonal" options={iconOptions} />
          <ControlledDemo size="lg" variant="tonal" options={iconOptions} />
        </div>
      </div>

      {/* Text only */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-text-primary">
          Text only
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="filled" options={textOptions} />
          <ControlledDemo size="md" variant="tonal" options={textOptions} />
        </div>
      </div>

      {/* Disabled */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-text-primary">
          Disabled
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="filled" options={iconOptions} disabled />
          <ControlledDemo size="md" variant="tonal" options={iconOptions} disabled />
        </div>
      </div>
    </div>
  ),
}

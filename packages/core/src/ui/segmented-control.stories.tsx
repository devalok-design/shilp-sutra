import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from 'storybook/test'
import { IconList, IconLayoutGrid, IconCalendar, IconChartBar, IconUsers } from '@tabler/icons-react'
import {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
  type SegmentedControlVariant,
} from './segmented-control'

// -- Mock options ----

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

// -- Meta ----

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/Form Controls/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs', 'stable'],
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
      options: ['default', 'accent'],
    },
    disabled: {
      control: 'boolean',
    },
    onSelect: { action: 'onSelect' },
  },
}
export default meta
type Story = StoryObj<typeof SegmentedControl>

// -- Helper wrapper for controlled state ----

function ControlledDemo({
  size = 'md',
  variant = 'default',
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

// -- Stories ----

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'default',
    options: textOptions,
    selectedId: 'board',
  },
}

export const Accent: Story = {
  args: {
    size: 'md',
    variant: 'accent',
    options: textOptions,
    selectedId: 'board',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'accent',
    options: textOptions,
    selectedId: 'list',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'accent',
    options: textOptions,
    selectedId: 'calendar',
  },
}

export const WithIcons: Story = {
  args: {
    size: 'md',
    variant: 'accent',
    options: iconOptions,
    selectedId: 'board',
  },
}

export const WithIconsDefault: Story = {
  args: {
    size: 'md',
    variant: 'default',
    options: iconOptions,
    selectedId: 'list',
  },
}

export const MixedIconsAndText: Story = {
  args: {
    size: 'md',
    variant: 'accent',
    options: mixedOptions,
    selectedId: 'overview',
  },
}

export const TwoOptions: Story = {
  args: {
    size: 'md',
    variant: 'accent',
    options: twoOptions,
    selectedId: 'active',
  },
}

export const Disabled: Story = {
  args: {
    size: 'md',
    variant: 'accent',
    options: textOptions,
    selectedId: 'board',
    disabled: true,
  },
}

export const DisabledDefault: Story = {
  args: {
    size: 'md',
    variant: 'default',
    options: iconOptions,
    selectedId: 'list',
    disabled: true,
  },
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Board is selected by default (role="tab", not radio)
    const boardBtn = canvas.getByRole('tab', { name: /board/i })
    await expect(boardBtn).toHaveAttribute('aria-selected', 'true')
    // Click "List" to select it
    const listBtn = canvas.getByRole('tab', { name: /list/i })
    await userEvent.click(listBtn)
    await expect(listBtn).toHaveAttribute('aria-selected', 'true')
    await expect(boardBtn).toHaveAttribute('aria-selected', 'false')
  },
}

export const ControlledWithIcons: Story = {
  render: () => <ControlledDemo options={iconOptions} />,
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Small
        </p>
        <ControlledDemo size="sm" options={iconOptions} />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
          Medium (default)
        </p>
        <ControlledDemo size="md" options={iconOptions} />
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-accent font-semibold text-surface-fg-muted">
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
      {/* Default variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Default
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="default" options={iconOptions} />
          <ControlledDemo size="md" variant="default" options={iconOptions} />
          <ControlledDemo size="lg" variant="default" options={iconOptions} />
        </div>
      </div>

      {/* Accent variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Accent
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="accent" options={iconOptions} />
          <ControlledDemo size="md" variant="accent" options={iconOptions} />
          <ControlledDemo size="lg" variant="accent" options={iconOptions} />
        </div>
      </div>

      {/* Text only */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Text only
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="accent" options={textOptions} />
          <ControlledDemo size="md" variant="default" options={textOptions} />
        </div>
      </div>

      {/* Disabled */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Disabled
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="accent" options={iconOptions} disabled />
          <ControlledDemo size="md" variant="default" options={iconOptions} disabled />
        </div>
      </div>
    </div>
  ),
}

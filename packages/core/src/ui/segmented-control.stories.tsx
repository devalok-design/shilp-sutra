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

const iconOnlyOptions: SegmentedControlOption[] = [
  { id: 'board', icon: IconLayoutGrid, ariaLabel: 'Board' },
  { id: 'list', icon: IconList, ariaLabel: 'List' },
  { id: 'calendar', icon: IconCalendar, ariaLabel: 'Calendar' },
]

// -- Meta ----

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Buttons/SegmentedControl',
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
      options: ['soft', 'solid'],
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    onValueChange: { action: 'onValueChange' },
  },
}
export default meta
type Story = StoryObj<typeof SegmentedControl>

// -- Helper wrapper for controlled state ----

function ControlledDemo({
  size = 'md',
  variant = 'soft',
  options = textOptions,
  disabled = false,
  fullWidth = false,
  defaultId,
}: {
  size?: SegmentedControlSize
  variant?: SegmentedControlVariant
  options?: SegmentedControlOption[]
  disabled?: boolean
  fullWidth?: boolean
  defaultId?: string
}) {
  const [selectedId, setSelectedId] = useState(defaultId ?? options[0].id)

  return (
    <SegmentedControl
      size={size}
      variant={variant}
      options={options}
      value={selectedId}
      onValueChange={setSelectedId}
      disabled={disabled}
      fullWidth={fullWidth}
    />
  )
}

// -- Stories ----

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'soft',
    options: textOptions,
    value: 'board',
  },
}

export const Solid: Story = {
  args: {
    size: 'md',
    variant: 'solid',
    options: textOptions,
    value: 'board',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'solid',
    options: textOptions,
    value: 'list',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'solid',
    options: textOptions,
    value: 'calendar',
  },
}

export const WithIcons: Story = {
  args: {
    size: 'md',
    variant: 'solid',
    options: iconOptions,
    value: 'board',
  },
}

export const WithIconsDefault: Story = {
  args: {
    size: 'md',
    variant: 'soft',
    options: iconOptions,
    value: 'list',
  },
}

export const MixedIconsAndText: Story = {
  args: {
    size: 'md',
    variant: 'solid',
    options: mixedOptions,
    value: 'overview',
  },
}

export const TwoOptions: Story = {
  args: {
    size: 'md',
    variant: 'solid',
    options: twoOptions,
    value: 'active',
  },
}

export const FullWidth: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <ControlledDemo variant="soft" options={textOptions} fullWidth />
      <ControlledDemo variant="solid" options={twoOptions} fullWidth />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'With `fullWidth`, segments split the container equally instead of hugging their content — a 3-item switcher gives each a third, a 2-item toggle splits 50/50. Use for view switchers and toolbar toggles that should fill their column.',
      },
    },
  },
}

export const IconOnly: Story = {
  render: () => <ControlledDemo options={iconOnlyOptions} />,
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only segments: omit `text` and set `ariaLabel` on each option so screen readers still announce a meaningful name.',
      },
    },
  },
}

export const RTL: Story = {
  render: () => (
    <div dir="rtl">
      <ControlledDemo options={iconOptions} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Right-to-left: Arrow keys track reading order (ArrowLeft moves to the next option, ArrowRight to the previous). The thumb slides accordingly.',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    size: 'md',
    variant: 'solid',
    options: textOptions,
    value: 'board',
    disabled: true,
  },
}

export const DisabledDefault: Story = {
  args: {
    size: 'md',
    variant: 'soft',
    options: iconOptions,
    value: 'list',
    disabled: true,
  },
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Board is selected by default (radiogroup/radio semantics)
    const boardBtn = canvas.getByRole('radio', { name: /board/i })
    await expect(boardBtn).toHaveAttribute('aria-checked', 'true')
    // Click "List" to select it
    const listBtn = canvas.getByRole('radio', { name: /list/i })
    await userEvent.click(listBtn)
    await expect(listBtn).toHaveAttribute('aria-checked', 'true')
    await expect(boardBtn).toHaveAttribute('aria-checked', 'false')
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
      {/* Soft variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Soft
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="soft" options={iconOptions} />
          <ControlledDemo size="md" variant="soft" options={iconOptions} />
          <ControlledDemo size="lg" variant="soft" options={iconOptions} />
        </div>
      </div>

      {/* Solid variant */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Solid
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="sm" variant="solid" options={iconOptions} />
          <ControlledDemo size="md" variant="solid" options={iconOptions} />
          <ControlledDemo size="lg" variant="solid" options={iconOptions} />
        </div>
      </div>

      {/* Text only */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Text only
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="solid" options={textOptions} />
          <ControlledDemo size="md" variant="soft" options={textOptions} />
        </div>
      </div>

      {/* Disabled */}
      <div>
        <p className="mb-ds-04 text-ds-md font-accent font-semibold text-surface-fg">
          Disabled
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlledDemo size="md" variant="solid" options={iconOptions} disabled />
          <ControlledDemo size="md" variant="soft" options={iconOptions} disabled />
        </div>
      </div>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { SplitButton } from './split-button'
import { Icon } from './icon'
import { IconSend, IconDownload, IconUpload, IconRocket } from '@tabler/icons-react'

const meta: Meta<typeof SplitButton> = {
  title: 'Components/Buttons/SplitButton',
  component: SplitButton,
  tags: ['autodocs', 'stable'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof SplitButton>

const sampleDropdown = (
  <div className="p-ds-02 min-w-[180px]">
    <p className="px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">Options</p>
    <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
      Option A
    </button>
    <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
      Option B
    </button>
    <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
      Option C
    </button>
  </div>
)

// ── Default ─────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    children: 'Save',
    onClick: fn(),
    dropdownContent: sampleDropdown,
  },
}

// ── With Icon ───────────────────────────────────────────────────

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon icon={IconSend} size="sm" />
        Send
      </>
    ),
    onClick: fn(),
    dropdownContent: sampleDropdown,
  },
}

// ── Icon Only ───────────────────────────────────────────────────

export const IconOnly: Story = {
  args: {
    children: <Icon icon={IconSend} size="md" />,
    onClick: fn(),
    size: 'icon-md',
    'aria-label': 'Send',
    dropdownContent: sampleDropdown,
  },
}

// ── Variants ────────────────────────────────────────────────────

export const Solid: Story = {
  args: { children: 'Deploy', onClick: fn(), variant: 'solid', dropdownContent: sampleDropdown },
}

export const Soft: Story = {
  args: { children: 'Export', onClick: fn(), variant: 'soft', dropdownContent: sampleDropdown },
}

export const Outline: Story = {
  args: { children: 'Download', onClick: fn(), variant: 'outline', dropdownContent: sampleDropdown },
}

// ── Colors ──────────────────────────────────────────────────────

export const Error: Story = {
  args: { children: 'Delete', onClick: fn(), color: 'error', dropdownContent: sampleDropdown },
}

export const Success: Story = {
  args: { children: 'Approve', onClick: fn(), color: 'success', dropdownContent: sampleDropdown },
}

export const Neutral: Story = {
  args: { children: 'More', onClick: fn(), color: 'neutral', dropdownContent: sampleDropdown },
}

// ── Sizes ───────────────────────────────────────────────────────

export const SizeXS: Story = {
  args: { children: 'Save', onClick: fn(), size: 'xs', dropdownContent: sampleDropdown },
}

export const SizeSM: Story = {
  args: { children: 'Save', onClick: fn(), size: 'sm', dropdownContent: sampleDropdown },
}

export const SizeMD: Story = {
  args: { children: 'Save', onClick: fn(), size: 'md', dropdownContent: sampleDropdown },
}

// ── Disabled ────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { children: 'Save', onClick: fn(), disabled: true, dropdownContent: sampleDropdown },
}

// ── All Variants ────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['solid', 'soft', 'outline'] as const).map((variant) => (
        <div key={variant} className="flex items-center gap-ds-04">
          <span className="w-16 text-ds-xs text-surface-fg-subtle font-medium">{variant}</span>
          {(['accent', 'error', 'success', 'warning', 'neutral'] as const).map((color) => (
            <SplitButton
              key={color}
              variant={variant}
              color={color}
              onClick={() => {}}
              dropdownContent={sampleDropdown}
            >
              {color}
            </SplitButton>
          ))}
        </div>
      ))}
    </div>
  ),
}

// ── Dropdown Side Bottom ────────────────────────────────────────

export const DropdownBottom: Story = {
  args: {
    children: 'Deploy',
    onClick: fn(),
    placement: 'bottom-end',
    dropdownContent: sampleDropdown,
  },
}

// ── Trigger Side ────────────────────────────────────────────────

export const TriggerLeft: Story = {
  args: {
    children: 'Deploy',
    onClick: fn(),
    triggerSide: 'left',
    dropdownContent: sampleDropdown,
  },
}

export const TriggerLeftSoft: Story = {
  args: {
    children: 'Export',
    onClick: fn(),
    triggerSide: 'left',
    variant: 'soft',
    dropdownContent: sampleDropdown,
  },
}

// ── Custom Trigger Width ────────────────────────────────────────

export const WiderTrigger: Story = {
  args: {
    children: 'Save',
    onClick: fn(),
    triggerWidth: 40,
    dropdownContent: sampleDropdown,
  },
}

// ── Real-World: Send / Schedule ─────────────────────────────────

export const SendSchedule: Story = {
  render: () => (
    <SplitButton
      onClick={() => alert('Sent!')}
      aria-label="Send"
      dropdownContent={
        <div className="p-ds-02 min-w-[240px]">
          <p className="px-ds-03 py-ds-01 text-ds-xs font-medium text-surface-fg-subtle">Schedule send</p>
          <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
            Tomorrow morning · 9:00 AM
          </button>
          <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
            Tomorrow afternoon · 1:00 PM
          </button>
          <button className="flex w-full items-center gap-ds-03 rounded-ds-md px-ds-03 py-ds-02b text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors">
            Next Monday · 9:00 AM
          </button>
        </div>
      }
    >
      <Icon icon={IconSend} size="sm" />
      Send
    </SplitButton>
  ),
}

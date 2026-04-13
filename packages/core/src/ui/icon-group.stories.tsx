import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconGroup } from './icon-group'
import { Icon } from './icon'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconLink,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconPlus,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react'

const meta: Meta<typeof IconGroup> = {
  title: 'Components/Data Display/IconGroup',
  component: IconGroup,
  tags: ['autodocs', 'stable'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    stroke: { control: 'select', options: ['light', 'regular', 'bold'] },
    gap: { control: 'select', options: ['tight', 'default', 'loose'] },
  },
}
export default meta
type Story = StoryObj<typeof IconGroup>

/* ── 1. Default ─────────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => (
    <IconGroup>
      <Icon icon={IconPlus} />
      <Icon icon={IconEdit} />
      <Icon icon={IconTrash} />
    </IconGroup>
  ),
}

/* ── 2. Toolbar Role ────────────────────────────────────────────────── */

export const Toolbar: Story = {
  render: () => (
    <div className="inline-flex rounded-ds-md border border-surface-border p-ds-01">
      <IconGroup size="md" stroke="regular" gap="tight" role="toolbar" label="Text formatting">
        <Icon icon={IconBold} />
        <Icon icon={IconItalic} />
        <Icon icon={IconUnderline} />
        <Icon icon={IconStrikethrough} />
        <Icon icon={IconLink} />
      </IconGroup>
    </div>
  ),
}

/* ── 3. Gap Variants ────────────────────────────────────────────────── */

export const GapVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['tight', 'default', 'loose'] as const).map((g) => (
        <div key={g} className="flex items-center gap-ds-04">
          <span className="w-16 text-xs text-text-secondary">{g}</span>
          <IconGroup gap={g}>
            <Icon icon={IconAlignLeft} />
            <Icon icon={IconAlignCenter} />
            <Icon icon={IconAlignRight} />
          </IconGroup>
        </div>
      ))}
    </div>
  ),
}

/* ── 4. Size Propagation ────────────────────────────────────────────── */

export const SizePropagation: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} className="flex items-center gap-ds-04">
          <span className="w-10 text-xs text-text-secondary">{s}</span>
          <IconGroup size={s}>
            <Icon icon={IconBold} />
            <Icon icon={IconItalic} />
            <Icon icon={IconUnderline} />
          </IconGroup>
        </div>
      ))}
    </div>
  ),
}

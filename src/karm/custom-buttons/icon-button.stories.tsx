import type { Meta, StoryObj } from '@storybook/react'
import {
  IconPlus,
  IconSettings,
  IconPencil,
  IconTrash,
  IconX,
  IconDotsVertical,
  IconSearch,
  IconBell,
  IconHeart,
  IconShare,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { IconButton } from './icon-button'

const meta: Meta<typeof IconButton> = {
  title: 'Karm/CustomButtons/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the icon button',
    },
    icon: {
      control: false,
      description: 'Icon element to render',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element using Radix Slot',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
    asChild: false,
  },
}
export default meta

type Story = StoryObj<typeof IconButton>

// --- Size Variants ---

export const Small: Story = {
  args: {
    size: 'small',
    icon: <IconSettings size={20} />,
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
    icon: <IconSettings size={24} />,
  },
}

export const Large: Story = {
  args: {
    size: 'large',
    icon: <IconSettings size={24} />,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="small" icon={<IconSettings size={20} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="medium" icon={<IconSettings size={24} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="large" icon={<IconSettings size={24} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Large</span>
      </div>
    </div>
  ),
}

// --- Different Icons ---

export const AddIcon: Story = {
  args: {
    size: 'medium',
    icon: <IconPlus size={24} />,
  },
}

export const EditIcon: Story = {
  args: {
    size: 'medium',
    icon: <IconPencil size={24} />,
  },
}

export const DeleteIcon: Story = {
  args: {
    size: 'medium',
    icon: <IconTrash size={24} />,
  },
}

export const CloseIcon: Story = {
  args: {
    size: 'medium',
    icon: <IconX size={24} />,
  },
}

export const MoreIcon: Story = {
  args: {
    size: 'medium',
    icon: <IconDotsVertical size={24} />,
  },
}

export const IconGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <IconButton icon={<IconPlus size={24} />} />
      <IconButton icon={<IconSettings size={24} />} />
      <IconButton icon={<IconPencil size={24} />} />
      <IconButton icon={<IconTrash size={24} />} />
      <IconButton icon={<IconX size={24} />} />
      <IconButton icon={<IconDotsVertical size={24} />} />
      <IconButton icon={<IconSearch size={24} />} />
      <IconButton icon={<IconBell size={24} />} />
      <IconButton icon={<IconHeart size={24} />} />
      <IconButton icon={<IconShare size={24} />} />
      <IconButton icon={<IconCopy size={24} />} />
      <IconButton icon={<IconChevronLeft size={24} />} />
      <IconButton icon={<IconChevronRight size={24} />} />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledSmall: Story = {
  args: {
    size: 'small',
    icon: <IconSettings size={20} />,
    disabled: true,
  },
}

export const DisabledMedium: Story = {
  args: {
    size: 'medium',
    icon: <IconSettings size={24} />,
    disabled: true,
  },
}

export const DisabledLarge: Story = {
  args: {
    size: 'large',
    icon: <IconSettings size={24} />,
    disabled: true,
  },
}

export const AllSizesDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="small" icon={<IconSettings size={20} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="medium" icon={<IconSettings size={24} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="large" icon={<IconSettings size={24} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Large</span>
      </div>
    </div>
  ),
}

// --- With Children (instead of icon prop) ---

export const WithChildren: Story = {
  render: () => (
    <IconButton size="medium">
      <IconHeart size={24} />
    </IconButton>
  ),
}

// --- IconNavigation Pattern ---

export const NavigationPair: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton size="medium" icon={<IconChevronLeft size={24} />} />
      <span style={{ fontSize: '14px', color: 'var(--text-primary, #333)', minWidth: '80px', textAlign: 'center' }}>
        Page 1 of 5
      </span>
      <IconButton size="medium" icon={<IconChevronRight size={24} />} />
    </div>
  ),
}

// --- Toolbar Pattern ---

export const Toolbar: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '8px',
        border: '1px solid var(--color-border-default, #e0e0e0)',
      }}
    >
      <IconButton size="small" icon={<IconPencil size={20} />} />
      <IconButton size="small" icon={<IconCopy size={20} />} />
      <IconButton size="small" icon={<IconShare size={20} />} />
      <div style={{ width: '1px', height: '20px', background: 'var(--color-border-default, #e0e0e0)', margin: '0 4px' }} />
      <IconButton size="small" icon={<IconTrash size={20} />} />
    </div>
  ),
}

// --- Playground ---

export const Playground: Story = {
  args: {
    size: 'medium',
    icon: <IconSettings size={24} />,
    disabled: false,
  },
}

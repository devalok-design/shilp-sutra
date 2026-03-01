import type { Meta, StoryObj } from '@storybook/react'
import {
  Plus,
  Settings,
  Pencil,
  Trash2,
  X,
  MoreVertical,
  Search,
  Bell,
  Heart,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
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
    icon: <Settings size={20} />,
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
    icon: <Settings size={24} />,
  },
}

export const Large: Story = {
  args: {
    size: 'large',
    icon: <Settings size={24} />,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="small" icon={<Settings size={20} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="medium" icon={<Settings size={24} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="large" icon={<Settings size={24} />} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Large</span>
      </div>
    </div>
  ),
}

// --- Different Icons ---

export const AddIcon: Story = {
  args: {
    size: 'medium',
    icon: <Plus size={24} />,
  },
}

export const EditIcon: Story = {
  args: {
    size: 'medium',
    icon: <Pencil size={24} />,
  },
}

export const DeleteIcon: Story = {
  args: {
    size: 'medium',
    icon: <Trash2 size={24} />,
  },
}

export const CloseIcon: Story = {
  args: {
    size: 'medium',
    icon: <X size={24} />,
  },
}

export const MoreIcon: Story = {
  args: {
    size: 'medium',
    icon: <MoreVertical size={24} />,
  },
}

export const IconGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
      <IconButton icon={<Plus size={24} />} />
      <IconButton icon={<Settings size={24} />} />
      <IconButton icon={<Pencil size={24} />} />
      <IconButton icon={<Trash2 size={24} />} />
      <IconButton icon={<X size={24} />} />
      <IconButton icon={<MoreVertical size={24} />} />
      <IconButton icon={<Search size={24} />} />
      <IconButton icon={<Bell size={24} />} />
      <IconButton icon={<Heart size={24} />} />
      <IconButton icon={<Share2 size={24} />} />
      <IconButton icon={<Copy size={24} />} />
      <IconButton icon={<ChevronLeft size={24} />} />
      <IconButton icon={<ChevronRight size={24} />} />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledSmall: Story = {
  args: {
    size: 'small',
    icon: <Settings size={20} />,
    disabled: true,
  },
}

export const DisabledMedium: Story = {
  args: {
    size: 'medium',
    icon: <Settings size={24} />,
    disabled: true,
  },
}

export const DisabledLarge: Story = {
  args: {
    size: 'large',
    icon: <Settings size={24} />,
    disabled: true,
  },
}

export const AllSizesDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="small" icon={<Settings size={20} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="medium" icon={<Settings size={24} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <IconButton size="large" icon={<Settings size={24} />} disabled />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Large</span>
      </div>
    </div>
  ),
}

// --- With Children (instead of icon prop) ---

export const WithChildren: Story = {
  render: () => (
    <IconButton size="medium">
      <Heart size={24} />
    </IconButton>
  ),
}

// --- Navigation Pattern ---

export const NavigationPair: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <IconButton size="medium" icon={<ChevronLeft size={24} />} />
      <span style={{ fontSize: '14px', color: 'var(--text-primary, #333)', minWidth: '80px', textAlign: 'center' }}>
        Page 1 of 5
      </span>
      <IconButton size="medium" icon={<ChevronRight size={24} />} />
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
        border: '1px solid var(--border-primary, #e0e0e0)',
      }}
    >
      <IconButton size="small" icon={<Pencil size={20} />} />
      <IconButton size="small" icon={<Copy size={20} />} />
      <IconButton size="small" icon={<Share2 size={20} />} />
      <div style={{ width: '1px', height: '20px', background: 'var(--border-primary, #e0e0e0)', margin: '0 4px' }} />
      <IconButton size="small" icon={<Trash2 size={20} />} />
    </div>
  ),
}

// --- Playground ---

export const Playground: Story = {
  args: {
    size: 'medium',
    icon: <Settings size={24} />,
    disabled: false,
  },
}

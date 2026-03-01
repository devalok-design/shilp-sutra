import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Pencil, MessageSquare, Heart, Share2 } from 'lucide-react'
import { FAB } from './FAB'

const meta: Meta<typeof FAB> = {
  title: 'Karm/CustomButtons/FAB',
  component: FAB,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'big'],
      description: 'Size of the floating action button',
    },
    icon: {
      control: false,
      description: 'Icon element to render inside the FAB',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the FAB is disabled',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible label for the button',
    },
  },
  args: {
    disabled: false,
    'aria-label': 'Floating action button',
  },
}
export default meta

type Story = StoryObj<typeof FAB>

// --- Size Variants ---

export const Small: Story = {
  args: {
    size: 'small',
    icon: <Plus size={20} />,
    'aria-label': 'Add item',
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
    icon: <Plus size={24} />,
    'aria-label': 'Add item',
  },
}

export const Big: Story = {
  args: {
    size: 'big',
    icon: <Plus size={28} />,
    'aria-label': 'Add item',
  },
}

// --- All Sizes Side by Side ---

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="small" icon={<Plus size={20} />} aria-label="Small FAB" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="medium" icon={<Plus size={24} />} aria-label="Medium FAB" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="big" icon={<Plus size={28} />} aria-label="Big FAB" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Big</span>
      </div>
    </div>
  ),
}

// --- Different Icons ---

export const EditIcon: Story = {
  args: {
    size: 'medium',
    icon: <Pencil size={24} />,
    'aria-label': 'Edit',
  },
}

export const ChatIcon: Story = {
  args: {
    size: 'medium',
    icon: <MessageSquare size={24} />,
    'aria-label': 'Open chat',
  },
}

export const VariousIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <FAB size="medium" icon={<Plus size={24} />} aria-label="Add" />
      <FAB size="medium" icon={<Pencil size={24} />} aria-label="Edit" />
      <FAB size="medium" icon={<MessageSquare size={24} />} aria-label="Chat" />
      <FAB size="medium" icon={<Heart size={24} />} aria-label="Favorite" />
      <FAB size="medium" icon={<Share2 size={24} />} aria-label="Share" />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledSmall: Story = {
  args: {
    size: 'small',
    icon: <Plus size={20} />,
    disabled: true,
    'aria-label': 'Add item (disabled)',
  },
}

export const DisabledMedium: Story = {
  args: {
    size: 'medium',
    icon: <Plus size={24} />,
    disabled: true,
    'aria-label': 'Add item (disabled)',
  },
}

export const DisabledBig: Story = {
  args: {
    size: 'big',
    icon: <Plus size={28} />,
    disabled: true,
    'aria-label': 'Add item (disabled)',
  },
}

export const AllSizesDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="small" icon={<Plus size={20} />} disabled aria-label="Small disabled" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="medium" icon={<Plus size={24} />} disabled aria-label="Medium disabled" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <FAB size="big" icon={<Plus size={28} />} disabled aria-label="Big disabled" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #666)' }}>Big</span>
      </div>
    </div>
  ),
}

// --- Playground ---

export const Playground: Story = {
  args: {
    size: 'medium',
    icon: <Plus size={24} />,
    disabled: false,
    'aria-label': 'Floating action button',
  },
}

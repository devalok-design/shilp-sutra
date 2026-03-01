import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Pencil, MessageSquare, Navigation, Upload } from 'lucide-react'
import { ExtendedFAB } from './ExtendedFAB'

const meta: Meta<typeof ExtendedFAB> = {
  title: 'Karm/CustomButtons/ExtendedFAB',
  component: ExtendedFAB,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'big'],
      description: 'Size of the extended FAB',
    },
    color: {
      control: 'select',
      options: ['filled', 'tonal'],
      description: 'Color scheme of the extended FAB',
    },
    text: {
      control: 'text',
      description: 'Label text displayed next to the icon',
    },
    icon: {
      control: false,
      description: 'Icon element to render',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the extended FAB is disabled',
    },
  },
  args: {
    disabled: false,
  },
}
export default meta

type Story = StoryObj<typeof ExtendedFAB>

// --- Size Variants ---

export const SmallFilled: Story = {
  args: {
    size: 'small',
    color: 'filled',
    text: 'Create',
    icon: <Plus size={18} />,
  },
}

export const BigFilled: Story = {
  args: {
    size: 'big',
    color: 'filled',
    text: 'Create',
    icon: <Plus size={24} />,
  },
}

export const SmallTonal: Story = {
  args: {
    size: 'small',
    color: 'tonal',
    text: 'Create',
    icon: <Plus size={18} />,
  },
}

export const BigTonal: Story = {
  args: {
    size: 'big',
    color: 'tonal',
    text: 'Create',
    icon: <Plus size={24} />,
  },
}

// --- All Variants Grid ---

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary, #666)' }}>Filled</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ExtendedFAB size="small" color="filled" text="Small Filled" icon={<Plus size={18} />} />
          <ExtendedFAB size="big" color="filled" text="Big Filled" icon={<Plus size={24} />} />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary, #666)' }}>Tonal</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ExtendedFAB size="small" color="tonal" text="Small Tonal" icon={<Plus size={18} />} />
          <ExtendedFAB size="big" color="tonal" text="Big Tonal" icon={<Plus size={24} />} />
        </div>
      </div>
    </div>
  ),
}

// --- Different Icons and Labels ---

export const Compose: Story = {
  args: {
    size: 'big',
    color: 'filled',
    text: 'Compose',
    icon: <Pencil size={24} />,
  },
}

export const Navigate: Story = {
  args: {
    size: 'big',
    color: 'tonal',
    text: 'Navigate',
    icon: <Navigation size={24} />,
  },
}

export const NewChat: Story = {
  args: {
    size: 'small',
    color: 'filled',
    text: 'New Chat',
    icon: <MessageSquare size={18} />,
  },
}

export const Upload_: Story = {
  name: 'Upload',
  args: {
    size: 'small',
    color: 'tonal',
    text: 'Upload',
    icon: <Upload size={18} />,
  },
}

export const VariousLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <ExtendedFAB size="big" color="filled" text="Compose" icon={<Pencil size={24} />} />
      <ExtendedFAB size="big" color="tonal" text="Navigate" icon={<Navigation size={24} />} />
      <ExtendedFAB size="big" color="filled" text="New Chat" icon={<MessageSquare size={24} />} />
      <ExtendedFAB size="big" color="tonal" text="Upload" icon={<Upload size={24} />} />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledSmallFilled: Story = {
  args: {
    size: 'small',
    color: 'filled',
    text: 'Create',
    icon: <Plus size={18} />,
    disabled: true,
  },
}

export const DisabledBigTonal: Story = {
  args: {
    size: 'big',
    color: 'tonal',
    text: 'Create',
    icon: <Plus size={24} />,
    disabled: true,
  },
}

export const AllVariantsDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary, #666)' }}>Filled (Disabled)</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ExtendedFAB size="small" color="filled" text="Small Filled" icon={<Plus size={18} />} disabled />
          <ExtendedFAB size="big" color="filled" text="Big Filled" icon={<Plus size={24} />} disabled />
        </div>
      </div>
      <div>
        <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary, #666)' }}>Tonal (Disabled)</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ExtendedFAB size="small" color="tonal" text="Small Tonal" icon={<Plus size={18} />} disabled />
          <ExtendedFAB size="big" color="tonal" text="Big Tonal" icon={<Plus size={24} />} disabled />
        </div>
      </div>
    </div>
  ),
}

// --- Playground ---

export const Playground: Story = {
  args: {
    size: 'big',
    color: 'filled',
    text: 'Create',
    icon: <Plus size={24} />,
    disabled: false,
  },
}

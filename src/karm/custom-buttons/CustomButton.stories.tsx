import type { Meta, StoryObj } from '@storybook/react'
import { Plus, ArrowRight, Download, Send, Heart, Settings } from 'lucide-react'
import { CustomButton } from './CustomButton'

const meta: Meta<typeof CustomButton> = {
  title: 'Karm/CustomButtons/CustomButton',
  component: CustomButton,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['filled', 'tonal', 'outline', 'text'],
      description: 'Visual style of the button',
    },
    text: {
      control: 'text',
      description: 'Button label text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    shake: {
      control: 'boolean',
      description: 'Enable the shake animation',
    },
    leftIcon: {
      control: false,
      description: 'Icon rendered before the text',
    },
    rightIcon: {
      control: false,
      description: 'Icon rendered after the text',
    },
  },
  args: {
    text: 'Button',
    disabled: false,
    shake: false,
  },
}
export default meta

type Story = StoryObj<typeof CustomButton>

// --- Type Variants ---

export const Filled: Story = {
  args: {
    type: 'filled',
    text: 'Filled Button',
  },
}

export const Tonal: Story = {
  args: {
    type: 'tonal',
    text: 'Tonal Button',
  },
}

export const Outline: Story = {
  args: {
    type: 'outline',
    text: 'Outline Button',
  },
}

export const Text: Story = {
  args: {
    type: 'text',
    text: 'Text Button',
  },
}

// --- All Types Side by Side ---

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton type="filled" text="Filled" />
      <CustomButton type="tonal" text="Tonal" />
      <CustomButton type="outline" text="Outline" />
      <CustomButton type="text" text="Text" />
    </div>
  ),
}

// --- With Icons ---

export const WithLeftIcon: Story = {
  args: {
    type: 'filled',
    text: 'Add Item',
    leftIcon: <Plus size={18} />,
  },
}

export const WithRightIcon: Story = {
  args: {
    type: 'filled',
    text: 'Continue',
    rightIcon: <ArrowRight size={18} />,
  },
}

export const WithBothIcons: Story = {
  args: {
    type: 'tonal',
    text: 'Download',
    leftIcon: <Download size={18} />,
    rightIcon: <ArrowRight size={18} />,
  },
}

export const AllTypesWithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton type="filled" text="Send" leftIcon={<Send size={18} />} />
      <CustomButton type="tonal" text="Favorite" leftIcon={<Heart size={18} />} />
      <CustomButton type="outline" text="Settings" leftIcon={<Settings size={18} />} />
      <CustomButton type="text" text="Download" rightIcon={<Download size={18} />} />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledFilled: Story = {
  args: {
    type: 'filled',
    text: 'Disabled Filled',
    disabled: true,
  },
}

export const DisabledTonal: Story = {
  args: {
    type: 'tonal',
    text: 'Disabled Tonal',
    disabled: true,
  },
}

export const AllTypesDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton type="filled" text="Filled" disabled />
      <CustomButton type="tonal" text="Tonal" disabled />
      <CustomButton type="outline" text="Outline" disabled />
      <CustomButton type="text" text="Text" disabled />
    </div>
  ),
}

// --- Shake Animation ---

export const ShakeAnimation: Story = {
  args: {
    type: 'filled',
    text: 'Shake Me',
    shake: true,
  },
}

export const ShakeWithIcon: Story = {
  args: {
    type: 'tonal',
    text: 'Attention!',
    shake: true,
    leftIcon: <Heart size={18} />,
  },
}

export const ShakeDisabledNoEffect: Story = {
  name: 'Shake + Disabled (No Animation)',
  args: {
    type: 'filled',
    text: 'No Shake When Disabled',
    shake: true,
    disabled: true,
  },
}

// --- Playground ---

export const Playground: Story = {
  args: {
    type: 'filled',
    text: 'Playground',
    leftIcon: <Plus size={18} />,
    disabled: false,
    shake: false,
  },
}

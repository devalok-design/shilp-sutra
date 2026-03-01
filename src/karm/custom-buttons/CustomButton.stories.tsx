import type { Meta, StoryObj } from '@storybook/react'
import { Plus, ArrowRight, Download, Send, Heart, Settings } from 'lucide-react'
import { CustomButton } from './CustomButton'

const meta: Meta<typeof CustomButton> = {
  title: 'Karm/CustomButtons/CustomButton',
  component: CustomButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
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

// --- Variants ---

export const Filled: Story = {
  args: {
    variant: 'filled',
    text: 'Filled Button',
  },
}

export const Tonal: Story = {
  args: {
    variant: 'tonal',
    text: 'Tonal Button',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    text: 'Outline Button',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    text: 'Text Button',
  },
}

// --- All Variants Side by Side ---

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton variant="filled" text="Filled" />
      <CustomButton variant="tonal" text="Tonal" />
      <CustomButton variant="outline" text="Outline" />
      <CustomButton variant="text" text="Text" />
    </div>
  ),
}

// --- With Icons ---

export const WithLeftIcon: Story = {
  args: {
    variant: 'filled',
    text: 'Add Item',
    leftIcon: <Plus size={18} />,
  },
}

export const WithRightIcon: Story = {
  args: {
    variant: 'filled',
    text: 'Continue',
    rightIcon: <ArrowRight size={18} />,
  },
}

export const WithBothIcons: Story = {
  args: {
    variant: 'tonal',
    text: 'Download',
    leftIcon: <Download size={18} />,
    rightIcon: <ArrowRight size={18} />,
  },
}

export const AllVariantsWithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton variant="filled" text="Send" leftIcon={<Send size={18} />} />
      <CustomButton variant="tonal" text="Favorite" leftIcon={<Heart size={18} />} />
      <CustomButton variant="outline" text="Settings" leftIcon={<Settings size={18} />} />
      <CustomButton variant="text" text="Download" rightIcon={<Download size={18} />} />
    </div>
  ),
}

// --- Disabled States ---

export const DisabledFilled: Story = {
  args: {
    variant: 'filled',
    text: 'Disabled Filled',
    disabled: true,
  },
}

export const DisabledTonal: Story = {
  args: {
    variant: 'tonal',
    text: 'Disabled Tonal',
    disabled: true,
  },
}

export const AllVariantsDisabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <CustomButton variant="filled" text="Filled" disabled />
      <CustomButton variant="tonal" text="Tonal" disabled />
      <CustomButton variant="outline" text="Outline" disabled />
      <CustomButton variant="text" text="Text" disabled />
    </div>
  ),
}

// --- Shake Animation ---

export const ShakeAnimation: Story = {
  args: {
    variant: 'filled',
    text: 'Shake Me',
    shake: true,
  },
}

export const ShakeWithIcon: Story = {
  args: {
    variant: 'tonal',
    text: 'Attention!',
    shake: true,
    leftIcon: <Heart size={18} />,
  },
}

export const ShakeDisabledNoEffect: Story = {
  name: 'Shake + Disabled (No Animation)',
  args: {
    variant: 'filled',
    text: 'No Shake When Disabled',
    shake: true,
    disabled: true,
  },
}

// --- Playground ---

export const Playground: Story = {
  args: {
    variant: 'filled',
    text: 'Playground',
    leftIcon: <Plus size={18} />,
    disabled: false,
    shake: false,
  },
}

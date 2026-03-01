import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Core/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'ghost',
        'danger',
        'danger-ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon-sm', 'icon-md', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger',
  },
}

export const DangerGhost: Story = {
  args: {
    variant: 'danger-ghost',
    children: 'Danger Ghost',
  },
}

export const Outline: Story = {
  args: {
    variant: 'secondary',
    children: 'Outline',
  },
}

export const LinkVariant: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const IconSmall: Story = {
  args: {
    size: 'icon-sm',
    children: '+',
  },
}

export const IconMedium: Story = {
  args: {
    size: 'icon-md',
    children: '+',
  },
}

export const IconLarge: Story = {
  args: {
    size: 'icon-lg',
    children: '+',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="danger-ghost">Danger Ghost</Button>
      <Button variant="secondary">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-sm">+</Button>
      <Button size="icon-md">+</Button>
      <Button size="icon-lg">+</Button>
    </div>
  ),
}

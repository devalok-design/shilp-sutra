import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['neutral', 'blue', 'green', 'red', 'yellow', 'magenta', 'purple'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    dot: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Blue: Story = {
  args: {
    variant: 'blue',
    children: 'In Progress',
  },
}

export const Green: Story = {
  args: {
    variant: 'green',
    children: 'Completed',
  },
}

export const Red: Story = {
  args: {
    variant: 'red',
    children: 'Urgent',
  },
}

export const Yellow: Story = {
  args: {
    variant: 'yellow',
    children: 'Pending',
  },
}

export const Magenta: Story = {
  args: {
    variant: 'magenta',
    children: 'Review',
  },
}

export const Purple: Story = {
  args: {
    variant: 'purple',
    children: 'Design',
  },
}

export const WithDot: Story = {
  args: {
    variant: 'green',
    dot: true,
    children: 'Active',
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'blue',
    children: 'Tag',
    onDismiss: () => {},
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="green">Green</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="magenta">Magenta</Badge>
      <Badge variant="purple">Purple</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const WithDots: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="green" dot>Online</Badge>
      <Badge variant="yellow" dot>Away</Badge>
      <Badge variant="red" dot>Busy</Badge>
      <Badge variant="neutral" dot>Offline</Badge>
    </div>
  ),
}

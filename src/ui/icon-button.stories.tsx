import type { Meta, StoryObj } from '@storybook/react'
import {
  IconSettings,
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconBell,
  IconHeart,
  IconDotsVertical,
  IconX,
  IconMenu2,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react'
import { IconButton } from './icon-button'

const meta: Meta<typeof IconButton> = {
  title: 'UI/Core/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'danger-ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    shape: {
      control: 'radio',
      options: ['square', 'circle'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    variant: 'ghost',
    icon: <IconSettings size={20} />,
    'aria-label': 'Settings',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton
        variant="primary"
        icon={<IconPlus size={20} />}
        aria-label="Add item"
      />
      <IconButton
        variant="secondary"
        icon={<IconSearch size={20} />}
        aria-label="Search"
      />
      <IconButton
        variant="ghost"
        icon={<IconSettings size={20} />}
        aria-label="Settings"
      />
      <IconButton
        variant="danger"
        icon={<IconTrash size={20} />}
        aria-label="Delete"
      />
      <IconButton
        variant="danger-ghost"
        icon={<IconX size={20} />}
        aria-label="Dismiss"
      />
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton
        size="sm"
        variant="ghost"
        icon={<IconPlus size={16} />}
        aria-label="Add (small)"
      />
      <IconButton
        size="md"
        variant="ghost"
        icon={<IconPlus size={20} />}
        aria-label="Add (medium)"
      />
      <IconButton
        size="lg"
        variant="ghost"
        icon={<IconPlus size={24} />}
        aria-label="Add (large)"
      />
    </div>
  ),
}

export const Circle: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <IconButton
        shape="circle"
        variant="primary"
        icon={<IconPlus size={20} />}
        aria-label="Add"
      />
      <IconButton
        shape="circle"
        variant="secondary"
        icon={<IconBell size={20} />}
        aria-label="Notifications"
      />
      <IconButton
        shape="circle"
        variant="ghost"
        icon={<IconHeart size={20} />}
        aria-label="Favourite"
      />
      <IconButton
        shape="circle"
        variant="danger"
        icon={<IconTrash size={20} />}
        aria-label="Delete"
      />
    </div>
  ),
}

export const Loading: Story = {
  args: {
    loading: true,
    variant: 'ghost',
    icon: <IconSettings size={20} />,
    'aria-label': 'Settings',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: 'ghost',
    icon: <IconSettings size={20} />,
    'aria-label': 'Settings',
  },
}

export const Toolbar: Story = {
  render: () => (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
      <IconButton
        variant="ghost"
        size="md"
        icon={<IconChevronLeft size={20} />}
        aria-label="Go back"
      />
      <IconButton
        variant="ghost"
        size="md"
        icon={<IconChevronRight size={20} />}
        aria-label="Go forward"
      />
      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
      <IconButton
        variant="ghost"
        size="md"
        icon={<IconPencil size={20} />}
        aria-label="Edit"
      />
      <IconButton
        variant="ghost"
        size="md"
        icon={<IconTrash size={20} />}
        aria-label="Delete"
      />
      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
      <IconButton
        variant="ghost"
        size="md"
        icon={<IconDotsVertical size={20} />}
        aria-label="More options"
      />
    </div>
  ),
}

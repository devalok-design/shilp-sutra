import type { Meta, StoryObj } from '@storybook/react'
import { AvatarGroup } from './avatar-group'

const mockUsers = [
  { name: 'Aarav Sharma', image: null },
  { name: 'Priya Patel', image: null },
  { name: 'Rohan Gupta', image: null },
  { name: 'Ananya Verma', image: null },
  { name: 'Vikram Singh', image: null },
  { name: 'Neha Reddy', image: null },
  { name: 'Karan Mehta', image: null },
]

const meta: Meta<typeof AvatarGroup> = {
  title: 'Composed/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    max: {
      control: { type: 'number', min: 1, max: 10 },
    },
    showTooltip: {
      control: 'boolean',
    },
  },
}
export default meta
type Story = StoryObj<typeof AvatarGroup>

export const Default: Story = {
  args: {
    users: mockUsers.slice(0, 4),
  },
}

export const TwoUsers: Story = {
  args: {
    users: mockUsers.slice(0, 2),
  },
}

export const SingleUser: Story = {
  args: {
    users: [{ name: 'Aarav Sharma', image: null }],
  },
}

export const WithOverflow: Story = {
  args: {
    users: mockUsers,
    max: 4,
  },
}

export const MaxThree: Story = {
  args: {
    users: mockUsers,
    max: 3,
  },
}

export const MaxTwo: Story = {
  args: {
    users: mockUsers.slice(0, 5),
    max: 2,
  },
}

export const SizeSmall: Story = {
  args: {
    users: mockUsers.slice(0, 5),
    size: 'sm',
    max: 4,
  },
}

export const SizeDefault: Story = {
  args: {
    users: mockUsers.slice(0, 5),
    size: 'md',
    max: 4,
  },
}

export const SizeLarge: Story = {
  args: {
    users: mockUsers.slice(0, 5),
    size: 'lg',
    max: 4,
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 60, fontSize: 12, color: 'var(--color-surface-fg-muted)' }}>
          Small
        </span>
        <AvatarGroup users={mockUsers.slice(0, 5)} size="sm" max={4} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 60, fontSize: 12, color: 'var(--color-surface-fg-muted)' }}>
          Default
        </span>
        <AvatarGroup users={mockUsers.slice(0, 5)} size="md" max={4} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ width: 60, fontSize: 12, color: 'var(--color-surface-fg-muted)' }}>
          Large
        </span>
        <AvatarGroup users={mockUsers.slice(0, 5)} size="lg" max={4} />
      </div>
    </div>
  ),
}

export const NoTooltip: Story = {
  args: {
    users: mockUsers.slice(0, 4),
    showTooltip: false,
  },
}

export const WithImages: Story = {
  args: {
    users: [
      { name: 'Aarav Sharma', image: 'https://i.pravatar.cc/150?u=aarav' },
      { name: 'Priya Patel', image: 'https://i.pravatar.cc/150?u=priya' },
      { name: 'Rohan Gupta', image: 'https://i.pravatar.cc/150?u=rohan' },
      { name: 'Ananya Verma', image: 'https://i.pravatar.cc/150?u=ananya' },
      { name: 'Vikram Singh', image: 'https://i.pravatar.cc/150?u=vikram' },
    ],
    max: 4,
  },
}

export const MixedImagesAndFallbacks: Story = {
  args: {
    users: [
      { name: 'Aarav Sharma', image: 'https://i.pravatar.cc/150?u=aarav' },
      { name: 'Priya Patel', image: null },
      { name: 'Rohan Gupta', image: 'https://i.pravatar.cc/150?u=rohan' },
      { name: 'Ananya Verma', image: null },
    ],
  },
}

export const LargeTeam: Story = {
  args: {
    users: [
      { name: 'Aarav Sharma', image: null },
      { name: 'Priya Patel', image: null },
      { name: 'Rohan Gupta', image: null },
      { name: 'Ananya Verma', image: null },
      { name: 'Vikram Singh', image: null },
      { name: 'Neha Reddy', image: null },
      { name: 'Karan Mehta', image: null },
      { name: 'Diya Joshi', image: null },
      { name: 'Arjun Nair', image: null },
      { name: 'Meera Iyer', image: null },
      { name: 'Siddharth Das', image: null },
      { name: 'Kavya Rao', image: null },
    ],
    max: 5,
    size: 'md',
  },
}

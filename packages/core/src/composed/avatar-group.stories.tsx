import type { Meta, StoryObj } from '@storybook/react'
import { AvatarGroup } from './avatar-group'
import type { AvatarUser } from './avatar-group'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'

const mockUsers: AvatarUser[] = [
  { name: 'Aarav Sharma', image: null },
  { name: 'Priya Patel', image: null },
  { name: 'Rohan Gupta', image: null },
  { name: 'Ananya Verma', image: null },
  { name: 'Vikram Singh', image: null },
  { name: 'Neha Reddy', image: null },
  { name: 'Karan Mehta', image: null },
]

const mockUsersWithImages: AvatarUser[] = [
  { name: 'Aarav Sharma', image: 'https://i.pravatar.cc/150?u=aarav' },
  { name: 'Priya Patel', image: 'https://i.pravatar.cc/150?u=priya' },
  { name: 'Rohan Gupta', image: 'https://i.pravatar.cc/150?u=rohan' },
  { name: 'Ananya Verma', image: 'https://i.pravatar.cc/150?u=ananya' },
  { name: 'Vikram Singh', image: 'https://i.pravatar.cc/150?u=vikram' },
  { name: 'Neha Reddy', image: 'https://i.pravatar.cc/150?u=neha' },
  { name: 'Karan Mehta', image: 'https://i.pravatar.cc/150?u=karan' },
]

const meta: Meta<typeof AvatarGroup> = {
  title: 'Composed/AvatarGroup',
  component: AvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    max: {
      control: { type: 'number', min: 1, max: 10 },
    },
    showTooltip: {
      control: 'boolean',
    },
    borderColor: {
      control: 'select',
      options: ['surface-base', 'surface-raised', 'surface-1', 'surface-2'],
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

// ── New stories for Tasks 6 & 7 ──────────────────────────────────────────

export const HoverExpand: Story = {
  args: {
    users: mockUsers.slice(0, 5),
    max: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hover over the group to see avatars spread apart. Hover individual avatars for a spotlight effect.',
      },
    },
  },
}

export const InteractiveOverflow: Story = {
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
    ],
    max: 4,
    onOverflowClick: () => {
      // eslint-disable-next-line no-console
      console.log('Overflow clicked — open member list')
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'The "+N" badge becomes a clickable button when `onOverflowClick` is provided.',
      },
    },
  },
}

export const WithRings: Story = {
  args: {
    users: [
      { name: 'Aarav Sharma', image: null, ring: 'lead' },
      { name: 'Priya Patel', image: null, ring: 'admin' },
      { name: 'Rohan Gupta', image: null, ring: 'client' },
      { name: 'Ananya Verma', image: null },
      { name: 'Vikram Singh', image: null, ring: 'lead' },
    ],
    max: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Users with `ring` get a colored ring: lead (accent), admin (warning), client (info).',
      },
    },
  },
}

export const CustomRender: Story = {
  render: () => {
    const users: AvatarUser[] = [
      { name: 'Aarav Sharma', image: null },
      { name: 'Priya Patel', image: null },
      { name: 'Rohan Gupta', image: null },
    ]

    return (
      <div className="flex flex-col gap-ds-06">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <div key={s} className="flex items-center gap-ds-04">
            <span className="w-8 font-mono text-ds-xs text-surface-fg-muted">{s}</span>
            <AvatarGroup
              users={users}
              size={s}
              max={3}
              showTooltip={false}
              renderAvatar={(user, index) => (
                <Avatar
                  size={s}
                  badge={index === 0 ? 3 : undefined}
                >
                  <AvatarFallback className="font-body font-semibold" colorSeed={user.name}>
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
            />
          </div>
        ))}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Use `renderAvatar` for full control. The consumer\'s Avatar handles its own sizing — pass the same `size` prop. First avatar has a badge overlay.',
      },
    },
  },
}

export const AllSizesUpdated: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-08">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Fallback</p>
        <div className="flex flex-col gap-ds-04">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <div key={s} className="flex items-center gap-ds-04">
              <span className="w-8 font-mono text-ds-xs text-surface-fg-muted">{s}</span>
              <AvatarGroup users={mockUsers.slice(0, 5)} size={s} max={4} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">With Images</p>
        <div className="flex flex-col gap-ds-04">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
            <div key={s} className="flex items-center gap-ds-04">
              <span className="w-8 font-mono text-ds-xs text-surface-fg-muted">{s}</span>
              <AvatarGroup users={mockUsersWithImages.slice(0, 5)} size={s} max={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All five sizes from xs to xl — fallback initials and images side by side.',
      },
    },
  },
}

export const OnCardSurface: Story = {
  render: () => (
    <div
      className="rounded-ds-md border border-surface-border bg-surface-raised p-ds-05"
      style={{ maxWidth: 320 }}
    >
      <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg">
        Team Members
      </p>
      <AvatarGroup
        users={mockUsers.slice(0, 5)}
        max={4}
        borderColor="surface-raised"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'When placed on a `bg-surface-raised` card, use `borderColor="surface-raised"` so the avatar border blends with the card background.',
      },
    },
  },
}

export const ExpandLeft: Story = {
  render: () => (
    <div className="flex flex-col items-end gap-ds-04" style={{ maxWidth: 400 }}>
      <p className="text-ds-sm text-surface-fg-muted">
        Right-aligned group — expands leftward on hover
      </p>
      <AvatarGroup
        users={mockUsers.slice(0, 6)}
        max={4}
        expandDirection="left"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use `expandDirection="left"` when the group is right-aligned (e.g., task cards). Avatars expand leftward so they don\'t overflow the container.',
      },
    },
  },
}

export const ExpandAmounts: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['compact', 'default', 'wide'] as const).map((amount) => (
        <div key={amount} className="flex items-center gap-ds-04">
          <span className="w-16 text-ds-sm font-medium text-surface-fg-muted">{amount}</span>
          <AvatarGroup
            users={mockUsers.slice(0, 6)}
            max={4}
            expandAmount={amount}
          />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '`expandAmount` controls how far avatars spread: `compact` (subtle peek), `default` (full spread), `wide` (extra breathing room).',
      },
    },
  },
}

export const SizeComparison: Story = {
  name: 'Size Comparison (Group vs Standalone)',
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const users = mockUsers.slice(0, 3)
    return (
      <div className="space-y-ds-07">
        <p className="text-ds-md text-surface-fg-muted">
          Each row shows a standalone Avatar next to an AvatarGroup at the same size.
          They should be identical in dimensions.
        </p>
        {sizes.map((s) => (
          <div key={s} className="flex items-center gap-ds-06">
            <span className="w-8 text-ds-sm font-mono text-surface-fg-subtle">{s}</span>
            <div className="flex items-center gap-ds-03">
              <span className="text-ds-xs text-surface-fg-subtle">Standalone:</span>
              <Avatar size={s}>
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center gap-ds-03">
              <span className="text-ds-xs text-surface-fg-subtle">Group:</span>
              <AvatarGroup users={users} size={s} max={3} showTooltip={false} />
            </div>
          </div>
        ))}
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Visual regression check: standalone Avatar and AvatarGroup avatars must be the same size at every size prop value.',
      },
    },
  },
}

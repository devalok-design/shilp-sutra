import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import type { AvatarRing } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="User avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const SingleLetter: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>A</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-04">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <div className="flex items-center gap-ds-02">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
        <AvatarFallback>U1</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U2</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>U3</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const statuses = ['online', 'offline', 'busy', 'away'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Sizes (with fallback)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {sizes.map((size) => (
              <Avatar key={size} size={size}>
                <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Sizes (with image)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {sizes.map((size) => (
              <Avatar key={size} size={size}>
                <AvatarImage src="https://github.com/shadcn.png" alt={`Avatar ${size}`} />
                <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        {statuses.map((status) => (
          <div key={status}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">Status: {status} (fallback)</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {sizes.map((size) => (
                <Avatar key={`${status}-${size}`} size={size} status={status}>
                  <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <p className="mb-ds-03 mt-ds-04 text-ds-sm font-semibold text-surface-fg-muted capitalize">Status: {status} (image)</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {sizes.map((size) => (
                <Avatar key={`${status}-${size}-img`} size={size} status={status}>
                  <AvatarImage src="https://github.com/shadcn.png" alt={`${status} ${size}`} />
                  <AvatarFallback>{size.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

// ── New stories for avatar improvements ─────────────────────────────────────

export const FallbackColors: Story = {
  render: () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank']
    return (
      <div className="flex flex-col gap-ds-04">
        <p className="text-ds-sm font-semibold text-surface-fg-muted">
          Deterministic fallback colors — same name always gets the same color
        </p>
        <div className="flex flex-wrap items-center gap-ds-03">
          {names.map((name) => (
            <div key={name} className="flex flex-col items-center gap-ds-02">
              <Avatar size="lg">
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-ds-xs text-surface-fg-muted">{name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

export const AllRings: Story = {
  render: () => {
    const rings: Array<{ ring: AvatarRing; label: string }> = [
      { ring: 'none', label: 'None' },
      { ring: 'lead', label: 'Lead' },
      { ring: 'admin', label: 'Admin' },
      { ring: 'client', label: 'Client' },
    ]
    return (
      <div className="flex flex-col gap-ds-04">
        <p className="text-ds-sm font-semibold text-surface-fg-muted">
          Role rings with status dots
        </p>
        <div className="flex flex-wrap items-center gap-ds-06">
          {rings.map(({ ring, label }) => (
            <div key={ring} className="flex flex-col items-center gap-ds-02">
              <Avatar size="lg" ring={ring} status="online">
                <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-ds-xs text-surface-fg-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

export const WithNumberBadge: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <Avatar size="lg" badge={5}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg" badge={99}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
      <Avatar size="lg" badge={150}>
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithDotBadge: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <Avatar size="md" badge="dot">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar size="lg" badge="dot" status="online">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const Loading: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    return (
      <div className="flex flex-col gap-ds-04">
        <p className="text-ds-sm font-semibold text-surface-fg-muted">
          Loading skeletons at all sizes
        </p>
        <div className="flex flex-wrap items-center gap-ds-03">
          {sizes.map((size) => (
            <Avatar key={size} size={size} loading>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    )
  },
}

export const KitchenSink: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <p className="text-ds-sm font-semibold text-surface-fg-muted">
        Kitchen sink: ring + status + badge combined
      </p>
      <div className="flex items-center gap-ds-06">
        <Avatar size="lg" ring="lead" status="online" badge={3}>
          <AvatarImage src="https://github.com/shadcn.png" alt="Lead user" />
          <AvatarFallback>LD</AvatarFallback>
        </Avatar>
        <Avatar size="lg" ring="admin" status="busy" badge="dot">
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <Avatar size="lg" ring="client" status="away" badge={99}>
          <AvatarFallback>CL</AvatarFallback>
        </Avatar>
      </div>
    </div>
  ),
}

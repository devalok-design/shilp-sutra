import type { Meta, StoryObj } from '@storybook/react-vite'
import { BadgeIndicator } from './badge-indicator'
import { Icon } from './icon'
import { IconBell, IconMail, IconUser } from '@tabler/icons-react'

const meta: Meta<typeof BadgeIndicator> = {
  title: 'UI/Core/BadgeIndicator',
  component: BadgeIndicator,
  tags: ['autodocs', 'stable'],
  argTypes: {
    color: { control: 'select', options: ['error', 'success', 'warning', 'accent', 'info'] },
    placement: { control: 'select', options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'] },
  },
}
export default meta
type Story = StoryObj<typeof BadgeIndicator>

/* ── 1. Notification Dot ────────────────────────────────────────────── */

export const NotificationDot: Story = {
  render: () => (
    <BadgeIndicator dot>
      <Icon icon={IconBell} size="xl" />
    </BadgeIndicator>
  ),
}

/* ── 2. Count ───────────────────────────────────────────────────────── */

export const Count: Story = {
  render: () => (
    <BadgeIndicator count={5}>
      <Icon icon={IconMail} size="xl" />
    </BadgeIndicator>
  ),
}

/* ── 3. Max Overflow ────────────────────────────────────────────────── */

export const MaxOverflow: Story = {
  render: () => (
    <div className="flex items-center gap-ds-08">
      <BadgeIndicator count={99}>
        <Icon icon={IconMail} size="xl" />
      </BadgeIndicator>
      <BadgeIndicator count={150} max={99}>
        <Icon icon={IconMail} size="xl" />
      </BadgeIndicator>
    </div>
  ),
}

/* ── 4. Color Variants ──────────────────────────────────────────────── */

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-ds-08">
      {(['error', 'success', 'warning', 'accent', 'info'] as const).map((c) => (
        <div key={c} className="flex flex-col items-center gap-ds-03">
          <BadgeIndicator dot color={c}>
            <Icon icon={IconUser} size="xl" />
          </BadgeIndicator>
          <span className="text-xs text-text-secondary">{c}</span>
        </div>
      ))}
    </div>
  ),
}

/* ── 5. Placement Variants ──────────────────────────────────────────── */

export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-ds-10">
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((p) => (
        <div key={p} className="flex flex-col items-center gap-ds-03">
          <BadgeIndicator dot placement={p}>
            <div className="h-10 w-10 rounded-ds-full bg-surface-raised flex items-center justify-center">
              <Icon icon={IconUser} size="md" />
            </div>
          </BadgeIndicator>
          <span className="text-xs text-text-secondary">{p}</span>
        </div>
      ))}
    </div>
  ),
}

/* ── 6. Invisible ───────────────────────────────────────────────────── */

export const Invisible: Story = {
  render: () => (
    <div className="flex items-center gap-ds-08">
      <BadgeIndicator count={3}>
        <Icon icon={IconBell} size="xl" />
      </BadgeIndicator>
      <BadgeIndicator count={3} invisible>
        <Icon icon={IconBell} size="xl" />
      </BadgeIndicator>
    </div>
  ),
}

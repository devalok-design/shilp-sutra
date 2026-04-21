import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconBell, IconMail, IconUser } from '@tabler/icons-react'

import { BadgeIndicator } from './badge-indicator'
import { Icon } from './icon'

const meta: Meta<typeof BadgeIndicator> = {
  title: 'Components/Data Display/BadgeIndicator',
  component: BadgeIndicator,
  tags: ['autodocs', 'stable'],
  argTypes: {
    count: { control: 'number' },
    max: { control: 'number' },
    dot: { control: 'boolean' },
    color: { control: 'select', options: ['error', 'success', 'warning', 'accent', 'info'] },
    invisible: { control: 'boolean' },
    showZero: { control: 'boolean' },
    placement: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
  },
}
export default meta
type Story = StoryObj<typeof BadgeIndicator>

export const Default: Story = {
  render: () => (
    <BadgeIndicator count={3}>
      <Icon icon={IconBell} size="lg" />
    </BadgeIndicator>
  ),
}

export const OverflowCap: Story = {
  render: () => (
    <div className="flex items-center gap-ds-05">
      <BadgeIndicator count={5}>
        <Icon icon={IconMail} size="lg" />
      </BadgeIndicator>
      <BadgeIndicator count={42}>
        <Icon icon={IconMail} size="lg" />
      </BadgeIndicator>
      <BadgeIndicator count={150} max={99}>
        <Icon icon={IconMail} size="lg" />
      </BadgeIndicator>
    </div>
  ),
}

export const DotIndicator: Story = {
  render: () => (
    <BadgeIndicator dot color="success">
      <Icon icon={IconUser} size="lg" />
    </BadgeIndicator>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-ds-05">
      {(['error', 'success', 'warning', 'accent', 'info'] as const).map((color) => (
        <BadgeIndicator key={color} count={3} color={color}>
          <Icon icon={IconBell} size="lg" />
        </BadgeIndicator>
      ))}
    </div>
  ),
}

export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((placement) => (
        <div key={placement} className="flex flex-col items-center gap-ds-02">
          <BadgeIndicator count={3} placement={placement}>
            <Icon icon={IconBell} size="lg" />
          </BadgeIndicator>
          <div className="text-ds-xs text-surface-fg-muted">{placement}</div>
        </div>
      ))}
    </div>
  ),
}

export const HidesZero: Story = {
  render: () => (
    <div className="flex items-center gap-ds-05">
      <div className="flex flex-col items-center gap-ds-02">
        <BadgeIndicator count={0}>
          <Icon icon={IconBell} size="lg" />
        </BadgeIndicator>
        <div className="text-ds-xs text-surface-fg-muted">count=0 (hidden)</div>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <BadgeIndicator count={0} showZero>
          <Icon icon={IconBell} size="lg" />
        </BadgeIndicator>
        <div className="text-ds-xs text-surface-fg-muted">showZero</div>
      </div>
    </div>
  ),
}

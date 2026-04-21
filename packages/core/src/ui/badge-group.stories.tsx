import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { BadgeGroup } from './badge-group'

const meta: Meta<typeof BadgeGroup> = {
  title: 'Components/Data Display/BadgeGroup',
  component: BadgeGroup,
  tags: ['autodocs', 'stable'],
  argTypes: {
    max: { control: 'number' },
    gap: { control: 'select', options: ['tight', 'default', 'loose'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    onOverflowClick: { action: 'overflow clicked' },
  },
}
export default meta
type Story = StoryObj<typeof BadgeGroup>

const tags = ['Design', 'Engineering', 'Product', 'Marketing', 'Sales', 'Support', 'Ops']

export const Default: Story = {
  render: () => (
    <BadgeGroup>
      {tags.slice(0, 3).map((t) => (
        <Badge key={t} variant="soft" color="accent">
          {t}
        </Badge>
      ))}
    </BadgeGroup>
  ),
}

export const WithOverflow: Story = {
  render: () => (
    <BadgeGroup max={3}>
      {tags.map((t) => (
        <Badge key={t} variant="soft" color="accent">
          {t}
        </Badge>
      ))}
    </BadgeGroup>
  ),
}

export const Gaps: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      {(['tight', 'default', 'loose'] as const).map((gap) => (
        <div key={gap}>
          <div className="text-ds-xs text-surface-fg-muted mb-ds-02">gap="{gap}"</div>
          <BadgeGroup gap={gap}>
            {tags.slice(0, 4).map((t) => (
              <Badge key={t} variant="outline" color="neutral">
                {t}
              </Badge>
            ))}
          </BadgeGroup>
        </div>
      ))}
    </div>
  ),
}

export const ClickableOverflow: Story = {
  render: () => (
    <BadgeGroup max={2} onOverflowClick={() => alert('See remaining members')}>
      {['Alice', 'Bob', 'Carol', 'Dave', 'Eve'].map((name) => (
        <Badge key={name} variant="soft" color="success">
          {name}
        </Badge>
      ))}
    </BadgeGroup>
  ),
}

export const SharedSize: Story = {
  render: () => (
    <BadgeGroup max={3} size="xs">
      {tags.map((t) => (
        <Badge key={t} variant="subtle" color="warning">
          {t}
        </Badge>
      ))}
    </BadgeGroup>
  ),
}

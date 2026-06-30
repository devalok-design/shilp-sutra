import { IconActivity, IconCurrencyDollar, IconServer, IconUsers } from '@tabler/icons-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { StatFlash } from './stat-flash'

const meta: Meta<typeof StatFlash> = {
  title: 'Components/Data Display/StatFlash',
  component: StatFlash,
  tags: ['autodocs', 'stable'],
  argTypes: {
    flash: {
      control: 'select',
      options: ['up', 'down', 'goal', 'record', 'alert', 'live'],
    },
    fill: { control: 'inline-radio', options: ['soft', 'solid'] },
    speed: { control: 'inline-radio', options: ['fast', 'normal', 'slow'] },
  },
}
export default meta
type Story = StoryObj<typeof StatFlash>

export const TrendUp: Story = {
  args: { icon: <IconActivity />, flash: 'up' },
}

export const TrendDown: Story = {
  args: { icon: <IconCurrencyDollar />, flash: 'down' },
}

export const Solid: Story = {
  args: { icon: <IconUsers />, flash: 'record', fill: 'solid' },
}

export const Slow: Story = {
  args: { icon: <IconServer />, flash: 'alert', speed: 'slow' },
}

export const CustomSpec: Story = {
  args: {
    icon: <IconActivity />,
    flash: { tone: 'info', icon: <IconServer /> },
  },
}

/** All six presets side by side. Hit refresh to replay the entrance. */
export const AllPresets: Story = {
  render: () => (
    <div className="flex flex-wrap gap-ds-04">
      <StatFlash icon={<IconActivity />} flash="up" />
      <StatFlash icon={<IconCurrencyDollar />} flash="down" />
      <StatFlash icon={<IconActivity />} flash="goal" />
      <StatFlash icon={<IconUsers />} flash="record" />
      <StatFlash icon={<IconServer />} flash="alert" />
      <StatFlash icon={<IconActivity />} flash="live" />
    </div>
  ),
}

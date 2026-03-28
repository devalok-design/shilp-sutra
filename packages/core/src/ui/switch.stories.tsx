import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconCheck, IconLock } from '@tabler/icons-react'
import { Switch } from './switch'
import { Label } from './label'

const meta: Meta<typeof Switch> = {
  title: 'UI/Form Controls/Switch',
  component: Switch,
  tags: ['autodocs', 'stable'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: {},
}

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-ds-03">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      <div className="flex items-center justify-between">
        <Label htmlFor="email-switch">Email notifications</Label>
        <Switch id="email-switch" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="sms-switch">SMS notifications</Label>
        <Switch id="sms-switch" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="push-switch">Push notifications</Label>
        <Switch id="push-switch" defaultChecked />
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-ds-02">
          <Switch size={s} defaultChecked />
          <span className="text-ds-xs text-surface-fg-muted">{s}</span>
        </div>
      ))}
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      {(['accent', 'success', 'warning'] as const).map((c) => (
        <div key={c} className="flex flex-col items-center gap-ds-02">
          <Switch color={c} defaultChecked />
          <span className="text-ds-xs text-surface-fg-muted">{c}</span>
        </div>
      ))}
    </div>
  ),
}

export const WithThumbIcon: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <div className="flex flex-col items-center gap-ds-02">
        <Switch defaultChecked thumbIcon={<IconCheck size={12} />} />
        <span className="text-ds-xs text-surface-fg-muted">check</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Switch defaultChecked color="warning" thumbIcon={<IconLock size={12} />} />
        <span className="text-ds-xs text-surface-fg-muted">lock</span>
      </div>
    </div>
  ),
}

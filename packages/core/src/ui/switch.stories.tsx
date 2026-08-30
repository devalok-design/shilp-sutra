import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect } from 'storybook/test'
import { IconCheck, IconLock } from '@tabler/icons-react'
import { Switch } from './switch'
import { Label } from './label'

const meta: Meta<typeof Switch> = {
  title: 'Components/Inputs/Switch',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole('switch')
    await expect(switchEl).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(switchEl)
    await expect(switchEl).toHaveAttribute('data-state', 'checked')
  },
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

/**
 * Design refresh 2026-08-24 — the OFF track is neutral-5 (was
 * `surface-border-strong`), which lifts thumb-against-track from 1.350:1 to
 * 1.598:1; hover goes to neutral-6 at 1.955:1. The sm thumb also gained its
 * missing 2px right inset: its travel was 16px against a 14px budget, so the
 * checked thumb sat flush on the border. Toggle each one to see the inset.
 */
export const TrackContrastAndThumbInset: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-ds-04">
          <Switch size={size} aria-label={`${size} off`} />
          <Switch size={size} defaultChecked aria-label={`${size} on`} />
          <Label>{size}</Label>
        </div>
      ))}
    </div>
  ),
}

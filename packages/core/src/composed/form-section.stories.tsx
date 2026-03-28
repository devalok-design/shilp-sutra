import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormSection } from './form-section'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

const meta: Meta<typeof FormSection> = {
  title: 'Composed/FormSection',
  component: FormSection,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof FormSection>

export const Default: Story = {
  render: () => (
    <FormSection title="General Information" className="max-w-lg">
      <div className="flex flex-col gap-ds-02">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" placeholder="Enter project name" />
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label htmlFor="code">Project code</Label>
        <Input id="code" placeholder="e.g. PRJ-001" />
      </div>
    </FormSection>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <FormSection
      title="Notification Preferences"
      description="Choose how and when you want to be notified about project updates."
      className="max-w-lg"
    >
      <div className="flex flex-col gap-ds-02">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    </FormSection>
  ),
}

export const Collapsible: Story = {
  render: () => (
    <FormSection
      title="Advanced Settings"
      description="Configure optional advanced settings for the project."
      collapsible
      defaultOpen={false}
      className="max-w-lg"
    >
      <div className="flex flex-col gap-ds-02">
        <Label htmlFor="webhook">Webhook URL</Label>
        <Input id="webhook" type="url" placeholder="https://hooks.example.com/..." />
      </div>
      <div className="flex flex-col gap-ds-02">
        <Label htmlFor="api-key">API Key</Label>
        <Input id="api-key" placeholder="sk_live_..." />
      </div>
    </FormSection>
  ),
}

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-08 max-w-lg">
      <FormSection title="Profile">
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="display-name">Display name</Label>
          <Input id="display-name" defaultValue="Aanya Patel" />
        </div>
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" placeholder="Tell us about yourself" />
        </div>
      </FormSection>

      <FormSection
        title="Security"
        description="Manage your password and two-factor authentication."
      >
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="current-pw">Current password</Label>
          <Input id="current-pw" type="password" placeholder="Enter current password" />
        </div>
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="new-pw">New password</Label>
          <Input id="new-pw" type="password" placeholder="Enter new password" />
        </div>
      </FormSection>

      <FormSection
        title="Danger Zone"
        description="Irreversible actions — proceed with caution."
        collapsible
        defaultOpen={false}
      >
        <div className="flex flex-col gap-ds-02">
          <Label htmlFor="confirm-delete">Type your username to confirm deletion</Label>
          <Input id="confirm-delete" state="error" placeholder="aanya-patel" />
        </div>
      </FormSection>
    </div>
  ),
}

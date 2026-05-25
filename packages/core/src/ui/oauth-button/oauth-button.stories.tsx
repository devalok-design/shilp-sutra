import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  OAuthButton,
  OAuthConnectionRow,
  OAuthDivider,
  OAuthGroup,
  type OAuthProvider,
} from './oauth-button'

const ALL_PROVIDERS: OAuthProvider[] = [
  'google',
  'apple',
  'github',
  'microsoft',
  'x',
  'linkedin',
  'facebook',
  'discord',
  'slack',
  'gitlab',
  'sso',
  'email',
  'passkey',
]

const meta: Meta<typeof OAuthButton> = {
  title: 'Components/OAuthButton',
  component: OAuthButton,
  tags: ['autodocs', 'stable'],
  argTypes: {
    provider: { control: 'select', options: ALL_PROVIDERS },
    intent: { control: 'select', options: ['continue', 'signin', 'signup'] },
    appearance: { control: 'select', options: ['brand', 'outline', 'dark'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    iconOnly: { control: 'boolean' },
    lastUsed: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    provider: 'google',
    intent: 'continue',
    appearance: 'brand',
    size: 'md',
  },
}
export default meta

type Story = StoryObj<typeof OAuthButton>

export const Default: Story = {
  args: { provider: 'google' },
}

export const AllProvidersBrand: Story = {
  name: 'All providers — brand',
  render: () => (
    <div className="grid grid-cols-1 gap-ds-03 sm:grid-cols-2 max-w-xl">
      {ALL_PROVIDERS.map((p) => (
        <OAuthButton key={p} provider={p} fullWidth />
      ))}
    </div>
  ),
}

export const AllProvidersOutline: Story = {
  name: 'All providers — outline',
  render: () => (
    <div className="grid grid-cols-1 gap-ds-03 sm:grid-cols-2 max-w-xl">
      {ALL_PROVIDERS.map((p) => (
        <OAuthButton key={p} provider={p} appearance="outline" fullWidth />
      ))}
    </div>
  ),
}

export const AllProvidersDark: Story = {
  name: 'All providers — dark (unified)',
  render: () => (
    <div className="grid grid-cols-1 gap-ds-03 sm:grid-cols-2 max-w-xl">
      {ALL_PROVIDERS.map((p) => (
        <OAuthButton key={p} provider={p} appearance="dark" fullWidth />
      ))}
    </div>
  ),
}

export const IntentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03 max-w-sm">
      <OAuthButton provider="google" intent="continue" fullWidth />
      <OAuthButton provider="google" intent="signin" fullWidth />
      <OAuthButton provider="google" intent="signup" fullWidth />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03 max-w-sm">
      <OAuthButton provider="google" size="xs" fullWidth />
      <OAuthButton provider="google" size="sm" fullWidth />
      <OAuthButton provider="google" size="md" fullWidth />
      <OAuthButton provider="google" size="lg" fullWidth />
    </div>
  ),
}

export const IconOnlyRow: Story = {
  render: () => (
    <OAuthGroup orientation="horizontal" fullWidth={false}>
      <OAuthButton provider="google" iconOnly />
      <OAuthButton provider="apple" iconOnly />
      <OAuthButton provider="github" iconOnly />
      <OAuthButton provider="microsoft" iconOnly />
      <OAuthButton provider="x" iconOnly />
    </OAuthGroup>
  ),
}

export const LastUsedHint: Story = {
  render: () => (
    <OAuthGroup>
      <OAuthButton provider="google" lastUsed />
      <OAuthButton provider="apple" />
      <OAuthButton provider="github" />
    </OAuthGroup>
  ),
}

export const HelperText: Story = {
  render: () => (
    <div className="max-w-sm">
      <OAuthButton
        provider="google"
        fullWidth
        helperText="We never post to your account."
      />
    </div>
  ),
}

export const TypicalSignupFlow: Story = {
  name: 'Typical signup flow',
  render: () => (
    <div className="max-w-sm flex flex-col gap-ds-04">
      <OAuthGroup>
        <OAuthButton provider="google" lastUsed />
        <OAuthButton provider="apple" />
        <OAuthButton provider="github" />
      </OAuthGroup>
      <OAuthDivider />
      <OAuthGroup>
        <OAuthButton provider="passkey" appearance="outline" />
        <OAuthButton provider="email" appearance="outline" />
      </OAuthGroup>
    </div>
  ),
}

export const EnterpriseFlow: Story = {
  name: 'Enterprise sign-in flow',
  render: () => (
    <div className="max-w-sm flex flex-col gap-ds-04">
      <OAuthButton provider="sso" appearance="outline" fullWidth />
      <OAuthDivider label="or use a personal account" />
      <OAuthGroup>
        <OAuthButton provider="google" appearance="outline" />
        <OAuthButton provider="microsoft" appearance="outline" />
      </OAuthGroup>
    </div>
  ),
}

export const AsyncSignIn: Story = {
  name: 'Async (loading + success/error feedback)',
  render: () => (
    <div className="max-w-sm flex flex-col gap-ds-03">
      <OAuthButton
        provider="google"
        fullWidth
        onClickAsync={async () => {
          await new Promise((r) => setTimeout(r, 1500))
        }}
      />
      <OAuthButton
        provider="apple"
        fullWidth
        onClickAsync={async () => {
          await new Promise((_, r) => setTimeout(() => r(new Error('boom')), 1500))
        }}
      />
    </div>
  ),
}

export const ConnectionRows: Story = {
  name: 'Connection rows (settings page)',
  render: () => (
    <div className="max-w-md flex flex-col gap-ds-03">
      <OAuthConnectionRow
        provider="google"
        connected
        accountLabel="namaskar@devalok.in"
        onAction={() => alert('disconnect google')}
      />
      <OAuthConnectionRow
        provider="github"
        connected={false}
        onAction={() => alert('connect github')}
      />
      <OAuthConnectionRow provider="apple" connected accountLabel="hidden-relay-id" />
      <OAuthConnectionRow provider="sso" connected={false} accountLabel="okta · acme.com" />
    </div>
  ),
}

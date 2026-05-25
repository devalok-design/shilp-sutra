import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

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

describe('OAuthButton', () => {
  it('renders default "Continue with Google" label', () => {
    render(<OAuthButton provider="google" />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it.each<[OAuthProvider, RegExp]>([
    ['google', /google/i],
    ['apple', /apple/i],
    ['github', /github/i],
    ['microsoft', /microsoft/i],
    ['x', /x/i],
    ['linkedin', /linkedin/i],
    ['facebook', /facebook/i],
    ['discord', /discord/i],
    ['slack', /slack/i],
    ['gitlab', /gitlab/i],
    ['sso', /sso/i],
    ['email', /email/i],
    ['passkey', /passkey/i],
  ])('renders %s provider with the right name', (provider, match) => {
    render(<OAuthButton provider={provider} />)
    expect(screen.getByRole('button', { name: match })).toBeInTheDocument()
  })

  it('uses "Sign in with X" for intent=signin', () => {
    render(<OAuthButton provider="github" intent="signin" />)
    expect(screen.getByRole('button', { name: 'Sign in with GitHub' })).toBeInTheDocument()
  })

  it('uses "Sign up with X" for intent=signup', () => {
    render(<OAuthButton provider="github" intent="signup" />)
    expect(screen.getByRole('button', { name: 'Sign up with GitHub' })).toBeInTheDocument()
  })

  it('uses the passkey-specific copy override', () => {
    render(<OAuthButton provider="passkey" intent="signup" />)
    expect(screen.getByRole('button', { name: /create a passkey/i })).toBeInTheDocument()
  })

  it('children override default label', () => {
    render(<OAuthButton provider="google">Sign in mit Google</OAuthButton>)
    expect(screen.getByRole('button', { name: 'Sign in mit Google' })).toBeInTheDocument()
  })

  it('iconOnly preserves the provider name in aria-label', () => {
    render(<OAuthButton provider="google" iconOnly />)
    const btn = screen.getByRole('button', { name: /continue with google/i })
    expect(btn).toBeInTheDocument()
    expect(btn.textContent?.trim()).toBe('')
  })

  it('sets the data-provider attribute for analytics', () => {
    render(<OAuthButton provider="microsoft" data-testid="ms" />)
    expect(screen.getByTestId('ms')).toHaveAttribute('data-provider', 'microsoft')
  })

  it('sets the data-oauth-appearance attribute', () => {
    render(<OAuthButton provider="google" appearance="dark" data-testid="g" />)
    expect(screen.getByTestId('g')).toHaveAttribute('data-oauth-appearance', 'dark')
  })

  it('forwards onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<OAuthButton provider="google" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled prevents clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<OAuthButton provider="google" onClick={onClick} disabled />)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders helperText below the button', () => {
    render(<OAuthButton provider="google" helperText="No spam." />)
    expect(screen.getByText('No spam.')).toBeInTheDocument()
  })

  it('renders the lastUsed hint', () => {
    render(<OAuthButton provider="google" lastUsed />)
    expect(screen.getByText(/last used/i)).toBeInTheDocument()
  })

  it('honours custom icon override', () => {
    render(
      <OAuthButton provider="google" icon={<svg data-testid="custom-glyph" />} />,
    )
    expect(screen.getByTestId('custom-glyph')).toBeInTheDocument()
  })

  it('has no axe violations (brand)', async () => {
    const { container } = render(<OAuthButton provider="google" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations (icon-only)', async () => {
    const { container } = render(<OAuthButton provider="apple" iconOnly />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no axe violations (all providers)', async () => {
    const { container } = render(
      <div>
        {ALL_PROVIDERS.map((p) => (
          <OAuthButton key={p} provider={p} />
        ))}
      </div>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('OAuthGroup', () => {
  it('renders children', () => {
    render(
      <OAuthGroup>
        <OAuthButton provider="google" />
        <OAuthButton provider="apple" />
      </OAuthGroup>,
    )
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /apple/i })).toBeInTheDocument()
  })

  it('horizontal orientation puts items in a row', () => {
    const { container } = render(
      <OAuthGroup orientation="horizontal" data-testid="grp">
        <OAuthButton provider="google" iconOnly />
        <OAuthButton provider="apple" iconOnly />
      </OAuthGroup>,
    )
    expect(container.firstChild).toHaveClass('flex-row')
  })
})

describe('OAuthDivider', () => {
  it('renders with default label "or"', () => {
    render(<OAuthDivider />)
    expect(screen.getByText('or')).toBeInTheDocument()
  })

  it('accepts a custom label', () => {
    render(<OAuthDivider label="or use a personal account" />)
    expect(screen.getByText('or use a personal account')).toBeInTheDocument()
  })

  it('has separator role', () => {
    render(<OAuthDivider />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})

describe('OAuthConnectionRow', () => {
  it('shows "Disconnect" when connected', () => {
    render(<OAuthConnectionRow provider="google" connected />)
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('shows "Connect <name>" when not connected', () => {
    render(<OAuthConnectionRow provider="github" connected={false} />)
    expect(screen.getByRole('button', { name: /connect github/i })).toBeInTheDocument()
  })

  it('renders accountLabel when provided', () => {
    render(
      <OAuthConnectionRow
        provider="google"
        connected
        accountLabel="namaskar@devalok.in"
      />,
    )
    expect(screen.getByText('namaskar@devalok.in')).toBeInTheDocument()
  })

  it('falls back to "Connected" / "Not connected" when no accountLabel', () => {
    const { rerender } = render(<OAuthConnectionRow provider="google" connected />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
    rerender(<OAuthConnectionRow provider="google" connected={false} />)
    expect(screen.getByText('Not connected')).toBeInTheDocument()
  })

  it('fires onAction', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<OAuthConnectionRow provider="google" connected onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <OAuthConnectionRow provider="google" connected accountLabel="namaskar@devalok.in" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})

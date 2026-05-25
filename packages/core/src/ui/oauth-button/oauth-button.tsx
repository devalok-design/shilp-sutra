'use client'

import {
  IconBrandApple,
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandGoogleFilled,
  IconBrandLinkedin,
  IconBrandSlack,
  IconBrandWindows,
  IconBrandXFilled,
  IconFingerprint,
  IconKey,
  IconMail,
} from '@tabler/icons-react'
import * as React from 'react'

import { Button, type ButtonProps } from '../button'
import { cn } from '../lib/utils'

// ── Types ───────────────────────────────────────────────────────

export type OAuthProvider =
  | 'google'
  | 'apple'
  | 'github'
  | 'microsoft'
  | 'x'
  | 'linkedin'
  | 'facebook'
  | 'discord'
  | 'slack'
  | 'gitlab'
  | 'sso'
  | 'email'
  | 'passkey'

export type OAuthIntent = 'continue' | 'signin' | 'signup'

/**
 * Visual treatment for the button.
 * - `brand`   — provider's brand background colour. Highest recognition.
 * - `outline` — DS-neutral outline with monochrome glyph. Best for uniform rows.
 * - `dark`    — unified Apple-style black-on-white (light) / white-on-black (dark)
 *               across all providers, for visual consistency.
 */
export type OAuthAppearance = 'brand' | 'outline' | 'dark'

// ── Static metadata ─────────────────────────────────────────────

const providerDisplay: Record<OAuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
  github: 'GitHub',
  microsoft: 'Microsoft',
  x: 'X',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  discord: 'Discord',
  slack: 'Slack',
  gitlab: 'GitLab',
  sso: 'SSO',
  email: 'email',
  passkey: 'a passkey',
}

// Default glyph per provider — sourced from Tabler (already a peer dep).
// Consumer can override with the `icon` prop to drop in a brand-multicolour SVG.
const providerIcon: Record<OAuthProvider, React.ComponentType<{ size?: number | string; 'aria-hidden'?: boolean }>> = {
  google: IconBrandGoogleFilled,
  apple: IconBrandApple,
  github: IconBrandGithub,
  microsoft: IconBrandWindows,
  x: IconBrandXFilled,
  linkedin: IconBrandLinkedin,
  facebook: IconBrandFacebook,
  discord: IconBrandDiscord,
  slack: IconBrandSlack,
  gitlab: IconBrandGitlab,
  sso: IconKey,
  email: IconMail,
  passkey: IconFingerprint,
}

function defaultLabel(provider: OAuthProvider, intent: OAuthIntent): string {
  const name = providerDisplay[provider]
  switch (intent) {
    case 'signin':
      return `Sign in with ${name}`
    case 'signup':
      return `Sign up with ${name}`
    case 'continue':
    default:
      return `Continue with ${name}`
  }
}

const providerCopyOverride: Partial<Record<OAuthProvider, Partial<Record<OAuthIntent, string>>>> = {
  passkey: {
    continue: 'Continue with a passkey',
    signin: 'Sign in with a passkey',
    signup: 'Create a passkey',
  },
}

function resolveLabel(provider: OAuthProvider, intent: OAuthIntent): string {
  return providerCopyOverride[provider]?.[intent] ?? defaultLabel(provider, intent)
}

// Brand colour classes per provider — hex values are published brand-page
// facts (the colour each provider uses on its own sign-in button). Generic
// providers (sso/email/passkey) have no brand colour → fall through to outline.
const brandClasses: Record<OAuthProvider, string> = {
  google:
    'bg-white text-[#1f1f1f] border-[#dadce0] hover:bg-[#f8f9fa] active:bg-[#f1f3f4] dark:bg-[#131314] dark:text-white dark:border-[#5f6368] dark:hover:bg-[#1e1f20]',
  apple:
    'bg-black text-white border-black hover:bg-[#1a1a1a] active:bg-[#262626] dark:bg-white dark:text-black dark:border-white dark:hover:bg-[#f0f0f0]',
  github:
    'bg-[#24292f] text-white border-[#24292f] hover:bg-[#32383f] active:bg-[#1c2025] dark:bg-white dark:text-[#24292f] dark:border-[#d0d7de] dark:hover:bg-[#f6f8fa]',
  microsoft:
    'bg-white text-[#5e5e5e] border-[#8c8c8c] hover:bg-[#f8f9fa] active:bg-[#f1f3f4] dark:bg-[#2f2f2f] dark:text-white dark:border-[#8c8c8c] dark:hover:bg-[#3a3a3a]',
  x:
    'bg-black text-white border-black hover:bg-[#1a1a1a] active:bg-[#262626] dark:bg-white dark:text-black dark:border-white dark:hover:bg-[#f0f0f0]',
  linkedin:
    'bg-[#0A66C2] text-white border-[#0A66C2] hover:bg-[#004182] active:bg-[#003a73]',
  facebook:
    'bg-[#1877F2] text-white border-[#1877F2] hover:bg-[#166FE5] active:bg-[#1464D4]',
  discord:
    'bg-[#5865F2] text-white border-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5]',
  slack:
    'bg-surface-base text-surface-fg border-surface-border-strong hover:bg-surface-raised-hover active:bg-surface-raised-active',
  gitlab:
    'bg-[#FC6D26] text-white border-[#FC6D26] hover:bg-[#E24329] active:bg-[#C73A24]',
  // No brand colour — fall through to DS-neutral outline behaviour.
  sso: '',
  email: '',
  passkey: '',
}

const darkUnifiedClasses =
  'bg-surface-fg text-surface-base border-surface-fg hover:opacity-90 active:opacity-80 dark:bg-surface-base dark:text-surface-fg dark:border-surface-fg dark:hover:opacity-90'

const ICON_PX: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  'compact-xs': 14,
  'compact-sm': 14,
  'compact-md': 16,
  icon: 18,
  'icon-xs': 14,
  'icon-sm': 16,
  'icon-md': 18,
  'icon-lg': 20,
}

const ICON_ONLY_SIZE: Record<string, NonNullable<ButtonProps['size']>> = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
  'compact-xs': 'icon-xs',
  'compact-sm': 'icon-sm',
  'compact-md': 'icon-md',
}

// ── Component ───────────────────────────────────────────────────

/**
 * Props for `OAuthButton` — a brand-aware sign-in button for OAuth providers.
 *
 * Composes on top of `<Button>`, inheriting `size`, `loading`, `onClickAsync`,
 * `fullWidth`, and async state machinery. The provider's icon, label, and
 * brand-coloured styling are derived from the `provider` prop.
 *
 * **Provider** (required): includes 10 social providers + 3 generic
 * identifiers (`sso` enterprise, `email` magic-link, `passkey` WebAuthn).
 *
 * **Intent**: drives the verb in the label.
 * - `continue` (default) — "Continue with Google" — works on login and signup.
 * - `signin` — "Sign in with Google".
 * - `signup` — "Sign up with Google".
 *
 * **Appearance**: visual treatment.
 * - `brand` (default) — provider's brand background colour.
 * - `outline` — DS-neutral outline with monochrome glyph. Best for uniform rows.
 * - `dark` — unified Apple-style across all providers for visual consistency.
 *
 * **icon**: override the default Tabler glyph (e.g. drop in the provider's
 * official multicolour SVG downloaded from their brand page).
 *
 * **iconOnly**: render a square icon button. Provider name kept in `aria-label`.
 *
 * **lastUsed**: shows a small "Last used" pill above the button — high-converting
 * UX hint. Consumer tracks which provider the user picked previously.
 *
 * **helperText**: optional reassurance copy rendered below the button.
 *
 * @example
 * <OAuthButton provider="google" intent="continue" fullWidth onClickAsync={signInWithGoogle} />
 *
 * @example
 * // True brand-multicolour glyph:
 * <OAuthButton provider="google" icon={<GoogleGSvg />} />
 *
 * @example
 * <OAuthGroup>
 *   <OAuthButton provider="google" appearance="dark" />
 *   <OAuthButton provider="apple"  appearance="dark" />
 *   <OAuthButton provider="github" appearance="dark" />
 * </OAuthGroup>
 */
export interface OAuthButtonProps
  extends Omit<
    ButtonProps,
    'variant' | 'color' | 'startIcon' | 'endIcon' | 'shape' | 'children'
  > {
  /** OAuth provider this button represents */
  provider: OAuthProvider
  /** Verb in the default label. Default: `continue` */
  intent?: OAuthIntent
  /** Visual treatment. Default: `brand` */
  appearance?: OAuthAppearance
  /** Override the default glyph (e.g. brand-multicolour SVG) */
  icon?: React.ReactNode
  /** Render a compact icon-only button (provider name kept in aria-label) */
  iconOnly?: boolean
  /** Show "Last used" hint above the button */
  lastUsed?: boolean
  /** Reassurance copy rendered below the button */
  helperText?: React.ReactNode
  /** Override the default label entirely (i18n / custom copy) */
  children?: React.ReactNode
}

const OAuthButton = React.forwardRef<HTMLButtonElement, OAuthButtonProps>(
  (
    {
      provider,
      intent = 'continue',
      appearance = 'brand',
      icon,
      iconOnly = false,
      lastUsed = false,
      helperText,
      children,
      className,
      size: sizeProp,
      fullWidth = false,
      ...buttonProps
    },
    ref,
  ) => {
    const size: NonNullable<ButtonProps['size']> = sizeProp ?? 'md'
    const DefaultGlyph = providerIcon[provider]
    const iconPx = ICON_PX[size] ?? 18
    const glyphNode = icon ?? <DefaultGlyph size={iconPx} aria-hidden />
    const label = children ?? resolveLabel(provider, intent)

    let appearanceClass: string
    if (appearance === 'dark') {
      appearanceClass = darkUnifiedClasses
    } else if (appearance === 'brand') {
      appearanceClass = brandClasses[provider] || ''
    } else {
      appearanceClass = ''
    }

    const buttonEl = (
      <Button
        ref={ref}
        variant="outline"
        color="neutral"
        size={iconOnly ? ICON_ONLY_SIZE[size] ?? 'icon-md' : size}
        fullWidth={fullWidth && !iconOnly}
        startIcon={iconOnly ? undefined : (glyphNode as React.ReactElement)}
        aria-label={iconOnly ? resolveLabel(provider, intent) : undefined}
        data-provider={provider}
        data-oauth-appearance={appearance}
        className={cn(appearanceClass, className)}
        {...buttonProps}
      >
        {iconOnly ? glyphNode : label}
      </Button>
    )

    if (!lastUsed && !helperText) return buttonEl

    return (
      <div className={cn('relative inline-flex flex-col', fullWidth && 'w-full')}>
        {lastUsed ? (
          <span
            aria-hidden="true"
            className="absolute -top-2 right-3 z-10 inline-flex items-center rounded-pill bg-accent-9 text-accent-fg px-ds-02 py-[1px] text-[10px] font-semibold uppercase tracking-wide shadow-raised"
          >
            Last used
          </span>
        ) : null}
        {buttonEl}
        {helperText ? (
          <span className="mt-ds-02 text-ds-sm text-surface-fg-subtle">{helperText}</span>
        ) : null}
      </div>
    )
  },
)
OAuthButton.displayName = 'OAuthButton'

export { OAuthButton }

// ── OAuthGroup ─────────────────────────────────────────────────

export interface OAuthGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout. `vertical` (default) stacks full-width buttons. */
  orientation?: 'vertical' | 'horizontal'
  /** Gap token between buttons. Default: `ds-03` */
  gap?: 'ds-02' | 'ds-03' | 'ds-04'
  /** Stretch children to fill width (vertical only). Default: true */
  fullWidth?: boolean
}

/**
 * Stacked layout wrapper for OAuth buttons with consistent spacing. Defaults to
 * vertical, full-width children — the dominant sign-in pattern. For an icon-only
 * row, set `orientation="horizontal"` and use `<OAuthButton iconOnly />`.
 */
const OAuthGroup = React.forwardRef<HTMLDivElement, OAuthGroupProps>(
  (
    { orientation = 'vertical', gap = 'ds-03', fullWidth = true, className, children, ...props },
    ref,
  ) => {
    const gapClass =
      gap === 'ds-02' ? 'gap-ds-02' : gap === 'ds-04' ? 'gap-ds-04' : 'gap-ds-03'
    const stretch = orientation === 'vertical' && fullWidth

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap items-center',
          gapClass,
          stretch && 'w-full [&>*]:w-full',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
OAuthGroup.displayName = 'OAuthGroup'

export { OAuthGroup }

// ── OAuthDivider ───────────────────────────────────────────────

export interface OAuthDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text between the rules. Default: "or" */
  label?: React.ReactNode
}

const OAuthDivider = React.forwardRef<HTMLDivElement, OAuthDividerProps>(
  ({ label = 'or', className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn('flex items-center gap-ds-03', className)}
      {...props}
    >
      <hr aria-hidden="true" className="flex-1 border-t border-surface-border-subtle" />
      <span className="text-ds-sm text-surface-fg-subtle uppercase tracking-wide">{label}</span>
      <hr aria-hidden="true" className="flex-1 border-t border-surface-border-subtle" />
    </div>
  ),
)
OAuthDivider.displayName = 'OAuthDivider'

export { OAuthDivider }

// ── OAuthConnectionRow (settings page — linked state) ──────────

export interface OAuthConnectionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: OAuthProvider
  /** Optional account identifier shown next to the provider name (e.g. email) */
  accountLabel?: React.ReactNode
  /** Whether the provider is currently linked */
  connected: boolean
  /** Click handler for the connect/disconnect action */
  onAction?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Promise-returning click handler — uses Button's async state machine */
  onActionAsync?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>
  /** Override the action label */
  actionLabel?: React.ReactNode
  /** Disable the action button */
  disabled?: boolean
  /** Override the default glyph */
  icon?: React.ReactNode
}

/**
 * Settings-page row representing a linked OAuth provider. Different surface
 * from sign-in: this is an existing connection the user can disconnect or
 * (re-)connect. Renders glyph + provider name + optional account label + a
 * connect/disconnect button.
 */
const OAuthConnectionRow = React.forwardRef<HTMLDivElement, OAuthConnectionRowProps>(
  (
    {
      provider,
      accountLabel,
      connected,
      onAction,
      onActionAsync,
      actionLabel,
      disabled,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    const DefaultGlyph = providerIcon[provider]
    const name = providerDisplay[provider]
    const resolvedLabel = actionLabel ?? (connected ? 'Disconnect' : `Connect ${name}`)

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-ds-04 py-ds-04 px-ds-04 rounded-ds-md border border-surface-border bg-surface-raised',
          className,
        )}
        data-provider={provider}
        data-connected={connected ? 'true' : 'false'}
        {...props}
      >
        <div className="flex items-center gap-ds-03 min-w-0">
          {icon ?? <DefaultGlyph size={24} aria-hidden />}
          <div className="flex flex-col min-w-0">
            <span className="text-ds-md font-semibold text-surface-fg truncate">{name}</span>
            {accountLabel ? (
              <span className="text-ds-sm text-surface-fg-muted truncate">{accountLabel}</span>
            ) : connected ? (
              <span className="text-ds-sm text-success-11">Connected</span>
            ) : (
              <span className="text-ds-sm text-surface-fg-subtle">Not connected</span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant={connected ? 'soft' : 'solid'}
          color={connected ? 'neutral' : 'accent'}
          disabled={disabled}
          onClick={onAction}
          onClickAsync={onActionAsync}
        >
          {resolvedLabel}
        </Button>
      </div>
    )
  },
)
OAuthConnectionRow.displayName = 'OAuthConnectionRow'

export { OAuthConnectionRow }

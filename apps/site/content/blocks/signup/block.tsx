'use client'

import { IconCheck } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  OAuthButton,
  OAuthDivider,
  OAuthGroup,
} from '@devalok/shilp-sutra/ui/oauth-button'
import { Text } from '@devalok/shilp-sutra/ui/text'

const benefits = [
  '119 accessible components, one consistent API',
  'Tailwind 4 CSS-first. No preset, no config file',
  'AI agents preconfigured via the bundled Agent Skill',
  'OKLCH design tokens with light + dark generated together',
] as const

/**
 * Authentic Google 4-colour G mark — sourced from Google's published sign-in
 * branding guidelines and used here, in the consumer app, rather than shipped
 * inside the DS package. Pass via `icon` to override the OAuthButton default
 * (which falls back to Tabler's monochrome glyph).
 */
function GoogleGMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

export function SignupBlock() {
  return (
    <div className="min-h-[560px] grid grid-cols-1 lg:grid-cols-2 rounded-ds-md border border-surface-border overflow-hidden">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-ds-09 bg-accent-2 relative">
        <header>
          <Text variant="label-md" className="text-accent-11">
            shilp-sutra
          </Text>
        </header>
        <div className="flex flex-col gap-ds-04 max-w-md">
          <Text variant="heading-xl" className="text-surface-fg">
            Build the brand your users remember.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            Devalok&apos;s React design system. Skip the boilerplate, keep the craft.
          </Text>
          <ul className="flex flex-col gap-ds-03 mt-ds-04">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-ds-03">
                <span className="mt-1 w-5 h-5 rounded-full bg-accent-9 text-accent-fg flex items-center justify-center shrink-0">
                  <IconCheck size={12} />
                </span>
                <Text variant="body-sm" className="text-surface-fg">
                  {b}
                </Text>
              </li>
            ))}
          </ul>
        </div>
        <footer>
          <Text variant="body-xs" className="text-surface-fg-subtle">
            &ldquo;shilp-sutra&rdquo;: the thread of craft. From the soul, we craft.
          </Text>
        </footer>
      </aside>

      {/* Form panel — form first, OAuth as fallback (Stripe / B2B pattern) */}
      <div className="flex flex-col justify-center p-ds-09 bg-surface-base">
        <div className="max-w-sm w-full mx-auto flex flex-col gap-ds-05">
          <header className="flex flex-col gap-ds-02">
            <Text variant="heading-lg" className="text-surface-fg">
              Create your account
            </Text>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Start with the studio plan. Upgrade only when you need to.
            </Text>
          </header>

          <form className="flex flex-col gap-ds-03">
            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg">
                Full name
              </Text>
              <input
                type="text"
                placeholder="Mudit Lal"
                className="h-ds-md px-ds-04 rounded-control border border-surface-border bg-surface-overlay text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
              />
            </label>

            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg">
                Work email
              </Text>
              <input
                type="email"
                placeholder="namaskar@devalok.in"
                className="h-ds-md px-ds-04 rounded-control border border-surface-border bg-surface-overlay text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
              />
            </label>

            <label className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg">
                Password
              </Text>
              <input
                type="password"
                placeholder="At least 12 characters"
                className="h-ds-md px-ds-04 rounded-control border border-surface-border bg-surface-overlay text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:border-accent-9 transition-colors duration-fast-01"
              />
            </label>

            <Button type="submit" fullWidth className="mt-ds-02">
              Create account
            </Button>
          </form>

          <OAuthDivider label="or continue with" />

          <OAuthGroup reorderLastUsedFirst>
            <OAuthButton
              provider="google"
              variant="outline"
              compact
              lastUsed
              icon={<GoogleGMark />}
            />
            <OAuthButton provider="passkey" variant="outline" compact />
            <OAuthButton provider="sso" variant="outline" compact />
          </OAuthGroup>

          <Text variant="body-xs" className="text-surface-fg-subtle text-center">
            Already have an account?{' '}
            <a
              href="#"
              className="text-accent-11 hover:underline underline-offset-2"
            >
              Sign in
            </a>
          </Text>
        </div>
      </div>
    </div>
  )
}

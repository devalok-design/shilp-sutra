'use client'

import { IconCheck, IconMail } from '@tabler/icons-react'
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
            "shilp-sutra": the thread of craft. From the soul, we craft.
          </Text>
        </footer>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col justify-center p-ds-09 bg-surface-base">
        <div className="max-w-sm w-full mx-auto flex flex-col gap-ds-06">
          <header className="flex flex-col gap-ds-02">
            <Text variant="heading-lg" className="text-surface-fg">
              Create your account
            </Text>
            <Text variant="body-sm" className="text-surface-fg-muted">
              Start with the studio plan. Upgrade only when you need to.
            </Text>
          </header>

          <OAuthGroup>
            <OAuthButton provider="google" lastUsed />
            <OAuthButton provider="apple" />
            <OAuthButton provider="github" />
          </OAuthGroup>

          <OAuthDivider />

          <form className="flex flex-col gap-ds-04">
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

            <Button startIcon={<IconMail size={16} />} type="submit">
              Create account
            </Button>
          </form>

          <Text variant="body-xs" className="text-surface-fg-subtle text-center">
            By creating an account you agree to the terms. No marketing email by default.
          </Text>
        </div>
      </div>
    </div>
  )
}

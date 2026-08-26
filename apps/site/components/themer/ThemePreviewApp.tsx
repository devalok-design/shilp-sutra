'use client'

/**
 * ThemePreviewApp — the themer's "see it on a real screen" surface.
 *
 * NOT a swatch dump. A compact but realistic product screen — app chrome, a
 * pricing card with a primary CTA, a sign-up form, and a live toast — built
 * from real shilp-sutra components. Everything inherits the caller's live
 * `--color-accent-*` + radius overrides (passed as `style`), so moving the hue
 * slider recolours a believable app in real time. This is the moment that
 * answers "will this actually look like my brand?".
 */

import { IconBell, IconCheck, IconSearch } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Progress } from '@devalok/shilp-sutra/ui/progress'
import { Switch } from '@devalok/shilp-sutra/ui/switch'

export function ThemePreviewApp({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="overflow-hidden rounded-surface border border-surface-border bg-surface-base shadow-raised"
    >
      {/* App chrome */}
      <div className="flex items-center justify-between gap-ds-03 border-b border-surface-border-subtle bg-surface-panel px-ds-04 py-ds-03">
        <div className="flex items-center gap-ds-02 min-w-0">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-control bg-accent-9 text-ds-xs font-bold text-accent-fg">
            A
          </span>
          <span className="truncate text-ds-sm font-semibold text-surface-fg">Acme</span>
          <Badge variant="soft" color="accent" size="sm" className="ml-ds-01 hidden sm:inline-flex">
            Pro
          </Badge>
        </div>
        <div className="flex items-center gap-ds-02">
          <span className="hidden items-center gap-ds-02 rounded-control border border-surface-border-subtle bg-surface-base px-ds-03 py-ds-01 text-ds-xs text-surface-fg-subtle sm:inline-flex">
            <IconSearch size={12} /> Search
          </span>
          <span className="relative inline-flex text-surface-fg-muted">
            <IconBell size={16} />
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-pill bg-accent-9" />
          </span>
          <Avatar size="xs">
            <AvatarFallback className="bg-accent-4 text-accent-11">KI</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-ds-04 p-ds-05 sm:grid-cols-2">
        {/* Pricing card */}
        <div className="flex flex-col gap-ds-03 rounded-surface border border-surface-border-subtle bg-surface-panel p-ds-05">
          <div className="flex items-center justify-between">
            <span className="text-ds-sm font-semibold text-surface-fg">Growth</span>
            <Badge variant="soft" color="accent" size="sm">
              Popular
            </Badge>
          </div>
          <div className="flex items-baseline gap-ds-01">
            <span className="font-display text-[length:var(--typo-heading-lg-size)] font-semibold text-surface-fg">
              $24
            </span>
            <span className="text-ds-sm text-surface-fg-subtle">/mo</span>
          </div>
          <ul className="flex flex-col gap-ds-02 text-ds-sm text-surface-fg-muted">
            {['Unlimited projects', 'Priority support', 'Custom domains'].map((f) => (
              <li key={f} className="flex items-center gap-ds-02">
                <IconCheck size={14} className="text-accent-11" />
                {f}
              </li>
            ))}
          </ul>
          <Button fullWidth>Upgrade</Button>
        </div>

        {/* Form + usage */}
        <div className="flex flex-col gap-ds-04">
          <div className="flex flex-col gap-ds-02">
            <label htmlFor="theme-preview-email" className="text-ds-sm font-medium text-surface-fg">
              Work email
            </label>
            <input
              id="theme-preview-email"
              type="email"
              placeholder="you@acme.com"
              className="h-ds-lg w-full rounded-control border border-surface-border bg-surface-base px-ds-03 text-ds-sm text-surface-fg placeholder:text-surface-fg-subtle focus:border-accent-9 focus:outline-hidden focus:ring-2 focus:ring-accent-9"
            />
          </div>

          <div className="flex flex-col gap-ds-02">
            <div className="flex items-center justify-between text-ds-sm">
              <span className="text-surface-fg-muted">Storage used</span>
              <span className="font-mono text-surface-fg">68%</span>
            </div>
            <Progress value={68} />
          </div>

          <label className="flex items-center justify-between gap-ds-03 rounded-control border border-surface-border-subtle bg-surface-panel px-ds-03 py-ds-02">
            <span className="text-ds-sm text-surface-fg">Email notifications</span>
            <Switch defaultChecked size="sm" />
          </label>

          {/* Live toast */}
          <div className="flex items-start gap-ds-03 rounded-control border border-accent-6 bg-accent-2 p-ds-03">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-pill bg-accent-9 text-accent-fg">
              <IconCheck size={12} />
            </span>
            <div className="flex flex-col">
              <span className="text-ds-sm font-medium text-surface-fg">Changes saved</span>
              <span className="text-ds-xs text-surface-fg-muted">Your brand is live.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

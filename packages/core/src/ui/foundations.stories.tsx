import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta: Meta = {
  title: 'Foundations/Tokens',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj

/* ── Shadow Scale ────────────────────────────────────────── */

export const Shadows: Story = {
  name: 'Shadow Scale',
  render: () => (
    <div className="space-y-ds-07 p-ds-06">
      <h2 className="text-ds-xl font-semibold text-surface-fg">
        Shadow Scale
      </h2>
      <p className="text-ds-md text-surface-fg-muted max-w-lg">
        Multi-layered shadows with 3 layers each (contact + main + ambient)
        for realistic depth perception. Dark mode automatically uses heavier
        opacities.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ds-06">
        {[
          { token: 'shadow-raised', label: 'Raised', usage: 'Buttons, switch thumb, small elevations' },
          { token: 'shadow-raised-hover', label: 'Raised Hover', usage: 'Cards, inputs on focus, tooltips' },
          { token: 'shadow-floating', label: 'Floating', usage: 'Popovers, dropdowns, command palette' },
          { token: 'shadow-overlay', label: 'Overlay', usage: 'Dialogs, sheets, toasts' },
          { token: 'shadow-brand', label: 'Brand', usage: 'Accent CTA hover, branded moments' },
        ].map(({ token, label, usage }) => (
          <div
            key={token}
            className={`rounded-ds-lg bg-surface-raised p-ds-06 ${token}`}
            style={{ boxShadow: `var(--${token})` }}
          >
            <p className="text-ds-md font-semibold text-surface-fg">
              {label}
            </p>
            <p className="mt-ds-01 font-mono text-ds-xs text-surface-fg-subtle">
              {token}
            </p>
            <p className="mt-ds-03 text-ds-sm text-surface-fg-muted">
              {usage}
            </p>
          </div>
        ))}
      </div>

      <h3 className="mt-ds-07 text-ds-lg font-semibold text-surface-fg">
        Elevation Comparison
      </h3>
      <p className="text-ds-md text-surface-fg-muted max-w-lg">
        Side-by-side comparison of progressive elevation levels.
      </p>
      <div className="flex flex-wrap items-end gap-ds-06 pt-ds-05">
        {['shadow-raised', 'shadow-raised-hover', 'shadow-floating', 'shadow-overlay'].map(
          (token, i) => (
            <div
              key={token}
              className="flex flex-col items-center gap-ds-03"
            >
              <div
                className="rounded-ds-lg bg-surface-raised"
                style={{
                  boxShadow: `var(--${token})`,
                  width: 80 + i * 16,
                  height: 80 + i * 16,
                }}
              />
              <span className="font-mono text-ds-xs text-surface-fg-subtle">
                {token}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  ),
}

/* ── Typography Scale ────────────────────────────────────── */

export const Typography: Story = {
  name: 'Typography Scale',
  render: () => (
    <div className="space-y-ds-07 p-ds-06">
      <h2 className="text-ds-xl font-semibold text-surface-fg">
        Heading Typography
      </h2>
      <p className="text-ds-md text-surface-fg-muted max-w-lg">
        Headings use tightened letter-spacing at larger sizes for editorial
        quality. The tracking gets progressively tighter as size increases.
      </p>
      <div className="space-y-ds-05">
        {[
          { variant: 'heading-2xl', size: '60px', tracking: '-0.025em' },
          { variant: 'heading-xl', size: '48px', tracking: '-0.025em' },
          { variant: 'heading-lg', size: '36px', tracking: '-0.02em' },
          { variant: 'heading-md', size: '32px', tracking: '-0.02em' },
          { variant: 'heading-sm', size: '24px', tracking: '-0.015em' },
          { variant: 'heading-xs', size: '20px', tracking: '0' },
        ].map(({ variant, size, tracking }) => (
          <div key={variant} className="border-b border-surface-border pb-ds-04">
            <p
              className="text-surface-fg"
              style={{
                fontSize: `var(--typo-${variant}-size)`,
                fontWeight: `var(--typo-${variant}-weight)`,
                lineHeight: `var(--typo-${variant}-leading)`,
                letterSpacing: `var(--typo-${variant}-tracking)`,
              }}
            >
              The quick brown fox
            </p>
            <div className="mt-ds-02 flex gap-ds-04">
              <span className="font-mono text-ds-xs text-surface-fg-subtle">
                {variant}
              </span>
              <span className="text-ds-xs text-surface-fg-muted">
                {size} / tracking: {tracking}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
}

/* ── Focus Ring Utilities ────────────────────────────────── */

export const FocusRings: Story = {
  name: 'Focus Ring Utilities',
  render: () => (
    <div className="space-y-ds-07 p-ds-06">
      <h2 className="text-ds-xl font-semibold text-surface-fg">
        Focus Ring Utilities
      </h2>
      <p className="text-ds-md text-surface-fg-muted max-w-lg">
        Three focus-ring utility classes for consistent keyboard navigation
        styling. Tab through the buttons below to see each variant.
      </p>
      <div className="flex flex-wrap gap-ds-05">
        <button className="focus-ring rounded-ds-md bg-accent-9 px-ds-05 py-ds-03 text-ds-md font-semibold text-accent-fg">
          .focus-ring
        </button>
        <button className="focus-ring-inset rounded-ds-md border border-surface-border-strong bg-surface-raised px-ds-05 py-ds-03 text-ds-md font-medium text-surface-fg">
          .focus-ring-inset
        </button>
        <button className="focus-ring-sm rounded-ds-md border border-surface-border-strong bg-surface-raised-hover px-ds-05 py-ds-03 text-ds-md font-medium text-surface-fg">
          .focus-ring-sm
        </button>
      </div>
      <p className="text-ds-sm text-surface-fg-subtle">
        Press <kbd className="rounded-ds-sm border border-surface-border-strong bg-surface-raised px-ds-02b py-ds-01 font-mono text-ds-xs">Tab</kbd> to
        focus each button and see the ring style.
      </p>
    </div>
  ),
}

/* ── Separator Variants ──────────────────────────────────── */

export const SeparatorVariants: Story = {
  name: 'Separator Variants',
  render: () => (
    <div className="space-y-ds-07 p-ds-06 max-w-lg">
      <h2 className="text-ds-xl font-semibold text-surface-fg">
        Separator Variants
      </h2>
      <div className="space-y-ds-05">
        {([
          { variant: 'default' as const, label: 'Default (solid)' },
          { variant: 'gradient' as const, label: 'Gradient (fades both edges)' },
          { variant: 'gradient-left' as const, label: 'Gradient Left (fades on left)' },
          { variant: 'gradient-right' as const, label: 'Gradient Right (fades on right)' },
        ]).map(({ variant, label }) => (
          <div key={variant}>
            <p className="text-ds-sm font-medium text-surface-fg-muted mb-ds-03">
              {label}
            </p>
            <Separator variant={variant} />
          </div>
        ))}
      </div>
    </div>
  ),
}

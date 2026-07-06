// @server-safe
import { Slot } from '@primitives/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from './lib/utils'

// Bundlers (Vite, Next.js, webpack) define process.env.NODE_ENV; guard for raw ESM.
declare const process: { env: { NODE_ENV?: string } } | undefined

const surfaceVariants = cva('', {
  variants: {
    // Elevation binds a surface-bg token to a shadow token — the one axis that
    // matters. `flat` sits on the page with no shadow (pair with `bordered` for a
    // Carbon-Tile edge); `raised` is the card level; `floating`/`overlay` are the
    // popover/menu/toast levels. bg + shadow always move together, so there is no
    // way to produce an un-tokened surface.
    elevation: {
      flat: 'bg-surface-raised',
      raised: 'bg-surface-raised shadow-raised',
      floating: 'bg-surface-overlay shadow-floating',
      overlay: 'bg-surface-overlay shadow-overlay',
    },
    // Simple, symmetric all-side padding — NOT Card's gap model. This is what keeps
    // Surface low-level: a plain box you can drop content into. Reach for Card when
    // you want the header/content/footer slot rhythm.
    padding: {
      none: '',
      sm: 'p-ds-04',
      md: 'p-ds-05',
      lg: 'p-ds-06',
    },
    radius: {
      none: 'rounded-none',
      control: 'rounded-control',
      surface: 'rounded-surface',
      overlay: 'rounded-overlay',
      pill: 'rounded-pill',
    },
    // Border-led edge (Carbon-Tile style). Meant for `elevation="flat"`; combining it
    // with a shadowed elevation is the double-edge anti-pattern and dev-warns below.
    bordered: {
      true: 'border border-surface-border-strong',
      false: '',
    },
  },
  defaultVariants: {
    elevation: 'raised',
    padding: 'none',
    radius: 'surface',
    bordered: false,
  },
})

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  /** Render as the passed child element (Radix Slot) instead of a `div` — wrap a link,
   * section, or `motion.div` without adding a wrapper node. */
  asChild?: boolean
}

/**
 * Surface — the low-level elevated container primitive.
 *
 * The building block every panel, card, popover, and toast surface sits on. It owns
 * exactly one job: paint a tokened surface (background + shadow), with optional radius,
 * padding, and border. It has no slots, no color axis, and no motion — those belong to
 * the components composed on top of it (Card = Surface + gap-model padding + slots).
 *
 * **Elevation:** `flat` (bg, no shadow — pair with `bordered`) | `raised` (card level,
 * default) | `floating` (toasts, floating toolbars) | `overlay` (popovers, menus, dialogs).
 *
 * **Padding:** `none` (default) | `sm` (12px) | `md` (16px) | `lg` (24px) — simple all-side.
 *
 * **Edge vs. elevation:** use a shadow (`raised`/`floating`/`overlay`) OR a `bordered`
 * `flat` — never both (the double-edge anti-pattern; dev-warns).
 *
 * @example
 * // A raised panel with comfortable padding:
 * <Surface elevation="raised" padding="md">…</Surface>
 *
 * @example
 * // An on-page, border-led tile (no shadow):
 * <Surface elevation="flat" bordered padding="sm">…</Surface>
 *
 * @example
 * // Wrap a link as the surface itself:
 * <Surface asChild elevation="raised" padding="sm">
 *   <a href="/upgrade">…</a>
 * </Surface>
 */
const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    { className, elevation, padding, radius, bordered, asChild = false, ...props },
    ref,
  ) => {
    if (
      typeof process !== 'undefined' &&
      process?.env.NODE_ENV !== 'production' &&
      bordered &&
      (elevation ?? 'raised') !== 'flat'
    ) {
      console.warn(
        '[shilp-sutra] <Surface> combines `bordered` with a raised `elevation` — the double-edge anti-pattern. Pick one: use elevation="flat" with `bordered`, or drop `bordered` and let the elevation carry the edge.',
      )
    }
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        className={cn(
          surfaceVariants({ elevation, padding, radius, bordered }),
          className,
        )}
        {...props}
      />
    )
  },
)
Surface.displayName = 'Surface'

export { Surface, surfaceVariants }

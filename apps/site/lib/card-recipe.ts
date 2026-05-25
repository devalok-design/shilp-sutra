/**
 * Card recipe — ported verbatim from Karm's task-card.tsx (taskCardVariants
 * base + default state) so the site reads with the same craft as the
 * product it ships inside.
 *
 * The softness is intentional. Border is transparent at rest, only
 * surfacing on hover. Lift is 1px. Shadow swap is a tier shift, not a
 * lighting change. Border on hover is the surface ramp's "strong" tier
 * (not the accent), so cards remain neutral until clicked.
 *
 * Restraint > theatrics. Match Karm exactly.
 */

/** Resting state — no interaction affordance. Use for non-clickable cards (FeatureGrid articles). */
export const CARD_RESTING =
  'rounded-ds-lg bg-surface-raised px-ds-05b py-ds-05 border border-transparent shadow-raised'

/**
 * Interactive — clickable card or Link. Gets hover lift + shadow swap +
 * border emerges. Karm's default-state variant verbatim.
 */
export const CARD_INTERACTIVE = [
  'group',
  'rounded-ds-lg bg-surface-raised px-ds-05b py-ds-05',
  'border border-transparent shadow-raised',
  'transition-[box-shadow,border-color,translate] duration-fast-02 ease-productive-standard',
  'cursor-pointer select-none',
  'hover:border-surface-border-strong hover:shadow-raised-hover hover:-translate-y-px',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
].join(' ')

/** Eyebrow above title — matches Karm's stage-name treatment. */
export const CARD_EYEBROW = 'text-ds-xs text-surface-fg-subtle mb-ds-02'

/** Card title — Karm's task title verbatim. */
export const CARD_TITLE = 'text-ds-md text-surface-fg font-semibold line-clamp-2'

/** Card description — Karm's description preview verbatim. */
export const CARD_DESCRIPTION = 'text-ds-sm text-surface-fg-subtle line-clamp-2 mt-ds-03'

/** Footer separator + spacing — Karm's divider + footer-row pattern. */
export const CARD_DIVIDER = 'mt-ds-05 bg-surface-border h-px'
export const CARD_FOOTER = 'mt-ds-04 gap-ds-04 flex items-center'

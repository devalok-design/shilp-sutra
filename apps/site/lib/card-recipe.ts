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
  'rounded-surface bg-surface-panel px-ds-05b py-ds-05 border border-transparent shadow-raised'

/**
 * Interactive — clickable card or Link. Border emerges on hover, shadow steps
 * up a tier, and the PRESS is what moves.
 *
 * ⛔ THE HOVER LIFT IS GONE. `hover:-translate-y-px` is the one motion the house
 * bans by name: nothing moves on hover, and press feedback is
 * `active:scale-[0.97]`. A state change is a tonal shift, not a position change.
 */
export const CARD_INTERACTIVE = [
  'group',
  'rounded-surface bg-surface-panel px-ds-05b py-ds-05',
  'border border-transparent shadow-raised',
  'transition-[box-shadow,border-color,scale] duration-fast-02 ease-productive-standard',
  'cursor-pointer select-none',
  'hover:border-surface-border-strong hover:shadow-raised-hover active:scale-[0.97]',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
].join(' ')

/**
 * Meta line — a short context string (product, industry). It used to be called
 * CARD_EYEBROW and sat ABOVE the title; the house bans a small label in that
 * position, so it now belongs BELOW the title at every call site.
 */
export const CARD_META = 'text-body-xs text-surface-fg-subtle'

/** Card title. Item tier of the two the type rules allow: label-plain-md, 14 semibold. */
export const CARD_TITLE = 'text-label-plain-md text-surface-fg line-clamp-2'

/** Card description — dense secondary copy. */
export const CARD_DESCRIPTION = 'text-body-sm text-surface-fg-subtle line-clamp-2 mt-ds-03'

/** Footer separator + spacing — Karm's divider + footer-row pattern. */
export const CARD_DIVIDER = 'mt-ds-05 bg-surface-border h-px'
export const CARD_FOOTER = 'mt-ds-04 gap-ds-04 flex items-center'

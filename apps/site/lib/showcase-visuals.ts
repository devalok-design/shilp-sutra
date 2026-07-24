/**
 * Per-showcase visual identity — typeface, corner radius, shadow/elevation
 * grammar, and primary-button treatment, each picked to match the brand's
 * industry description, not the site's own Inter/Manrope + slightly-rounded
 * + soft-shadow + soft-button default.
 *
 * Colour is handled separately (already scoped per-brand via the existing
 * `rampInlineStyle`/`useBrandRamp` `--color-accent-*` override on
 * `ShowcaseCanvas` / `UnifiedCanvas` / `built-with.tsx`) — this file covers
 * everything else: font, radius, elevation, button style.
 *
 * Mechanism:
 *  - Font: scoped `--font-display`/`--font-sans` CSS-var override (same
 *    trick as the accent-ramp override) — cascades to every heading/body
 *    element already written as `var(--font-display)` in the DS's own CSS.
 *  - Radius: `data-shape` only gives 3 buckets (sharp/slightly-rounded/
 *    rounded), which isn't enough to keep 6 brands visually distinct from
 *    each other — two brands were landing on the same bucket. So radius is
 *    now ALSO a direct `--radius-control` CSS-var override (six genuinely
 *    different pixel values), layered on top of the `data-shape` attribute
 *    (which still governs surfaces/overlays/etc. that don't have their own
 *    override here).
 *  - Shadow: no official per-subtree preset exists for elevation, so these
 *    are direct `--shadow-raised`/`--shadow-raised-hover`/`--shadow-floating`/
 *    `--shadow-overlay` CSS-var overrides. The grammar (hairline insets for
 *    precision brands, soft ambient shadows for warm ones, flat for
 *    editorial) mirrors the same role-token language the site's own
 *    Themer archetypes already use (lib/archetype-presets.ts).
 *  - Button: every showcase's primary CTA was rendering `variant="soft"`
 *    regardless of brand — only the colour differed. `buttonVariant` (and
 *    optional `buttonShape`) now give each brand's main action button a
 *    genuinely different shape/weight, not just a different hue.
 *
 * Devalok is the house brand — included explicitly below (not left to
 * inherit site defaults) so all six tabs are visually distinct from each
 * other, not just five distinct brands plus one that quietly matches the
 * site chrome.
 */

export type ShowcaseVisual = {
  font: string
  shape: 'sharp' | 'slightly-rounded' | 'rounded'
  /** Explicit --radius-control override in px — keeps all 6 brands' button/control corners genuinely distinct, since the 3-value `shape` bucket alone isn't enough. */
  radius: string
  shadow: {
    raised: string
    raisedHover: string
    floating: string
    overlay: string
  }
  /** Primary CTA button variant for this brand — was uniformly 'soft' everywhere before; now varies per brand. */
  buttonVariant: 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
  /** Optional button shape override — 'pill' for brands whose primary action should read as a fully rounded pill regardless of the radius token. */
  buttonShape?: 'pill'
}

export const SHOWCASE_VISUALS: Record<string, ShowcaseVisual> = {
  // Atlas — SaaS/B2B — clean modern dashboard. Slightly-rounded corners,
  // crisp conventional drop shadows, confident solid primary button
  // (Stripe/Vercel-dashboard grammar).
  atlas: {
    font: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    shape: 'slightly-rounded',
    radius: '10px',
    shadow: {
      raised: '0 1px 2px oklch(0 0 0 / 0.06)',
      raisedHover: '0 2px 6px oklch(0 0 0 / 0.08)',
      floating: '0 6px 16px oklch(0 0 0 / 0.10)',
      overlay: '0 12px 32px oklch(0 0 0 / 0.14)',
    },
    buttonVariant: 'solid',
  },
  // Lendis — Fintech — precise, trustworthy. Sharp corners, hairline
  // borders instead of soft shadows, bordered/outline primary button —
  // reads audited, not decorated.
  lendis: {
    font: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    shape: 'sharp',
    radius: '2px',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.88 0.01 145)',
      raisedHover: 'inset 0 0 0 1px oklch(0.8 0.02 145)',
      floating: 'inset 0 0 0 1px oklch(0.85 0.01 145), 0 4px 10px oklch(0 0 0 / 0.06)',
      overlay: '0 10px 28px oklch(0 0 0 / 0.12)',
    },
    buttonVariant: 'outline',
  },
  // Mira — D2C textiles — warm, hand-crafted, generous. Fully rounded pill
  // corners, soft ambient shadows, huggable pill-shaped primary button
  // (Apple-ish, tinted warm rather than neutral).
  mira: {
    font: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
    shape: 'rounded',
    radius: '9999px',
    shadow: {
      raised: '0 4px 12px oklch(0.55 0.1 55 / 0.10)',
      raisedHover: '0 8px 20px oklch(0.55 0.1 55 / 0.14)',
      floating: '0 12px 28px oklch(0 0 0 / 0.10)',
      overlay: '0 20px 48px oklch(0 0 0 / 0.16)',
    },
    buttonVariant: 'solid',
    buttonShape: 'pill',
  },
  // Vaidya — Healthcare — clean, calm, clinical. Gentle minimal-radius
  // corners, mostly flat with hairline definition, calm soft-filled
  // primary button — nothing decorative near patient data.
  vaidya: {
    font: 'Verdana, Geneva, "Segoe UI", sans-serif',
    shape: 'slightly-rounded',
    radius: '4px',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.9 0.005 200)',
      raisedHover: 'inset 0 0 0 1px oklch(0.82 0.01 200)',
      floating: '0 4px 12px oklch(0 0 0 / 0.06)',
      overlay: '0 10px 28px oklch(0 0 0 / 0.10)',
    },
    buttonVariant: 'soft',
  },
  // Patrika — Editorial — print-like, flat, typography-led. Square corners,
  // hairline rules instead of drop shadows, chrome-less link-style primary
  // action — a page, not a floating panel.
  patrika: {
    font: 'Georgia, Cambria, "Times New Roman", Times, serif',
    shape: 'sharp',
    radius: '0px',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.9 0.005 15)',
      raisedHover: 'inset 0 0 0 1px oklch(0.82 0.01 15)',
      floating: 'inset 0 0 0 1px oklch(0.88 0.005 15)',
    overlay: '0 8px 20px oklch(0 0 0 / 0.10)',
    },
    buttonVariant: 'link',
  },
  // Devalok — the house/studio brand. Site-default radius bucket, but a
  // distinct button treatment (ghost — no other brand uses it) and its own
  // explicit radius value so it doesn't quietly duplicate Atlas or Vaidya.
  devalok: {
    font: 'var(--font-display)',
    shape: 'slightly-rounded',
    radius: '6px',
    shadow: {
      raised: '0 1px 3px oklch(0 0 0 / 0.08)',
      raisedHover: '0 3px 8px oklch(0 0 0 / 0.10)',
      floating: '0 8px 20px oklch(0 0 0 / 0.12)',
      overlay: '0 14px 34px oklch(0 0 0 / 0.16)',
    },
    buttonVariant: 'ghost',
  },
}

/**
 * Scoped CSS-var override for a showcase's root element: font + shadow +
 * radius tokens. Pair with the `data-shape` attribute (see `showcaseShape`)
 * on the same element — `data-shape` still drives surfaces/overlays that
 * don't have their own override here, while `--radius-control` here pins
 * the exact button/input corner radius so it can't collide with another
 * brand sharing the same 3-value `data-shape` bucket.
 */
export function showcaseVisualStyle(slug: string): Record<string, string> {
  const v = SHOWCASE_VISUALS[slug]
  if (!v) return {}
  return {
    '--font-display': v.font,
    '--font-sans': v.font,
    '--shadow-raised': v.shadow.raised,
    '--shadow-raised-hover': v.shadow.raisedHover,
    '--shadow-floating': v.shadow.floating,
    '--shadow-overlay': v.shadow.overlay,
    '--radius-control': v.radius,
  }
}

/** `data-shape` attribute value for a showcase's root element, or undefined for the house brand. */
export function showcaseShape(slug: string): ShowcaseVisual['shape'] | undefined {
  return SHOWCASE_VISUALS[slug]?.shape
}

/** Primary CTA button variant for this brand's showcase — distinct per brand, not just recolored `soft` everywhere. */
export function showcaseButtonVariant(slug: string): ShowcaseVisual['buttonVariant'] {
  return SHOWCASE_VISUALS[slug]?.buttonVariant ?? 'soft'
}

/** Primary CTA button shape override for this brand's showcase (e.g. 'pill' for Mira), or undefined for the default rectangular shape. */
export function showcaseButtonShape(slug: string): ShowcaseVisual['buttonShape'] {
  return SHOWCASE_VISUALS[slug]?.buttonShape
}

/**
 * Direct `font-family` value for one-off labels (e.g. the UnifiedCanvas tab
 * strip) that don't themselves reference `var(--font-display)` and so won't
 * pick up a custom-property override — these need the resolved stack set
 * directly on `fontFamily`.
 */
export function showcaseFontFamily(slug: string): string | undefined {
  return SHOWCASE_VISUALS[slug]?.font
}

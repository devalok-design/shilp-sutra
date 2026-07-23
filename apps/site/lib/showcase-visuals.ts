/**
 * Per-showcase visual identity — typeface, corner radius, and shadow/
 * elevation grammar, each picked to match the brand's industry description,
 * not the site's own Inter/Manrope + slightly-rounded + soft-shadow default.
 *
 * Colour is handled separately (already scoped per-brand via the existing
 * `rampInlineStyle`/`useBrandRamp` `--color-accent-*` override on
 * `ShowcaseCanvas` / `UnifiedCanvas` / `built-with.tsx`) — this file covers
 * everything else: font, radius, elevation.
 *
 * Mechanism:
 *  - Font: scoped `--font-display`/`--font-sans` CSS-var override (same
 *    trick as the accent-ramp override) — cascades to every heading/body
 *    element already written as `var(--font-display)` in the DS's own CSS.
 *  - Radius: the DS ships an official per-subtree preset for exactly this —
 *    `[data-shape="sharp"|"slightly-rounded"|"rounded"]`
 *    (packages/core/src/tokens/semantic.css) — apply as a real `data-shape`
 *    HTML attribute on the showcase's root element, not a style override.
 *  - Shadow: no official per-subtree preset exists for elevation, so these
 *    are direct `--shadow-raised`/`--shadow-raised-hover`/`--shadow-floating`/
 *    `--shadow-overlay` CSS-var overrides. The grammar (hairline insets for
 *    precision brands, soft ambient shadows for warm ones, flat for
 *    editorial) mirrors the same role-token language the site's own
 *    Themer archetypes already use (lib/archetype-presets.ts).
 *
 * Devalok has no entry — it's the house brand, uses the site defaults.
 */

export type ShowcaseVisual = {
  font: string
  shape: 'sharp' | 'slightly-rounded' | 'rounded'
  shadow: {
    raised: string
    raisedHover: string
    floating: string
    overlay: string
  }
}

export const SHOWCASE_VISUALS: Record<string, ShowcaseVisual> = {
  // Atlas — SaaS/B2B — clean modern dashboard. Slightly-rounded, crisp
  // conventional drop shadows (Stripe/Vercel-dashboard grammar).
  atlas: {
    font: '-apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    shape: 'slightly-rounded',
    shadow: {
      raised: '0 1px 2px oklch(0 0 0 / 0.06)',
      raisedHover: '0 2px 6px oklch(0 0 0 / 0.08)',
      floating: '0 6px 16px oklch(0 0 0 / 0.10)',
      overlay: '0 12px 32px oklch(0 0 0 / 0.14)',
    },
  },
  // Lendis — Fintech — precise, trustworthy. Sharp corners, hairline
  // borders instead of soft shadows — reads audited, not decorated.
  lendis: {
    font: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    shape: 'sharp',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.88 0.01 145)',
      raisedHover: 'inset 0 0 0 1px oklch(0.8 0.02 145)',
      floating: 'inset 0 0 0 1px oklch(0.85 0.01 145), 0 4px 10px oklch(0 0 0 / 0.06)',
      overlay: '0 10px 28px oklch(0 0 0 / 0.12)',
    },
  },
  // Mira — D2C textiles — warm, hand-crafted, generous. Rounded corners,
  // soft ambient shadows (Apple-ish, tinted warm rather than neutral).
  mira: {
    font: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
    shape: 'rounded',
    shadow: {
      raised: '0 4px 12px oklch(0.55 0.1 55 / 0.10)',
      raisedHover: '0 8px 20px oklch(0.55 0.1 55 / 0.14)',
      floating: '0 12px 28px oklch(0 0 0 / 0.10)',
      overlay: '0 20px 48px oklch(0 0 0 / 0.16)',
    },
  },
  // Vaidya — Healthcare — clean, calm, clinical. Slightly-rounded, mostly
  // flat with hairline definition — nothing decorative near patient data.
  vaidya: {
    font: 'Verdana, Geneva, "Segoe UI", sans-serif',
    shape: 'slightly-rounded',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.9 0.005 200)',
      raisedHover: 'inset 0 0 0 1px oklch(0.82 0.01 200)',
      floating: '0 4px 12px oklch(0 0 0 / 0.06)',
      overlay: '0 10px 28px oklch(0 0 0 / 0.10)',
    },
  },
  // Patrika — Editorial — print-like, flat, typography-led. Sharp corners,
  // hairline rules instead of drop shadows — a page, not a floating panel.
  patrika: {
    font: 'Georgia, Cambria, "Times New Roman", Times, serif',
    shape: 'sharp',
    shadow: {
      raised: 'inset 0 0 0 1px oklch(0.9 0.005 15)',
      raisedHover: 'inset 0 0 0 1px oklch(0.82 0.01 15)',
      floating: 'inset 0 0 0 1px oklch(0.88 0.005 15)',
      overlay: '0 8px 20px oklch(0 0 0 / 0.10)',
    },
  },
}

/**
 * Scoped CSS-var override for a showcase's root element: font + shadow
 * tokens. Pair with the `data-shape` attribute (see `showcaseShape`) on
 * the same element for the radius half of the treatment.
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
  }
}

/** `data-shape` attribute value for a showcase's root element, or undefined for the house brand. */
export function showcaseShape(slug: string): ShowcaseVisual['shape'] | undefined {
  return SHOWCASE_VISUALS[slug]?.shape
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

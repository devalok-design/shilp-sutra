/**
 * shilp-sutra core version, sourced from packages/core/package.json at build
 * time via NEXT_PUBLIC_SHILP_SUTRA_VERSION (see next.config.ts). Client-safe.
 */
// Next.js statically replaces NEXT_PUBLIC_* references at build time
// (see apps/site/next.config.ts). Fallback is defensive — if the env wiring
// breaks, the chip still renders without crashing the page.
const raw = process.env.NEXT_PUBLIC_SHILP_SUTRA_VERSION ?? '0.0.0'

export const SHILP_SUTRA_VERSION = raw

/** "0.38.0" → "0.38" — for trust chips + nav badges. */
export const SHILP_SUTRA_MINOR = raw.split('.').slice(0, 2).join('.')

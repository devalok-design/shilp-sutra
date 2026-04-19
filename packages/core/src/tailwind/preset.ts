import type { Config } from 'tailwindcss'

/**
 * @deprecated Since 0.37.0. Tailwind 4 uses CSS-first configuration via
 * `@theme`, `@utility`, and `@custom-variant`, not JavaScript presets.
 *
 * Migrate to:
 *
 * ```css
 *   // app/globals.css
 *   @import "tailwindcss";
 *   @import "@devalok/shilp-sutra/css";
 * ```
 *
 * And delete your `tailwind.config.ts` (or shrink it to whatever your own
 * app needs — we no longer ask you to reference our preset).
 *
 * This export remains as a typed no-op so in-flight consumer code that
 * still imports it doesn't crash at import time. Scheduled for removal
 * in 0.38.0.
 *
 * See MIGRATION.md at the repo root for the full 0.36 → 0.37 walkthrough.
 */
const preset: Partial<Config> = {}

// Emit a one-time deprecation warning so consumers on the old JS-preset
// setup discover the migration via their build output — not via silent
// visual breakage in production.
//
// Critical: the warning fires in ALL environments including `next build`
// (NODE_ENV=production). Gating this on NODE_ENV would defeat the whole
// point — the consumer most likely to ship broken CSS (CI-only pipeline,
// no local dev loop) is exactly the one who would never see a dev-only
// warn. Audited 0.37.0-pre-RC; see post-audit commit message.
//
// Written to stderr directly (not console.warn) so it survives Next's
// output filters which can silence console calls during `next build`.
let warned = false
function emitDeprecationNotice(): void {
  if (warned) return
  warned = true
  const msg =
    '\n' +
    '⚠️  [@devalok/shilp-sutra] DEPRECATION: The JS preset at "./tailwind" is ' +
    'deprecated in 0.37.0 and will be removed in 0.38.0.\n\n' +
    'Every class utility you relied on from this preset (bg-surface-raised, ' +
    'p-ds-04, shadow-raised, text-ds-md, etc.) is now emitted zero CSS by ' +
    'Tailwind 4. Your app will ship unstyled unless you migrate.\n\n' +
    'Replace:\n' +
    '    // tailwind.config.ts\n' +
    '    import shilpSutra from "@devalok/shilp-sutra/tailwind"\n' +
    '    export default { presets: [shilpSutra], content: [...] }\n\n' +
    'with:\n' +
    '    // app/globals.css\n' +
    '    @import "tailwindcss";\n' +
    '    @import "@devalok/shilp-sutra/css";\n\n' +
    'Full guide: https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md\n'

  // Prefer process.stderr for CI visibility; fall back to console.warn
  // in environments where process is not available (browsers, Edge runtime).
  try {
    if (
      typeof process !== 'undefined' &&
      typeof process.stderr?.write === 'function'
    ) {
      process.stderr.write(msg)
      return
    }
  } catch {
    // Fall through to console.warn.
  }
  // eslint-disable-next-line no-console
  console.warn(msg)
}
// Fire when the module is imported (ESM evaluates module body once).
emitDeprecationNotice()

export default preset

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

// Emit a one-time dev-mode warning so consumers on the old setup
// discover the migration via their terminal, not silent visual breakage.
// Production: silent (NODE_ENV check). Sonly warn once per process.
declare const process: { env?: { NODE_ENV?: string } } | undefined
let warned = false
function warnIfDev(): void {
  if (warned) return
  const env =
    typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined
  if (env === 'production') return
  warned = true
  // eslint-disable-next-line no-console
  console.warn(
    '[@devalok/shilp-sutra] The JS preset at `./tailwind` is deprecated in ' +
      '0.37.0 and will be removed in 0.38.0. Replace\n' +
      '    // tailwind.config.ts\n' +
      '    import shilpSutra from "@devalok/shilp-sutra/tailwind"\n' +
      '    export default { presets: [shilpSutra], content: [...] }\n' +
      'with\n' +
      '    // app/globals.css\n' +
      '    @import "tailwindcss";\n' +
      '    @import "@devalok/shilp-sutra/css";\n' +
      'See https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md',
  )
}
// Fire the warning when the module is imported (Node ESM evaluates the
// module body once at import time).
warnIfDev()

export default preset

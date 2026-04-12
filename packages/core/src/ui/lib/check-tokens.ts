/**
 * Dev-mode check for missing token CSS.
 *
 * If the consumer forgets `import '@devalok/shilp-sutra/tokens'`, all CSS
 * custom properties resolve to empty strings and components render with
 * transparent/broken backgrounds. This check detects that condition and
 * warns in the console.
 *
 * Only runs once, only in development, only in the browser.
 */
let checked = false

export function checkTokensLoaded(): void {
  if (checked) return
  if (typeof window === 'undefined') return

  // Skip in production — bundlers (Vite, Next.js, webpack) define import.meta.env or process.env
  try {
    // @ts-expect-error -- import.meta.env is Vite-specific, not in base TS lib
    if (import.meta.env?.PROD) return
  } catch { /* not in Vite */ }

  checked = true

  // Wait for stylesheets to load
  requestAnimationFrame(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-9').trim()
    if (!value) {
      console.warn(
        '[shilp-sutra] Design system tokens CSS not loaded. ' +
        'Add `import \'@devalok/shilp-sutra/tokens\'` to your root layout. ' +
        'Without it, components will render with missing colors, spacing, and typography.'
      )
    }
  })
}

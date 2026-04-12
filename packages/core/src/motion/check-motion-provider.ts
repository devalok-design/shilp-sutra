/**
 * Dev-mode hint for missing MotionProvider.
 *
 * If the consumer hasn't wrapped their app in <MotionProvider>, Framer Motion
 * animations still work but reduced-motion preferences won't propagate through
 * MotionConfig. This check emits a one-time console.info in dev mode.
 *
 * Only runs once, only in development, only in the browser.
 */
let checked = false

export function checkMotionProvider(): void {
  if (checked) return
  if (typeof window === 'undefined') return

  // Skip in production
  try {
    // @ts-expect-error -- import.meta.env is Vite-specific, not in base TS lib
    if (import.meta.env?.PROD) return
  } catch { /* not in Vite */ }

  checked = true

  // eslint-disable-next-line no-console
  console.info(
    '[shilp-sutra] Tip: Wrap your app in <MotionProvider> for reduced-motion support ' +
    'across all shilp-sutra animations. See https://www.npmjs.com/package/@devalok/shilp-sutra',
  )
}

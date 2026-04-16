declare const process: { env?: { NODE_ENV?: string } } | undefined

let mountedToasters = 0
let warned = false

export function registerToaster(): () => void {
  mountedToasters += 1
  return () => {
    mountedToasters = Math.max(0, mountedToasters - 1)
  }
}

/**
 * Called by toast() in dev to warn once if no <Toaster /> is mounted.
 * Silent on missing Toaster so we never crash the UI — only a console warning.
 */
export function assertToasterMounted(): void {
  const env = typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined
  if (env === 'production') return
  if (warned) return
  if (mountedToasters > 0) return
  warned = true
  // eslint-disable-next-line no-console
  console.warn(
    '[shilp-sutra] toast() was called but no <Toaster /> is mounted. ' +
      'Render <Toaster /> once at your app root (e.g. in RootLayout). ' +
      'Without it, toasts are dropped silently.',
  )
}

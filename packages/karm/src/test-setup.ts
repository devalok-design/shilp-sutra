// ── Global scrollTo polyfill ─────────────────────────────────────────────────
// MessageList and other scroll-heavy components call scrollTo.
if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = (() => {}) as any
}

// ── Stable matchMedia mock ──────────────────────────────────────────────────
// Override core's per-call matchMedia mock with a cached version.
// BoardProvider uses useSyncExternalStore + window.matchMedia. If each call
// returns a new object, the combination with Radix DropdownMenu's internal
// requestAnimationFrame creates an infinite timer-based re-render loop in jsdom.
// Caching ensures React sees stable references and won't re-subscribe endlessly.
if (typeof window !== 'undefined') {
  const cache = new Map<string, MediaQueryList>()
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList => {
      let mql = cache.get(query)
      if (!mql) {
        const listeners: Array<(e: MediaQueryListEvent) => void> = []
        mql = {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: (_: string, cb: any) => { listeners.push(cb) },
          removeEventListener: (_: string, cb: any) => {
            const idx = listeners.indexOf(cb)
            if (idx >= 0) listeners.splice(idx, 1)
          },
          dispatchEvent: () => false,
        } as unknown as MediaQueryList
        cache.set(query, mql)
      }
      return mql
    },
  })
}

// ── No-op requestAnimationFrame ─────────────────────────────────────────────
// Radix's vendored `_internal/rect.js` has a `runLoop` that continuously calls
// `requestAnimationFrame(runLoop)` to poll element positions. In a real browser
// rAF fires at ~60fps — harmless. In jsdom, rAF fires near-synchronously and
// React's act() flushes pending timers, creating an infinite tight loop.
// Fix: make rAF a no-op. Callbacks never fire. Components skip animation logic
// but render correctly for testing.
if (typeof window !== 'undefined') {
  let rafId = 0
  window.requestAnimationFrame = (_cb: FrameRequestCallback): number => ++rafId
  window.cancelAnimationFrame = (_id: number): void => {}
}

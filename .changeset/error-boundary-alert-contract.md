---
"@devalok/shilp-sutra": minor
---

fix(error-boundary): alert a11y + boundary contract parity (audit)

All additive (non-breaking).

- **a11y (P0):** the message region is `role="alert"` (assertive live region) — screen
  readers announce the error when it appears (there was no live region; the axe tests
  passed only because axe can't detect a *missing* one). Focus moves to the recovery
  button when `ErrorBoundary` swaps in (`autoFocusReset`).
- **security (P1):** the raw `error.message` is gated behind development — production
  shows the friendly status-mapped copy (no internal-detail leak); the real message
  stays in the dev-only stack block.
- **api (P1):** `ErrorBoundary` now implements `componentDidCatch` → `onError(error, info)`
  (wire Sentry/logging), and `ErrorDisplay` gains an `actions` slot for a secondary
  recovery action (default "Try Again" only when absent).
- **api (P2):** `resetKeys` — the boundary auto-recovers when a dependency changes
  (react-error-boundary parity); the `fallback` render-prop now receives a guaranteed
  `onReset`.
- **visual (P1/P2):** dead `border-card-strong` → `border-card`; `min-h-[60vh]` gated
  behind a `fullPage` prop (default true) so inline boundaries don't force viewport height.
- **docs:** documented the full `ErrorBoundary` API + the new props.
